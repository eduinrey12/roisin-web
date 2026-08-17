'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { adminCreateProductAction } from '@/lib/actions/admin.actions';
import { Upload, Plus, Trash2, AlertCircle, ArrowLeft, Check, Sparkles } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

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
      { sku: `${baseSku}-T${count + 5}`, price: formData.basePrice || '0', initialStock: '10' },
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
      images: imagesList.map((img) => ({
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
      setError(res.error || 'Error al guardar la joya');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 text-xs flex items-center gap-2">
          <AlertCircle size={16} />
          <span>{error}</span>
        </div>
      )}

      {/* 1. Basic Info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#FAD1DC] pb-3.5">
          <RoisinDiamond size={15} color="#E65573" />
          <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
            1. Información General de la Joya
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">Título de la Joya *</label>
            <input
              type="text"
              required
              placeholder="Ej: Anillo Solitario Eterno en Plata 925"
              value={formData.title}
              onChange={handleTitleChange}
              className="w-full px-4 py-3 text-xs bg-[#FFF8FA] border border-[#FAD1DC] rounded-2xl focus:outline-none focus:border-[#D33658] focus:bg-white text-zinc-900 transition"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">Slug URL *</label>
            <input
              type="text"
              required
              placeholder="anillo-solitario-eterno-plata-925"
              value={formData.slug}
              onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
              className="w-full px-4 py-3 text-xs bg-[#FFF8FA] border border-[#FAD1DC] rounded-2xl font-mono focus:outline-none focus:border-[#D33658] focus:bg-white text-zinc-900 transition"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">Categoría *</label>
            <select
              value={formData.categoryId}
              onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
              className="w-full px-4 py-3 text-xs bg-[#FFF8FA] border border-[#FAD1DC] rounded-2xl focus:outline-none focus:border-[#D33658] focus:bg-white text-zinc-900 font-medium transition cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-zinc-800 block mb-1.5">Precio Base ($ USD) *</label>
            <input
              type="number"
              step="0.01"
              required
              placeholder="48.00"
              value={formData.basePrice}
              onChange={(e) => setFormData({ ...formData, basePrice: e.target.value })}
              className="w-full px-4 py-3 text-xs bg-[#FFF8FA] border border-[#FAD1DC] rounded-2xl focus:outline-none focus:border-[#D33658] focus:bg-white text-zinc-900 font-bold transition"
            />
          </div>

          <div className="flex items-center gap-2.5 pt-6">
            <input
              type="checkbox"
              id="isFeatured"
              checked={formData.isFeatured}
              onChange={(e) => setFormData({ ...formData, isFeatured: e.target.checked })}
              className="w-4.5 h-4.5 accent-[#E65573] rounded-md cursor-pointer"
            />
            <label htmlFor="isFeatured" className="text-xs font-bold text-zinc-800 cursor-pointer">
              Destacar en Portada
            </label>
          </div>
        </div>

        <div>
          <label className="text-xs font-bold text-zinc-800 block mb-1.5">Descripción Detallada *</label>
          <textarea
            rows={4}
            required
            placeholder="Detalla los materiales (Plata 925, baño de oro 18k), quilataje, corte de circonia, tipo de cierre, garantía y recomendaciones de cuidado..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="w-full px-4 py-3 text-xs bg-[#FFF8FA] border border-[#FAD1DC] rounded-2xl focus:outline-none focus:border-[#D33658] focus:bg-white text-zinc-900 font-light transition leading-relaxed"
          />
        </div>
      </div>

      {/* 2. Images Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-[#FAD1DC] pb-3.5">
          <RoisinDiamond size={15} color="#E65573" />
          <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
            2. Fotografías de la Joya
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <label className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-[#FAD1DC] hover:border-[#E65573] rounded-3xl cursor-pointer bg-[#FFF8FA] hover:bg-[#FFF5F7] transition text-center group">
            <Upload size={26} className="text-[#E65573] mb-1.5 group-hover:scale-110 transition-transform" />
            <span className="text-xs font-bold text-zinc-900">
              {uploading ? 'Subiendo fotografía...' : 'Subir Imagen desde el equipo'}
            </span>
            <span className="text-[10px] text-zinc-400 mt-0.5 font-light">Se guarda de forma segura en el servidor</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              disabled={uploading}
              className="hidden"
            />
          </label>

          <div className="space-y-2">
            <label className="text-xs font-bold text-zinc-800 block">O añadir URL de imagen directa</label>
            <div className="flex gap-2">
              <input
                type="url"
                placeholder="https://images.unsplash.com/..."
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                className="flex-1 px-4 py-3 text-xs bg-[#FFF8FA] border border-[#FAD1DC] rounded-2xl focus:outline-none focus:border-[#D33658] focus:bg-white text-zinc-900"
              />
              <button
                type="button"
                onClick={handleAddImageUrl}
                className="btn-pink-diamond px-5 py-3 rounded-2xl text-xs font-bold shadow-xs cursor-pointer"
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
                className="relative w-22 h-22 rounded-2xl overflow-hidden border-2 border-[#FAD1DC] shrink-0 group shadow-xs"
              >
                <Image src={img.url} alt="" fill className="object-cover" />
                <button
                  type="button"
                  onClick={() => setImagesList(imagesList.filter((_, i) => i !== idx))}
                  className="absolute top-1.5 right-1.5 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition shadow-xs cursor-pointer"
                >
                  <Trash2 size={12} />
                </button>
                {img.isPrimary && (
                  <span className="absolute bottom-0 inset-x-0 bg-[#D33658] text-white text-[9px] font-bold text-center py-0.5">
                    Principal
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 3. Variants & Initial Stock Section */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#FAD1DC] shadow-xs space-y-5">
        <div className="flex justify-between items-center border-b border-[#FAD1DC] pb-3.5">
          <div className="flex items-center gap-2">
            <RoisinDiamond size={15} color="#E65573" />
            <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900">
              3. Variantes de Talla / SKU e Inventario
            </h2>
          </div>
          <button
            type="button"
            onClick={handleAddVariant}
            className="text-xs uppercase font-bold tracking-wider text-[#D33658] hover:text-[#93203A] flex items-center gap-1 cursor-pointer"
          >
            <Plus size={14} /> Añadir Variante
          </button>
        </div>

        <div className="space-y-3">
          {variantsList.map((v, idx) => (
            <div key={idx} className="flex gap-3 items-center bg-[#FFF8FA] p-3.5 rounded-2xl border border-[#FAD1DC]">
              <div className="flex-1">
                <input
                  type="text"
                  required
                  placeholder="SKU (Ej: AN-SOL-T7)"
                  value={v.sku}
                  onChange={(e) => {
                    const next = [...variantsList];
                    next[idx].sku = e.target.value;
                    setVariantsList(next);
                  }}
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#FAD1DC] rounded-xl focus:outline-none focus:border-[#D33658] font-mono font-bold text-zinc-900"
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
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#FAD1DC] rounded-xl focus:outline-none focus:border-[#D33658] font-serif font-bold text-zinc-900"
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
                  className="w-full px-3.5 py-2 text-xs bg-white border border-[#FAD1DC] rounded-xl focus:outline-none focus:border-[#D33658] font-bold text-zinc-900 text-center"
                />
              </div>

              {variantsList.length > 1 && (
                <button
                  type="button"
                  onClick={() => handleRemoveVariant(idx)}
                  className="p-2 text-zinc-400 hover:text-red-600 transition cursor-pointer"
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Form Actions */}
      <div className="flex gap-4 items-center justify-end pt-2">
        <Link
          href="/admin/productos"
          className="text-xs uppercase tracking-widest font-bold px-7 py-4 rounded-2xl border border-[#FAD1DC] bg-white hover:bg-[#FFF5F7] transition text-zinc-700 shadow-2xs"
        >
          Cancelar
        </Link>
        <button
          type="submit"
          disabled={loading}
          className="btn-pink-diamond text-xs uppercase tracking-widest font-bold px-9 py-4 rounded-2xl transition active:scale-[0.99] disabled:opacity-50 shadow-md shimmer-button cursor-pointer"
        >
          {loading ? 'Guardando Joya...' : 'Guardar y Publicar Joya'}
        </button>
      </div>
    </form>
  );
}
