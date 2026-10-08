import React from 'react';
import { CartItem } from '../../types';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Truck } from 'lucide-react';

interface OnlineCartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  onUpdateQuantity: (productId: string, quantity: number) => void;
  onRemoveItem: (productId: string) => void;
  onClearCart: () => void;
  onProceedToCheckout: () => void;
}

export const OnlineCartDrawer: React.FC<OnlineCartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onProceedToCheckout
}) => {
  if (!isOpen) return null;

  const FREE_SHIPPING_THRESHOLD = 800;

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const tax = Math.round(subtotal * 0.16 * 100) / 100;
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const shippingCost = items.length === 0 ? 0 : (isFreeShipping ? 0 : 99);
  const total = subtotal + tax;
  const remainingForFreeShipping = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  const freeShippingProgress = Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100);

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-stone-950/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white border-l border-stone-200 shadow-2xl flex flex-col justify-between animate-slideLeft">
          
          {/* Drawer Header */}
          <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50/80">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-stone-900" />
              <h3 className="font-serif font-bold text-stone-900 text-base">Tu Bolsa de Compras</h3>
              <span className="text-xs text-stone-500 font-mono">({items.length})</span>
            </div>

            <div className="flex items-center gap-2">
              {items.length > 0 && (
                <button
                  onClick={onClearCart}
                  className="text-[11px] text-stone-500 hover:text-red-600 transition-colors"
                >
                  Vaciar
                </button>
              )}
              <button
                onClick={onClose}
                className="p-1 text-stone-400 hover:text-stone-800 rounded-lg"
                title="Cerrar bolsa"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Free Shipping Progress bar */}
          {items.length > 0 && (
            <div className="px-4 py-2.5 bg-amber-50/70 border-b border-amber-200/60 text-xs">
              <div className="flex items-center gap-2 text-stone-800 mb-1">
                <Truck className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span>
                  {isFreeShipping ? (
                    <strong className="text-emerald-800">¡Calificas para Envío Gratis!</strong>
                  ) : (
                    <>Te faltan <strong className="font-mono">${remainingForFreeShipping.toFixed(2)}</strong> para envío gratis</>
                  )}
                </span>
              </div>
              <div className="w-full bg-amber-200/50 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-amber-600 h-full rounded-full transition-all duration-300"
                  style={{ width: `${freeShippingProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Items List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 divide-y divide-stone-100">
            {items.map(item => (
              <div key={item.productId} className="pt-3 first:pt-0 flex gap-3">
                <div className="w-16 h-16 rounded-lg bg-stone-100 overflow-hidden border border-stone-200 shrink-0">
                  <img
                    src={item.product.image}
                    alt={item.product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <h4 className="text-xs font-semibold text-stone-900 truncate">
                        {item.product.name}
                      </h4>
                      <button
                        onClick={() => onRemoveItem(item.productId)}
                        className="text-stone-400 hover:text-red-500 p-0.5"
                        title="Eliminar"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <span className="text-[11px] text-stone-500 font-mono">
                      ${item.unitPrice.toFixed(2)} c/u
                    </span>
                  </div>

                  {/* Stepper & Total */}
                  <div className="flex items-center justify-between pt-1">
                    <div className="flex items-center border border-stone-300 rounded bg-stone-50">
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity - 1)}
                        className="p-1 hover:bg-stone-200 text-stone-600"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <span className="px-2 text-xs font-mono font-bold text-stone-900 min-w-[20px] text-center">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.productId, item.quantity + 1)}
                        disabled={item.quantity >= item.product.stock}
                        className="p-1 hover:bg-stone-200 disabled:opacity-30 text-stone-600"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>

                    <span className="font-mono text-xs font-bold text-stone-900 tabular-nums">
                      ${(item.unitPrice * item.quantity).toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>
            ))}

            {items.length === 0 && (
              <div className="py-20 text-center text-stone-400 space-y-2">
                <ShoppingBag className="w-10 h-10 mx-auto text-stone-300" />
                <p className="text-sm font-medium text-stone-600">Tu bolsa está vacía</p>
                <p className="text-xs text-stone-400">
                  Agrega productos de la tienda para comenzar tu pedido.
                </p>
              </div>
            )}
          </div>

          {/* Drawer Footer & Checkout Action */}
          {items.length > 0 && (
            <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-stone-600">
                  <span>Subtotal:</span>
                  <span className="font-mono tabular-nums">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>Envío estimado:</span>
                  <span className="font-mono tabular-nums">
                    {shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`}
                  </span>
                </div>
                <div className="flex justify-between text-stone-600">
                  <span>IVA estimado (16%):</span>
                  <span className="font-mono tabular-nums">${tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
                </div>
                <div className="flex justify-between font-bold text-base text-stone-900 pt-2 border-t border-stone-200">
                  <span>Total estimado:</span>
                  <span className="font-mono tabular-nums">
                    ${(total + shippingCost).toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  onProceedToCheckout();
                }}
                className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md active:scale-[0.99]"
              >
                <span>Proceder al Pago</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
