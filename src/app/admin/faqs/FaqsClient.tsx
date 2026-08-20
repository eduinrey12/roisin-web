'use client';

import { useState } from 'react';
import {
  adminCreateFaqAction,
  adminDeleteFaqAction,
  adminToggleFaqHomeStatusAction,
} from '@/lib/actions/admin.actions';
import { HelpCircle, Plus, Trash2, X, Home, Eye, EyeOff } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  sortOrder: number;
  showOnHome: boolean;
  isActive: boolean;
}

export default function FaqsClient({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const [faqs, setFaqs] = useState<FaqItem[]>(initialFaqs);
  const [isCreating, setIsCreating] = useState(false);

  const [formData, setFormData] = useState({
    question: '',
    answer: '',
    category: 'Garantía & Materiales',
    sortOrder: 0,
    showOnHome: true,
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await adminCreateFaqAction({
        question: formData.question,
        answer: formData.answer,
        category: formData.category,
        sortOrder: Number(formData.sortOrder),
        showOnHome: formData.showOnHome,
      });

      if (res.success && res.faq) {
        setFaqs([...faqs, res.faq as any]);
        setIsCreating(false);
        setFormData({
          question: '',
          answer: '',
          category: 'Garantía & Materiales',
          sortOrder: 0,
          showOnHome: true,
        });
      } else {
        setError(res.error || 'Error al crear FAQ');
      }
    } catch (err: any) {
      setError(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleHome = async (id: string, currentShowOnHome: boolean) => {
    const nextVal = !currentShowOnHome;
    setFaqs(faqs.map((f) => (f.id === id ? { ...f, showOnHome: nextVal } : f)));
    try {
      const res = await adminToggleFaqHomeStatusAction(id, nextVal);
      if (!res.success) {
        // Rollback
        setFaqs(faqs.map((f) => (f.id === id ? { ...f, showOnHome: currentShowOnHome } : f)));
        alert(res.error || 'Error al actualizar visibilidad en portada');
      }
    } catch (err) {
      setFaqs(faqs.map((f) => (f.id === id ? { ...f, showOnHome: currentShowOnHome } : f)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Deseas eliminar esta pregunta frecuente?')) return;
    try {
      const res = await adminDeleteFaqAction(id);
      if (res.success) {
        setFaqs(faqs.filter((f) => f.id !== id));
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
            <HelpCircle className="text-[#7043A0]" size={24} />
            Preguntas Frecuentes (FAQ)
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Administra las dudas comunes. Puedes marcar cuáles aparecen en la <strong>Página Principal (Home)</strong> y cuáles en la página dedicada de FAQs.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsCreating(!isCreating)}
          className="btn-purple-diamond px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
        >
          <Plus size={16} /> Nueva Pregunta
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
            <h3 className="font-bold text-sm text-zinc-900">Agregar Pregunta Frecuente</h3>
            <button
              type="button"
              onClick={() => setIsCreating(false)}
              className="text-zinc-400 hover:text-zinc-700 cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Pregunta *</label>
              <input
                type="text"
                required
                placeholder="Ej: ¿Qué garantía tienen las joyas en Plata 925?"
                value={formData.question}
                onChange={(e) => setFormData({ ...formData, question: e.target.value })}
                className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <div>
              <CustomSelect
                label="Categoría"
                value={formData.category}
                onChange={(val) => setFormData({ ...formData, category: val })}
                options={[
                  { value: 'Garantía & Materiales', label: 'Garantía & Materiales' },
                  { value: 'Empaques & Regalos', label: 'Empaques & Regalos' },
                  { value: 'Envíos & Tiempos', label: 'Envíos & Tiempos' },
                  { value: 'Tallas & Medidas', label: 'Tallas & Medidas' },
                  { value: 'Pagos & Seguridad', label: 'Pagos & Seguridad' },
                  { value: 'General', label: 'General' },
                ]}
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Respuesta Completa *</label>
            <textarea
              required
              rows={4}
              placeholder="Explica la respuesta de forma clara y detallada..."
              value={formData.answer}
              onChange={(e) => setFormData({ ...formData, answer: e.target.value })}
              className="w-full px-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div>
              <label className="text-xs font-semibold text-zinc-700 block mb-1">Orden de Aparición</label>
              <input
                type="number"
                value={formData.sortOrder}
                onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
                className="w-full sm:w-48 px-4 py-2 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
              />
            </div>

            <label className="flex items-center gap-2.5 text-xs font-semibold text-zinc-800 bg-[#F8F5FA] p-3 rounded-2xl border border-[#DFD0EC] cursor-pointer select-none self-end">
              <input
                type="checkbox"
                checked={formData.showOnHome}
                onChange={(e) => setFormData({ ...formData, showOnHome: e.target.checked })}
                className="accent-[#3F235F] w-4 h-4"
              />
              <span className="flex items-center gap-1.5">
                <Home size={14} className="text-[#7043A0]" />
                Mostrar en la Portada / Página Principal (Home)
              </span>
            </label>
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
              {loading ? 'Guardando...' : 'Guardar Pregunta'}
            </button>
          </div>
        </form>
      )}

      {/* Faqs List */}
      <div className="space-y-3.5">
        {faqs.map((faq) => (
          <div
            key={faq.id}
            className="bg-white rounded-2xl border border-[#DFD0EC] p-5 shadow-xs flex flex-col sm:flex-row sm:items-start justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                {faq.category && (
                  <span className="text-[9.5px] uppercase font-bold text-[#7043A0] tracking-wider">
                    {faq.category}
                  </span>
                )}

                {faq.showOnHome ? (
                  <span className="text-[9px] uppercase font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Home size={10} /> Visible en Portada (Home)
                  </span>
                ) : (
                  <span className="text-[9px] uppercase font-bold text-zinc-600 bg-zinc-100 px-2 py-0.5 rounded-full flex items-center gap-1">
                    Solo en /preguntas-frecuentes
                  </span>
                )}
              </div>

              <h3 className="font-sans text-sm font-bold text-zinc-900">{faq.question}</h3>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">{faq.answer}</p>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-start shrink-0">
              <button
                type="button"
                onClick={() => handleToggleHome(faq.id, faq.showOnHome)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer border ${
                  faq.showOnHome
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100'
                }`}
                title={faq.showOnHome ? 'Ocultar del Home' : 'Mostrar en el Home'}
              >
                {faq.showOnHome ? (
                  <>
                    <Eye size={13} className="text-emerald-600" />
                    <span>En Home</span>
                  </>
                ) : (
                  <>
                    <EyeOff size={13} className="text-zinc-400" />
                    <span>Oculto en Home</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handleDelete(faq.id)}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                title="Eliminar pregunta"
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

