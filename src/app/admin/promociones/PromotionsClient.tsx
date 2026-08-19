'use client';

import { useState } from 'react';
import {
  adminCreatePromotionAction,
  adminDeletePromotionAction,
} from '@/lib/actions/admin.actions';
import { Megaphone, Plus, Trash2, X, Image as ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface PromotionItem {
  id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  discountText: string | null;
  targetUrl: string;
  imageUrl: string;
  sortOrder: number;
  isActive: boolean;
}

export default function PromotionsClient({ initialPromotions }: { initialPromotions: PromotionItem[] }) {
  const [promotions, setPromotions] = useState<PromotionItem[]>(initialPromotions);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    badge: '',
    discountText: '',
    targetUrl: '/productos',
    imageUrl: '',
    sortOrder: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminCreatePromotionAction({
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        badge: formData.badge || undefined,
        discountText: formData.discountText || undefined,
        targetUrl: formData.targetUrl || '/productos',
        imageUrl: formData.imageUrl,
        sortOrder: formData.sortOrder,
      });

      if (res.success && res.promotion) {
        setPromotions([...promotions, res.promotion as any]);
        setIsCreating(false);
        setFormData({
          title: '',
          subtitle: '',
          badge: '',
          discountText: '',
          targetUrl: '/productos',
          imageUrl: '',
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
            Administra las tarjetas promocionales cuadradas y horizontales que se muestran en la página de inicio.
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

      {/* Create Modal */}
      {isCreating && (
        <form
          onSubmit={handleCreate}
          className="bg-white p-6 rounded-3xl border border-[#DFD0EC] shadow-sm space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#DFD0EC] pb-3">
            <h3 className="font-bold text-sm text-zinc-900">Crear Tarjeta Promocional</h3>
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
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Título *</label>
              <input
                type="text"
                required
                placeholder="Ej: Anillos de Promesa"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Badge / Distintivo (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: NUEVA COLECCIÓN"
                value={formData.badge}
                onChange={(e) => setFormData({ ...formData, badge: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Subtítulo / Mensaje
              </label>
              <input
                type="text"
                placeholder="El símbolo eterno del amor en plata fina 925"
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                Texto de Descuento (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: HASTA 25% OFF"
                value={formData.discountText}
                onChange={(e) => setFormData({ ...formData, discountText: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                URL de Imagen de Fondo *
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

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Orden de Aparición</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Enlace de Destino (URL)</label>
            <input
              type="text"
              placeholder="/productos?collection=diamante-morado-2026"
              value={formData.targetUrl}
              onChange={(e) => setFormData({ ...formData, targetUrl: e.target.value })}
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
              {loading ? 'Guardando...' : 'Crear Promoción'}
            </button>
          </div>
        </form>
      )}

      {/* Promotions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {promotions.map((p) => (
          <div
            key={p.id}
            className="relative h-64 rounded-3xl overflow-hidden border border-[#DFD0EC] group shadow-sm flex flex-col justify-between p-5 text-white"
          >
            <Image
              src={p.imageUrl}
              alt={p.title}
              fill
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1B1124]/90 via-[#1B1124]/40 to-transparent" />

            {/* Content on top */}
            <div className="relative z-10 flex justify-between items-start">
              {p.badge ? (
                <span className="bg-[#3F235F]/90 backdrop-blur-xs text-white text-[9px] uppercase font-black px-2.5 py-1 rounded-full border border-white/20">
                  {p.badge}
                </span>
              ) : p.discountText ? (
                <span className="bg-[#7043A0]/90 backdrop-blur-xs text-white text-[9px] uppercase font-black px-2.5 py-1 rounded-full border border-white/20">
                  {p.discountText}
                </span>
              ) : (
                <span />
              )}

              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                className="p-2 bg-black/50 hover:bg-red-600 text-white rounded-xl transition cursor-pointer backdrop-blur-xs"
                title="Eliminar banner"
              >
                <Trash2 size={14} />
              </button>
            </div>

            <div className="relative z-10 space-y-1">
              <h3 className="font-sans font-bold text-base text-white leading-snug">{p.title}</h3>
              {p.subtitle && (
                <p className="text-xs text-zinc-200 line-clamp-2">{p.subtitle}</p>
              )}
              <div className="pt-2">
                <span className="inline-block text-[10px] uppercase font-bold tracking-widest text-[#E6D4F8] bg-white/10 px-3 py-1 rounded-full border border-white/20">
                  Ver Colección
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
