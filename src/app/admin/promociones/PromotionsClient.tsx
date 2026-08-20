'use client';

import { useState } from 'react';
import {
  adminCreatePromotionAction,
  adminDeletePromotionAction,
} from '@/lib/actions/admin.actions';
import { Megaphone, Plus, Trash2, X, Gem, Package, Layers, ExternalLink, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import CustomSelect from '@/components/ui/CustomSelect';

interface CollectionItem {
  id: string;
  name: string;
  slug: string;
}

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
}

interface PromotionItem {
  id: string;
  title: string;
  imageUrl: string;
  targetType: 'COLLECTION' | 'PRODUCTS' | 'CUSTOM_URL';
  collectionId?: string | null;
  collection?: CollectionItem | null;
  products?: { product: ProductItem }[];
  discountPercent?: number | null;
  targetUrl?: string | null;
  sortOrder: number;
  isActive: boolean;
}

interface PromotionsClientProps {
  initialPromotions: PromotionItem[];
  collections: CollectionItem[];
  products: ProductItem[];
}

export default function PromotionsClient({
  initialPromotions,
  collections,
  products,
}: PromotionsClientProps) {
  const [promotions, setPromotions] = useState<PromotionItem[]>(initialPromotions);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    imageUrl: '',
    targetType: 'COLLECTION' as 'COLLECTION' | 'PRODUCTS' | 'CUSTOM_URL',
    collectionId: collections[0]?.id || '',
    productIds: [] as string[],
    discountPercent: 0,
    targetUrl: '',
    sortOrder: 0,
  });

  const [productSearch, setProductSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleToggleProduct = (productId: string) => {
    setFormData((prev) => ({
      ...prev,
      productIds: prev.productIds.includes(productId)
        ? prev.productIds.filter((id) => id !== productId)
        : [...prev.productIds, productId],
    }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let targetUrl = formData.targetUrl;
      if (formData.targetType === 'COLLECTION') {
        const col = collections.find((c) => c.id === formData.collectionId);
        targetUrl = col ? `/productos?collection=${col.slug}` : '/productos';
      }

      const res = await adminCreatePromotionAction({
        title: formData.title,
        imageUrl: formData.imageUrl,
        targetType: formData.targetType,
        collectionId: formData.targetType === 'COLLECTION' ? formData.collectionId : null,
        productIds: formData.targetType === 'PRODUCTS' ? formData.productIds : [],
        discountPercent: formData.discountPercent > 0 ? formData.discountPercent : null,
        targetUrl: targetUrl || undefined,
        sortOrder: formData.sortOrder,
      });

      if (res.success && res.promotion) {
        setPromotions([...promotions, res.promotion as any]);
        setIsCreating(false);
        setFormData({
          title: '',
          imageUrl: '',
          targetType: 'COLLECTION',
          collectionId: collections[0]?.id || '',
          productIds: [],
          discountPercent: 0,
          targetUrl: '',
          sortOrder: 0,
        });
      } else {
        setError(res.error || 'Error al crear promoción');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas desactivar este banner promocional?')) return;
    try {
      const res = await adminDeletePromotionAction(id);
      if (res.success) {
        setPromotions(promotions.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const filteredProducts = products.filter((p) =>
    p.title.toLowerCase().includes(productSearch.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-zinc-900 flex items-center gap-2">
            <Megaphone className="text-[#7043A0]" size={24} />
            Banners & Promociones
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Configura los banners de inicio que redirigen a colecciones exclusivas o conjuntos de productos en oferta.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="btn-purple-diamond px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Nueva Promoción
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200">
          {error}
        </div>
      )}

      {/* Create Modal Form */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 sm:p-7 rounded-3xl border border-[#DFD0EC] shadow-lg space-y-5 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#DFD0EC] pb-3">
            <h3 className="font-bold text-sm text-zinc-900 flex items-center gap-2">
              <Gem size={17} className="text-[#7043A0]" />
              Crear Nuevo Banner Promocional
            </h3>
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
                Nombre Interno (Solo visible para el Admin) *
              </label>
              <input
                type="text"
                required
                placeholder="Ej: Promo Colección Diamante Morado 2026"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                URL de Imagen del Banner (Arte completo) *
              </label>
              <input
                type="url"
                required
                placeholder="https://images.unsplash.com/..."
                value={formData.imageUrl}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>
          </div>

          {/* Target Type Selector */}
          <div className="space-y-2 pt-1">
            <label className="text-xs font-semibold text-zinc-700 block">
              Tipo de Destino al dar Clic en la Promoción *
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormData({ ...formData, targetType: 'COLLECTION' })}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                  formData.targetType === 'COLLECTION'
                    ? 'bg-[#F0E9F5] border-[#7043A0] text-[#3F235F] shadow-xs'
                    : 'bg-[#F8F5FA] border-[#DFD0EC] text-zinc-700 hover:border-zinc-400'
                }`}
              >
                <Layers size={18} className="text-[#7043A0]" />
                <div>
                  <span className="font-bold text-xs block">Dirigir a una Colección</span>
                  <span className="text-[10.5px] text-zinc-500 font-light">
                    Redirige al catálogo filtrado por la colección elegida
                  </span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData({ ...formData, targetType: 'PRODUCTS' })}
                className={`p-3.5 rounded-2xl border text-left flex items-center gap-3 transition cursor-pointer ${
                  formData.targetType === 'PRODUCTS'
                    ? 'bg-[#F0E9F5] border-[#7043A0] text-[#3F235F] shadow-xs'
                    : 'bg-[#F8F5FA] border-[#DFD0EC] text-zinc-700 hover:border-zinc-400'
                }`}
              >
                <Package size={18} className="text-[#7043A0]" />
                <div>
                  <span className="font-bold text-xs block">Productos Específicos</span>
                  <span className="text-[10.5px] text-zinc-500 font-light">
                    Selecciona varios productos específicos en promoción
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Conditional Target UI */}
          {formData.targetType === 'COLLECTION' ? (
            <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-2">
              <CustomSelect
                label="Seleccionar Colección de Destino:"
                value={formData.collectionId}
                onChange={(val) => setFormData({ ...formData, collectionId: val })}
                options={collections.map((col) => ({
                  value: col.id,
                  label: col.name,
                  badge: `/productos?collection=${col.slug}`,
                }))}
                placeholder="Elige una colección..."
              />
            </div>
          ) : (
            <div className="p-4 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC] space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-zinc-800">
                  Seleccionar Productos en Promoción ({formData.productIds.length} seleccionados):
                </label>
                <input
                  type="text"
                  placeholder="Buscar producto..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="px-3 py-1.5 text-xs bg-white border border-[#DFD0EC] rounded-lg focus:outline-none"
                />
              </div>

              <div className="max-h-48 overflow-y-auto space-y-1.5 border border-[#DFD0EC] bg-white rounded-xl p-2.5">
                {filteredProducts.map((prod) => {
                  const isSelected = formData.productIds.includes(prod.id);
                  return (
                    <label
                      key={prod.id}
                      className={`flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition ${
                        isSelected
                          ? 'bg-[#F0E9F5] text-[#3F235F] font-bold'
                          : 'hover:bg-zinc-50 text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleToggleProduct(prod.id)}
                          className="rounded border-[#DFD0EC] text-[#3F235F] focus:ring-[#7043A0]"
                        />
                        <span>{prod.title}</span>
                      </div>
                      <span className="text-zinc-500 font-medium">${prod.basePrice.toFixed(2)}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Descuento Promocional % (Opcional)
              </label>
              <input
                type="number"
                min="0"
                max="100"
                placeholder="Ej: 20 para 20% OFF"
                value={formData.discountPercent || ''}
                onChange={(e) => setFormData({ ...formData, discountPercent: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Orden de Aparición
              </label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
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
              className="btn-purple-diamond px-6 py-2.5 text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer shadow-md"
            >
              {loading ? 'Guardando...' : 'Crear Promoción'}
            </button>
          </div>
        </form>
      )}

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {promotions.map((p) => {
          const destinationLabel =
            p.targetType === 'COLLECTION'
              ? `Colección: ${p.collection?.name || 'Asignada'}`
              : p.targetType === 'PRODUCTS'
              ? `${p.products?.length || 0} Productos en Oferta`
              : 'Enlace personalizado';

          return (
            <div
              key={p.id}
              className="relative aspect-[16/9.5] rounded-3xl overflow-hidden border border-[#DFD0EC] group shadow-sm flex flex-col justify-between p-5 text-white bg-[#1B1124]"
            >
              <Image
                src={p.imageUrl}
                alt={p.title}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105 opacity-85"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1124]/90 via-[#1B1124]/30 to-transparent" />

              {/* Top Controls */}
              <div className="relative z-10 flex justify-between items-start">
                <span className="bg-black/60 backdrop-blur-xs text-white text-[9.5px] uppercase font-bold px-3 py-1 rounded-full border border-white/20">
                  {destinationLabel}
                </span>

                <button
                  type="button"
                  onClick={() => handleDelete(p.id)}
                  className="p-2 bg-black/60 hover:bg-red-600 text-white rounded-xl transition cursor-pointer backdrop-blur-xs shadow-md"
                  title="Eliminar banner"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Bottom Admin Title info */}
              <div className="relative z-10 space-y-1">
                <h3 className="font-sans font-bold text-base text-white leading-snug">{p.title}</h3>
                {p.discountPercent && (
                  <span className="inline-block text-[10px] font-black uppercase text-amber-300">
                    🔥 Descuento: {p.discountPercent}% OFF
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
