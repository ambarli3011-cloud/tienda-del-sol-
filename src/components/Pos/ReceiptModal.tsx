import React from 'react';
import { Order } from '../../types';
import { Printer, X, CheckCircle, ArrowRight } from 'lucide-react';

interface ReceiptModalProps {
  order: Order;
  onClose: () => void;
  onNewSale?: () => void;
}

export const ReceiptModal: React.FC<ReceiptModalProps> = ({ order, onClose, onNewSale }) => {
  const handlePrint = () => {
    window.print();
  };

  const formattedDate = new Date(order.createdAt).toLocaleString('es-MX', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-stone-900 border border-stone-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative my-auto animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
          title="Cerrar recibo"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-2 mb-4 text-emerald-400">
          <CheckCircle className="w-5 h-5 shrink-0" />
          <h2 className="text-base font-semibold text-stone-100">
            {order.channel === 'pos' ? 'Venta POS Registrada con Éxito' : 'Pedido Online Confirmado'}
          </h2>
        </div>

        {/* Thermal Ticket Paper Simulation (80mm width standard) */}
        <div id="printable-receipt" className="bg-[#FAF9F5] text-stone-900 p-6 rounded-xl font-mono text-xs shadow-md border border-stone-300">
          
          {/* Ticket Header */}
          <div className="text-center pb-4 border-b border-dashed border-stone-400">
            <h1 className="font-serif font-bold text-lg tracking-wider text-stone-950">
              AURA VELONES & AROMAS
            </h1>
            <p className="text-[11px] text-stone-600">Av. Masaryk 140, Polanco, CDMX</p>
            <p className="text-[11px] text-stone-600">RFC: AUR-240108-9K2 · Tel: 55 5892 4100</p>
            <div className="mt-2 text-[11px] text-stone-700">
              <span>{order.channel === 'pos' ? 'TICKET DE VENTA MOSTRADOR' : 'TICKET COMPRA ONLINE'}</span>
            </div>
            <div className="font-bold text-stone-900 text-sm mt-0.5">
              FOLIO: {order.orderNumber}
            </div>
          </div>

          {/* Ticket Meta */}
          <div className="py-3 border-b border-dashed border-stone-400 text-[11px] space-y-0.5 text-stone-700">
            <div className="flex justify-between">
              <span>FECHA:</span>
              <span>{formattedDate}</span>
            </div>
            {order.cashierName && (
              <div className="flex justify-between">
                <span>CAJERO:</span>
                <span>{order.cashierName}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>CLIENTE:</span>
              <span className="font-semibold">{order.customer.name}</span>
            </div>
            {order.customer.phone && (
              <div className="flex justify-between">
                <span>TEL:</span>
                <span>{order.customer.phone}</span>
              </div>
            )}
            {order.customer.deliveryType && (
              <div className="flex justify-between">
                <span>ENTREGA:</span>
                <span className="uppercase">{order.customer.deliveryType === 'pickup' ? 'Retiro en Tienda' : 'Envío a Domicilio'}</span>
              </div>
            )}
          </div>

          {/* Line Items */}
          <div className="py-3 border-b border-dashed border-stone-400 space-y-2">
            <div className="flex justify-between font-bold text-[11px] text-stone-800 pb-1 border-b border-stone-300">
              <span>CANT / ARTÍCULO</span>
              <span className="text-right">TOTAL</span>
            </div>

            {order.items.map((item, idx) => {
              const lineTotal = item.unitPrice * item.quantity;
              const lineDiscount = item.discountPercent ? (lineTotal * item.discountPercent) / 100 : 0;
              const finalLineTotal = lineTotal - lineDiscount;

              return (
                <div key={idx} className="space-y-0.5 text-[11px]">
                  <div className="flex justify-between items-start">
                    <span className="font-medium pr-2 text-stone-950">
                      {item.quantity}x {item.product.name}
                    </span>
                    <span className="font-mono tabular-nums font-semibold shrink-0">
                      ${finalLineTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between text-[10px] text-stone-500">
                    <span>${item.unitPrice.toFixed(2)} c/u</span>
                    {item.discountPercent ? (
                      <span className="text-emerald-700">Desc. {item.discountPercent}% (-${lineDiscount.toFixed(2)})</span>
                    ) : null}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Totals */}
          <div className="py-3 border-b border-dashed border-stone-400 space-y-1 text-[11px]">
            <div className="flex justify-between text-stone-600">
              <span>SUBTOTAL:</span>
              <span className="font-mono tabular-nums">${order.subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            {order.discount > 0 && (
              <div className="flex justify-between text-emerald-700 font-medium">
                <span>DESCUENTO:</span>
                <span className="font-mono tabular-nums">-${order.discount.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
            )}
            <div className="flex justify-between text-stone-600">
              <span>IVA (16%):</span>
              <span className="font-mono tabular-nums">${order.tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
            </div>
            <div className="flex justify-between font-bold text-sm text-stone-950 pt-1 border-t border-stone-300">
              <span>TOTAL A PAGAR:</span>
              <span className="font-mono tabular-nums">${order.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN</span>
            </div>
          </div>

          {/* Payment Detail */}
          <div className="py-2.5 border-b border-dashed border-stone-400 text-[11px] text-stone-700 space-y-0.5">
            <div className="flex justify-between">
              <span>FORMA DE PAGO:</span>
              <span className="font-semibold uppercase">
                {order.paymentMethod === 'cash' && 'Efectivo'}
                {order.paymentMethod === 'pos_card' && 'Tarjeta (Terminal POS)'}
                {order.paymentMethod === 'transfer' && 'Transferencia / SPEI'}
                {order.paymentMethod === 'online_card' && 'Tarjeta en Línea'}
                {order.paymentMethod === 'online_transfer' && 'Transferencia Digital'}
              </span>
            </div>

            {order.paymentMethod === 'cash' && order.paymentDetails && (
              <>
                <div className="flex justify-between">
                  <span>EFECTIVO RECIBIDO:</span>
                  <span className="font-mono tabular-nums">${(order.paymentDetails.cashReceived || order.total).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-bold text-stone-950">
                  <span>CAMBIO:</span>
                  <span className="font-mono tabular-nums">${(order.paymentDetails.changeGiven || 0).toFixed(2)}</span>
                </div>
              </>
            )}

            {order.paymentDetails?.authCode && (
              <div className="flex justify-between text-[10px] text-stone-500">
                <span>CÓDIGO DE AUTORIZACIÓN:</span>
                <span>{order.paymentDetails.authCode}</span>
              </div>
            )}
          </div>

          {/* Barcode representation */}
          <div className="pt-4 text-center">
            <div className="font-mono tracking-widest text-xs font-bold text-stone-800">
              ||| | ||||| || |||| ||| ||||| | ||
            </div>
            <p className="text-[10px] text-stone-500 mt-1">¡Gracias por tu compra en AURA!</p>
            <p className="text-[9px] text-stone-400">Conserva este ticket para cualquier cambio o aclaración.</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-5 flex items-center justify-between gap-3">
          <button
            onClick={handlePrint}
            className="flex-1 py-2.5 px-3 bg-stone-800 hover:bg-stone-700 text-stone-100 font-medium rounded-xl text-xs flex items-center justify-center gap-2 border border-stone-700 transition-colors"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Imprimir Ticket</span>
          </button>

          {onNewSale ? (
            <button
              onClick={() => {
                onClose();
                onNewSale();
              }}
              className="flex-1 py-2.5 px-3 bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Nueva Venta</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={onClose}
              className="flex-1 py-2.5 px-3 bg-amber-500 hover:bg-amber-400 text-stone-950 font-semibold rounded-xl text-xs flex items-center justify-center gap-2 transition-colors shadow-sm"
            >
              <span>Listo</span>
            </button>
          )}
        </div>

      </div>
    </div>
  );
};
