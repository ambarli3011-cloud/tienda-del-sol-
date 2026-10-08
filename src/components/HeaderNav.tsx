import React, { useState } from 'react';
import { useCommerce } from '../context/CommerceContext';
import { AppViewMode } from '../types';
import { 
  ShoppingBag, 
  Store, 
  Columns2, 
  Layers, 
  RefreshCw, 
  CheckCircle2, 
  Info,
  X
} from 'lucide-react';

interface HeaderNavProps {
  currentView: AppViewMode;
  onViewChange: (view: AppViewMode) => void;
}

export const HeaderNav: React.FC<HeaderNavProps> = ({ currentView, onViewChange }) => {
  const { 
    products, 
    posCart, 
    onlineCart, 
    lastSyncEvent, 
    isFirebaseActive, 
    firebaseProjectId, 
    syncAllProductsToFirebase, 
    executeFirebaseLiveTest,
    resetAllData 
  } = useCommerce();
  const [showSyncInfo, setShowSyncInfo] = useState(false);

  const posCartCount = posCart.reduce((sum, item) => sum + item.quantity, 0);
  const onlineCartCount = onlineCart.reduce((sum, item) => sum + item.quantity, 0);
  const lowStockCount = products.filter(p => p.stock <= p.minStockAlert).length;

  return (
    <>
      <header className="sticky top-0 z-40 bg-stone-900 text-stone-100 border-b border-stone-800 backdrop-blur-md select-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          
          {/* Zone 1: Single element brand wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => onViewChange('dual')}
              className="text-left group focus:outline-none"
              title="AURA Retail Hub"
            >
              <span className="font-serif text-xl tracking-wider font-semibold text-stone-100 group-hover:text-amber-300 transition-colors">
                AURA
              </span>
              <span className="text-xs text-stone-400 font-mono tracking-tight ml-2 hidden sm:inline">
                RETAIL & COMMERCE
              </span>
            </button>
          </div>

          {/* Zone 2: Navigation / View Mode Switcher (Interactive Segmented Control) */}
          <nav aria-label="Modo de trabajo" className="flex items-center p-1 bg-stone-800/90 rounded-xl border border-stone-700/60 shadow-inner">
            <button
              onClick={() => onViewChange('dual')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                currentView === 'dual'
                  ? 'bg-amber-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
              title="Ver Tienda Online y Punto de Venta en pantalla dividida en tiempo real"
            >
              <Columns2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Vista Dual</span>
              <span className="sm:hidden">Dual</span>
            </button>

            <button
              onClick={() => onViewChange('online')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${
                currentView === 'online'
                  ? 'bg-stone-100 text-stone-900 font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
              title="Tienda Online para clientes con carrito de compras"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Tienda Online</span>
              {onlineCartCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-amber-500 text-stone-950 rounded-full font-mono font-bold">
                  {onlineCartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onViewChange('pos')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${
                currentView === 'pos'
                  ? 'bg-emerald-500 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
              title="Terminal de caja registradora tipo POS para mostrador"
            >
              <Store className="w-3.5 h-3.5" />
              <span>Punto de Venta POS</span>
              {posCartCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] bg-stone-900 text-emerald-400 rounded-full font-mono font-bold">
                  {posCartCount}
                </span>
              )}
            </button>

            <button
              onClick={() => onViewChange('inventory')}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap relative ${
                currentView === 'inventory'
                  ? 'bg-amber-100 text-stone-950 font-semibold shadow-sm'
                  : 'text-stone-300 hover:text-white hover:bg-stone-700/60'
              }`}
              title="Gestor central de inventario y pedidos unificados"
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Inventario & Ventas</span>
              <span className="md:hidden">Inventario</span>
              {lowStockCount > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" title={`${lowStockCount} con bajo stock`} />
              )}
            </button>
          </nav>

          {/* Zone 3: Sync Status & Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setShowSyncInfo(true)}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs text-stone-300 hover:text-white bg-stone-800/80 hover:bg-stone-700 rounded-lg border border-stone-700/50 transition-colors"
              title="Información de base de datos Firebase tienda-de-sol"
            >
              <span className={`w-2 h-2 rounded-full ${isFirebaseActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <span className="hidden lg:inline font-mono text-[11px] text-emerald-400 font-medium">
                Firebase: {firebaseProjectId}
              </span>
              <Info className="w-3.5 h-3.5 text-stone-400" />
            </button>

            <button
              onClick={() => syncAllProductsToFirebase()}
              className="px-2.5 py-1 bg-stone-800 hover:bg-stone-700 text-amber-300 border border-stone-700 rounded-lg text-xs font-mono hidden sm:flex items-center gap-1 transition-colors"
              title="Guardar todos los productos en la base de datos Firestore (tienda-de-sol)"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Guardar en BD</span>
            </button>

            <button
              onClick={() => executeFirebaseLiveTest()}
              className="px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/60 text-emerald-300 rounded-lg text-xs font-mono hidden md:flex items-center gap-1 transition-colors"
              title="Realizar una prueba de venta en la base de datos Firestore con descuento de stock"
            >
              <span>⚡ Probar Venta en BD</span>
            </button>

            <button
              onClick={() => {
                if (window.confirm('¿Deseas reiniciar los datos de demostración a su estado original?')) {
                  resetAllData();
                }
              }}
              className="p-1.5 text-stone-400 hover:text-stone-200 hover:bg-stone-800 rounded-lg transition-colors"
              title="Reiniciar datos de demostración"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>

        {/* Live sync pulse banner when action occurs */}
        {lastSyncEvent && (
          <div className="bg-gradient-to-r from-emerald-950/80 via-stone-900 to-amber-950/80 border-t border-emerald-500/30 px-4 py-1 text-xs text-emerald-300 flex items-center justify-between animate-fadeIn">
            <div className="max-w-7xl mx-auto w-full flex items-center justify-between">
              <div className="flex items-center gap-2 truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-semibold text-emerald-300">{lastSyncEvent.title}:</span>
                <span className="text-stone-300 truncate">{lastSyncEvent.detail}</span>
              </div>
              <span className="text-[10px] text-stone-400 font-mono shrink-0 ml-2">Stock compartido en vivo</span>
            </div>
          </div>
        )}
      </header>

      {/* Sync Explanation Dialog */}
      {showSyncInfo && (
        <div className="fixed inset-0 z-50 bg-stone-950/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setShowSyncInfo(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="text-lg font-serif font-bold text-amber-300 mb-2">
              Sincronización Unificada POS & Tienda Online
            </h3>
            <p className="text-sm text-stone-300 leading-relaxed mb-4">
              Esta plataforma resuelve la problemática de inventarios duplicados conectando ambos canales a una base de datos central en tiempo real:
            </p>

            <div className="space-y-3 text-xs text-stone-300 mb-6">
              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/60 flex items-start gap-3">
                <Store className="w-4 h-4 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-emerald-400 block mb-0.5">Venta en Mostrador (POS)</strong>
                  Al cobrar un producto con el punto de venta, las existencias se descuentan al instante en la tienda en línea para evitar sobreventa.
                </div>
              </div>

              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/60 flex items-start gap-3">
                <ShoppingBag className="w-4 h-4 text-amber-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-amber-400 block mb-0.5">Pedido en Tienda Online</strong>
                  Cuando un cliente en línea realiza una compra, el inventario del cajero físico se actualiza inmediatamente mostrando el nuevo stock disponible.
                </div>
              </div>

              <div className="p-3 bg-stone-800/80 rounded-xl border border-stone-700/60 flex items-start gap-3">
                <Columns2 className="w-4 h-4 text-sky-400 mt-0.5 shrink-0" />
                <div>
                  <strong className="text-sky-400 block mb-0.5">Modo Dual (Pantalla Dividida)</strong>
                  Permite trabajar o visualizar ambos canales a la vez en paralelo para operadores que administran ventas físicas y pedidos digitales simultáneamente.
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSyncInfo(false)}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl text-xs transition-colors"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </>
  );
};
