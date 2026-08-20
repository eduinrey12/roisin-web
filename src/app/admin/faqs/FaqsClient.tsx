'use client';

import { useState } from 'react';
import {
  adminCreateFaqAction,
  adminDeleteFaqAction,
} from '@/lib/actions/admin.actions';
import { HelpCircle, Plus, Trash2, X, FolderTree } from 'lucide-react';
import CustomSelect from '@/components/ui/CustomSelect';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  sortOrder: number;
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
      });

      if (res.success && res.faq) {
        setFaqs([...faqs, res.faq as any]);
        setIsCreating(false);
        setFormData({
          question: '',
          answer: '',
          category: 'Garantía & Materiales',
          sortOrder: 0,
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
            Administra las dudas comunes de clientas que se muestran en el acordeón de la página principal.
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

          <div>
            <label className="text-xs font-semibold text-zinc-700 block mb-1">Orden de Aparición</label>
            <input
              type="number"
              value={formData.sortOrder}
              onChange={(e) => setFormData({ ...formData, sortOrder: Number(e.target.value) })}
              className="w-48 px-4 py-2 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-xl focus:outline-none focus:border-[#7043A0]"
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
            className="bg-white rounded-2xl border border-[#DFD0EC] p-5 shadow-xs flex items-start justify-between gap-4"
          >
            <div className="space-y-1.5 flex-1">
              {faq.category && (
                <span className="text-[9.5px] uppercase font-bold text-[#7043A0] tracking-wider block">
                  {faq.category}
                </span>
              )}
              <h3 className="font-sans text-sm font-bold text-zinc-900">{faq.question}</h3>
              <p className="text-xs text-zinc-600 font-light leading-relaxed">{faq.answer}</p>
            </div>

            <button
              type="button"
              onClick={() => handleDelete(faq.id)}
              className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
              title="Eliminar pregunta"
            >
              <Trash2 size={15} />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
