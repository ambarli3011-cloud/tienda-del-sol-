import React, { useState } from 'react';
import { PaymentMethod, CustomerInfo, Order } from '../../types';
import { Banknote, CreditCard, QrCode, X, Check, Calculator, ArrowRight } from 'lucide-react';

interface PosCheckoutModalProps {
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  itemCount: number;
  onConfirm: (params: {
    paymentMethod: PaymentMethod;
    customer: CustomerInfo;
    cashReceived?: number;
    cashierName?: string;
  }) => Order | null;
  onClose: () => void;
}

export const PosCheckoutModal: React.FC<PosCheckoutModalProps> = ({
  total,
  subtotal,
  tax,
  discount,
  itemCount,
  onConfirm,
  onClose
}) => {
  const [method, setMethod] = useState<PaymentMethod>('cash');
  const [customerName, setCustomerName] = useState('Cliente de mostrador');
  const [customerPhone, setCustomerPhone] = useState('');
  const [cashReceivedInput, setCashReceivedInput] = useState<string>(Math.ceil(total).toString());
  const [isProcessing, setIsProcessing] = useState(false);

  const cashReceived = parseFloat(cashReceivedInput) || 0;
  const change = Math.max(0, cashReceived - total);
  const isCashInsufficient = method === 'cash' && cashReceived < total;

  // Preset quick cash denominations
  const quickBills = [
    { label: 'Exacto', value: Math.ceil(total) },
    { label: '$100', value: 100 },
    { label: '$200', value: 200 },
    { label: '$500', value: 500 },
    { label: '$1,000', value: 1000 },
  ].filter(b => b.label === 'Exacto' || b.value >= total || b.value >= 100);

  const handleFinishPayment = () => {
    if (isCashInsufficient) return;
    setIsProcessing(true);

    setTimeout(() => {
      onConfirm({
        paymentMethod: method,
        customer: {
          name: customerName.trim() || 'Cliente de mostrador',
          phone: customerPhone.trim() || undefined,
        },
        cashReceived: method === 'cash' ? cashReceived : total,
        cashierName: 'Ana Morales (Caja 01)'
      });
      setIsProcessing(false);
    }, 250);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/75 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-stone-900 border border-stone-800 text-stone-100 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
          title="Cancelar cobro"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-4">
          <span className="text-[11px] font-mono text-emerald-400 tracking-wider uppercase font-semibold">
            Terminal de Cobro POS
          </span>
          <div className="flex items-baseline justify-between mt-1">
            <h2 className="text-xl font-bold font-serif text-white">
              Cobrar Venta
            </h2>
            <div className="text-right">
              <span className="text-xs text-stone-400 block">{itemCount} artículos</span>
              <span className="text-2xl font-bold font-mono tabular-nums text-emerald-400">
                ${total.toLocaleString('es-MX', { minimumFractionDigits: 2 })}
              </span>
            </div>
          </div>
        </div>

        {/* Payment Methods Selector (Functional segmented tabs) */}
        <div className="grid grid-cols-3 gap-2 p-1 bg-stone-800/80 rounded-xl mb-5 border border-stone-700/60">
          <button
            type="button"
            onClick={() => setMethod('cash')}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
              method === 'cash'
                ? 'bg-emerald-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <Banknote className="w-4 h-4 mb-1" />
            <span>Efectivo</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('pos_card')}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
              method === 'pos_card'
                ? 'bg-emerald-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <CreditCard className="w-4 h-4 mb-1" />
            <span>Tarjeta POS</span>
          </button>

          <button
            type="button"
            onClick={() => setMethod('transfer')}
            className={`flex flex-col items-center justify-center py-2.5 px-3 rounded-lg text-xs font-medium transition-all ${
              method === 'transfer'
                ? 'bg-emerald-500 text-stone-950 font-semibold shadow-sm'
                : 'text-stone-300 hover:text-white hover:bg-stone-700/50'
            }`}
          >
            <QrCode className="w-4 h-4 mb-1" />
            <span>Transfer / QR</span>
          </button>
        </div>

        {/* Cash Calculation View */}
        {method === 'cash' && (
          <div className="space-y-4 mb-5 p-4 bg-stone-800/50 rounded-xl border border-stone-700/40">
            <div>
              <label className="block text-xs font-medium text-stone-300 mb-1.5 flex items-center justify-between">
                <span>Efectivo recibido del cliente:</span>
                <span className="text-[11px] font-mono text-stone-400">Total: ${total.toFixed(2)}</span>
              </label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400 font-mono text-base font-bold">$</span>
                <input
                  type="number"
                  step="any"
                  min={0}
                  value={cashReceivedInput}
                  onChange={(e) => setCashReceivedInput(e.target.value)}
                  className="w-full pl-8 pr-3 py-2.5 bg-stone-900 border border-stone-700 rounded-xl text-lg font-mono tabular-nums text-white focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                  placeholder="0.00"
                  autoFocus
                />
              </div>
            </div>

            {/* Quick Bill buttons */}
            <div>
              <span className="text-[11px] text-stone-400 block mb-1.5 font-medium">Billetes sugeridos:</span>
              <div className="flex flex-wrap gap-1.5">
                {quickBills.map((bill, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCashReceivedInput(bill.value.toString())}
                    className="px-3 py-1 bg-stone-700/80 hover:bg-stone-600 text-stone-200 hover:text-white rounded-lg text-xs font-mono font-medium border border-stone-600/50 transition-colors"
                  >
                    {bill.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Change Result Display */}
            <div className={`p-3 rounded-xl border flex items-center justify-between ${
              isCashInsufficient 
                ? 'bg-red-950/40 border-red-800/60 text-red-200' 
                : 'bg-emerald-950/40 border-emerald-800/60 text-emerald-200'
            }`}>
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-xs font-medium">
                  {isCashInsufficient ? 'Faltante de pago:' : 'Cambio / Vuelto a entregar:'}
                </span>
              </div>
              <span className={`text-xl font-bold font-mono tabular-nums ${
                isCashInsufficient ? 'text-red-400' : 'text-emerald-400'
              }`}>
                ${isCashInsufficient ? (total - cashReceived).toFixed(2) : change.toFixed(2)}
              </span>
            </div>
          </div>
        )}

        {/* Card POS View */}
        {method === 'pos_card' && (
          <div className="mb-5 p-4 bg-stone-800/50 rounded-xl border border-stone-700/40 text-center space-y-3">
            <div className="w-12 h-12 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <CreditCard className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Acerque o inserte la tarjeta en la terminal</p>
              <p className="text-xs text-stone-400 mt-0.5">Compatible con Chip, Contactless, Apple Pay y Google Wallet</p>
            </div>
            <div className="inline-block px-3 py-1 bg-stone-900 border border-stone-700 rounded-lg text-xs font-mono text-emerald-400">
              Terminal Bancaria #POS-8821 Conectada
            </div>
          </div>
        )}

        {/* Transfer / QR View */}
        {method === 'transfer' && (
          <div className="mb-5 p-4 bg-stone-800/50 rounded-xl border border-stone-700/40 text-center space-y-2">
            <div className="w-12 h-12 mx-auto rounded-full bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <QrCode className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">Transferencia Inmediata SPEI / CoDi</p>
              <p className="text-xs text-stone-400 font-mono">CLABE: 012 180 00123456789 4 (BBVA)</p>
              <p className="text-[11px] text-stone-500">Monto exacto: ${total.toFixed(2)} MXN</p>
            </div>
          </div>
        )}

        {/* Customer Info (Optional quick note) */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Nombre del cliente:</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className="w-full px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
              placeholder="Cliente de mostrador"
            />
          </div>
          <div>
            <label className="block text-[11px] font-medium text-stone-400 mb-1">Tel / WhatsApp (Opcional):</label>
            <input
              type="tel"
              value={customerPhone}
              onChange={(e) => setCustomerPhone(e.target.value)}
              className="w-full px-3 py-1.5 bg-stone-800 border border-stone-700 rounded-lg text-xs text-stone-200 focus:outline-none focus:border-emerald-500"
              placeholder="Para ticket digital"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-stone-800 hover:bg-stone-700 text-stone-300 font-medium rounded-xl text-xs transition-colors border border-stone-700"
          >
            Regresar
          </button>

          <button
            type="button"
            disabled={isCashInsufficient || isProcessing}
            onClick={handleFinishPayment}
            className="flex-2 py-2.5 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:bg-stone-700 disabled:text-stone-500 text-stone-950 font-bold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-lg shadow-emerald-950/50"
          >
            {isProcessing ? (
              <span>Registrando venta...</span>
            ) : (
              <>
                <Check className="w-4 h-4 stroke-[3]" />
                <span>Confirmar Pago (${total.toFixed(2)})</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
