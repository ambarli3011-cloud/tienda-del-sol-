import React, { useState } from 'react';
import { Product } from '../../types';
import { X, Plus, Minus, ShoppingBag, ShieldCheck, Check, Sparkles } from 'lucide-react';

interface ProductDetailModalProps {
  product: Product;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number) => void;
  currentInCartQty: number;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  currentInCartQty
}) => {
  const [qty, setQty] = useState(1);
  const [addedNotice, setAddedNotice] = useState(false);

  const availableStock = Math.max(0, product.stock - currentInCartQty);
  const isOutOfStock = availableStock <= 0;

  const handleAdd = () => {
    if (isOutOfStock) return;
    onAddToCart(product, qty);
    setAddedNotice(true);
    setTimeout(() => {
      setAddedNotice(false);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 border border-stone-200 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative my-auto animate-scaleUp">
        
        {/* Close */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 p-1 rounded-lg"
          title="Cerrar"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
          
          {/* Image */}
          <div className="aspect-square rounded-xl bg-stone-100 overflow-hidden border border-stone-200">
            <img
              src={product.image}
              alt={product.name}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details & Contiguous Purchase Module */}
          <div className="space-y-4">
            <div>
              {/* Unboxed metadata adhering to frontend-design skill */}
              <div className="flex items-center gap-2 text-xs text-stone-500 mb-1">
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono">SKU: {product.sku}</span>
              </div>
              <h2 className="text-xl font-serif font-bold text-stone-900 leading-tight">
                {product.name}
              </h2>
              <p className="text-xs text-stone-600 mt-1 italic">
                {product.subtitle}
              </p>
            </div>

            <div className="flex items-baseline gap-3">
              <span className="text-2xl font-bold font-mono tabular-nums text-stone-900">
                ${product.price.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
              <span className="text-xs text-stone-500 font-mono">MXN · IVA incluido</span>
            </div>

            {/* Live Stock Indicator */}
            <div className="py-2 border-y border-stone-100 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-stone-600">Disponibilidad en almacén:</span>
                <span className={`font-mono font-semibold ${
                  isOutOfStock ? 'text-red-600' : product.stock <= product.minStockAlert ? 'text-amber-700' : 'text-emerald-700'
                }`}>
                  {isOutOfStock ? 'Agotado temporalmente' : `${product.stock} unidades en stock central`}
                </span>
              </div>
              {currentInCartQty > 0 && (
                <span className="text-[11px] text-stone-500 block mt-0.5">
                  (Ya tienes {currentInCartQty} en tu bolsa)
                </span>
              )}
            </div>

            <p className="text-xs text-stone-600 leading-relaxed">
              {product.description}
            </p>

            {/* Stepper & Add Button */}
            <div className="space-y-3 pt-2">
              {!isOutOfStock && (
                <div className="flex items-center gap-3">
                  <span className="text-xs font-medium text-stone-700">Cantidad:</span>
                  <div className="flex items-center border border-stone-300 rounded-lg bg-stone-50">
                    <button
                      type="button"
                      onClick={() => setQty(Math.max(1, qty - 1))}
                      className="p-1.5 hover:bg-stone-200 text-stone-600 rounded-l-lg"
                      title="Restar cantidad"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-mono font-bold text-stone-900 min-w-[28px] text-center">
                      {qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => setQty(Math.min(availableStock, qty + 1))}
                      disabled={qty >= availableStock}
                      className="p-1.5 hover:bg-stone-200 disabled:opacity-40 text-stone-600 rounded-r-lg"
                      title="Sumar cantidad"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              <button
                type="button"
                disabled={isOutOfStock}
                onClick={handleAdd}
                className={`w-full py-3 px-4 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all ${
                  isOutOfStock
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                    : addedNotice
                    ? 'bg-emerald-600 text-white'
                    : 'bg-stone-900 hover:bg-stone-800 text-white shadow-md'
                }`}
              >
                {addedNotice ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>¡Agregado a tu bolsa!</span>
                  </>
                ) : isOutOfStock ? (
                  <span>Producto Agotado</span>
                ) : (
                  <>
                    <ShoppingBag className="w-4 h-4" />
                    <span>Añadir a la Bolsa · ${(product.price * qty).toFixed(2)}</span>
                  </>
                )}
              </button>
            </div>

            <div className="pt-2 flex items-center gap-4 text-[11px] text-stone-500">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
                Compra 100% Protegida
              </span>
              <span>·</span>
              <span>Sincronizado con tienda física</span>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
