'use client';

import { useState } from 'react';
import {
  adminCreateMaterialAction,
  adminUpdateMaterialAction,
  adminDeleteMaterialAction,
} from '@/lib/actions/admin.actions';
import { Layers, Plus, Trash2, Edit3, X, CheckCircle2, AlertCircle } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface MaterialItem {
  id: string;
  name: string;
  description: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function MaterialsClient({ initialMaterials }: { initialMaterials: MaterialItem[] }) {
  const [materials, setMaterials] = useState<MaterialItem[]>(initialMaterials);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<MaterialItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    sortOrder: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const openCreateModal = () => {
    setEditingMaterial(null);
    setFormData({
      name: '',
      description: '',
      sortOrder: materials.length,
      isActive: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (mat: MaterialItem) => {
    setEditingMaterial(mat);
    setFormData({
      name: mat.name,
      description: mat.description || '',
      sortOrder: mat.sortOrder,
      isActive: mat.isActive,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingMaterial) {
        const res = await adminUpdateMaterialAction(editingMaterial.id, {
          name: formData.name,
          description: formData.description || undefined,
          sortOrder: Number(formData.sortOrder) || 0,
          isActive: formData.isActive,
        });

        if (res.success && res.material) {
          setMaterials(
            materials.map((m) => (m.id === editingMaterial.id ? (res.material as MaterialItem) : m))
          );
          setIsModalOpen(false);
        } else {
          setError(res.error || 'Error al actualizar material');
        }
      } else {
        const res = await adminCreateMaterialAction({
          name: formData.name,
          description: formData.description || undefined,
          sortOrder: Number(formData.sortOrder) || 0,
        });

        if (res.success && res.material) {
          setMaterials([...materials, res.material as MaterialItem]);
          setIsModalOpen(false);
        } else {
          setError(res.error || 'Error al crear material');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este material del catálogo?')) return;

    try {
      const res = await adminDeleteMaterialAction(id);
      if (res.success) {
        setMaterials(materials.filter((m) => m.id !== id));
      } else {
        alert(res.error || 'Error al eliminar material');
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleToggleStatus = async (mat: MaterialItem) => {
    try {
      const res = await adminUpdateMaterialAction(mat.id, {
        isActive: !mat.isActive,
      });
      if (res.success && res.material) {
        setMaterials(
          materials.map((m) => (m.id === mat.id ? (res.material as MaterialItem) : m))
        );
      }
    } catch (err: any) {
      alert(err.message || 'Error al cambiar estado');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-[#DFD0EC] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F] mb-1">
            <RoisinDiamond size={13} color="#7043A0" /> Gestión de Catálogo
          </div>
          <h1 className="font-sans text-3xl font-bold text-zinc-900">
            Materiales de Joyería
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Administra los tipos de materiales (Plata 925, Oro 18k, etc.) disponibles para las piezas y sus variantes.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl btn-purple-diamond text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Añadir Nuevo Material</span>
        </button>
      </div>

      {/* Materials Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {materials.map((mat) => (
          <div
            key={mat.id}
            className={`p-6 rounded-3xl border transition bg-white shadow-xs space-y-4 flex flex-col justify-between ${
              mat.isActive ? 'border-[#DFD0EC]' : 'border-zinc-200 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#F0E9F5] border border-[#DFD0EC] flex items-center justify-center text-[#7043A0]">
                    <Layers size={16} />
                  </div>
                  <h3 className="font-bold text-zinc-900 text-sm">{mat.name}</h3>
                </div>

                <button
                  onClick={() => handleToggleStatus(mat)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                    mat.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                  }`}
                >
                  {mat.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <p className="text-xs text-zinc-500 font-light leading-relaxed">
                {mat.description || 'Sin descripción asignada.'}
              </p>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DFD0EC]/60 text-xs">
              <span className="text-[10px] text-zinc-400 font-mono">
                Orden: #{mat.sortOrder}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(mat)}
                  className="p-1.5 hover:bg-[#F8F5FA] rounded-lg text-zinc-600 hover:text-[#3F235F] transition border border-transparent hover:border-[#DFD0EC] cursor-pointer"
                  title="Editar material"
                >
                  <Edit3 size={15} />
                </button>
                <button
                  onClick={() => handleDelete(mat.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition cursor-pointer"
                  title="Eliminar material"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#DFD0EC]">
            <div className="flex justify-between items-center pb-3 border-b border-[#DFD0EC]">
              <div className="flex items-center gap-2">
                <RoisinDiamond size={16} color="#7043A0" />
                <h3 className="font-bold text-zinc-900 text-sm">
                  {editingMaterial ? 'Editar Material de Joyería' : 'Nuevo Material'}
                </h3>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full hover:bg-[#F8F5FA] transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-center gap-2">
                <AlertCircle size={15} className="shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">
                  Nombre del Material <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Plata de Ley 925, Baño de Oro 18k"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-xl focus:outline-hidden focus:border-[#7043A0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">
                  Descripción Oficial <span className="text-zinc-400 font-normal">(Opcional)</span>
                </label>
                <textarea
                  rows={3}
                  placeholder="Ej: Plata de ley 925 con recubrimiento de rodio hipoalergénico..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-xl focus:outline-hidden focus:border-[#7043A0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">Orden de Visualización</label>
                <input
                  type="number"
                  value={formData.sortOrder}
                  onChange={(e) =>
                    setFormData({ ...formData, sortOrder: parseInt(e.target.value) || 0 })
                  }
                  className="w-full px-3.5 py-2.5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-xl focus:outline-hidden focus:border-[#7043A0]"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#DFD0EC]">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#DFD0EC] bg-white text-zinc-600 font-bold hover:bg-[#F8F5FA] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="px-5 py-2 rounded-xl btn-purple-diamond font-bold shadow-xs cursor-pointer"
                >
                  {loading ? 'Guardando...' : editingMaterial ? 'Actualizar' : 'Crear Material'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
