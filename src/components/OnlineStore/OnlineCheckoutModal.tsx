import React, { useState } from 'react';
import { CustomerInfo, PaymentMethod, Order, CartItem } from '../../types';
import { 
  X, 
  Truck, 
  Store, 
  CreditCard, 
  Building2, 
  CheckCircle2, 
  ShieldCheck, 
  ArrowRight,
  PackageCheck
} from 'lucide-react';

interface OnlineCheckoutModalProps {
  items: CartItem[];
  subtotal: number;
  tax: number;
  total: number;
  shippingCost: number;
  onConfirm: (params: { customer: CustomerInfo; paymentMethod: PaymentMethod }) => Order | null;
  onClose: () => void;
}

export const OnlineCheckoutModal: React.FC<OnlineCheckoutModalProps> = ({
  items,
  subtotal,
  tax,
  total,
  shippingCost,
  onConfirm,
  onClose
}) => {
  const [deliveryType, setDeliveryType] = useState<'shipping' | 'pickup'>('shipping');
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('online_card');
  
  // Customer fields
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');

  // Simulated card fields
  const [cardNumber, setCardNumber] = useState('');
  const [cardExp, setCardExp] = useState('');
  const [cardCvv, setCardCvv] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<Order | null>(null);

  const grandTotal = total + (deliveryType === 'shipping' ? shippingCost : 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    setTimeout(() => {
      const order = onConfirm({
        customer: {
          name: name.trim(),
          email: email.trim() || undefined,
          phone: phone.trim() || undefined,
          address: deliveryType === 'shipping' ? address.trim() : 'Retiro en Sucursal Masaryk 140',
          city: deliveryType === 'shipping' ? city.trim() : 'CDMX',
          postalCode: postalCode.trim() || undefined,
          deliveryType
        },
        paymentMethod
      });
      setIsSubmitting(false);
      if (order) {
        setConfirmedOrder(order);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 bg-stone-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white text-stone-900 border border-stone-200 rounded-2xl max-w-xl w-full p-6 shadow-2xl relative my-auto animate-scaleUp">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-stone-400 hover:text-stone-800 p-1 rounded-lg"
          title="Cerrar ventana"
        >
          <X className="w-5 h-5" />
        </button>

        {confirmedOrder ? (
          /* Confirmation State */
          <div className="text-center py-6 space-y-4">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner">
              <PackageCheck className="w-8 h-8" />
            </div>

            <div>
              <span className="text-xs font-mono text-emerald-700 font-semibold tracking-wider uppercase">
                ¡Compra Exitosa!
              </span>
              <h2 className="text-2xl font-serif font-bold text-stone-900 mt-1">
                Gracias por tu pedido, {confirmedOrder.customer.name}
              </h2>
              <p className="text-sm text-stone-600 mt-1">
                Hemos asignado el folio de seguimiento:{' '}
                <strong className="font-mono text-stone-900">{confirmedOrder.orderNumber}</strong>
              </p>
            </div>

            {/* Order summary box */}
            <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-2">
              <div className="flex justify-between font-medium text-stone-700">
                <span>Modalidad:</span>
                <span className="font-semibold text-stone-900">
                  {confirmedOrder.customer.deliveryType === 'pickup' 
                    ? 'Retiro en Tienda (Listo en 2 horas)' 
                    : 'Envío a Domicilio Express'}
                </span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Artículos:</span>
                <span>{confirmedOrder.items.length} productos</span>
              </div>
              <div className="flex justify-between text-stone-600">
                <span>Total pagado:</span>
                <span className="font-mono tabular-nums font-bold text-stone-900">
                  ${confirmedOrder.total.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500">
              * El inventario central de la tienda y punto de venta se ha actualizado inmediatamente.
            </p>

            <button
              onClick={onClose}
              className="w-full py-3 bg-stone-900 hover:bg-stone-800 text-white font-medium rounded-xl text-xs transition-colors shadow-sm"
            >
              Seguir explorando la tienda
            </button>
          </div>
        ) : (
          /* Checkout Form */
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <span className="text-[11px] font-mono text-stone-500 tracking-wider uppercase font-semibold">
                Tienda Online · Finalizar Compra
              </span>
              <h2 className="text-xl font-bold font-serif text-stone-900">
                Información del Pedido
              </h2>
            </div>

            {/* Delivery Method Selector (Segmented buttons) */}
            <div>
              <label className="block text-xs font-semibold text-stone-700 mb-2">
                Método de Entrega:
              </label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('shipping')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    deliveryType === 'shipping'
                      ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <Truck className="w-4 h-4 text-stone-700 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold block text-stone-900">Envío a Domicilio</span>
                    <span className="text-[11px] text-stone-500">
                      {shippingCost === 0 ? 'Gratis (por compras > $800)' : `$${shippingCost} MXN`}
                    </span>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setDeliveryType('pickup')}
                  className={`p-3 rounded-xl border text-left flex items-start gap-2.5 transition-all ${
                    deliveryType === 'pickup'
                      ? 'border-stone-900 bg-stone-50 ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-300'
                  }`}
                >
                  <Store className="w-4 h-4 text-stone-700 mt-0.5 shrink-0" />
                  <div>
                    <span className="text-xs font-semibold block text-stone-900">Retiro en Tienda</span>
                    <span className="text-[11px] text-stone-500">Gratis · Polanco, CDMX</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Customer Details */}
            <div className="space-y-3">
              <h3 className="text-xs font-semibold text-stone-800 border-b border-stone-100 pb-1">
                Datos de Contacto
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Nombre Completo *</label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Roberto Gómez"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-medium text-stone-600 mb-1">Correo Electrónico</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-medium text-stone-600 mb-1">Teléfono Móvil</label>
                <input
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+52 55 1234 5678"
                  className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                />
              </div>

              {deliveryType === 'shipping' && (
                <div className="space-y-2.5 pt-1">
                  <div>
                    <label className="block text-[11px] font-medium text-stone-600 mb-1">Dirección de Entrega</label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder="Calle, número exterior e interior, colonia"
                      className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Ciudad / Estado</label>
                      <input
                        type="text"
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="Ciudad de México"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-medium text-stone-600 mb-1">Código Postal</label>
                      <input
                        type="text"
                        value={postalCode}
                        onChange={(e) => setPostalCode(e.target.value)}
                        placeholder="11560"
                        className="w-full px-3 py-2 border border-stone-300 rounded-lg text-xs text-stone-900 focus:outline-none focus:border-stone-900"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-semibold text-stone-800 border-b border-stone-100 pb-1">
                Método de Pago Seguro
              </h3>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPaymentMethod('online_card')}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-center gap-2 font-medium ${
                    paymentMethod === 'online_card'
                      ? 'border-stone-900 bg-stone-100 text-stone-900'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>Tarjeta Débito/Crédito</span>
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMethod('online_transfer')}
                  className={`p-2.5 rounded-lg border text-xs flex items-center justify-center gap-2 font-medium ${
                    paymentMethod === 'online_transfer'
                      ? 'border-stone-900 bg-stone-100 text-stone-900'
                      : 'border-stone-200 text-stone-600 hover:border-stone-300'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  <span>SPEI / Transferencia</span>
                </button>
              </div>

              {paymentMethod === 'online_card' && (
                <div className="p-3 bg-stone-50 rounded-xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between text-[11px] text-stone-500">
                    <span className="flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Cifrado SSL 256-bit
                    </span>
                    <span>Visa · Mastercard · Amex</span>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    placeholder="4000 1234 5678 9010"
                    maxLength={19}
                    className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                  />
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      value={cardExp}
                      onChange={(e) => setCardExp(e.target.value)}
                      placeholder="MM/AA"
                      maxLength={5}
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                    />
                    <input
                      type="password"
                      value={cardCvv}
                      onChange={(e) => setCardCvv(e.target.value)}
                      placeholder="CVV"
                      maxLength={4}
                      className="w-full px-3 py-1.5 bg-white border border-stone-300 rounded-lg text-xs font-mono"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Total summary & Action */}
            <div className="pt-3 border-t border-stone-200 space-y-2">
              <div className="flex justify-between text-xs text-stone-600">
                <span>Subtotal ({items.length} artículos):</span>
                <span className="font-mono tabular-nums">${subtotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>Envío:</span>
                <span className="font-mono tabular-nums">
                  {deliveryType === 'pickup' || shippingCost === 0 ? 'Gratis' : `$${shippingCost.toFixed(2)}`}
                </span>
              </div>
              <div className="flex justify-between text-xs text-stone-600">
                <span>IVA (16%):</span>
                <span className="font-mono tabular-nums">${tax.toLocaleString('es-MX', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-1 border-t border-stone-200">
                <span>Total a Pagar:</span>
                <span className="font-mono tabular-nums text-lg">
                  ${grandTotal.toLocaleString('es-MX', { minimumFractionDigits: 2 })} MXN
                </span>
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-stone-900 hover:bg-stone-800 disabled:bg-stone-300 text-white font-semibold rounded-xl text-xs transition-colors flex items-center justify-center gap-2 shadow-md"
            >
              {isSubmitting ? (
                <span>Procesando compra segura...</span>
              ) : (
                <>
                  <span>Pagar Ahora (${grandTotal.toFixed(2)})</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>
        )}

      </div>
    </div>
  );
};
