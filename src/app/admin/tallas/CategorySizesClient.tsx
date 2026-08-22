'use client';

import { useState } from 'react';
import {
  adminCreateCategorySizeAction,
  adminUpdateCategorySizeAction,
  adminDeleteCategorySizeAction,
} from '@/lib/actions/admin.actions';
import { Ruler, Plus, Trash2, Edit3, X, AlertCircle } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import CustomSelect from '@/components/ui/CustomSelect';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

interface CategorySizeItem {
  id: string;
  categoryId: string;
  name: string;
  isAdjustable: boolean;
  sortOrder: number;
  isActive: boolean;
  category?: {
    id: string;
    name: string;
  };
}

export default function CategorySizesClient({
  initialSizes,
  categories,
}: {
  initialSizes: CategorySizeItem[];
  categories: CategoryItem[];
}) {
  const [sizes, setSizes] = useState<CategorySizeItem[]>(initialSizes);
  const [filterCategoryId, setFilterCategoryId] = useState<string>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSize, setEditingSize] = useState<CategorySizeItem | null>(null);

  const [formData, setFormData] = useState({
    categoryId: categories[0]?.id || '',
    name: '',
    isAdjustable: false,
    sortOrder: 0,
    isActive: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const filteredSizes =
    filterCategoryId === 'ALL'
      ? sizes
      : sizes.filter((s) => s.categoryId === filterCategoryId);

  const openCreateModal = () => {
    setEditingSize(null);
    setFormData({
      categoryId: filterCategoryId !== 'ALL' ? filterCategoryId : categories[0]?.id || '',
      name: '',
      isAdjustable: false,
      sortOrder: sizes.length,
      isActive: true,
    });
    setError('');
    setIsModalOpen(true);
  };

  const openEditModal = (sz: CategorySizeItem) => {
    setEditingSize(sz);
    setFormData({
      categoryId: sz.categoryId,
      name: sz.name,
      isAdjustable: sz.isAdjustable,
      sortOrder: sz.sortOrder,
      isActive: sz.isActive,
    });
    setError('');
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (editingSize) {
        const res = await adminUpdateCategorySizeAction(editingSize.id, {
          categoryId: formData.categoryId,
          name: formData.name,
          isAdjustable: formData.isAdjustable,
          sortOrder: Number(formData.sortOrder) || 0,
          isActive: formData.isActive,
        });

        if (res.success && res.size) {
          const categoryObj = categories.find((c) => c.id === formData.categoryId);
          const updated = {
            ...(res.size as CategorySizeItem),
            category: categoryObj ? { id: categoryObj.id, name: categoryObj.name } : undefined,
          };
          setSizes(sizes.map((s) => (s.id === editingSize.id ? updated : s)));
          setIsModalOpen(false);
        } else {
          setError(res.error || 'Error al actualizar talla');
        }
      } else {
        const res = await adminCreateCategorySizeAction({
          categoryId: formData.categoryId,
          name: formData.name,
          isAdjustable: formData.isAdjustable,
          sortOrder: Number(formData.sortOrder) || 0,
        });

        if (res.success && res.size) {
          const categoryObj = categories.find((c) => c.id === formData.categoryId);
          const created = {
            ...(res.size as CategorySizeItem),
            category: categoryObj ? { id: categoryObj.id, name: categoryObj.name } : undefined,
          };
          setSizes([...sizes, created]);
          setIsModalOpen(false);
        } else {
          setError(res.error || 'Error al crear talla');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar esta talla?')) return;

    try {
      const res = await adminDeleteCategorySizeAction(id);
      if (res.success) {
        setSizes(sizes.filter((s) => s.id !== id));
      } else {
        alert(res.error || 'Error al eliminar talla');
      }
    } catch (err: any) {
      alert(err.message || 'Error al eliminar');
    }
  };

  const handleToggleStatus = async (sz: CategorySizeItem) => {
    try {
      const res = await adminUpdateCategorySizeAction(sz.id, {
        isActive: !sz.isActive,
      });
      if (res.success && res.size) {
        setSizes(
          sizes.map((s) =>
            s.id === sz.id ? { ...s, isActive: (res.size as CategorySizeItem).isActive } : s
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
            Tallas por Categoría
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Configura las medidas disponibles (Anillos: 5-10, Collares: 40-60cm, Pulseras, Ajustables) para cada categoría.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="px-5 py-2.5 rounded-2xl btn-purple-diamond text-xs font-bold shadow-xs cursor-pointer inline-flex items-center gap-2"
        >
          <Plus size={16} />
          <span>Añadir Nueva Talla</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none text-xs">
        <button
          onClick={() => setFilterCategoryId('ALL')}
          className={`px-4 py-2.5 rounded-2xl font-bold uppercase tracking-wider transition shrink-0 cursor-pointer ${
            filterCategoryId === 'ALL'
              ? 'btn-purple-diamond shadow-xs'
              : 'bg-white text-zinc-700 hover:bg-[#F8F5FA] border border-[#DFD0EC]'
          }`}
        >
          Todas las Categorías ({sizes.length})
        </button>
        {categories.map((cat) => {
          const count = sizes.filter((s) => s.categoryId === cat.id).length;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategoryId(cat.id)}
              className={`px-4 py-2.5 rounded-2xl font-bold uppercase tracking-wider transition shrink-0 cursor-pointer ${
                filterCategoryId === cat.id
                  ? 'btn-purple-diamond shadow-xs'
                  : 'bg-white text-zinc-700 hover:bg-[#F8F5FA] border border-[#DFD0EC]'
              }`}
            >
              {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Sizes Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredSizes.map((sz) => (
          <div
            key={sz.id}
            className={`p-5 rounded-3xl border bg-white shadow-xs space-y-3 flex flex-col justify-between transition ${
              sz.isActive ? 'border-[#DFD0EC]' : 'border-zinc-200 opacity-60'
            }`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#7043A0] bg-[#F0E9F5] px-2 py-0.5 rounded-md">
                  {sz.category?.name || 'Categoría'}
                </span>
                <button
                  onClick={() => handleToggleStatus(sz)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border cursor-pointer ${
                    sz.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                      : 'bg-zinc-100 text-zinc-500 border-zinc-300'
                  }`}
                >
                  {sz.isActive ? 'Activo' : 'Inactivo'}
                </button>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <Ruler size={16} className="text-[#3F235F] shrink-0" />
                <h3 className="font-bold text-zinc-900 text-sm">{sz.name}</h3>
              </div>

              {sz.isAdjustable && (
                <span className="inline-block text-[10px] bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-md font-medium">
                  ✨ Talla Ajustable / Adaptable
                </span>
              )}
            </div>

            <div className="flex items-center justify-between pt-2.5 border-t border-[#DFD0EC]/60 text-xs">
              <span className="text-[10px] text-zinc-400 font-mono">
                Orden: #{sz.sortOrder}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEditModal(sz)}
                  className="p-1.5 hover:bg-[#F8F5FA] rounded-lg text-zinc-600 hover:text-[#3F235F] transition border border-transparent hover:border-[#DFD0EC] cursor-pointer"
                  title="Editar talla"
                >
                  <Edit3 size={14} />
                </button>
                <button
                  onClick={() => handleDelete(sz.id)}
                  className="p-1.5 hover:bg-red-50 rounded-lg text-red-500 hover:text-red-700 transition cursor-pointer"
                  title="Eliminar talla"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSizes.length === 0 && (
        <div className="p-10 text-center bg-white rounded-3xl border border-[#DFD0EC] text-zinc-400 text-xs font-light">
          No hay tallas registradas para este filtro. Haz clic en <strong>Añadir Nueva Talla</strong> para agregar una.
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
                  {editingSize ? 'Editar Talla' : 'Nueva Talla de Joyería'}
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
                <label className="font-bold text-zinc-700 block">Categoría de Joyería</label>
                <CustomSelect
                  value={formData.categoryId}
                  onChange={(val) => setFormData({ ...formData, categoryId: val })}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                  triggerClassName="py-2.5 px-3.5 rounded-xl bg-[#FAF8FC] border border-[#DFD0EC] text-xs font-semibold text-zinc-900"
                />
              </div>

              <div className="space-y-1.5">
                <label className="font-bold text-zinc-700 block">
                  Nombre de la Talla / Medida <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Talla 7, 45 cm (Princesa), Ajustable 16-19 cm"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#FAF8FC] border border-[#DFD0EC] rounded-xl focus:outline-hidden focus:border-[#7043A0]"
                />
              </div>

              <div className="flex items-center gap-2 p-3 bg-[#FAF8FC] rounded-xl border border-[#DFD0EC]">
                <input
                  type="checkbox"
                  id="isAdjustable"
                  checked={formData.isAdjustable}
                  onChange={(e) =>
                    setFormData({ ...formData, isAdjustable: e.target.checked })
                  }
                  className="w-4 h-4 rounded text-[#7043A0] focus:ring-[#7043A0] accent-[#7043A0] cursor-pointer"
                />
                <label htmlFor="isAdjustable" className="font-bold text-zinc-800 cursor-pointer">
                  Es una Talla Ajustable / Adaptable
                </label>
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
                  {loading ? 'Guardando...' : editingSize ? 'Actualizar' : 'Crear Talla'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
