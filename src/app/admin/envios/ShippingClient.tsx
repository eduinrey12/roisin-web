'use client';

import { useState } from 'react';
import {
  adminCreateShippingRegionAction,
  adminUpdateShippingRegionAction,
  adminDeleteShippingRegionAction,
} from '@/lib/actions/admin.actions';
import { Truck, Plus, Trash2, Edit2, Check, X } from 'lucide-react';

interface ShippingRegionItem {
  id: string;
  name: string;
  baseRate: any;
  description: string | null;
  isActive: boolean;
}

export default function ShippingClient({
  initialRegions,
}: {
  initialRegions: ShippingRegionItem[];
}) {
  const [regions, setRegions] = useState(initialRegions);
  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editRate, setEditRate] = useState<string>('');

  const [formData, setFormData] = useState({
    name: '',
    baseRate: '',
    description: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminCreateShippingRegionAction({
        name: formData.name,
        baseRate: Number(formData.baseRate),
        description: formData.description || undefined,
      });

      if (res.success && res.region) {
        setRegions([...regions, res.region as any]);
        setIsCreating(false);
        setFormData({ name: '', baseRate: '', description: '' });
      } else {
        setError(res.error || 'Error al crear zona de envío');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleStartEdit = (region: ShippingRegionItem) => {
    setEditingId(region.id);
    setEditRate(String(Number(region.baseRate)));
  };

  const handleSaveEdit = async (id: string) => {
    if (!editRate || isNaN(Number(editRate))) return;
    try {
      const res = await adminUpdateShippingRegionAction(id, {
        baseRate: Number(editRate),
      });
      if (res.success && res.region) {
        setRegions(
          regions.map((r) => (r.id === id ? { ...r, baseRate: res.region.baseRate } : r))
        );
        setEditingId(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas desactivar esta zona de envío? (Se mantendrá el registro histórico)'))
      return;
    try {
      const res = await adminDeleteShippingRegionAction(id);
      if (res.success) {
        setRegions(regions.filter((r) => r.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-zinc-900 flex items-center gap-2">
            <Truck className="text-[#7043A0]" size={24} />
            Tarifas de Envíos Nacionales
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configura los costos de envío a nivel nacional (Guayaquil $3, Otros Destinos $6, Galápagos $12). Las eliminaciones se realizan mediante baja lógica (isActive: false) para proteger las órdenes históricas.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="btn-purple-diamond px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Nueva Zona de Envío
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200">
          {error}
        </div>
      )}

      {/* Create Modal */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#DFD0EC] pb-3">
            <h3 className="font-bold text-sm text-zinc-900">Crear Zona de Envío</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Nombre de la Zona *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Guayaquil & Samborondón"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Tarifa de Envío ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                placeholder="3.00"
                value={formData.baseRate}
                onChange={(e) => setFormData({ ...formData, baseRate: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Detalle / Tiempo de Entrega
            </label>
            <input
              type="text"
              placeholder="Entrega local el mismo día o 24 horas"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
            />
          </div>

          <div className="flex justify-end gap-3 pt-3 border-t border-[#DFD0EC]">
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="px-4 py-2 text-xs font-bold text-zinc-600 hover:bg-zinc-100 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="btn-purple-diamond px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer"
            >
              {loading ? 'Guardando...' : 'Crear Zona'}
            </button>
          </div>
        </form>
      )}

      {/* Shipping Regions Table */}
      <div className="bg-white rounded-3xl border border-[#DFD0EC] overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F5FA] border-b border-[#DFD0EC] text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-6">Zona de Envío</th>
              <th className="py-3.5 px-6">Descripción</th>
              <th className="py-3.5 px-6">Costo ($ USD)</th>
              <th className="py-3.5 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFD0EC]/60">
            {regions.map((r) => {
              const isEditing = editingId === r.id;

              return (
                <tr key={r.id} className="hover:bg-[#F8F5FA]/50 transition">
                  <td className="py-3.5 px-6">
                    <span className="font-bold text-zinc-900">{r.name}</span>
                  </td>
                  <td className="py-3.5 px-6 text-zinc-500">
                    {r.description || 'Sin descripción'}
                  </td>
                  <td className="py-3.5 px-6">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          value={editRate}
                          onChange={(e) => setEditRate(e.target.value)}
                          className="w-24 px-2 py-1 bg-[#F8F5FA] border border-[#7043A0] rounded-lg font-bold text-zinc-900"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveEdit(r.id)}
                          className="p-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingId(null)}
                          className="p-1 text-zinc-400 hover:text-zinc-700"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <span className="font-bold text-[#3F235F] text-sm">
                        ${Number(r.baseRate).toFixed(2)}
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-6 text-right space-x-2">
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => handleStartEdit(r)}
                        className="p-2 text-zinc-400 hover:text-[#3F235F] hover:bg-[#F8F5FA] rounded-xl transition cursor-pointer"
                        title="Editar tarifa"
                      >
                        <Edit2 size={15} />
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={() => handleDelete(r.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Desactivar zona (Soft Delete)"
                    >
                      <Trash2 size={15} />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
