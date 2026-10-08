import React, { useState } from 'react';
import { useCommerce } from '../../context/CommerceContext';
import { OnlineStoreView } from '../OnlineStore/OnlineStoreView';
import { PosView } from '../Pos/PosView';
import { 
  Columns2, 
  ArrowLeftRight, 
  Sparkles, 
  CheckCircle2, 
  Zap, 
  ShoppingBag, 
  Store,
  Maximize2
} from 'lucide-react';

interface DualSplitViewProps {
  onSelectView: (view: 'online' | 'pos') => void;
}

export const DualSplitView: React.FC<DualSplitViewProps> = ({ onSelectView }) => {
  const { products, addToPosCart, checkoutPos, addToOnlineCart, checkoutOnline } = useCommerce();
  const [splitRatio, setSplitRatio] = useState<'50-50' | '60-40' | '40-60'>('50-50');
  const [demoNotice, setDemoNotice] = useState<string | null>(null);

  // Quick 1-click test simulation to show off real-time stock sync
  const handleQuickPosSale = () => {
    const item = products.find(p => p.stock > 0);
    if (!item) return;

    addToPosCart(item, 1);
    const order = checkoutPos({
      paymentMethod: 'cash',
      customer: { name: 'Cliente mostrador (Prueba en vivo)' },
      cashReceived: item.price,
      cashierName: 'Cajero Rápido'
    });

    if (order) {
      setDemoNotice(`Venta POS completada y guardada en Firestore (tienda-de-sol): Se descontó 1x "${item.name}". Observa el stock actualizado en la tienda online.`);
      setTimeout(() => setDemoNotice(null), 5000);
    }
  };

  const handleQuickOnlineOrder = () => {
    const item = products.find(p => p.stock > 0);
    if (!item) return;

    addToOnlineCart(item, 1);
    const order = checkoutOnline({
      paymentMethod: 'online_card',
      customer: {
        name: 'Cliente Web Demo',
        email: 'demo@tienda-de-sol.com',
        deliveryType: 'pickup'
      }
    });

    if (order) {
      setDemoNotice(`Pedido Online registrado y guardado en Firestore (tienda-de-sol): Se descontó 1x "${item.name}". Observa cómo el botón del teclado POS a la derecha refleja el nuevo stock.`);
      setTimeout(() => setDemoNotice(null), 5000);
    }
  };

  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)] bg-stone-950">
      
      {/* Synchronization Control Strip */}
      <div className="bg-gradient-to-r from-stone-900 via-stone-850 to-stone-900 border-b border-stone-800 px-4 py-2 flex flex-wrap items-center justify-between gap-3 text-xs text-stone-300">
        
        {/* Left: Indicator */}
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-amber-300 font-medium">
            <Columns2 className="w-3.5 h-3.5" />
            <span>Modo Conjunto: Tienda Online & POS en Paralelo</span>
          </div>
          <span className="text-stone-500 hidden md:inline">|</span>
          <span className="text-[11px] text-stone-400 hidden lg:inline">
            El inventario se sincroniza en ambos paneles en tiempo real.
          </span>
        </div>

        {/* Center: Live interactive test triggers */}
        <div className="flex items-center gap-2">
          <span className="text-[11px] text-stone-400 font-mono hidden sm:inline">Probar Sincronización:</span>
          
          <button
            onClick={handleQuickPosSale}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-950/80 hover:bg-emerald-900 border border-emerald-600/50 text-emerald-300 rounded-lg text-[11px] font-medium transition-colors"
            title="Realiza una venta de prueba en mostrador para ver el stock actualizarse en la tienda web"
          >
            <Store className="w-3 h-3 text-emerald-400" />
            <span>+ Venta POS Rápida</span>
          </button>

          <button
            onClick={handleQuickOnlineOrder}
            className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-950/80 hover:bg-amber-900 border border-amber-600/50 text-amber-300 rounded-lg text-[11px] font-medium transition-colors"
            title="Realiza una compra web de prueba para ver el stock actualizarse en la pantalla de caja"
          >
            <ShoppingBag className="w-3 h-3 text-amber-400" />
            <span>+ Compra Web Rápida</span>
          </button>
        </div>

        {/* Right: Split ratio controls */}
        <div className="flex items-center gap-1 bg-stone-900 p-0.5 rounded-lg border border-stone-800">
          <button
            onClick={() => setSplitRatio('50-50')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
              splitRatio === '50-50' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            50 / 50
          </button>
          <button
            onClick={() => setSplitRatio('60-40')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
              splitRatio === '60-40' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            Tienda +
          </button>
          <button
            onClick={() => setSplitRatio('40-60')}
            className={`px-2 py-0.5 rounded text-[10px] font-mono ${
              splitRatio === '40-60' ? 'bg-stone-700 text-white font-bold' : 'text-stone-400 hover:text-white'
            }`}
          >
            POS +
          </button>
        </div>

      </div>

      {/* Floating Demo Feedback Notice */}
      {demoNotice && (
        <div className="bg-amber-900/90 text-amber-100 text-xs px-4 py-2 border-b border-amber-700 flex items-center justify-between animate-fadeIn">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-300 shrink-0" />
            <span>{demoNotice}</span>
          </div>
          <button onClick={() => setDemoNotice(null)} className="text-amber-200 hover:text-white font-bold ml-2">
            ×
          </button>
        </div>
      )}

      {/* Dual Side-by-Side Panes */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-[calc(100vh-6.5rem)]">
        
        {/* Left Pane: Tienda Online (Responsive Embed) */}
        <div className={`border-b lg:border-b-0 lg:border-r border-stone-800 flex flex-col overflow-y-auto ${
          splitRatio === '50-50' ? 'lg:w-1/2' : splitRatio === '60-40' ? 'lg:w-3/5' : 'lg:w-2/5'
        }`}>
          {/* Channel Header Bar */}
          <div className="bg-stone-200 px-4 py-2 flex items-center justify-between text-stone-900 border-b border-stone-300">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-amber-600" />
              <span className="font-serif font-bold text-xs">Canal 01: Tienda en Línea (Cliente)</span>
            </div>
            <button
              onClick={() => onSelectView('online')}
              className="text-[11px] font-medium text-stone-700 hover:text-stone-950 flex items-center gap-1 hover:underline"
              title="Abrir pantalla completa"
            >
              <span>Pantalla Completa</span>
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1">
            <OnlineStoreView isCompact={true} />
          </div>
        </div>

        {/* Right Pane: Punto de Venta POS (Cashier Terminal) */}
        <div className={`flex flex-col overflow-y-auto ${
          splitRatio === '50-50' ? 'lg:w-1/2' : splitRatio === '60-40' ? 'lg:w-2/5' : 'lg:w-3/5'
        }`}>
          {/* Channel Header Bar */}
          <div className="bg-stone-900 px-4 py-2 flex items-center justify-between text-stone-100 border-b border-stone-800">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span className="font-mono font-bold text-xs text-emerald-400">Canal 02: Terminal Punto de Venta POS (Cajero)</span>
            </div>
            <button
              onClick={() => onSelectView('pos')}
              className="text-[11px] font-medium text-stone-400 hover:text-stone-200 flex items-center gap-1 hover:underline"
              title="Abrir pantalla completa"
            >
              <span>Pantalla Completa</span>
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <div className="flex-1 bg-stone-950">
            <PosView isCompact={true} />
          </div>
        </div>

      </div>

    </div>
  );
};
