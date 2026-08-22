'use client';

import { useState } from 'react';
import {
  adminCreateJewelryColorAction,
  adminUpdateJewelryColorAction,
  adminDeleteJewelryColorAction,
} from '@/lib/actions/admin.actions';
import { Palette, Plus, Trash2, Edit3, X, AlertCircle } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import CustomSelect from '@/components/ui/CustomSelect';

interface JewelryColorItem {
  id: string;
  name: string;
  type: 'METAL' | 'GEM';
  hexCode: string | null;
  sortOrder: number;
  isActive: boolean;
}

export default function JewelryColorsClient({
  initialColors,
}: {
  initialColors: JewelryColorItem[];
}) {
  const [colors, setColors] = useState<JewelryColorItem[]>(initialColors);
  const [filterType, setFilterType] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingColor, setEditingColor] = useState<JewelryColorItem | null>(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'METAL' as 'METAL' | 'GEM',
    hexCode: '#7043A0',
    sortOrder: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredColors =
    filterType === 'ALL'
      ? colors
      : colors.filter((c) => c.type === filterType);

  const openCreateModal = () => {
    setEditingColor(null);
    setFormData({
      name: '',
      type: filterType === 'GEM' ? 'GEM' : 'METAL',
      hexCode: filterType === 'GEM' ? '#7043A0' : '#E5E7EB',
      sortOrder: colors.length,
      isActive: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (col: JewelryColorItem) => {
    setEditingColor(col);
    setFormData({
      name: col.name,
      type: col.type,
      hexCode: col.hexCode || '#7043A0',
      sortOrder: col.sortOrder,
      isActive: col.isActive,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingColor) {
        const res = await adminUpdateJewelryColorAction(editingColor.id, {
          name: formData.name,
          type: formData.type,
          hexCode: formData.hexCode || undefined,
          sortOrder: Number(formData.sortOrder) || 0,
          isActive: formData.isActive,
        });

        if (res.success && res.color) {
          setColors(
            colors.map((c) => (c.id === editingColor.id ? (res.color as JewelryColorItem) : c))
          );
          setIsModalOpen(false);
        } else {
          setError(res.error || 'Error al actualizar color/acabado');
        }
      } else {
        const res = await adminCreateJewelryColorAction({
          name: formData.name,
          type: formData.type,
          hexCode: formData.hexCode || undefined,
          sortOrder: Number(formData.sortOrder) || 0,
        });

        if (res.success && res.color) {
          setColors([...colors, res.color as JewelryColorItem]);
          setIsModalOpen(false);
        } else {
          setError(res.error || 'Error al crear color/acabado');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este acabado/color?')) return;

    try {
      const res = await adminDeleteJewelryColorAction(id);
      if (res.success) {
        setColors(colors.filter((c) => c.id !== id));
      } else {
        alert(res.error || 'Error al eliminar color');
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleToggleStatus = async (col: JewelryColorItem) => {
    try {
      const res = await adminUpdateJewelryColorAction(col.id, {
        isActive: !col.isActive,
      });
      if (res.success && res.color) {
        setColors(
          colors.map((c) =>
            c.id === col.id ? { ...c, isActive: (res.color as JewelryColorItem).isActive } : c
          )
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
            Colores y Acabados de Joyería
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Administra los acabados de metales (Plateado Rodio, Baño Oro 18k, etc.) y tonalidades de gemas (Amatista Morada, Circonia, Esmeralda).
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl btn-purple-diamond text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Añadir Acabado / Color</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        {[
          { key: 'ALL', label: `Todos los Acabados (${colors.length})` },
          { key: 'METAL', label: `Metales (${colors.filter((c) => c.type === 'METAL').length})` },
          { key: 'GEM', label: `Gemas & Circonias (${colors.filter((c) => c.type === 'GEM').length})` },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterType(tab.key)}
            className={`px-4 py-2.5 rounded-2xl font-bold uppercase tracking-wider transition shrink-0 cursor-pointer ${
              filterType === tab.key
                ? 'btn-purple-diamond shadow-xs'
                : 'bg-white text-zinc-700 hover:bg-[#F8F5FA] border border-[#DFD0EC]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Colors Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredColors.map((col) => (
          <div
            key={col.id}
            className={`p-5 rounded-3xl border bg-white shadow-xs space-y-3 flex flex-col justify-between transition ${
              col.isActive ? 'border-[#DFD0EC]' : 'border-zinc-200 opacity-60'
            }`}
          >
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                    col.type === 'METAL'
                      ? 'bg-amber-50 text-amber-800 border-amber-200'
                      : 'bg-purple-50 text-purple-800 border-purple-200'
                  }`}
                >
                  {col.type === 'METAL' ? 'Metal' : 'Gema / Piedra'}
                </span>
                <button
                  onClick={() => handleToggleStatus(col)}
                  className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border cursor-pointer ${
                    col.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                  }`}
                >
                  {col.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="flex items-center gap-3 pt-1">
                <div
                  className="w-7 h-7 rounded-full border border-[#DFD0EC] shadow-2xs shrink-0"
                  style={{ backgroundColor: col.hexCode || '#7043A0' }}
                />
                <div>
                  <h3 className="font-bold text-zinc-900 text-sm leading-snug">{col.name}</h3>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {col.hexCode || 'Sin código'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-[#DFD0EC]/60 text-xs">
              <span className="text-[10px] text-zinc-400 font-mono">
                Orden: #{col.sortOrder}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(col)}
                  className="p-1.5 hover:bg-[#F8F5FA] rounded-lg text-zinc-600 hover:text-[#3F235F] transition border border-transparent hover:border-[#DFD0EC] cursor-pointer"
                  title="Editar color"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(col.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition cursor-pointer"
                  title="Eliminar color"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredColors.length === 0 && (
        <div className="p-10 text-center bg-white rounded-3xl border border-[#DFD0EC] text-zinc-400 text-xs font-light">
          No hay acabados registrados para este filtro. Haz clic en <strong>Añadir Acabado / Color</strong> para crear uno.
        </div>
      )}

      {/* Modal Crear / Editar */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-[#DFD0EC]">
            <div className="flex justify-between items-center pb-3 border-b border-[#DFD0EC]">
              <div className="flex items-center gap-2">
                <RoisinDiamond size={16} color="#7043A0" />
                <h3 className="font-bold text-zinc-900 text-sm">
                  {editingColor ? 'Editar Acabado / Color' : 'Nuevo Acabado o Tonalidad'}
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
                <label className="font-bold text-zinc-700 block">Tipo de Acabado</label>
                <CustomSelect
                  value={formData.type}
                  onChange={(val) => setFormData({ ...formData, type: val as 'METAL' | 'GEM' })}
                  options={[
                    { value: 'METAL', label: 'Color / Baño de Metal' },
                    { value: 'GEM', label: 'Color / Tipo de Gema o Circonia' },
                  ]}
                  triggerClassName="py-2.5 px-3.5 rounded-xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">
                  Nombre del Acabado <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Amatista Morada, Oro Rosa 18k, Circonia Blanca"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-xl focus:outline-hidden focus:border-[#7043A0]"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">
                  Color Representativo (HEX) <span className="text-zinc-400 font-normal">(Muestra visual)</span>
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={formData.hexCode}
                    onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                    className="w-10 h-10 rounded-xl cursor-pointer border border-[#DFD0EC] bg-white p-0.5"
                  />
                  <input
                    type="text"
                    value={formData.hexCode}
                    onChange={(e) => setFormData({ ...formData, hexCode: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-xl font-mono text-xs focus:outline-hidden focus:border-[#7043A0]"
                  />
                </div>
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
                  {loading ? 'Guardando...' : editingColor ? 'Actualizar' : 'Crear Acabado'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
