'use client';

import { useState } from 'react';
import {
  adminCreateCollectionAction,
  adminUpdateCollectionAction,
  adminDeleteCollectionAction,
} from '@/lib/actions/admin.actions';
import { Sparkles, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  imageUrl: string | null;
  bannerUrl?: string | null;
  isFeatured?: boolean;
  isActive: boolean;
  _count?: {
    products: number;
  };
}

export default function CollectionsClient({ initialCollections }: { initialCollections: CollectionItem[] }) {
  const [collections, setCollections] = useState<CollectionItem[]>(initialCollections);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    slug: '',
    description: '',
    imageUrl: '',
    bannerUrl: '',
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
      const res = await adminCreateCollectionAction({
        name: formData.name,
        slug: formData.slug || generateSlug(formData.name),
        description: formData.description || undefined,
        imageUrl: formData.imageUrl || undefined,
        bannerUrl: formData.bannerUrl || undefined,
      });

      if (res.success && res.collection) {
        setCollections([res.collection as any, ...collections]);
        setIsCreating(false);
        setFormData({ name: '', slug: '', description: '', imageUrl: '', bannerUrl: '' });
      } else {
        setError(res.error || 'Error al crear colección');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas desactivar esta colección?')) return;
    try {
      const res = await adminDeleteCollectionAction(id);
      if (res.success) {
        setCollections(collections.filter((c) => c.id !== id));
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
            <Sparkles className="text-[#7043A0]" size={24} />
            Colecciones Exclusivas
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Crea colecciones destacadas (ej: San Valentín, Diamante Morado, Anillos de Promesa) y asócialas a productos.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="btn-purple-diamond px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Nueva Colección
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200">
          {error}
        </div>
      )}

      {/* Create Modal / Card */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#DFD0EC] pb-3">
            <h3 className="font-bold text-sm text-zinc-900">Crear Nueva Colección</h3>
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
                Nombre de la Colección *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Diamante Morado 2026"
                value={formData.name}
                onChange={handleNameChange}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Slug (URL identificador) *
              </label>
              <input
                type="text"
                required
                placeholder="diamante-morado-2026"
                value={formData.slug}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0] font-mono"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">
              Descripción Corta
            </label>
            <input
              type="text"
              placeholder="Joyas bañadas en oro blanco y plata fina inspiradas en amatistas..."
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                URL de Portada de la Colección
              </label>
              <input
                type="url"
                placeholder="https://..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-zinc-800 block mb-1">Banner Promocional (Opcional)</label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={formData.bannerUrl || ''}
                onChange={(e) => setFormData({ ...formData, bannerUrl: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>
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
              {loading ? 'Guardando...' : 'Crear Colección'}
            </button>
          </div>
        </form>
      )}

      {/* Collections Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {collections.map((c) => (
          <div
            key={c.id}
            className="bg-white rounded-3xl border border-[#DFD0EC] p-5 space-y-4 shadow-2xs hover:border-[#7043A0] transition flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-[#F8F5FA] border border-[#DFD0EC]">
                {c.imageUrl ? (
                  <Image src={c.imageUrl} alt={c.name} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-300">
                    <ImageIcon size={32} />
                  </div>
                )}
                {c.isFeatured && (
                  <span className="absolute top-2 right-2 bg-[#3F235F] text-white text-[9px] uppercase font-bold px-2.5 py-1 rounded-full shadow-xs">
                    Destacada
                  </span>
                )}
              </div>

              <div>
                <h3 className="font-bold text-sm text-zinc-900">{c.name}</h3>
                <p className="text-[11px] font-mono text-zinc-400">slug: {c.slug}</p>
                {c.description && (
                  <p className="text-xs text-zinc-600 line-clamp-2 mt-1">{c.description}</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-[#DFD0EC] text-xs">
              <span className="text-zinc-500 font-medium">
                {c._count?.products ?? 0} joyas vinculadas
              </span>

              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Desactivar colección"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
