'use client';

import { useState } from 'react';
import { adminCreateCouponAction, adminToggleCouponAction } from '@/lib/actions/admin.actions';
import { Plus, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface CouponItem {
  id: string;
  code: string;
  discountPercentage: number;
  maxUses: number | null;
  currentUses: number;
  validUntil: string | null;
  isActive: boolean;
}

export default function CouponsClient({ coupons: initialCoupons }: { coupons: CouponItem[] }) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [formData, setFormData] = useState({
    code: '',
    discountPercentage: '10',
    maxUses: '',
    validUntil: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await adminCreateCouponAction({
      code: formData.code,
      discountPercentage: Number(formData.discountPercentage),
      maxUses: formData.maxUses ? Number(formData.maxUses) : undefined,
      validUntil: formData.validUntil || undefined,
    });

    setLoading(false);
    if (res.success && res.coupon) {
      setCoupons([
        {
          id: res.coupon.id,
          code: res.coupon.code,
          discountPercentage: res.coupon.discountPercentage,
          maxUses: res.coupon.maxUses,
          currentUses: res.coupon.currentUses,
          validUntil: res.coupon.validUntil ? res.coupon.validUntil.toISOString() : null,
          isActive: res.coupon.isActive,
        },
        ...coupons,
      ]);
      setFormData({ code: '', discountPercentage: '10', maxUses: '', validUntil: '' });
    } else {
      setError(res.error || 'Error al crear cupón');
    }
  };

  const handleToggle = async (id: string, current: boolean) => {
    const res = await adminToggleCouponAction(id, !current);
    if (res.success) {
      setCoupons(coupons.map((c) => (c.id === id ? { ...c, isActive: !current } : c)));
    }
  };

  return (
    <div className="space-y-8">
      {/* 1. Creation Form */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#DFD0EC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#DFD0EC] pb-3.5">
          <RoisinDiamond size={15} color="#7043A0" />
          <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
            Crear Nuevo Cupón de Descuento
          </h2>
        </div>

        {error && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">Código Promocional *</label>
            <input
              type="text"
              required
              placeholder="EJ: AMOR2026"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl font-mono uppercase font-bold focus:outline-none focus:border-[#7043A0] focus:bg-white text-zinc-900 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">Descuento (%) *</label>
            <input
              type="number"
              min="1"
              max="100"
              required
              placeholder="15"
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
              className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl focus:outline-none focus:border-[#7043A0] focus:bg-white text-[#3F235F] font-bold transition text-center"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">Usos Máx (Opcional)</label>
            <input
              type="number"
              min="1"
              placeholder="Ilimitado"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              className="w-full px-4 py-3 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl focus:outline-none focus:border-[#7043A0] focus:bg-white text-zinc-900 font-bold transition text-center"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full btn-purple-diamond py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold transition active:scale-[0.99] disabled:opacity-50 shadow-md flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Plus size={15} /> {loading ? '...' : 'Crear Cupón'}
            </button>
          </div>
        </form>
      </div>

      {/* 2. Coupons Table */}
      <div className="bg-white rounded-3xl border border-[#DFD0EC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-[#DFD0EC] bg-[#F8F5FA] text-zinc-900 font-bold">
                <th className="p-4 uppercase tracking-wider">Código</th>
                <th className="p-4 uppercase tracking-wider">Descuento</th>
                <th className="p-4 uppercase tracking-wider">Usos (Actual / Máx)</th>
                <th className="p-4 uppercase tracking-wider">Estado</th>
                <th className="p-4 uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DFD0EC]/60">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-[#F8F5FA]/50 transition">
                  <td className="p-4 font-mono font-bold text-zinc-900 tracking-wider text-sm">
                    <span className="bg-[#F8F5FA] px-3 py-1 rounded-full border border-[#DFD0EC] text-[#3F235F]">
                      {coupon.code}
                    </span>
                  </td>
                  <td className="p-4 font-sans font-bold text-[#3F235F] text-sm">{coupon.discountPercentage}% OFF</td>
                  <td className="p-4 text-zinc-700 font-medium">
                    {coupon.currentUses} / {coupon.maxUses || 'Ilimitado'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full ${
                        coupon.isActive
                          ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          : 'bg-zinc-100 text-zinc-600 border border-zinc-200'
                      }`}
                    >
                      {coupon.isActive ? <CheckCircle2 size={12} className="text-emerald-700" /> : <XCircle size={12} />}
                      {coupon.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggle(coupon.id, coupon.isActive)}
                      className="text-xs font-bold text-[#3F235F] hover:text-[#7043A0] transition cursor-pointer px-3 py-1.5 rounded-xl hover:bg-[#F8F5FA]"
                    >
                      {coupon.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-10 text-center text-zinc-400 font-light">
                    No hay cupones creados aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

