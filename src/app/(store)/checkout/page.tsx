'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { useRouter } from 'next/navigation';
import { submitOrderAction, validateCouponAction } from '@/lib/actions/checkout.actions';
import Link from 'next/link';
import Image from 'next/image';
import { ShieldCheck, Truck, ArrowRight, Tag, AlertCircle, CheckCircle2, Lock } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

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
      setCouponError(res.error || 'Cupón no válido para esta compra');
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
        <div className="p-4 bg-[#FAF4F5] rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-[#EFCFD6]">
          <RoisinDiamond size={28} color="#BE6C7C" />
        </div>
        <h2 className="text-2xl font-serif font-bold text-zinc-900">Tu bolsa está vacía</h2>
        <p className="text-xs text-zinc-500">
          No tienes piezas seleccionadas en tu carrito para realizar el pedido.
        </p>
        <Link
          href="/productos"
          className="inline-block text-xs uppercase tracking-widest bg-zinc-900 text-white px-8 py-3.5 rounded-full font-bold hover:bg-black transition shadow-xs"
        >
          Explorar Joyas
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
      <div className="mb-8 space-y-1">
        <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#BE6C7C]">
          <Lock size={12} /> Checkout Seguro & Privado
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
          Finaliza tu Pedido
        </h1>
        <p className="text-xs text-zinc-500">Completa tus datos de envío para preparar tu joya de forma exclusiva</p>
      </div>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{errorMessage}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
        {/* Left: Form */}
        <form onSubmit={handleSubmit} id="checkout-form" className="lg:col-span-7 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#F0E6E8] shadow-xs space-y-6">
            <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-2 border-b border-[#F0E6E8] pb-3">
              <RoisinDiamond size={13} color="#E2A3B0" /> 1. Datos de Contacto y Entrega
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Nombre *</label>
                <input
                  type="text"
                  required
                  placeholder="Tu nombre"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  className="w-full px-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Apellido *</label>
                <input
                  type="text"
                  required
                  placeholder="Tu apellido"
                  value={formData.lastName}
                  onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                  className="w-full px-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Correo Electrónico *</label>
                <input
                  type="email"
                  required
                  placeholder="ejemplo@correo.com"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Teléfono / WhatsApp *</label>
                <input
                  type="tel"
                  required
                  placeholder="0991234567"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
                />
              </div>
            </div>

            <div className="space-y-4 pt-2">
              <div>
                <label className="text-xs font-semibold text-zinc-700 block mb-1">Dirección de Entrega Exacta *</label>
                <input
                  type="text"
                  required
                  placeholder="Calle principal, número de casa/departamento, referencia"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">Ciudad *</label>
                  <input
                    type="text"
                    required
                    placeholder="Quito, Guayaquil, Cuenca..."
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-zinc-700 block mb-1">Provincia *</label>
                  <input
                    type="text"
                    required
                    placeholder="Pichincha, Guayas, Azuay..."
                    value={formData.province}
                    onChange={(e) => setFormData({ ...formData, province: e.target.value })}
                    className="w-full px-4 py-3 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition"
                  />
                </div>
              </div>
            </div>

            {/* Shipping Region Selector */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-zinc-700 block">
                Zona de Envíos en Ecuador *
              </label>
              <div className="grid grid-cols-1 gap-2.5">
                {regions.map((r) => {
                  const isSelected = formData.regionId === r.id;
                  return (
                    <label
                      key={r.id}
                      className={`flex items-center justify-between p-3.5 rounded-2xl border cursor-pointer text-xs transition ${
                        isSelected
                          ? 'border-[#BE6C7C] bg-[#FAF4F5] font-semibold text-zinc-900 ring-1 ring-[#BE6C7C]'
                          : 'border-[#F0E6E8] bg-white text-zinc-700 hover:border-[#EFCFD6]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          name="regionId"
                          value={r.id}
                          checked={isSelected}
                          onChange={() => setFormData({ ...formData, regionId: r.id })}
                          className="accent-[#BE6C7C]"
                        />
                        <span>{r.name}</span>
                      </div>
                      <span className="font-bold text-zinc-900">${Number(r.baseRate).toFixed(2)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          </div>
        </form>

        {/* Right: Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#F0E6E8] shadow-xs space-y-5">
            <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-2 border-b border-[#F0E6E8] pb-3">
              <RoisinDiamond size={13} color="#E2A3B0" /> 2. Resumen del Pedido
            </h2>

            {/* Item List */}
            <div className="divide-y divide-[#FAF4F5] max-h-60 overflow-y-auto pr-1">
              {items.map((item: any) => {
                const product = item.variant.product;
                const primaryImg = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop';
                const itemPrice = Number(item.variant.price);
                const optionsPrice = (item.options || []).reduce(
                  (optSum: number, o: any) => optSum + Number(o.option.priceModifier || 0),
                  0
                );
                const unitTotal = itemPrice + optionsPrice;

                return (
                  <div key={item.id} className="py-3 first:pt-0 flex gap-3.5 items-center">
                    <div className="w-14 h-14 bg-[#FAF7F8] rounded-xl overflow-hidden shrink-0 relative border border-[#F0E6E8]">
                      <Image
                        src={primaryImg}
                        alt={product.title}
                        fill
                        className="object-cover"
                        sizes="56px"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-serif font-bold text-zinc-900 truncate">
                        {product.title}
                      </p>
                      <p className="text-[11px] text-zinc-500">
                        Cant: {item.quantity} • {item.variant.sku.split('-').pop() || item.variant.sku}
                      </p>
                    </div>
                    <span className="font-serif font-bold text-xs text-zinc-900 shrink-0">
                      ${(unitTotal * item.quantity).toFixed(2)}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Coupon Code Input */}
            <div className="pt-2 border-t border-[#F0E6E8] space-y-2">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Código de cupón (Ej: BIENVENIDA10)"
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value.toUpperCase())}
                  className="flex-1 px-3.5 py-2.5 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl focus:outline-none focus:border-[#BE6C7C]"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponInput.trim()}
                  className="px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-xs font-bold hover:bg-black transition disabled:opacity-50"
                >
                  {couponLoading ? '...' : 'Aplicar'}
                </button>
              </div>
              {couponError && <p className="text-[11px] text-red-600">{couponError}</p>}
              {appliedCoupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-50 text-emerald-800 p-2.5 rounded-xl border border-emerald-200">
                  <span className="flex items-center gap-1.5 font-semibold">
                    <Tag size={13} /> {appliedCoupon.code} ({appliedCoupon.discountPercentage}% OFF)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setAppliedCoupon(null);
                      setFormData((prev) => ({ ...prev, couponCode: '' }));
                    }}
                    className="text-emerald-700 hover:text-emerald-900 font-bold"
                  >
                    Quitar
                  </button>
                </div>
              )}
            </div>

            {/* Financial Breakdown */}
            <div className="space-y-2 pt-2 border-t border-[#F0E6E8] text-xs">
              <div className="flex justify-between text-zinc-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between text-emerald-700 font-semibold">
                  <span>Descuento ({appliedCoupon.discountPercentage}%)</span>
                  <span>-${discountAmount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-zinc-600">
                <span>Envío ({selectedRegion?.name || 'Por definir'})</span>
                <span>${shippingCost.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-[#F0E6E8]">
                <span>Total a Pagar</span>
                <span className="font-serif text-lg font-bold">${total.toFixed(2)}</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              form="checkout-form"
              disabled={loading}
              className="w-full btn-pink-diamond py-4 px-6 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition shadow-xl active:scale-[0.99] disabled:opacity-50 shimmer-button"
            >
              {loading ? 'Generando Pedido...' : 'Continuar al Pago'}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
