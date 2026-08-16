'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreateProductAction } from '@/lib/actions/admin.actions';
import { Upload, Plus, Trash2, AlertCircle, ArrowLeft, Check } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

interface CategoryItem {
  id: string;
  name: string;
  slug: string;
}

export default function ProductCreateForm({ categories }: { categories: CategoryItem[] }) {
  const router = useRouter();

  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    description: '',
    basePrice: '',
    categoryId: categories[0]?.id || '',
    isFeatured: false,
  });

  const [imageUrl, setImageUrl] = useState('');
  const [imagesList, setImagesList] = useState<{ url: string; isPrimary: boolean }[]>([]);
  const [uploading, setUploading] = useState(false);

  const [variantsList, setVariantsList] = useState<
    { sku: string; price: string; initialStock: string }[]
  >([{ sku: '', price: '', initialStock: '10' }]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Auto slug generation
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const slug = title
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');

    setFormData((prev) => ({ ...prev, title, slug }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError('');

    const fd = new FormData();
    fd.append('file', file);

    try {
      const res = await fetch('/api/uploads', { method: 'POST', body: fd });
      const data = await res.json();
      if (res.ok && data.url) {
        setImagesList((prev) => [
          ...prev,
          { url: data.url, isPrimary: prev.length === 0 },
        ]);
      } else {
        setError(data.error || 'Error al subir la imagen');
      }
    } catch {
      setError('Error de conexión al subir imagen');
    } finally {
      setUploading(false);
    }
  };

  const handleAddImageUrl = () => {
    if (!imageUrl.trim()) return;
    setImagesList((prev) => [
      ...prev,
      { url: imageUrl.trim(), isPrimary: prev.length === 0 },
    ]);
    setImageUrl('');
  };

  const handleAddVariant = () => {
    const count = variantsList.length + 1;
    const baseSku = formData.slug ? formData.slug.toUpperCase().substring(0, 8) : 'JOY';
    setVariantsList((prev) => [
      ...prev,
      { sku: `${baseSku}-VAR${count}`, price: formData.basePrice || '0', initialStock: '10' },
    ]);
  };

  const handleRemoveVariant = (index: number) => {
    if (variantsList.length <= 1) return;
    setVariantsList((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (imagesList.length === 0) {
      setError('Debes añadir al menos una imagen para el producto');
      return;
    }

    setLoading(true);
    setError('');

    const payload = {
      title: formData.title,
      slug: formData.slug,
      description: formData.description,
      basePrice: Number(formData.basePrice),
      categoryId: formData.categoryId,
      isFeatured: formData.isFeatured,
      images: imagesList.map((img, idx) => ({
        url: img.url,
        isPrimary: img.isPrimary,
      })),
      variants: variantsList.map((v) => ({
        sku: v.sku,
        price: Number(v.price),
        initialStock: Number(v.initialStock),
      })),
    };

    const res = await adminCreateProductAction(payload);
    setLoading(false);

    if (res.success) {
      router.push('/admin/productos');
      router.refresh();
    } else {
      setError(res.error || 'Error al guardar el producto');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* Basic Info */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
          1. Información General
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Título de la Joya *</label>
            <input
              type="text"
              required
              placeholder="Ej: Anillo Solitario en Plata 925"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Slug URL *</label>
            <input
              type="text"
              required
              placeholder="anillo-solitario-plata-925"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl font-mono focus:outline-none focus:border-black"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Categoría *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-black"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Precio Base ($ USD) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="45.00"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-black"
            />
          </div>

          <div className="flex items-center gap-2 pt-6">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4 h-4 text-black focus:ring-black rounded"
            />
            <label htmlFor="isFeatured" className="text-xs font-semibold text-zinc-800 cursor-pointer">
              Destacar en la Página de Inicio
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-semibold text-zinc-700 block mb-1">Descripción Detallada *</label>
          <textarea
            rows={4}
            required
            placeholder="Detalla los materiales, quilataje, tipo de cierre, garantía y recomendaciones..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-2.5 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-black"
          />
        </div>
      </div>

      {/* Images Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
          2. Fotografías del Producto
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-zinc-300 hover:border-black rounded-2xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition text-center">
            <Upload size={24} className="text-zinc-400 mb-1" />
            <span className="text-xs font-semibold text-zinc-800">
              {uploading ? 'Subiendo...' : 'Subir Imagen desde el equipo'}
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5">Se almacena en tu hosting NVMe</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <div className="space-y-2">
            <label className="text-xs font-semibold text-zinc-700 block">O añadir URL de imagen externa</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-3 py-2 text-xs bg-zinc-50 border border-zinc-200 rounded-xl focus:outline-none focus:border-black"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="bg-zinc-900 text-white px-4 py-2 rounded-xl text-xs font-semibold hover:bg-black"
              >
                Añadir
              </button>
            </div>
          </div>
        </div>

        {/* Thumbnail Preview List */}
        {imagesList.length > 0 && (
          <div className="flex gap-3 overflow-x-auto pt-2">
            {imagesList.map((img, idx) => (
              <div
                key={idx}
                className="relative w-20 h-20 rounded-xl overflow-hidden border-2 border-zinc-200 shrink-0 group"
              >
                <Image src={img.url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImagesList(imagesList.filter((_, i) => i !== idx))}
                  className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-xs"
                >
                  <Trash2 size={12} />
                </button>
                {img.isPrimary && (
                  <span className="absolute bottom-0 inset-x-0 bg-black/80 text-white text-[9px] font-bold text-center py-0.5">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Variants & Initial Stock Section */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-zinc-200 shadow-xs space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
            3. Variantes de Talla / SKU e Inventario
          </h2>
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-xs uppercase tracking-wider font-semibold text-black hover:underline flex items-center gap-1"
          >
            <Plus size={14} /> Añadir Variante
          </button>
        </div>

        <div className="space-y-3">
          {variantsList.map((v, idx) => (
            <div key={idx} className="flex gap-3 items-center bg-zinc-50 p-3 rounded-xl border border-zinc-200">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="SKU (Ej: AN-SOL-T6)"
                  value={v.sku}
                  onChange={(e) => {
                    const next = [...variantsList];
                    next[idx].sku = e.target.value;
                    setVariantsList(next);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-black font-mono"
                />
              </div>

              <div className="w-28">
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="Precio ($)"
                  value={v.price}
                  onChange={(e) => {
                    const next = [...variantsList];
                    next[idx].price = e.target.value;
                    setVariantsList(next);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              <div className="w-24">
                <input
                  type="number"
                  required
                  placeholder="Stock"
                  value={v.initialStock}
                  onChange={(e) => {
                    const next = [...variantsList];
                    next[idx].initialStock = e.target.value;
                    setVariantsList(next);
                  }}
                  className="w-full px-3 py-1.5 text-xs bg-white border border-zinc-200 rounded-lg focus:outline-none focus:border-black"
                />
              </div>

              {variantsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="p-1.5 text-zinc-400 hover:text-red-600 transition"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 items-center justify-end">
        <Link
          href="/admin/productos"
          className="text-xs uppercase tracking-widest font-semibold px-6 py-3.5 rounded-xl border border-zinc-200 hover:bg-zinc-100 transition text-zinc-700"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="bg-black text-white text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded-xl hover:bg-zinc-800 transition active:scale-[0.99] disabled:opacity-50 shadow-sm"
        >
          {loading ? 'Guardando Joya...' : 'Guardar y Publicar'}
        </button>
      </div>
    </form>
  );
}
