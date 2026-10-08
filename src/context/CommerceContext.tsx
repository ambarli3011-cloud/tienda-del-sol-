import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Product, CartItem, Order, CustomerInfo, PaymentMethod } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { 
  db, 
  handleFirestoreError, 
  OperationType 
} from '../firebase';
import { 
  collection, 
  doc, 
  setDoc, 
  deleteDoc, 
  onSnapshot, 
  writeBatch 
} from 'firebase/firestore';

interface SyncEvent {
  type: 'pos_sale' | 'online_sale' | 'inventory_update' | 'restock' | 'firebase_sync';
  title: string;
  detail: string;
  timestamp: number;
}

interface CommerceContextType {
  products: Product[];
  orders: Order[];
  posCart: CartItem[];
  onlineCart: CartItem[];
  heldCarts: { id: string; name: string; items: CartItem[]; date: string }[];
  lastSyncEvent: SyncEvent | null;
  isFirebaseActive: boolean;
  firebaseProjectId: string;
  // POS methods
  addToPosCart: (product: Product, quantity?: number) => boolean;
  updatePosCartQuantity: (productId: string, quantity: number) => void;
  updatePosItemDiscount: (productId: string, discountPercent: number) => void;
  removeFromPosCart: (productId: string) => void;
  clearPosCart: () => void;
  holdCurrentPosCart: (ticketName?: string) => void;
  restoreHeldCart: (cartId: string) => void;
  deleteHeldCart: (cartId: string) => void;
  checkoutPos: (params: {
    paymentMethod: PaymentMethod;
    customer: CustomerInfo;
    cashReceived?: number;
    cashierName?: string;
  }) => Order | null;
  // Online methods
  addToOnlineCart: (product: Product, quantity?: number) => boolean;
  updateOnlineCartQuantity: (productId: string, quantity: number) => void;
  removeFromOnlineCart: (productId: string) => void;
  clearOnlineCart: () => void;
  checkoutOnline: (params: {
    customer: CustomerInfo;
    paymentMethod: PaymentMethod;
  }) => Order | null;
  // Inventory methods
  adjustStock: (productId: string, delta: number) => void;
  setExactStock: (productId: string, newStock: number) => void;
  upsertProduct: (product: Product) => void;
  deleteProduct: (productId: string) => void;
  toggleChannelVisibility: (productId: string, channel: 'pos' | 'online') => void;
  syncAllProductsToFirebase: () => Promise<void>;
  executeFirebaseLiveTest: () => Promise<Order | undefined>;
  resetAllData: () => void;
}

const CommerceContext = createContext<CommerceContextType | undefined>(undefined);

function playSound(type: 'beep' | 'cash' | 'success') {
  try {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return;
    const ctx = new AudioCtx();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'beep') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } else if (type === 'cash') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(523.25, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(1046.5, ctx.currentTime + 0.18);
      gain.gain.setValueAtTime(0.12, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.22);
      osc.start();
      osc.stop(ctx.currentTime + 0.22);
    } else if (type === 'success') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, ctx.currentTime);
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
      gain.gain.setValueAtTime(0.09, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.25);
      osc.start();
      osc.stop(ctx.currentTime + 0.25);
    }
  } catch {
    // audio fallback
  }
}

