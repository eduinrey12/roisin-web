'use client';

import { useState } from 'react';
import { adminCreateCouponAction, adminToggleCouponAction } from '@/lib/actions/admin.actions';
import { Tag, Plus, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';

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
      {/* Creation Form */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-2">
          <Tag size={16} /> Crear Nuevo Cupón
        </h2>

        {error && (
          <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-5 gap-4 items-end">
          <div className="sm:col-span-2">
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Código de Cupón *</label>
            <input
              type="text"
              required
              placeholder="EJ: VERANO20"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl font-mono uppercase focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Descuento (%) *</label>
            <input
              type="number"
              min="1"
              max="100"
              required
              placeholder="10"
              value={formData.discountPercentage}
              onChange={(e) => setFormData({ ...formData, discountPercentage: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Usos Máx (Opcional)</label>
            <input
              type="number"
              min="1"
              placeholder="Ilimitado"
              value={formData.maxUses}
              onChange={(e) => setFormData({ ...formData, maxUses: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-black text-white py-2.5 rounded-xl text-xs uppercase tracking-wider font-bold hover:bg-zinc-800 transition active:scale-[0.99] disabled:opacity-50 h-[38px] flex items-center justify-center gap-1.5"
            >
              <Plus size={14} /> {loading ? '...' : 'Crear'}
            </button>
          </div>
        </form>
      </div>

      {/* Coupons Table */}
      <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-600">
                <th className="p-4 font-bold uppercase tracking-wider">Código</th>
                <th className="p-4 font-bold uppercase tracking-wider">Descuento</th>
                <th className="p-4 font-bold uppercase tracking-wider">Usos (Actual / Máx)</th>
                <th className="p-4 font-bold uppercase tracking-wider">Estado</th>
                <th className="p-4 font-bold uppercase tracking-wider text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100">
              {coupons.map((coupon) => (
                <tr key={coupon.id} className="hover:bg-zinc-50 transition">
                  <td className="p-4 font-mono font-bold text-black tracking-wider text-sm">
                    {coupon.code}
                  </td>
                  <td className="p-4 font-bold text-emerald-700">{coupon.discountPercentage}%</td>
                  <td className="p-4 text-zinc-700">
                    {coupon.currentUses} / {coupon.maxUses || '∞'}
                  </td>
                  <td className="p-4">
                    <span
                      className={`inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                        coupon.isActive
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-zinc-200 text-zinc-600'
                      }`}
                    >
                      {coupon.isActive ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
                      {coupon.isActive ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleToggle(coupon.id, coupon.isActive)}
                      className="text-xs font-semibold text-zinc-700 hover:text-black hover:underline"
                    >
                      {coupon.isActive ? 'Desactivar' : 'Activar'}
                    </button>
                  </td>
                </tr>
              ))}
              {coupons.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-zinc-400">
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
