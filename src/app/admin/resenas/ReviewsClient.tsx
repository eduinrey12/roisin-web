'use client';

import { useState } from 'react';
import {
  adminCreateReviewAction,
  adminDeleteReviewAction,
} from '@/lib/actions/admin.actions';
import { Star, Plus, Trash2, X, ShieldCheck, CheckCircle2, Image as ImageIcon, Video, Play } from 'lucide-react';
import Image from 'next/image';

interface ReviewItem {
  id: string;
  authorName: string;
  location?: string | null;
  rating: number;
  comment: string;
  mediaUrl?: string | null;
  mediaType: 'IMAGE' | 'VIDEO' | 'NONE';
  productTitle?: string | null;
  isVerified: boolean;
  sortOrder: number;
  isActive: boolean;
}

export default function ReviewsClient({ initialReviews }: { initialReviews: ReviewItem[] }) {
  const [reviews, setReviews] = useState<ReviewItem[]>(initialReviews);
  const [isCreating, setIsCreating] = useState(false);
  const [activeMediaModal, setActiveMediaModal] = useState<{ url: string; type: string; title: string } | null>(null);

  const [formData, setFormData] = useState({
    authorName: '',
    location: '',
    rating: 5,
    comment: '',
    mediaUrl: '',
    mediaType: 'IMAGE' as 'IMAGE' | 'VIDEO' | 'NONE',
    productTitle: '',
    isVerified: true,
    sortOrder: 0,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminCreateReviewAction({
        authorName: formData.authorName,
        location: formData.location || undefined,
        rating: Number(formData.rating),
        comment: formData.comment,
        mediaUrl: formData.mediaUrl || undefined,
        mediaType: formData.mediaUrl ? formData.mediaType : 'NONE',
        productTitle: formData.productTitle || undefined,
        isVerified: formData.isVerified,
        sortOrder: Number(formData.sortOrder),
      });

      if (res.success && res.review) {
        setReviews([res.review as any, ...reviews]);
        setIsCreating(false);
        setFormData({
          authorName: '',
          location: '',
          rating: 5,
          comment: '',
          mediaUrl: '',
          mediaType: 'IMAGE',
          productTitle: '',
          isVerified: true,
          sortOrder: 0,
        });
      } else {
        setError(res.error || 'Error al crear reseña');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar esta reseña de clienta?')) return;
    try {
      const res = await adminDeleteReviewAction(id);
      if (res.success) {
        setReviews(reviews.filter((r) => r.id !== id));
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
            <ShieldCheck className="text-[#7043A0]" size={24} />
            Reseñas & Testimonios con Fotos y Videos
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Colección interactiva de testimonios de clientas. Sube fotos o videos reales para mostrarlos en la página de inicio.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="btn-purple-diamond px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Nueva Reseña
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
          className="bg-white p-6 sm:p-7 rounded-3xl border border-[#DFD0EC] shadow-lg space-y-4 animate-fade-in"
        >
          <div className="flex items-center justify-between border-b border-[#DFD0EC] pb-3">
            <h3 className="font-bold text-sm text-zinc-900">Agregar Nueva Reseña (Foto o Video)</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Nombre de la Clienta *</label>
              <input
                type="text"
                required
                placeholder="Ej: Camila Mendoza"
                value={formData.authorName}
                onChange={(e) => setFormData({ ...formData, authorName: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Ciudad / Ubicación</label>
              <input
                type="text"
                placeholder="Ej: Guayaquil, Ecuador"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Calificación (Estrellas)</label>
              <select
                value={formData.rating}
                onChange={(e) => setFormData({ ...formData, rating: Number(e.target.value) })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              >
                <option value={5}>⭐⭐⭐⭐⭐ (5 Estrellas)</option>
                <option value={4}>⭐⭐⭐⭐ (4 Estrellas)</option>
                <option value={3}>⭐⭐⭐ (3 Estrellas)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Comentario / Testimonio *</label>
            <textarea
              required
              rows={3}
              placeholder="Escribe la experiencia o testimonio de la clienta..."
              value={formData.comment}
              onChange={(e) => setFormData({ ...formData, comment: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-1">
                URL de Archivo Multimedia (Foto o Video)
              </label>
              <input
                type="url"
                placeholder="https://images.unsplash.com/... o https://...video.mp4"
                value={formData.mediaUrl}
                onChange={(e) => setFormData({ ...formData, mediaUrl: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Tipo de Archivo</label>
              <select
                value={formData.mediaType}
                onChange={(e) => setFormData({ ...formData, mediaType: e.target.value as any })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              >
                <option value="IMAGE">Foto / Imagen</option>
                <option value="VIDEO">Video</option>
                <option value="NONE">Solo Texto</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Joya Comprada (Opcional)</label>
              <input
                type="text"
                placeholder="Ej: Anillo Solitario Diamante Morado"
                value={formData.productTitle}
                onChange={(e) => setFormData({ ...formData, productTitle: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div className="flex items-center gap-2 pt-6">
              <input
                type="checkbox"
                id="isVerified"
                checked={formData.isVerified}
                onChange={(e) => setFormData({ ...formData, isVerified: e.target.checked })}
                className="rounded border-[#DFD0EC] text-[#3F235F] focus:ring-[#7043A0]"
              />
              <label htmlFor="isVerified" className="text-xs font-semibold text-zinc-700 cursor-pointer">
                Mostrar distintivo de Compra Verificada
              </label>
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
              {loading ? 'Guardando...' : 'Publicar Reseña'}
            </button>
          </div>
        </form>
      )}

      {/* Structured Table for Admin Reviews Collection Management */}
      <div className="bg-white rounded-3xl border border-[#DFD0EC] shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-zinc-700">
            <thead className="bg-[#F8F5FA] text-zinc-900 font-bold uppercase tracking-wider text-[10px] border-b border-[#DFD0EC]">
              <tr>
                <th className="p-4 pl-6">Foto / Video</th>
                <th className="p-4">Clienta</th>
                <th className="p-4">Ciudad</th>
                <th className="p-4">Calificación</th>
                <th className="p-4">Comentario / Joya</th>
                <th className="p-4">Verificación</th>
                <th className="p-4 text-right pr-6">Acción</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F8F5FA]">
              {reviews.map((rev) => (
                <tr key={rev.id} className="hover:bg-[#FAF7FC] transition">
                  <td className="p-4 pl-6">
                    {rev.mediaUrl ? (
                      <div
                        onClick={() =>
                          setActiveMediaModal({
                            url: rev.mediaUrl!,
                            type: rev.mediaType,
                            title: rev.authorName,
                          })
                        }
                        className="relative w-14 h-14 rounded-xl overflow-hidden cursor-pointer border border-[#DFD0EC] group shadow-2xs hover:scale-105 transition-transform"
                      >
                        {rev.mediaType === 'VIDEO' ? (
                          <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative">
                            <video src={rev.mediaUrl} className="w-full h-full object-cover opacity-75" muted />
                            <Play size={14} className="fill-white text-white absolute" />
                          </div>
                        ) : (
                          <Image src={rev.mediaUrl} alt={rev.authorName} fill className="object-cover" />
                        )}
                      </div>
                    ) : (
                      <span className="text-[10px] text-zinc-400 italic">Sin multimedia</span>
                    )}
                  </td>
                  <td className="p-4 font-bold text-zinc-900">{rev.authorName}</td>
                  <td className="p-4 text-zinc-500">{rev.location || 'Ecuador'}</td>
                  <td className="p-4">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(rev.rating)].map((_, i) => (
                        <Star key={i} size={12} className="fill-amber-400" />
                      ))}
                    </div>
                  </td>
                  <td className="p-4 max-w-xs">
                    <p className="line-clamp-2 text-zinc-700 italic font-light">&ldquo;{rev.comment}&rdquo;</p>
                    {rev.productTitle && (
                      <span className="text-[10px] text-[#7043A0] font-bold block mt-0.5">
                        Joya: {rev.productTitle}
                      </span>
                    )}
                  </td>
                  <td className="p-4">
                    {rev.isVerified ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={11} /> Verificada
                      </span>
                    ) : (
                      <span className="text-[10px] text-zinc-400">Regular</span>
                    )}
                  </td>
                  <td className="p-4 pr-6 text-right">
                    <button
                      type="button"
                      onClick={() => handleDelete(rev.id)}
                      className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                      title="Eliminar reseña"
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

      {/* Modal for viewing media */}
      {activeMediaModal && (
        <div
          onClick={() => setActiveMediaModal(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1B1124] rounded-3xl overflow-hidden max-w-lg w-full max-h-[85vh] shadow-2xl border border-[#DFD0EC]/30 flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10 text-white">
              <span className="text-xs font-bold uppercase tracking-wider">
                Multimedia de {activeMediaModal.title}
              </span>
              <button
                onClick={() => setActiveMediaModal(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-video w-full bg-black flex items-center justify-center overflow-hidden">
              {activeMediaModal.type === 'VIDEO' ? (
                <video src={activeMediaModal.url} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <Image src={activeMediaModal.url} alt="Review Media" fill className="object-contain" />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