export const CommerceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      const saved = localStorage.getItem('aura_products_velones_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id?.startsWith('velon-')) {
          return parsed;
        }
      }
    } catch {
      // fallback
    }
    return INITIAL_PRODUCTS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    try {
      const saved = localStorage.getItem('aura_orders_velones_v2');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [posCart, setPosCart] = useState<CartItem[]>([]);
  const [onlineCart, setOnlineCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('aura_online_cart_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [heldCarts, setHeldCarts] = useState<{ id: string; name: string; items: CartItem[]; date: string }[]>(() => {
    try {
      const saved = localStorage.getItem('aura_held_carts_v1');
      if (saved) return JSON.parse(saved);
    } catch {
      // fallback
    }
    return [];
  });

  const [lastSyncEvent, setLastSyncEvent] = useState<SyncEvent | null>(null);
  const [isFirebaseActive, setIsFirebaseActive] = useState<boolean>(false);
  const firebaseProjectId = "tienda-de-sol";

  // Trigger sync notification
  const triggerSyncNotice = useCallback((event: SyncEvent) => {
    setLastSyncEvent(event);
  }, []);

  // Sync to local storage
  useEffect(() => {
    try {
      localStorage.setItem('aura_products_v1', JSON.stringify(products));
    } catch {
      // ignore
    }
  }, [products]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_orders_v1', JSON.stringify(orders));
    } catch {
      // ignore
    }
  }, [orders]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_online_cart_v1', JSON.stringify(onlineCart));
    } catch {
      // ignore
    }
  }, [onlineCart]);

  useEffect(() => {
    try {
      localStorage.setItem('aura_held_carts_v1', JSON.stringify(heldCarts));
    } catch {
      // ignore
    }
  }, [heldCarts]);

  // Real-Time Firebase Firestore Listeners
  useEffect(() => {
    let unsubProducts: (() => void) | undefined;
    let unsubOrders: (() => void) | undefined;

    try {
      const productsRef = collection(db, 'products');
      unsubProducts = onSnapshot(
        productsRef,
        (snapshot) => {
          setIsFirebaseActive(true);
          if (!snapshot.empty) {
            const fbProducts: Product[] = [];
            snapshot.forEach(docSnap => {
              fbProducts.push(docSnap.data() as Product);
            });
            // If products exist in Firestore, update state
            setProducts(fbProducts);
          } else {
            // First time connection: seed initial products into Firestore!
            seedInitialToFirestore();
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'products');
          // If Firestore is still being set up or offline, remain functional locally
          setIsFirebaseActive(false);
        }
      );

      const ordersRef = collection(db, 'orders');
      unsubOrders = onSnapshot(
        ordersRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const fbOrders: Order[] = [];
            snapshot.forEach(docSnap => {
              fbOrders.push(docSnap.data() as Order);
            });
            // Sort by latest
            fbOrders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(fbOrders);
          }
        },
        (error) => {
          handleFirestoreError(error, OperationType.LIST, 'orders');
        }
      );
    } catch (err) {
      console.warn('Firebase snapshot listener init warning:', err);
    }

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubOrders) unsubOrders();
    };
  }, []);

  // Helper to seed initial products into Firestore
  const seedInitialToFirestore = async () => {
    try {
      const batch = writeBatch(db);
      INITIAL_PRODUCTS.forEach(item => {
        const docRef = doc(db, 'products', item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
      setIsFirebaseActive(true);
      triggerSyncNotice({
        type: 'firebase_sync',
        title: 'Firebase Conectado (tienda-de-sol)',
        detail: 'Se sincronizó el catálogo inicial en la nube de Firestore.',
        timestamp: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products/batch');
    }
  };

  // Explicit user trigger to push all current products to Firebase
  const syncAllProductsToFirebase = async () => {
    try {
      const batch = writeBatch(db);
      products.forEach(item => {
        const docRef = doc(db, 'products', item.id);
        batch.set(docRef, item);
      });
      await batch.commit();
      setIsFirebaseActive(true);
      playSound('success');
      triggerSyncNotice({
        type: 'firebase_sync',
        title: 'Nube Sincronizada',
        detail: `Todos los productos fueron respaldados en Firestore (Proyecto: ${firebaseProjectId}).`,
        timestamp: Date.now()
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'products/syncAll');
      alert('Aviso: Comprueba las reglas de Firestore en la consola de Firebase tienda-de-sol para habilitar permisos de escritura.');
    }
  };

  // Automated test sale committed to Firestore
  const executeFirebaseLiveTest = async (): Promise<Order | undefined> => {
    try {
      const targetProduct = products.find(p => p.stock > 0) || INITIAL_PRODUCTS[0];
      if (!targetProduct) return;

      const testOrderNumber = `TEST-FIREBASE-${Math.floor(1000 + Math.random() * 9000)}`;
      const subtotal = targetProduct.price;
      const tax = Math.round(subtotal * 0.16 * 100) / 100;
      const total = Math.round((subtotal + tax) * 100) / 100;

      const testOrder: Order = {
        id: `ord-test-${Date.now()}`,
        orderNumber: testOrderNumber,
        channel: 'pos',
        items: [
          {
            productId: targetProduct.id,
            product: targetProduct,
            quantity: 1,
            unitPrice: targetProduct.price,
          }
        ],
        subtotal,
        tax,
        discount: 0,
        total,
        paymentMethod: 'cash',
        paymentDetails: {
          cashReceived: total + 100,
          changeGiven: 100,
        },
        customer: { 
          name: 'Cliente de Prueba (Base de Datos)',
          phone: '+52 55 9876 5432'
        },
        status: 'completed',
        createdAt: new Date().toISOString(),
        cashierName: 'Prueba Automatizada Firebase'
      };

      // Decrement stock in real-time
      const updatedProduct = {
        ...targetProduct,
        stock: Math.max(0, targetProduct.stock - 1)
      };

      // Push both order and updated product to Firestore
      await setDoc(doc(db, 'products', updatedProduct.id), updatedProduct);
      await setDoc(doc(db, 'orders', testOrder.id), testOrder);

      // Local state updates
      setProducts(prev => prev.map(p => p.id === updatedProduct.id ? updatedProduct : p));
      setOrders(prev => [testOrder, ...prev]);

      setIsFirebaseActive(true);
      playSound('cash');

      triggerSyncNotice({
        type: 'firebase_sync',
        title: `Prueba en BD Exitosa (${testOrderNumber})`,
        detail: `Se guardó la orden y se actualizó el stock de "${targetProduct.name}" (Quedan ${updatedProduct.stock}) en Firestore tienda-de-sol.`,
        timestamp: Date.now()
      });

      return testOrder;
    } catch (err) {
      console.error('Firebase test execution error:', err);
      handleFirestoreError(err, OperationType.WRITE, 'orders/test');
    }
  };

  // Helper to save a single product to Firestore
  const saveProductToFirestore = async (product: Product) => {
    try {
      await setDoc(doc(db, 'products', product.id), product);
      setIsFirebaseActive(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, `products/${product.id}`);
    }
  };

  // Helper to save an order to Firestore
  const saveOrderToFirestore = async (order: Order) => {
    try {
      await setDoc(doc(db, 'orders', order.id), order);
      setIsFirebaseActive(true);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `orders/${order.id}`);
    }
  };

  // Helper to delete from Firestore
  const deleteProductFromFirestore = async (productId: string) => {
    try {
      await deleteDoc(doc(db, 'products', productId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `products/${productId}`);
    }
  };

  // POS Operations
  const addToPosCart = useCallback((product: Product, quantity = 1): boolean => {
    if (product.stock <= 0) return false;

    setPosCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + quantity > product.stock) {
        return prev;
      }

      playSound('beep');
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        product,
        quantity,
        unitPrice: product.price,
        discountPercent: 0
      }];
    });
    return true;
  }, []);

  const updatePosCartQuantity = useCallback((productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      setPosCart(prev => prev.filter(item => item.productId !== productId));
      return;
    }

    if (quantity > product.stock) {
      quantity = product.stock;
    }

    setPosCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [products]);

  const updatePosItemDiscount = useCallback((productId: string, discountPercent: number) => {
    const clamped = Math.max(0, Math.min(100, discountPercent));
    setPosCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, discountPercent: clamped } : item
      )
    );
  }, []);

  const removeFromPosCart = useCallback((productId: string) => {
    setPosCart(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const clearPosCart = useCallback(() => {
    setPosCart([]);
  }, []);

  const holdCurrentPosCart = useCallback((ticketName?: string) => {
    if (posCart.length === 0) return;
    const name = ticketName?.trim() || `Ticket en espera #${heldCarts.length + 1}`;
    setHeldCarts(prev => [
      ...prev,
      {
        id: `held-${Date.now()}`,
        name,
        items: [...posCart],
        date: new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
      }
    ]);
    setPosCart([]);
    playSound('beep');
  }, [posCart, heldCarts.length]);

  const restoreHeldCart = useCallback((cartId: string) => {
    const found = heldCarts.find(c => c.id === cartId);
    if (!found) return;
    setPosCart(found.items);
    setHeldCarts(prev => prev.filter(c => c.id !== cartId));
    playSound('beep');
  }, [heldCarts]);

  const deleteHeldCart = useCallback((cartId: string) => {
    setHeldCarts(prev => prev.filter(c => c.id !== cartId));
  }, []);

  // Checkout POS: decrements stock locally + writes to Firestore
  const checkoutPos = useCallback((params: {
    paymentMethod: PaymentMethod;
    customer: CustomerInfo;
    cashReceived?: number;
    cashierName?: string;
  }): Order | null => {
    if (posCart.length === 0) return null;

    let subtotal = 0;
    let totalDiscount = 0;

    posCart.forEach(item => {
      const lineSub = item.unitPrice * item.quantity;
      const lineDisc = item.discountPercent ? (lineSub * item.discountPercent) / 100 : 0;
      subtotal += lineSub;
      totalDiscount += lineDisc;
    });

    const netSubtotal = subtotal - totalDiscount;
    const tax = Math.round(netSubtotal * 0.16 * 100) / 100;
    const total = Math.round((netSubtotal + tax) * 100) / 100;

    const cashReceived = params.cashReceived ?? total;
    const changeGiven = params.paymentMethod === 'cash' ? Math.max(0, cashReceived - total) : 0;

    const orderNumber = `POS-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: Order = {
      id: `ord-pos-${Date.now()}`,
      orderNumber,
      channel: 'pos',
      items: [...posCart],
      subtotal,
      tax,
      discount: totalDiscount,
      total,
      paymentMethod: params.paymentMethod,
      paymentDetails: {
        cashReceived,
        changeGiven,
        authCode: params.paymentMethod === 'pos_card' ? `AUTH-${Math.floor(100000 + Math.random() * 900000)}` : undefined
      },
      customer: params.customer,
      status: 'completed',
      createdAt: new Date().toISOString(),
      cashierName: params.cashierName || 'Cajero 01 (Principal)'
    };

    // Update local state and push stock updates to Firestore
    setProducts(prevProducts => {
      const updated = prevProducts.map(prod => {
        const cartItem = posCart.find(ci => ci.productId === prod.id);
        if (!cartItem) return prod;
        const newStock = Math.max(0, prod.stock - cartItem.quantity);
        const updatedProd = { ...prod, stock: newStock };
        // Sync updated product to Firestore
        saveProductToFirestore(updatedProd);
        return updatedProd;
      });
      return updated;
    });

    // Save order to Firestore & state
    saveOrderToFirestore(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    setPosCart([]);

    playSound('cash');

    triggerSyncNotice({
      type: 'pos_sale',
      title: `Venta POS Guardada (${orderNumber})`,
      detail: `${newOrder.items.length} productos vendidos por $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}. Guardado en Firestore tienda-de-sol.`,
      timestamp: Date.now()
    });

    return newOrder;
  }, [posCart, triggerSyncNotice]);

  // Online Store Operations
  const addToOnlineCart = useCallback((product: Product, quantity = 1): boolean => {
    if (product.stock <= 0) return false;

    setOnlineCart(prev => {
      const existing = prev.find(item => item.productId === product.id);
      const currentQty = existing ? existing.quantity : 0;
      if (currentQty + quantity > product.stock) {
        return prev;
      }

      playSound('beep');
      if (existing) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, {
        productId: product.id,
        product,
        quantity,
        unitPrice: product.price
      }];
    });
    return true;
  }, []);

  const updateOnlineCartQuantity = useCallback((productId: string, quantity: number) => {
    const product = products.find(p => p.id === productId);
    if (!product) return;

    if (quantity <= 0) {
      setOnlineCart(prev => prev.filter(item => item.productId !== productId));
      return;
    }

    if (quantity > product.stock) {
      quantity = product.stock;
    }

    setOnlineCart(prev =>
      prev.map(item =>
        item.productId === productId ? { ...item, quantity } : item
      )
    );
  }, [products]);

  const removeFromOnlineCart = useCallback((productId: string) => {
    setOnlineCart(prev => prev.filter(item => item.productId !== productId));
  }, []);

  const clearOnlineCart = useCallback(() => {
    setOnlineCart([]);
  }, []);

  // Checkout Online: decrements stock locally + writes to Firestore
  const checkoutOnline = useCallback((params: {
    customer: CustomerInfo;
    paymentMethod: PaymentMethod;
  }): Order | null => {
    if (onlineCart.length === 0) return null;

    let subtotal = 0;
    onlineCart.forEach(item => {
      subtotal += item.unitPrice * item.quantity;
    });

    const tax = Math.round(subtotal * 0.16 * 100) / 100;
    const total = Math.round((subtotal + tax) * 100) / 100;

    const orderNumber = `WEB-${Math.floor(5000 + Math.random() * 5000)}`;
    const newOrder: Order = {
      id: `ord-web-${Date.now()}`,
      orderNumber,
      channel: 'online',
      items: [...onlineCart],
      subtotal,
      tax,
      discount: 0,
      total,
      paymentMethod: params.paymentMethod,
      customer: params.customer,
      status: params.customer.deliveryType === 'pickup' ? 'pending_pickup' : 'shipped',
      createdAt: new Date().toISOString()
    };

    // Update stock in state and Firestore
    setProducts(prevProducts => {
      const updated = prevProducts.map(prod => {
        const cartItem = onlineCart.find(ci => ci.productId === prod.id);
        if (!cartItem) return prod;
        const newStock = Math.max(0, prod.stock - cartItem.quantity);
        const updatedProd = { ...prod, stock: newStock };
        // Sync updated product to Firestore
        saveProductToFirestore(updatedProd);
        return updatedProd;
      });
      return updated;
    });

    // Save order to Firestore & state
    saveOrderToFirestore(newOrder);
    setOrders(prev => [newOrder, ...prev]);
    setOnlineCart([]);

    playSound('success');

    triggerSyncNotice({
      type: 'online_sale',
      title: `Pedido Web Registrado (${orderNumber})`,
      detail: `Cliente: ${params.customer.name}. Total: $${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}. Guardado en Firestore tienda-de-sol.`,
      timestamp: Date.now()
    });

    return newOrder;
  }, [onlineCart, triggerSyncNotice]);

  // Inventory Management with Firebase persistence
  const adjustStock = useCallback((productId: string, delta: number) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id !== productId) return p;
        const newStock = Math.max(0, p.stock + delta);
        const modified = { ...p, stock: newStock };
        saveProductToFirestore(modified);
        return modified;
      });
      return updated;
    });
    playSound('beep');
    const p = products.find(x => x.id === productId);
    triggerSyncNotice({
      type: 'restock',
      title: 'Ajuste de Existencias',
      detail: `${p?.name || 'Producto'}: cambio de ${delta > 0 ? `+${delta}` : delta} piezas sincronizado con Firestore.`,
      timestamp: Date.now()
    });
  }, [products, triggerSyncNotice]);

  const setExactStock = useCallback((productId: string, newStock: number) => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id !== productId) return p;
        const modified = { ...p, stock: Math.max(0, newStock) };
        saveProductToFirestore(modified);
        return modified;
      });
      return updated;
    });
  }, []);

  const upsertProduct = useCallback((product: Product) => {
    setProducts(prev => {
      const idx = prev.findIndex(p => p.id === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = product;
        return next;
      }
      return [product, ...prev];
    });
    saveProductToFirestore(product);
    triggerSyncNotice({
      type: 'inventory_update',
      title: 'Producto Actualizado en la Nube',
      detail: `"${product.name}" guardado en base de datos Firestore tienda-de-sol.`,
      timestamp: Date.now()
    });
  }, [triggerSyncNotice]);

  const deleteProduct = useCallback((productId: string) => {
    setProducts(prev => prev.filter(p => p.id !== productId));
    setPosCart(prev => prev.filter(ci => ci.productId !== productId));
    setOnlineCart(prev => prev.filter(ci => ci.productId !== productId));
    deleteProductFromFirestore(productId);
  }, []);

  const toggleChannelVisibility = useCallback((productId: string, channel: 'pos' | 'online') => {
    setProducts(prev => {
      const updated = prev.map(p => {
        if (p.id !== productId) return p;
        const modified = channel === 'pos' 
          ? { ...p, isPos: !p.isPos } 
          : { ...p, isOnline: !p.isOnline };
        saveProductToFirestore(modified);
        return modified;
      });
      return updated;
    });
  }, []);

  const resetAllData = useCallback(() => {
    setProducts(INITIAL_PRODUCTS);
    setOrders([]);
    setPosCart([]);
    setOnlineCart([]);
    setHeldCarts([]);
    localStorage.removeItem('aura_products_v1');
    localStorage.removeItem('aura_orders_v1');
    localStorage.removeItem('aura_online_cart_v1');
    localStorage.removeItem('aura_held_carts_v1');
    seedInitialToFirestore();
  }, []);

  return (
    <CommerceContext.Provider
      value={{
        products,
        orders,
        posCart,
        onlineCart,
        heldCarts,
        lastSyncEvent,
        isFirebaseActive,
        firebaseProjectId,
        addToPosCart,
        updatePosCartQuantity,
        updatePosItemDiscount,
        removeFromPosCart,
        clearPosCart,
        holdCurrentPosCart,
        restoreHeldCart,
        deleteHeldCart,
        checkoutPos,
        addToOnlineCart,
        updateOnlineCartQuantity,
        removeFromOnlineCart,
        clearOnlineCart,
        checkoutOnline,
        adjustStock,
        setExactStock,
        upsertProduct,
        deleteProduct,
        toggleChannelVisibility,
        syncAllProductsToFirebase,
        executeFirebaseLiveTest,
        resetAllData,
      }}
    >
      {children}
    </CommerceContext.Provider>
  );
};

export function useCommerce() {
  const context = useContext(CommerceContext);
  if (!context) {
    throw new Error('useCommerce must be used within a CommerceProvider');
  }
  return context;
}
