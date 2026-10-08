import React, { useState, useMemo } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { Product } from '../../types';
import { ProductDetailModal } from './ProductDetailModal';
import { OnlineCartDrawer } from './OnlineCartDrawer';
import { OnlineCheckoutModal } from './OnlineCheckoutModal';
import { 
  ShoppingBag, 
  Search, 
  ArrowRight, 
  Sparkles, 
  ShieldCheck, 
  Truck, 
  Store, 
  Heart,
  Eye,
  SlidersHorizontal
} from 'lucide-react';

interface OnlineStoreViewProps {
  isCompact?: boolean;
}

export const OnlineStoreView: React.FC<OnlineStoreViewProps> = ({ isCompact = false }) => {
  const { 
    products, 
    onlineCart, 
    addToOnlineCart, 
    updateOnlineCartQuantity, 
    removeFromOnlineCart, 
    clearOnlineCart, 
    checkoutOnline 
  } = useCommerce();

  const [selectedCategory, setSelectedCategory] = useState<string>('Todos');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  // Filter products for online store
  const onlineProducts = useMemo(() => {
    return products.filter(p => p.isOnline !== false);
  }, [products]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    onlineProducts.forEach(p => set.add(p.category));
    return ['Todos', ...Array.from(set)];
  }, [onlineProducts]);

  const filteredProducts = useMemo(() => {
    return onlineProducts.filter(p => {
      const matchCat = selectedCategory === 'Todos' || p.category === selectedCategory;
      const q = searchQuery.toLowerCase().trim();
      const matchQ = !q || 
        p.name.toLowerCase().includes(q) || 
        p.subtitle.toLowerCase().includes(q) || 
        p.description.toLowerCase().includes(q);
      return matchCat && matchQ;
    });
  }, [onlineProducts, selectedCategory, searchQuery]);

  // Cart totals
  const totalCartCount = onlineCart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = onlineCart.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const cartTax = Math.round(cartSubtotal * 0.16 * 100) / 100;
  const isFreeShipping = cartSubtotal >= 800;
  const shippingCost = onlineCart.length === 0 ? 0 : (isFreeShipping ? 0 : 99);
  const cartTotal = cartSubtotal + cartTax;

  return (
    <div className={`bg-[#FAF9F5] text-stone-900 min-h-screen flex flex-col font-sans ${isCompact ? 'text-xs' : ''}`}>
      
      {/* Store Header */}
      <header className="sticky top-0 z-30 bg-[#FAF9F5]/90 backdrop-blur-md border-b border-stone-200">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-2">
            <span className="font-serif font-bold text-lg tracking-wide text-stone-900">
              AURA
            </span>
            <span className="text-[11px] text-stone-500 font-mono hidden sm:inline">
              Boutique Online
            </span>
          </div>

          {/* Search bar */}
          <div className="relative max-w-xs w-full hidden sm:block">
            <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar en el catálogo..."
              className="w-full pl-8 pr-3 py-1.5 bg-white border border-stone-200 rounded-lg text-xs text-stone-800 placeholder-stone-400 focus:outline-none focus:border-stone-900"
            />
          </div>

          {/* Shopping Bag Button */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-2 px-3 py-1.5 bg-stone-900 text-white rounded-lg text-xs font-medium hover:bg-stone-800 transition-colors shadow-sm"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Bolsa</span>
              <span className="font-mono bg-stone-800 px-1.5 py-0.2 rounded text-[11px]">
                {totalCartCount}
              </span>
            </button>
          </div>

        </div>
      </header>

      {/* Hero Section (E-commerce Campaign Focal Point) */}
      {!isCompact && (
        <section className="border-b border-stone-200 bg-gradient-to-b from-[#F5F3ED] to-[#FAF9F5] py-10 px-4">
          <div className="max-w-5xl mx-auto flex flex-col md:flex-row items-center gap-8 justify-between">
            <div className="max-w-xl space-y-3">
              <span className="text-xs font-mono text-amber-800 tracking-wider uppercase font-semibold">
                Colección 2026 · Cera Vegetal & Esencias Botánicas
              </span>
              <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900 leading-tight">
                Velones Artesanales, Velas en Vaso y Fragancias de Autor.
              </h1>
              <p className="text-sm text-stone-600 leading-relaxed max-w-lg">
                Elaborados a mano con cera de soja, parafina vegetal y aceites esenciales puros. Disponibles con envío a domicilio o retiro inmediato en nuestro punto de venta.
              </p>
              <div className="pt-2 flex items-center gap-4 text-xs font-medium text-stone-700">
                <span className="flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-stone-500" />
                  Envío gratis desde $800
                </span>
                <span className="text-stone-300">·</span>
                <span className="flex items-center gap-1.5">
                  <Store className="w-4 h-4 text-stone-500" />
                  Click & Collect en mostrador
                </span>
              </div>
            </div>

            {/* Hero Visual Pill Card */}
            <div className="w-full sm:w-72 aspect-square rounded-2xl overflow-hidden shadow-xl border border-stone-300/80 shrink-0 relative group">
              <img
                src="/src/assets/images/candle_velon_artesanal_1791501416291.jpg"
                alt="Velón Botánico Rústico Lavanda & Mirra"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-stone-950/80 via-transparent to-transparent flex flex-col justify-end p-4 text-white">
                <span className="text-[10px] uppercase tracking-wider font-mono text-amber-300">
                  Pieza de Autor
                </span>
                <h4 className="font-serif font-semibold text-sm">Velón Rústico Lavanda & Mirra</h4>
                <p className="text-xs font-mono tabular-nums text-stone-200">$380.00 MXN</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Main Catalog View */}
      <main className="max-w-6xl mx-auto px-4 py-8 flex-1 w-full space-y-6">
        
        {/* Category Controls & Search (Mobile/Compact) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Category Tabs (Segmented control) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                  selectedCategory === cat
                    ? 'bg-stone-900 text-white shadow-sm'
                    : 'bg-white text-stone-600 hover:text-stone-900 border border-stone-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="text-xs text-stone-500 font-mono shrink-0">
            {filteredProducts.length} productos disponibles
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map(product => {
            const isOutOfStock = product.stock <= 0;
            const isLowStock = product.stock > 0 && product.stock <= product.minStockAlert;
            const inCart = onlineCart.find(c => c.productId === product.id);

            return (
              <div
                key={product.id}
                className="group bg-white rounded-xl border border-stone-200/80 overflow-hidden hover:border-stone-400 hover:shadow-lg transition-all flex flex-col justify-between"
              >
                {/* Product Image Lead with 1:1 ratio */}
                <div 
                  className="aspect-square bg-stone-100 overflow-hidden relative cursor-pointer"
                  onClick={() => setSelectedProduct(product)}
                >
                  <img
                    src={product.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  />

                  {/* Stock tag / Status */}
                  <div className="absolute top-2.5 left-2.5">
                    {isOutOfStock ? (
                      <span className="px-2 py-0.5 bg-stone-900/90 backdrop-blur-xs text-white text-[10px] font-medium rounded">
                        Agotado
                      </span>
                    ) : isLowStock ? (
                      <span className="px-2 py-0.5 bg-amber-600/90 backdrop-blur-xs text-white text-[10px] font-medium rounded">
                        Últimas {product.stock} piezas
                      </span>
                    ) : null}
                  </div>

                  {/* Quick View Button on Hover */}
                  <div className="absolute inset-0 bg-stone-900/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="px-3 py-1.5 bg-white/95 text-stone-900 rounded-lg text-xs font-semibold shadow flex items-center gap-1.5">
                      <Eye className="w-3.5 h-3.5" />
                      Ver Detalles
                    </span>
                  </div>
                </div>

                {/* Product Info */}
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    {/* Unboxed clean metadata with dot separator */}
                    <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-1">
                      <span>{product.category}</span>
                      <span aria-hidden="true">·</span>
                      <span className="font-mono">{product.stock} en stock</span>
                    </div>

                    <h3 
                      onClick={() => setSelectedProduct(product)}
                      className="font-serif font-semibold text-stone-900 text-sm group-hover:text-amber-800 transition-colors cursor-pointer line-clamp-1"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-stone-500 line-clamp-2 mt-0.5">
                      {product.subtitle}
                    </p>
                  </div>

                  {/* Price & Action */}
                  <div className="pt-3 mt-3 border-t border-stone-100 flex items-center justify-between">
                    <div>
                      <span className="font-mono text-base font-bold text-stone-900 tabular-nums">
                        ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                      </span>
                      <span className="text-[10px] text-stone-400 block">IVA incl.</span>
                    </div>

                    <button
                      disabled={isOutOfStock}
                      onClick={() => addToOnlineCart(product, 1)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors ${
                        isOutOfStock
                          ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                          : inCart
                          ? 'bg-amber-600 text-white'
                          : 'bg-stone-900 text-white hover:bg-stone-800'
                      }`}
                    >
                      <ShoppingBag className="w-3 h-3" />
                      <span>{inCart ? `En bolsa (${inCart.quantity})` : 'Añadir'}</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-16 text-stone-500 space-y-2">
            <p className="text-base font-serif">No se encontraron artículos para esta selección.</p>
            <button
              onClick={() => { setSelectedCategory('Todos'); setSearchQuery(''); }}
              className="text-xs text-stone-800 underline font-medium"
            >
              Ver todo el catálogo
            </button>
          </div>
        )}
      </main>

      {/* Footer / Storefront Trust Section */}
      <footer className="mt-auto border-t border-stone-200 bg-white py-8 px-4 text-xs text-stone-600">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-stone-900 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block mb-0.5">Garantía Artesanal</strong>
              Seleccionamos café de microlote fresco y piezas moldeadas por maestros artesanos.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Store className="w-5 h-5 text-stone-900 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block mb-0.5">Retiro en Mostrador</strong>
              Paga en línea y recoge tu paquete en menos de 2 horas en nuestro punto de venta.
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Truck className="w-5 h-5 text-stone-900 shrink-0 mt-0.5" />
            <div>
              <strong className="text-stone-900 block mb-0.5">Envíos Cuidados</strong>
              Empaque libre de plástico reciclable con amortiguación reforzada para cerámica.
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto pt-6 mt-6 border-t border-stone-100 flex flex-col sm:flex-row items-center justify-between text-[11px] text-stone-500 gap-2">
          <span>© 2026 AURA Studio & Café. Todos los derechos reservados.</span>
          <span>Inventario compartido y sincronizado en tiempo real con terminal POS.</span>
        </div>
      </footer>

      {/* Product Detail Modal */}
      {selectedProduct && (
        <ProductDetailModal
          product={selectedProduct}
          currentInCartQty={onlineCart.find(c => c.productId === selectedProduct.id)?.quantity || 0}
          onClose={() => setSelectedProduct(null)}
          onAddToCart={(p, qty) => addToOnlineCart(p, qty)}
        />
      )}

      {/* Cart Drawer */}
      <OnlineCartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={onlineCart}
        onUpdateQuantity={updateOnlineCartQuantity}
        onRemoveItem={removeFromOnlineCart}
        onClearCart={clearOnlineCart}
        onProceedToCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      {isCheckoutOpen && (
        <OnlineCheckoutModal
          items={onlineCart}
          subtotal={cartSubtotal}
          tax={cartTax}
          total={cartTotal}
          shippingCost={shippingCost}
          onClose={() => setIsCheckoutOpen(false)}
          onConfirm={(params) => {
            const order = checkoutOnline(params);
            return order;
          }}
        />
      )}

    </div>
  );
};
