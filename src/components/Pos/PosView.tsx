import React, { useState, useMemo, useEffect } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Product, Order } from '../../types';
import { PosCheckoutModal } from './PosCheckoutModal';
import { ReceiptModal } from './ReceiptModal';
import { 
  Search, 
  Barcode, 
  Plus, 
  Minus, 
  Trash2, 
  PauseCircle, 
  PlayCircle, 
  Percent, 
  Clock, 
  ShoppingBag,
  Sparkles,
  Package,
  Layers
} from 'lucide-react';

interface PosViewProps {
  isCompact?: boolean;
}

export const PosView: React.FC<PosViewProps> = ({ isCompact = false }) => {
  const {
    products,
    posCart,
    heldCarts,
    addToPosCart,
    updatePosCartQuantity,
    updatePosItemDiscount,
    removeFromPosCart,
    clearPosCart,
    holdCurrentPosCart,
    restoreHeldCart,
    deleteHeldCart,
    checkoutPos
  } = useCommerce();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeDiscountItemId, setActiveDiscountItemId] = useState<string | null>(null);
  const [showCheckoutModal, setShowCheckoutModal] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<Order | null>(null);
  const [showHeldModal, setShowHeldModal] = useState(false);
  const [currentTime, setCurrentTime] = useState('');

  // Clock update
  useEffect(() => {
    const updateTime = () => {
      setCurrentTime(new Date().toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Filter products for POS
  const posProducts = useMemo(() => {
    return products.filter(p => p.isPos !== false);
  }, [products]);

  const categories = useMemo(() => {
    const cats = new Set<string>();
    posProducts.forEach(p => cats.add(p.category));
    return ['Todos', ...Array.from(cats)];
  }, [posProducts]);

  const filteredProducts = useMemo(() => {
    return posProducts.filter(p => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQuery = !q || 
        p.name.toLowerCase().includes(q) || 
        p.sku.toLowerCase().includes(q) || 
        p.barcode.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q);
      return matchCat && matchQuery;
    });
  }, [posProducts, selectedCategory, searchQuery]);

  // Totals calculation
  const { subtotal, totalDiscount, tax, total, itemCount } = useMemo(() => {
    let sub = 0;
    let disc = 0;
    let count = 0;
    posCart.forEach(item => {
      const lineSub = item.unitPrice * item.quantity;
      const lineDisc = item.discountPercent ? (lineSub * item.discountPercent) / 100 : 0;
      sub += lineSub;
      disc += lineDisc;
      count += item.quantity;
    });
    const net = sub - disc;
    const t = Math.round(net * 0.16 * 100) / 100;
    const tot = Math.round((net + t) * 100) / 100;
    return { subtotal: sub, totalDiscount: disc, tax: t, total: tot, itemCount: count };
  }, [posCart]);

  // Simulate scanning a barcode
  const handleSimulateBarcodeScan = () => {
    const available = posProducts.filter(p => p.stock > 0);
    if (available.length === 0) return;
    const randomProduct = available[Math.floor(Math.random() * available.length)];
    addToPosCart(randomProduct, 1);
  };

  // Keyboard shortcut to submit search as barcode scan
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      const exactMatch = posProducts.find(
        p => p.barcode === searchQuery.trim() || p.sku.toLowerCase() === searchQuery.trim().toLowerCase()
      );
      if (exactMatch && exactMatch.stock > 0) {
        addToPosCart(exactMatch, 1);
        setSearchQuery('');
      }
    }
  };

  return (
    <div className={`bg-stone-950 text-stone-100 min-h-screen flex flex-col ${isCompact ? 'text-xs' : ''}`}>
      
      {/* POS Top Terminal Bar */}
      <div className="bg-stone-900 border-b border-stone-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400" />
            <span className="font-mono text-xs font-semibold text-emerald-400 uppercase tracking-wide">
              Caja 01 · Activa
            </span>
          </div>
          <span className="text-stone-600 hidden sm:inline">|</span>
          <span className="text-xs text-stone-300 hidden sm:inline">
            Cajero: <strong className="text-white">Ana Morales</strong>
          </span>
        </div>

        {/* Live Clock & Scan quick trigger */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleSimulateBarcodeScan}
            className="flex items-center gap-1.5 px-3 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 hover:text-amber-200 border border-stone-700 rounded-lg text-xs font-mono transition-colors"
            title="Simula la lectura de un código de barras con lector láser"
          >
            <Barcode className="w-4 h-4" />
            <span className="hidden md:inline">Simular Escáner</span>
          </button>

          <div className="flex items-center gap-1.5 text-xs font-mono text-stone-400 bg-stone-950/60 px-2.5 py-1 rounded-lg border border-stone-800">
            <Clock className="w-3.5 h-3.5 text-stone-400" />
            <span>{currentTime || '--:--:--'}</span>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Keypad (Left) & Ticket (Right) */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden">
        
        {/* Left Side: Product Search, Categories & Touch Keypad */}
        <div className="flex-1 flex flex-col p-4 overflow-y-auto space-y-3">
          
          {/* Search bar & quick filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Buscar por nombre, SKU o código de barras (Presiona Enter)..."
                className="w-full pl-9 pr-4 py-2.5 bg-stone-900 border border-stone-800 rounded-xl text-xs sm:text-sm text-white placeholder-stone-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 font-sans"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-500 hover:text-stone-300 text-xs"
                >
                  Limpiar
                </button>
              )}
            </div>
          </div>

          {/* Category Tabs (Segmented interactive buttons) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-stone-950 font-semibold'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-800 hover:text-white border border-stone-800/80'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Touch Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3">
            {filteredProducts.map(product => {
              const isOutOfStock = product.stock <= 0;
              const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
              const inCartItem = posCart.find(c => c.productId === product.id);

              return (
                <button
                  key={product.id}
                  disabled={isOutOfStock}
                  onClick={() => addToPosCart(product, 1)}
                  className={`group relative text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                    isOutOfStock
                      ? 'bg-stone-900/40 border-stone-800/40 opacity-50 cursor-not-allowed'
                      : inCartItem
                      ? 'bg-stone-900 border-emerald-500/80 shadow-md shadow-emerald-950/30'
                      : 'bg-stone-900/80 hover:bg-stone-800/90 border-stone-800 hover:border-stone-700 active:scale-[0.98]'
                  }`}
                >
                  {/* Top: Image & Stock Badge */}
                  <div className="flex items-start gap-2.5 mb-2">
                    <div className="w-12 h-12 rounded-lg bg-stone-800 overflow-hidden shrink-0 border border-stone-700/60 relative">
                      <img
                        src={product.image}
                        alt={product.name}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                      />
                      {inCartItem && (
                        <div className="absolute inset-0 bg-emerald-950/70 backdrop-blur-xs flex items-center justify-center font-mono font-bold text-xs text-emerald-300">
                          +{inCartItem.quantity}
                        </div>
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[10px] font-mono text-stone-400 truncate">
                          {product.sku}
                        </span>
                        {/* Stock indicator */}
                        <span className={`text-[10px] font-mono tabular-nums shrink-0 ${
                          isOutOfStock
                            ? 'text-red-400 font-semibold'
                            : isLowStock
                            ? 'text-amber-400 font-semibold'
                            : 'text-stone-400'
                        }`}>
                          {isOutOfStock ? 'Sin stock' : `${product.stock} disp.`}
                        </span>
                      </div>
                      <h4 className="text-xs font-semibold text-stone-100 line-clamp-2 mt-0.5 leading-snug">
                        {product.name}
                      </h4>
                    </div>
                  </div>

                  {/* Bottom: Price & Quick Action */}
                  <div className="flex items-center justify-between pt-2 border-t border-stone-800/60 mt-auto">
                    <span className="font-mono text-sm font-bold text-emerald-400 tabular-nums">
                      ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="p-1 rounded bg-stone-800 group-hover:bg-emerald-500 group-hover:text-stone-950 text-stone-400 transition-colors">
                      <Plus className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </button>
              );
            })}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-12 text-stone-500 space-y-2">
              <Package className="w-10 h-10 mx-auto text-stone-600" />
              <p className="text-sm">No se encontraron productos para "{searchQuery}"</p>
              <button
                onClick={() => { setSearchQuery(''); setSelectedCategory('Todos'); }}
                className="text-xs text-amber-400 hover:underline"
              >
                Limpiar búsqueda y filtros
              </button>
            </div>
          )}
        </div>

        {/* Right Side: Cashier Ticket & Totals */}
        <div className="w-full lg:w-96 bg-stone-900 border-t lg:border-t-0 lg:border-l border-stone-800 flex flex-col justify-between shrink-0 shadow-2xl">
          
          {/* Ticket Header & Actions */}
          <div className="p-3.5 border-b border-stone-800 bg-stone-900/90 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif font-bold text-sm text-stone-100">Ticket Actual</span>
                <span className="text-[11px] font-mono text-stone-400">({itemCount} ítems)</span>
              </div>
              <span className="text-[10px] text-stone-400">Cliente de mostrador</span>
            </div>

            <div className="flex items-center gap-1.5">
              {/* Park ticket button */}
              <button
                onClick={() => holdCurrentPosCart()}
                disabled={posCart.length === 0}
                className="p-1.5 text-stone-400 hover:text-amber-300 hover:bg-stone-800 disabled:opacity-40 rounded-lg transition-colors"
                title="Poner ticket en espera"
              >
                <PauseCircle className="w-4 h-4" />
              </button>

              {/* View held tickets */}
              {heldCarts.length > 0 && (
                <button
                  onClick={() => setShowHeldModal(true)}
                  className="px-2 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-mono flex items-center gap-1"
                  title="Recuperar tickets en espera"
                >
                  <PlayCircle className="w-3.5 h-3.5" />
                  <span>{heldCarts.length}</span>
                </button>
              )}

              {/* Clear ticket */}
              <button
                onClick={clearPosCart}
                disabled={posCart.length === 0}
                className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-800 disabled:opacity-40 rounded-lg transition-colors"
                title="Vaciar ticket"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Line Items List */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2.5 divide-y divide-stone-800/60 max-h-[42vh] lg:max-h-none">
            {posCart.map(item => {
              const lineSub = item.unitPrice * item.quantity;
              const lineDisc = item.discountPercent ? (lineSub * item.discountPercent) / 100 : 0;
              const finalLineTotal = lineSub - lineDisc;
              const isDiscountOpen = activeDiscountItemId === item.productId;

              return (
                <div key={item.productId} className="pt-2 first:pt-0 space-y-1.5">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <h5 className="text-xs font-medium text-stone-200 truncate">
                        {item.product.name}
                      </h5>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 font-mono">
                        <span>${item.unitPrice.toFixed(2)} c/u</span>
                        <span>·</span>
                        <span>Stock: {item.product.stock}</span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-xs font-bold text-stone-100 tabular-nums">
                        ${finalLineTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      {item.discountPercent ? (
                        <div className="text-[10px] text-emerald-400 font-mono">
                          -{item.discountPercent}% (-${lineDisc.toFixed(2)})
                        </div>
                      ) : null}
                    </div>
                  </div>

                  {/* Quantity Stepper & Discount trigger */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 bg-stone-950 rounded-lg p-0.5 border border-stone-800">
                      <button
                        onClick={() => updatePosCartQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-stone-800 rounded text-stone-300"
                        title="Restar uno"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-white min-w-[24px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updatePosCartQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 hover:bg-stone-800 disabled:opacity-30 rounded text-stone-300"
                        title="Sumar uno"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setActiveDiscountItemId(isDiscountOpen ? null : item.productId)}
                        className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border transition-colors ${
                          item.discountPercent
                            ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                            : 'bg-stone-800 text-stone-300 border-stone-700 hover:text-white'
                        }`}
                        title="Aplicar descuento a esta línea"
                      >
                        <Percent className="w-2.5 h-2.5" />
                        <span>{item.discountPercent ? `${item.discountPercent}%` : 'Desc.'}</span>
                      </button>

                      <button
                        onClick={() => removeFromPosCart(item.productId)}
                        className="p-1 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded transition-colors"
                        title="Eliminar artículo"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Quick discount picker row */}
                  {isDiscountOpen && (
                    <div className="flex items-center gap-1 p-1 bg-stone-950 rounded-lg border border-stone-800 animate-fadeIn">
                      <span className="text-[9px] font-mono text-stone-400 pl-1">Desc:</span>
                      {[0, 5, 10, 15, 20].map(pct => (
                        <button
                          key={pct}
                          onClick={() => {
                            updatePosItemDiscount(item.productId, pct);
                            setActiveDiscountItemId(null);
                          }}
                          className={`flex-1 py-0.5 text-[10px] font-mono rounded ${
                            item.discountPercent === pct
                              ? 'bg-emerald-500 text-stone-950 font-bold'
                              : 'bg-stone-800 hover:bg-stone-700 text-stone-300'
                          }`}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {posCart.length === 0 && (
              <div className="text-center py-10 text-stone-500 space-y-2">
                <ShoppingBag className="w-8 h-8 mx-auto text-stone-600" />
                <p className="text-xs">Ticket vacío</p>
                <p className="text-[11px] text-stone-600">
                  Selecciona productos del teclado o usa el botón "Simular Escáner"
                </p>
              </div>
            )}
          </div>

          {/* Ticket Totals & Checkout Button */}
          <div className="p-3.5 bg-stone-950 border-t border-stone-800 space-y-2.5">
            <div className="space-y-1 text-xs">
              <div className="flex justify-between text-stone-400">
                <span>Subtotal:</span>
                <span className="font-mono tabular-nums">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              {totalDiscount > 0 && (
                <div className="flex justify-between text-emerald-400">
                  <span>Descuentos:</span>
                  <span className="font-mono tabular-nums">-${totalDiscount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-400">
                <span>IVA (16%):</span>
                <span className="font-mono tabular-nums">${tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-white pt-1.5 border-t border-stone-800">
                <span>TOTAL:</span>
                <span className="font-mono tabular-nums text-emerald-400 text-lg">
                  ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>

            {/* Big Cobrar Button */}
            <button
              onClick={() => setShowCheckoutModal(true)}
              disabled={posCart.length === 0}
              className="w-full py-3.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-800 disabled:text-stone-600 text-stone-950 font-bold rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/40 active:scale-[0.99]"
            >
              <span>COBRAR</span>
              <span className="font-mono font-black">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </button>
          </div>

        </div>
      </div>

      {/* Held Carts Modal */}
      {showHeldModal && (
        <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl max-w-md w-full p-6 shadow-2xl">
            <h3 className="text-base font-bold text-amber-300 mb-3 flex items-center gap-2">
              <PlayCircle className="w-5 h-5" />
              <span>Tickets en Espera</span>
            </h3>

            <div className="space-y-2 max-h-72 overflow-y-auto mb-4">
              {heldCarts.map(cart => (
                <div key={cart.id} className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/60 flex items-center justify-between">
                  <div>
                    <h5 className="text-xs font-semibold text-stone-200">{cart.name}</h5>
                    <div className="text-[10px] text-stone-400 font-mono mt-0.5">
                      <span>{cart.items.length} artículos</span> · <span>Hora: {cart.date}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        restoreHeldCart(cart.id);
                        setShowHeldModal(false);
                      }}
                      className="px-2.5 py-1 bg-amber-500 text-stone-950 font-semibold rounded-lg text-xs hover:bg-amber-400"
                    >
                      Recuperar
                    </button>
                    <button
                      onClick={() => deleteHeldCart(cart.id)}
                      className="p-1 text-stone-400 hover:text-red-400"
                      title="Descartar"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={() => setShowHeldModal(false)}
              className="w-full py-2 bg-stone-800 text-stone-300 rounded-xl text-xs hover:bg-stone-700"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}

      {/* Checkout Modal */}
      {showCheckoutModal && (
        <PosCheckoutModal
          total={total}
          subtotal={subtotal}
          tax={tax}
          discount={totalDiscount}
          itemCount={itemCount}
          onClose={() => setShowCheckoutModal(false)}
          onConfirm={(params) => {
            const order = checkoutPos(params);
            setShowCheckoutModal(false);
            if (order) {
              setCompletedOrder(order);
            }
            return order;
          }}
        />
      )}

      {/* Thermal Receipt Print Modal */}
      {completedOrder && (
        <ReceiptModal
          order={completedOrder}
          onClose={() => setCompletedOrder(null)}
          onNewSale={() => setCompletedOrder(null)}
        />
      )}

    </div>
  );
};
