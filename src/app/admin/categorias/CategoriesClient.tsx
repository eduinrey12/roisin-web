'use client';

import { useState } from 'react';
import {
  adminCreateCategoryAction,
  adminDeleteCategoryAction,
} from '@/lib/actions/admin.actions';
import { FolderTree, Plus, Trash2, X } from 'lucide-react';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export default function CategoriesClient({ initialCategories }: { initialCategories: CategoryItem[] }) {
  const [categories, setCategories] = useState(initialCategories);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  };

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    setFormData((prev) => ({
      ...prev,
      name,
      slug: generateSlug(name),
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminCreateCategoryAction({
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
      });

      if (res.success && res.category) {
        setCategories([...categories, res.category as any]);
        setIsCreating(false);
        setFormData({ name: '', slug: '', description: '', imageUrl: '' });
      } else {
        setError(res.error || 'Error al crear categoría');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas desactivar esta categoría?')) return;
    try {
      const res = await adminDeleteCategoryAction(id);
      if (res.success) {
        setCategories(categories.filter((c) => c.id !== id));
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
            <FolderTree className="text-[#7043A0]" size={24} />
            Categorías de Joyería
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organiza tus joyas por tipos (Anillos, Collares, Aretes, Pulseras) para la navegación principal.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="btn-purple-diamond px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Nueva Categoría
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
            <h3 className="font-bold text-sm text-zinc-900">Crear Nueva Categoría</h3>
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
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Nombre *</label>
              <input
                type="text"
                required
                placeholder="Ej: Anillos de Promesa"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Slug *</label>
              <input
                type="text"
                required
                placeholder="anillos-de-promesa"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Descripción</label>
            <input
              type="text"
              placeholder="Elegantes anillos en plata 925 y oro 18k..."
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
              {loading ? 'Guardando...' : 'Crear Categoría'}
            </button>
          </div>
        </form>
      )}

      {/* Categories Table */}
      <div className="bg-white rounded-3xl border border-[#DFD0EC] overflow-hidden shadow-2xs">
        <table className="w-full text-left text-xs">
          <thead className="bg-[#F8F5FA] border-b border-[#DFD0EC] text-zinc-600 font-bold uppercase tracking-wider text-[10px]">
            <tr>
              <th className="py-3.5 px-6">Categoría</th>
              <th className="py-3.5 px-6">Slug</th>
              <th className="py-3.5 px-6">Productos Asociados</th>
              <th className="py-3.5 px-6 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFD0EC]/60">
            {categories.map((c) => (
              <tr key={c.id} className="hover:bg-[#F8F5FA]/50 transition">
                <td className="py-3.5 px-6">
                  <span className="font-bold text-zinc-900">{c.name}</span>
                  {c.description && (
                    <span className="text-[11px] text-zinc-400 block truncate max-w-xs">{c.description}</span>
                  )}
                </td>
                <td className="py-3.5 px-6 font-mono text-zinc-500">{c.slug}</td>
                <td className="py-3.5 px-6 font-semibold text-zinc-700">
                  {c._count?.products ?? 0} productos
                </td>
                <td className="py-3.5 px-6 text-right">
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id)}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Desactivar categoría"
                  >
                    <Trash2 size={15} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
