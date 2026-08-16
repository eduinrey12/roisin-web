'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useRouter } from 'next/navigation';
import { submitOrderAction, validateCouponAction } from '@/lib/actions/checkout.actions';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, ArrowRight, Tag, AlertCircle } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, initCart } = useCartStore();
  const router = useRouter();

  const [regions, setRegions] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    province: '',
    regionId: '',
    couponCode: '',
  });

  const [couponInput, setCouponInput] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{
    id: string;
    code: string;
    discountPercentage: number;
  } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    initCart();
    fetch('/api/shipping/regions')
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setRegions(data);
          if (data.length > 0) {
            setFormData((prev) => ({ ...prev, regionId: data[0].id }));
          }
        }
      })
      .catch(() => {});
  }, [initCart]);

  const items = cart?.items || [];
  const subtotal = items.reduce((sum: number, item: any) => {
    const itemPrice = Number(item.variant.price);
    const optionsPrice = (item.options || []).reduce(
      (optSum: number, o: any) => optSum + Number(o.option.priceModifier || 0),
      0
    );
    return sum + (itemPrice + optionsPrice) * item.quantity;
  }, 0);

  const selectedRegion = regions.find((r) => r.id === formData.regionId);
  const shippingCost = selectedRegion ? Number(selectedRegion.baseRate) : 0;
  const discountAmount = appliedCoupon
    ? (subtotal * appliedCoupon.discountPercentage) / 100
    : 0;
  const total = subtotal - discountAmount + shippingCost;

  const handleApplyCoupon = async () => {
    if (!couponInput.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    const res = await validateCouponAction(couponInput);
    setCouponLoading(false);
    if (res.success && res.coupon) {
      setAppliedCoupon(res.coupon);
      setFormData((prev) => ({ ...prev, couponCode: res.coupon.code }));
      setCouponInput('');
    } else {
      setCouponError(res.error || 'Cupón inválido');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) return;

    setLoading(true);
    setErrorMessage('');

    try {
      const res = await submitOrderAction({
        ...formData,
        couponCode: appliedCoupon?.code || undefined,
      });

      if (res.success && res.orderId) {
        await initCart();
        router.push(`/checkout/${res.orderId}`);
      } else {
        setErrorMessage(res.error || 'Error al procesar el pedido. Verifica tus datos.');
        setLoading(false);
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Ocurrió un error inesperado');
      setLoading(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 py-24 text-center space-y-4">
        <h2 className="text-2xl font-serif font-bold text-gray-900">Tu bolsa está vacía</h2>
        <p className="text-xs text-gray-500">
          No tienes productos en tu carrito para realizar el pedido.
        </p>
        <Link
          href="/productos"
          className="inline-block text-xs uppercase tracking-widest bg-black text-white px-8 py-3.5 rounded-full font-semibold hover:bg-gray-800 transition"
        >
          Ir al Catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">Checkout Seguro</h1>
        <p className="text-xs text-gray-500 mt-1">Completa tus datos de envío para finalizar tu compra</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} id="checkout-form" className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-2xl border border-gray-100 shadow-xs space-y-5">
            <h2 className="text-sm uppercase font-bold tracking-wider text-gray-900">
              1. Información de Contacto y Envío
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="0991234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Dirección de Entrega *</label>
              <input
                type="text"
                required
                placeholder="Calle principal, número de casa/depto e intersección"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Ciudad *</label>
                <input
                  type="text"
                  required
                  placeholder="Quito, Guayaquil, Cuenca..."
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1">Provincia *</label>
                <input
                  type="text"
                  required
                  placeholder="Pichincha, Guayas, Azuay..."
                  value={formData.province}
                  onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                  className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-700 block mb-1">Zona y Tarifa de Envío *</label>
              <select
                required
                value={formData.regionId}
                onChange={(e) => setFormData({ ...formData, regionId: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:border-black focus:bg-white transition"
              >
                {regions.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} — ${Number(r.baseRate).toFixed(2)}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>

        {/* Right: Order Summary & Coupon */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-zinc-50 p-6 sm:p-8 rounded-2xl border border-zinc-200/80 sticky top-28 space-y-6">
            <h2 className="text-sm uppercase font-bold tracking-wider text-gray-900">
              Resumen de Compra ({items.length})
            </h2>

            {/* Item list */}
            <div className="divide-y divide-gray-200/60 max-h-60 overflow-y-auto pr-1">
              {items.map((item: any) => {
                const product = item.variant.product;
                const primaryImg = product.images?.[0]?.url || '/placeholder.png';
                const itemPrice = Number(item.variant.price);
                const optionsPrice = (item.options || []).reduce(
                  (s: number, o: any) => s + Number(o.option.priceModifier || 0),
                  0
                );
                return (
                  <div key={item.id} className="py-3 first:pt-0 flex gap-3 text-xs">
                    <div className="relative w-12 h-12 rounded-lg bg-white overflow-hidden border border-gray-200 shrink-0">
                      <Image src={primaryImg} alt="" fill className="object-cover" />
                    </div>
                    <div className="flex-1 flex justify-between">
                      <div>
                        <p className="font-semibold text-gray-900 line-clamp-1">{product.title}</p>
                        <p className="text-[11px] text-gray-500">Cant: {item.quantity}</p>
                      </div>
                      <span className="font-bold text-gray-900">
                        ${((itemPrice + optionsPrice) * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Coupon Application Box */}
            <div className="pt-4 border-t border-gray-200/60 space-y-2">
              <label className="text-xs font-semibold text-gray-700 flex items-center gap-1.5">
                <Tag size={14} /> ¿Tienes un cupón de descuento?
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  placeholder="Ej: BIENVENIDA10"
                  className="flex-1 px-3 py-2 text-xs uppercase bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-black"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="bg-black text-white px-4 py-2 rounded-xl text-xs uppercase tracking-wider font-semibold hover:bg-zinc-800 disabled:opacity-50 transition"
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>

              {couponError && <p className="text-red-500 text-[11px] mt-1">{couponError}</p>}
              {appliedCoupon && (
                <div className="text-emerald-700 text-xs bg-emerald-50 p-2.5 rounded-lg border border-emerald-200 flex justify-between items-center">
                  <span>Cupón <strong>{appliedCoupon.code}</strong> (-{appliedCoupon.discountPercentage}%) aplicado</span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setFormData((p) => ({ ...p, couponCode: '' }));
                    }}
                    className="text-red-500 hover:underline text-[11px]"
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>

            {/* Totals Breakdown */}
            <div className="pt-4 border-t border-gray-200/60 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-medium">
                  <span>Descuento ({appliedCoupon.code})</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-gray-600">
                <span>Costo de Envío ({selectedRegion?.name || 'Seleccionado'})</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-base font-bold text-gray-900 pt-2 border-t border-gray-300">
                <span>Total a Pagar</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>

            <button
              form="checkout-form"
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-4 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-zinc-800 transition active:scale-[0.99] disabled:opacity-50 shadow-md"
            >
              {loading ? 'Generando Pedido...' : `Continuar al Pago • $${total.toFixed(2)}`}
              <ArrowRight size={16} />
            </button>

            <div className="flex items-center justify-center gap-2 text-[11px] text-gray-500 text-center">
              <ShieldCheck size={14} className="text-emerald-600" />
              <span>Tus datos están protegidos con cifrado SSL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
