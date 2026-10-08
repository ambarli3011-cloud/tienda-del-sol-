import React, { useState, useMemo } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Product, Order, SalesChannel } from '../../types';
import { ReceiptModal } from '../Pos/ReceiptModal';
import { 
  Package, 
  Search, 
  Plus, 
  Minus, 
  AlertTriangle, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  Store, 
  ShoppingBag, 
  Edit3, 
  Trash2, 
  X, 
  FileText,
  DollarSign,
  ArrowUpDown,
  Filter
} from 'lucide-react';

export const InventoryOrdersView: React.FC = () => {
  const { 
    products, 
    orders, 
    adjustStock, 
    setExactStock, 
    upsertProduct, 
    deleteProduct, 
    toggleChannelVisibility,
    syncAllProductsToFirebase,
    executeFirebaseLiveTest,
    isFirebaseActive,
    firebaseProjectId
  } = useCommerce();

  const [activeTab, setActiveTab] = useState<'inventory' | 'orders'>('inventory');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('Todos');
  const [stockStatusFilter, setStockStatusFilter] = useState<'all' | 'low' | 'out'>('all');
  const [channelFilter, setChannelFilter] = useState<'all' | 'pos' | 'online'>('all');
  
  // Product editor modal
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);

  // Order ticket view modal
  const [selectedOrderForReceipt, setSelectedOrderForReceipt] = useState<Order | null>(null);

  // Form state for creating/editing product
  const [formData, setFormData] = useState<Partial<Product>>({
    name: '',
    subtitle: '',
    description: '',
    category: 'Café & Granos',
    price: 200,
    costPrice: 100,
    stock: 20,
    minStockAlert: 5,
    sku: '',
    barcode: '',
    image: '/src/assets/images/pos_coffee_bag_1791499545022.jpg',
    isOnline: true,
    isPos: true
  });

  const categories = useMemo(() => {
    const set = new Set<string>();
    products.forEach(p => set.add(p.category));
    return ['Todos', ...Array.from(set)];
  }, [products]);

  // Inventory KPIs
  const totalStockCount = products.reduce((acc, p) => acc + p.stock, 0);
  const totalInventoryValue = products.reduce((acc, p) => acc + (p.price * p.stock), 0);
  const lowStockCount = products.filter(p => p.stock > 0 && p.stock <= p.minStockAlert).length;
  const outOfStockCount = products.filter(p => p.stock === 0).length;

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      const matchCat = categoryFilter === 'Todos' || p.category === categoryFilter;
      const q = searchQuery.toLowerCase().trim();
      const matchQ = !q || p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q) || p.barcode.includes(q);
      
      let matchStock = true;
      if (stockStatusFilter === 'low') matchStock = p.stock > 0 && p.stock <= p.minStockAlert;
      if (stockStatusFilter === 'out') matchStock = p.stock === 0;

      return matchCat && matchQ && matchStock;
    });
  }, [products, categoryFilter, searchQuery, stockStatusFilter]);

  // Filtered Orders
  const filteredOrders = useMemo(() => {
    return orders.filter(o => {
      if (channelFilter === 'pos') return o.channel === 'pos';
      if (channelFilter === 'online') return o.channel === 'online';
      return true;
    });
  }, [orders, channelFilter]);

  // Handle open editor
  const handleOpenCreate = () => {
    const randomSku = `PROD-${Math.floor(100 + Math.random() * 900)}`;
    const randomBarcode = `750100${Math.floor(100000 + Math.random() * 900000)}`;
    setFormData({
      name: '',
      subtitle: '',
      description: '',
      category: 'Café & Granos',
      price: 250,
      costPrice: 120,
      stock: 25,
      minStockAlert: 5,
      sku: randomSku,
      barcode: randomBarcode,
      image: '/src/assets/images/pos_coffee_bag_1791499545022.jpg',
      isOnline: true,
      isPos: true
    });
    setEditingProduct(null);
    setIsEditorOpen(true);
  };

  const handleOpenEdit = (prod: Product) => {
    setFormData({ ...prod });
    setEditingProduct(prod);
    setIsEditorOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim()) return;

    const saved: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      sku: formData.sku?.trim() || `SKU-${Date.now()}`,
      barcode: formData.barcode?.trim() || `750${Date.now()}`,
      name: formData.name.trim(),
      subtitle: formData.subtitle?.trim() || '',
      description: formData.description?.trim() || '',
      category: formData.category || 'Varios',
      price: Number(formData.price) || 0,
      costPrice: Number(formData.costPrice) || 0,
      stock: Math.max(0, Number(formData.stock) || 0),
      minStockAlert: Math.max(1, Number(formData.minStockAlert) || 3),
      image: formData.image || '/src/assets/images/pos_coffee_bag_1791499545022.jpg',
      isOnline: formData.isOnline ?? true,
      isPos: formData.isPos ?? true,
    };

    upsertProduct(saved);
    setIsEditorOpen(false);
  };

  return (
    <div className="bg-stone-950 text-stone-100 min-h-screen p-4 sm:p-6 font-sans">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Top Header & Tab Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-stone-800 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="w-5 h-5 text-amber-400" />
              <h1 className="text-xl font-serif font-bold text-white">
                Centro de Inventario & Ventas Unificadas
              </h1>
            </div>
            <p className="text-xs text-stone-400 mt-1">
              Catálogo compartido en tiempo real para terminales POS y tienda en línea.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Functional tab switchers */}
            <div className="flex items-center p-1 bg-stone-900 rounded-xl border border-stone-800">
              <button
                onClick={() => setActiveTab('inventory')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'inventory'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Inventario ({products.length})
              </button>
              <button
                onClick={() => setActiveTab('orders')}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  activeTab === 'orders'
                    ? 'bg-amber-500 text-stone-950 font-bold'
                    : 'text-stone-400 hover:text-white'
                }`}
              >
                Ventas & Pedidos ({orders.length})
              </button>
            </div>

            {activeTab === 'inventory' && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => syncAllProductsToFirebase()}
                  className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-amber-300 border border-stone-800 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Respaldar todo el catálogo actual a Firestore (tienda-de-sol)"
                >
                  <span className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-emerald-400' : 'bg-amber-400'}`} />
                  <span>Sincronizar Firebase</span>
                </button>

                <button
                  onClick={() => executeFirebaseLiveTest()}
                  className="px-3 py-2 bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border border-emerald-700/60 rounded-xl text-xs font-mono flex items-center gap-1.5 transition-colors"
                  title="Realizar una prueba de venta en la base de datos Firestore y descontar existencias"
                >
                  <span>⚡ Probar Venta en BD</span>
                </button>

                <button
                  onClick={handleOpenCreate}
                  className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-bold rounded-xl text-xs flex items-center gap-1.5 transition-colors shadow-sm"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>Nuevo Producto</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab 1: Inventory View */}
        {activeTab === 'inventory' && (
          <div className="space-y-6">
            
            {/* KPI Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
                <span className="text-[11px] font-mono text-stone-400 block mb-1">Total de Productos</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-stone-100 tabular-nums">
                    {products.length}
                  </span>
                  <span className="text-xs text-stone-500">{categories.length - 1} categorías</span>
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
                <span className="text-[11px] font-mono text-stone-400 block mb-1">Unidades en Existencia</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums">
                    {totalStockCount}
                  </span>
                  <span className="text-xs text-stone-500">Unidades</span>
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
                <span className="text-[11px] font-mono text-stone-400 block mb-1">Valor Venta Estimado</span>
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold font-mono text-stone-100 tabular-nums">
                    ${totalInventoryValue.toLocaleString('es-MX', { maximumFractionDigits: 0 })}
                  </span>
                  <span className="text-xs text-stone-500">MXN</span>
                </div>
              </div>

              <div className="bg-stone-900 border border-stone-800 p-4 rounded-xl">
                <span className="text-[11px] font-mono text-stone-400 block mb-1">Alertas de Stock</span>
                <div className="flex items-baseline justify-between">
                  <span className={`text-2xl font-bold font-mono tabular-nums ${
                    outOfStockCount > 0 ? 'text-red-400' : lowStockCount > 0 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {lowStockCount + outOfStockCount}
                  </span>
                  <span className="text-xs text-stone-400">
                    {outOfStockCount > 0 ? `${outOfStockCount} agotados` : 'Bajo control'}
                  </span>
                </div>
              </div>
            </div>

            {/* Filters Bar */}
            <div className="bg-stone-900 border border-stone-800 p-3 rounded-xl flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Buscar por nombre, SKU o código de barras..."
                  className="w-full pl-9 pr-3 py-1.5 bg-stone-950 border border-stone-800 rounded-lg text-xs text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="flex items-center gap-2 overflow-x-auto">
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  aria-label="Filtrar por categoría"
                  className="bg-stone-950 border border-stone-800 text-stone-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-amber-400"
                >
                  {categories.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>

                <div className="flex items-center p-0.5 bg-stone-950 rounded-lg border border-stone-800 text-xs">
                  <button
                    onClick={() => setStockStatusFilter('all')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      stockStatusFilter === 'all' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Todos
                  </button>
                  <button
                    onClick={() => setStockStatusFilter('low')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      stockStatusFilter === 'low' ? 'bg-amber-950 text-amber-300' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Bajo Stock
                  </button>
                  <button
                    onClick={() => setStockStatusFilter('out')}
                    className={`px-2.5 py-1 rounded text-[11px] font-medium transition-colors ${
                      stockStatusFilter === 'out' ? 'bg-red-950 text-red-300' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Agotados
                  </button>
                </div>
              </div>
            </div>

            {/* Inventory Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-850 text-stone-400 font-mono text-[11px] border-b border-stone-800 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Producto</th>
                      <th className="py-3 px-4">Categoría</th>
                      <th className="py-3 px-4 text-center">Stock Actual</th>
                      <th className="py-3 px-4">P. Venta / Costo</th>
                      <th className="py-3 px-4 text-center">Canales Activos</th>
                      <th className="py-3 px-4 text-right">Ajuste Rápido & Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-sans">
                    {filteredProducts.map(product => {
                      const isOutOfStock = product.stock === 0;
                      const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
                      const margin = product.price > 0 
                        ? Math.round(((product.price - product.costPrice) / product.price) * 100) 
                        : 0;

                      return (
                        <tr key={product.id} className="hover:bg-stone-850/60 transition-colors">
                          
                          {/* Product Info */}
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-3">
                              <img
                                src={product.image}
                                alt={product.name}
                                referrerPolicy="no-referrer"
                                className="w-10 h-10 rounded-lg object-cover bg-stone-800 border border-stone-700 shrink-0"
                              />
                              <div>
                                <h4 className="font-semibold text-stone-100">{product.name}</h4>
                                <div className="text-[10px] text-stone-400 font-mono flex items-center gap-2 mt-0.5">
                                  <span>SKU: {product.sku}</span>
                                  <span>·</span>
                                  <span>Bar: {product.barcode}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Category */}
                          <td className="py-3 px-4 text-stone-300">
                            {product.category}
                          </td>

                          {/* Stock Counter with inline alerts */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex flex-col items-center">
                              <span className={`font-mono text-sm font-bold tabular-nums ${
                                isOutOfStock ? 'text-red-400' : isLowStock ? 'text-amber-400' : 'text-emerald-400'
                              }`}>
                                {product.stock}
                              </span>
                              <span className="text-[10px] text-stone-500 font-mono">
                                Min: {product.minStockAlert}
                              </span>
                            </div>
                          </td>

                          {/* Pricing & Margin */}
                          <td className="py-3 px-4">
                            <div className="font-mono text-xs">
                              <span className="font-bold text-stone-100 tabular-nums">
                                ${product.price.toFixed(2)}
                              </span>
                              <div className="text-[10px] text-stone-500 flex items-center gap-1.5 mt-0.5">
                                <span>Costo: ${product.costPrice.toFixed(2)}</span>
                                <span className="text-emerald-400">({margin}%)</span>
                              </div>
                            </div>
                          </td>

                          {/* Channel Toggles */}
                          <td className="py-3 px-4 text-center">
                            <div className="inline-flex items-center gap-2">
                              <button
                                onClick={() => toggleChannelVisibility(product.id, 'pos')}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border transition-colors ${
                                  product.isPos
                                    ? 'bg-emerald-950 text-emerald-300 border-emerald-700/60'
                                    : 'bg-stone-900 text-stone-500 border-stone-800 opacity-60'
                                }`}
                                title="Visible en Terminal POS"
                              >
                                <Store className="w-3 h-3" />
                                <span>POS</span>
                              </button>

                              <button
                                onClick={() => toggleChannelVisibility(product.id, 'online')}
                                className={`px-2 py-0.5 rounded text-[10px] font-mono flex items-center gap-1 border transition-colors ${
                                  product.isOnline
                                    ? 'bg-amber-950 text-amber-300 border-amber-700/60'
                                    : 'bg-stone-900 text-stone-500 border-stone-800 opacity-60'
                                }`}
                                title="Visible en Tienda Online"
                              >
                                <ShoppingBag className="w-3 h-3" />
                                <span>Web</span>
                              </button>
                            </div>
                          </td>

                          {/* Quick Adjustments */}
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Quick +10 restock */}
                              <button
                                onClick={() => adjustStock(product.id, 10)}
                                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] font-mono transition-colors"
                                title="Añadir +10 piezas al inventario"
                              >
                                +10
                              </button>

                              {/* Quick +5 restock */}
                              <button
                                onClick={() => adjustStock(product.id, 5)}
                                className="px-2 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded text-[11px] font-mono transition-colors"
                                title="Añadir +5 piezas"
                              >
                                +5
                              </button>

                              {/* -1 decrement */}
                              <button
                                onClick={() => adjustStock(product.id, -1)}
                                disabled={product.stock <= 0}
                                className="p-1 bg-stone-800 hover:bg-stone-700 disabled:opacity-40 text-stone-300 rounded transition-colors"
                                title="Restar 1 pieza"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>

                              {/* Edit product */}
                              <button
                                onClick={() => handleOpenEdit(product)}
                                className="p-1.5 text-stone-400 hover:text-white hover:bg-stone-800 rounded transition-colors"
                                title="Editar producto"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              {/* Delete */}
                              <button
                                onClick={() => {
                                  if (window.confirm(`¿Eliminar definitivamente "${product.name}"?`)) {
                                    deleteProduct(product.id);
                                  }
                                }}
                                className="p-1.5 text-stone-500 hover:text-red-400 hover:bg-stone-800 rounded transition-colors"
                                title="Eliminar del catálogo"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>

                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {filteredProducts.length === 0 && (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <Package className="w-8 h-8 mx-auto text-stone-600" />
                  <p className="text-xs">No se encontraron productos con los filtros aplicados</p>
                </div>
              )}
            </div>

          </div>
        )}

        {/* Tab 2: Orders View */}
        {activeTab === 'orders' && (
          <div className="space-y-4">
            
            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-3 bg-stone-900 border border-stone-800 p-3 rounded-xl">
              <div className="flex items-center gap-2">
                <span className="text-xs text-stone-400 font-medium">Filtrar Canal:</span>
                <div className="flex items-center p-0.5 bg-stone-950 rounded-lg border border-stone-800 text-xs">
                  <button
                    onClick={() => setChannelFilter('all')}
                    className={`px-3 py-1 rounded text-xs font-medium ${
                      channelFilter === 'all' ? 'bg-stone-800 text-white' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    Todos ({orders.length})
                  </button>
                  <button
                    onClick={() => setChannelFilter('pos')}
                    className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${
                      channelFilter === 'pos' ? 'bg-emerald-950 text-emerald-300' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <Store className="w-3 h-3" />
                    <span>POS ({orders.filter(o => o.channel === 'pos').length})</span>
                  </button>
                  <button
                    onClick={() => setChannelFilter('online')}
                    className={`px-3 py-1 rounded text-xs font-medium flex items-center gap-1.5 ${
                      channelFilter === 'online' ? 'bg-amber-950 text-amber-300' : 'text-stone-400 hover:text-white'
                    }`}
                  >
                    <ShoppingBag className="w-3 h-3" />
                    <span>Online ({orders.filter(o => o.channel === 'online').length})</span>
                  </button>
                </div>
              </div>

              <span className="text-xs font-mono text-stone-400">
                Total Ventas: ${orders.reduce((sum, o) => sum + o.total, 0).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
              </span>
            </div>

            {/* Orders Table */}
            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-xl">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-stone-850 text-stone-400 font-mono text-[11px] border-b border-stone-800 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Folio</th>
                      <th className="py-3 px-4">Canal</th>
                      <th className="py-3 px-4">Fecha / Hora</th>
                      <th className="py-3 px-4">Cliente</th>
                      <th className="py-3 px-4">Artículos</th>
                      <th className="py-3 px-4">Método de Pago</th>
                      <th className="py-3 px-4 text-right">Total</th>
                      <th className="py-3 px-4 text-center">Acción</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-800/60 font-sans">
                    {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-stone-850/60 transition-colors">
                        <td className="py-3 px-4 font-mono font-bold text-stone-100">
                          {order.orderNumber}
                        </td>
                        <td className="py-3 px-4">
                          {order.channel === 'pos' ? (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400">
                              <Store className="w-3 h-3" />
                              POS Mostrador
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-amber-400">
                              <ShoppingBag className="w-3 h-3" />
                              Tienda Online
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-400 font-mono text-[11px]">
                          {new Date(order.createdAt).toLocaleDateString('es-MX', {
                            day: '2-digit',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-medium text-stone-200 block">{order.customer.name}</span>
                          {order.customer.deliveryType && (
                            <span className="text-[10px] text-stone-500 uppercase">
                              {order.customer.deliveryType === 'pickup' ? 'Retiro en tienda' : 'Envío domicilio'}
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-stone-300">
                          {order.items.map((it, idx) => (
                            <div key={idx} className="truncate max-w-xs text-[11px]">
                              {it.quantity}x {it.product.name}
                            </div>
                          ))}
                        </td>
                        <td className="py-3 px-4 text-stone-300 uppercase text-[11px]">
                          {order.paymentMethod === 'cash' && 'Efectivo'}
                          {order.paymentMethod === 'pos_card' && 'Tarjeta POS'}
                          {order.paymentMethod === 'transfer' && 'SPEI / QR'}
                          {order.paymentMethod === 'online_card' && 'Tarjeta Web'}
                          {order.paymentMethod === 'online_transfer' && 'Transferencia Web'}
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-stone-100 tabular-nums">
                          ${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <button
                            onClick={() => setSelectedOrderForReceipt(order)}
                            className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-lg text-xs font-medium flex items-center gap-1 mx-auto transition-colors"
                          >
                            <FileText className="w-3.5 h-3.5 text-amber-400" />
                            <span>Ver Ticket</span>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {filteredOrders.length === 0 && (
                <div className="py-12 text-center text-stone-500 space-y-2">
                  <FileText className="w-8 h-8 mx-auto text-stone-600" />
                  <p className="text-xs">No hay ventas registradas en este canal</p>
                </div>
              )}
            </div>

          </div>
        )}

      </div>

      {/* Product Form Modal (Create or Edit) */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative my-auto animate-scaleUp">
            
            <button
              onClick={() => setIsEditorOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-serif font-bold text-white mb-4">
              {editingProduct ? 'Editar Producto' : 'Registrar Nuevo Producto'}
            </h2>

            <form onSubmit={handleSaveProduct} className="space-y-4 text-xs">
              <div>
                <label className="block text-stone-300 font-medium mb-1">Nombre del Producto *</label>
                <input
                  type="text"
                  required
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ej. Café Molido Mezcla de la Casa"
                  className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Categoría</label>
                  <input
                    type="text"
                    value={formData.category || ''}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    placeholder="Café & Granos, Cerámica, etc."
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Subtítulo / Variedad</label>
                  <input
                    type="text"
                    value={formData.subtitle || ''}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    placeholder="250g, notas, material..."
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Código SKU</label>
                  <input
                    type="text"
                    value={formData.sku || ''}
                    onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                    placeholder="CAF-001"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Código de Barras</label>
                  <input
                    type="text"
                    value={formData.barcode || ''}
                    onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                    placeholder="750100100101"
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Precio Venta ($) *</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    required
                    value={formData.price ?? ''}
                    onChange={(e) => setFormData({ ...formData, price: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Costo Unitario ($)</label>
                  <input
                    type="number"
                    min={0}
                    step="any"
                    value={formData.costPrice ?? ''}
                    onChange={(e) => setFormData({ ...formData, costPrice: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div>
                  <label className="block text-stone-300 font-medium mb-1">Stock Inicial *</label>
                  <input
                    type="number"
                    min={0}
                    required
                    value={formData.stock ?? ''}
                    onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                    className="w-full px-3 py-2 bg-stone-950 border border-stone-800 rounded-lg text-white font-mono focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              {/* Channel Availability Checkboxes */}
              <div className="p-3 bg-stone-950 rounded-xl border border-stone-800 space-y-2">
                <span className="text-[11px] font-medium text-stone-400 block">Canales de Venta Permitidos:</span>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer text-stone-200">
                    <input
                      type="checkbox"
                      checked={formData.isPos ?? true}
                      onChange={(e) => setFormData({ ...formData, isPos: e.target.checked })}
                      className="rounded accent-emerald-500"
                    />
                    <span>Vender en POS mostrador</span>
                  </label>

                  <label className="flex items-center gap-2 cursor-pointer text-stone-200">
                    <input
                      type="checkbox"
                      checked={formData.isOnline ?? true}
                      onChange={(e) => setFormData({ ...formData, isOnline: e.target.checked })}
                      className="rounded accent-amber-500"
                    />
                    <span>Publicar en Tienda Online</span>
                  </label>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditorOpen(false)}
                  className="px-4 py-2 bg-stone-800 hover:bg-stone-700 text-stone-300 rounded-xl"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold rounded-xl"
                >
                  Guardar Producto
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

      {/* Ticket Modal */}
      {selectedOrderForReceipt && (
        <ReceiptModal
          order={selectedOrderForReceipt}
          onClose={() => setSelectedOrderForReceipt(null)}
        />
      )}

    </div>
  );
};
