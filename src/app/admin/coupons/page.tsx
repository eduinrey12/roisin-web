'use client';

import { useEffect, useState } from 'react';

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<any[]>([]);
  const [formData, setFormData] = useState({ code: '', discountPercentage: 10, maxUses: '' });

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/coupons`)
      .then(res => res.json())
      .then(data => setCoupons(data))
      .catch(console.error);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await fetch(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1'}/admin/coupons`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code: formData.code,
          discountPercentage: Number(formData.discountPercentage),
          maxUses: formData.maxUses ? Number(formData.maxUses) : undefined
        })
      });
      setFormData({ code: '', discountPercentage: 10, maxUses: '' });
      fetchCoupons();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Gestión de Cupones</h1>
      
      <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-8">
        <h2 className="text-xl font-semibold mb-4">Crear Nuevo Cupón</h2>
        <form onSubmit={handleCreate} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm text-gray-600 mb-1">Código</label>
            <input type="text" required value={formData.code} onChange={e => setFormData({...formData, code: e.target.value.toUpperCase()})} placeholder="EJ: VERANO20" className="w-full border rounded px-4 py-2" />
          </div>
          <div className="w-32">
            <label className="block text-sm text-gray-600 mb-1">Descuento (%)</label>
            <input type="number" required min="1" max="100" value={formData.discountPercentage} onChange={e => setFormData({...formData, discountPercentage: Number(e.target.value)})} className="w-full border rounded px-4 py-2" />
          </div>
          <div className="w-32">
            <label className="block text-sm text-gray-600 mb-1">Usos Max (Opc)</label>
            <input type="number" min="1" value={formData.maxUses} onChange={e => setFormData({...formData, maxUses: e.target.value})} placeholder="∞" className="w-full border rounded px-4 py-2" />
          </div>
          <button type="submit" className="bg-black text-white px-6 py-2 rounded font-medium hover:bg-gray-800 h-[42px]">
            Crear
          </button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="p-4 font-semibold text-gray-600">Código</th>
              <th className="p-4 font-semibold text-gray-600">Descuento</th>
              <th className="p-4 font-semibold text-gray-600">Usos (Actual / Max)</th>
              <th className="p-4 font-semibold text-gray-600">Estado</th>
            </tr>
          </thead>
          <tbody>
            {coupons.map(coupon => (
              <tr key={coupon.id} className="border-b last:border-0 hover:bg-gray-50">
                <td className="p-4 font-bold tracking-widest">{coupon.code}</td>
                <td className="p-4 text-green-600 font-semibold">{coupon.discountPercentage}%</td>
                <td className="p-4">{coupon.currentUses} / {coupon.maxUses || '∞'}</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${coupon.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {coupon.isActive ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
              </tr>
            ))}
            {coupons.length === 0 && (
              <tr><td colSpan={4} className="p-8 text-center text-gray-500">No hay cupones creados</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
