'use client';

import { useState } from 'react';
import {
  adminUpdateHomeSectionsOrderAction,
  adminToggleHomeSectionStatusAction,
  adminResetHomeSectionsOrderAction,
} from '@/lib/actions/admin.actions';
import {
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
  Save,
  RotateCcw,
  LayoutTemplate,
  Layers,
  Megaphone,
  Gift,
  Flame,
  Star,
  Sparkles,
  HelpCircle,
  Share2,
  CheckCircle2,
} from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface HomeSectionItem {
  id: string;
  key: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  isActive: boolean;
}

const SECTION_ICONS: Record<string, any> = {
  CATEGORIES: Layers,
  PROMOTIONS: Megaphone,
  BRAND_PILLARS: Sparkles,
  EXPERIENCE: Gift,
  FEATURED: Flame,
  REVIEWS: Star,
  NEW_ARRIVALS: Sparkles,
  FAQS: HelpCircle,
  SOCIAL_FEED: Share2,
};

export default function HomeSectionsClient({ initialSections }: { initialSections: HomeSectionItem[] }) {
  const [sections, setSections] = useState<HomeSectionItem[]>(
    [...initialSections].sort((a, b) => a.sortOrder - b.sortOrder)
  );
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const moveUp = (index: number) => {
    if (index <= 0) return;
    const newSections = [...sections];
    const temp = newSections[index - 1];
    newSections[index - 1] = newSections[index];
    newSections[index] = temp;

    // Recalculate sortOrders
    newSections.forEach((s, idx) => {
      s.sortOrder = idx;
    });

    setSections(newSections);
  };

  const moveDown = (index: number) => {
    if (index >= sections.length - 1) return;
    const newSections = [...sections];
    const temp = newSections[index + 1];
    newSections[index + 1] = newSections[index];
    newSections[index] = temp;

    // Recalculate sortOrders
    newSections.forEach((s, idx) => {
      s.sortOrder = idx;
    });

    setSections(newSections);
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    const updated = sections.map((s) => (s.id === id ? { ...s, isActive: !currentStatus } : s));
    setSections(updated);

    try {
      await adminToggleHomeSectionStatusAction(id, !currentStatus);
      setSuccessMsg('Visibilidad de sección actualizada');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al cambiar estado');
      setTimeout(() => setErrorMsg(''), 3000);
    }
  };

  const handleSaveOrder = async () => {
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const updates = sections.map((s, idx) => ({
        id: s.id,
        sortOrder: idx,
      }));

      const res = await adminUpdateHomeSectionsOrderAction(updates);
      if (res.success) {
        setSuccessMsg('¡Orden de secciones guardado exitosamente en la tienda!');
        setTimeout(() => setSuccessMsg(''), 3500);
      } else {
        setErrorMsg(res.error || 'Error al guardar orden');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  const handleResetOrder = async () => {
    if (!confirm('¿Deseas restablecer el orden de las secciones al diseño recomendado original?')) return;
    setLoading(true);
    setErrorMsg('');
    setSuccessMsg('');

    try {
      const res = await adminResetHomeSectionsOrderAction();
      if (res.success) {
        window.location.reload();
      } else {
        setErrorMsg(res.error || 'Error al restablecer orden');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error inesperado');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-sans text-zinc-900 flex items-center gap-2">
            <LayoutTemplate className="text-[#7043A0]" size={24} />
            Orden de Secciones (Página Principal)
          </h1>
          <p className="text-xs text-zinc-500 mt-0.5">
            Organiza el orden de aparición y visibilidad de cada bloque de la página de inicio según tus campañas y estrategia.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleResetOrder}
            disabled={loading}
            className="px-4 py-2.5 rounded-2xl bg-white hover:bg-zinc-50 border border-[#DFD0EC] text-zinc-700 text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
            title="Restablecer al orden recomendado original"
          >
            <RotateCcw size={15} /> Restablecer
          </button>

          <button
            type="button"
            onClick={handleSaveOrder}
            disabled={loading}
            className="btn-purple-diamond px-5 py-2.5 rounded-2xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 cursor-pointer shadow-md"
          >
            <Save size={16} /> {loading ? 'Guardando...' : 'Guardar Orden'}
          </button>
        </div>
      </div>

      {/* Notifications */}
      {successMsg && (
        <div className="p-4 bg-emerald-50 text-emerald-800 text-xs rounded-2xl border border-emerald-200 flex items-center gap-2 animate-fade-in">
          <CheckCircle2 size={16} className="text-emerald-600" />
          <span>{successMsg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-4 bg-red-50 text-red-700 text-xs rounded-2xl border border-red-200 animate-fade-in">
          {errorMsg}
        </div>
      )}

      {/* Interactive List of Sections */}
      <div className="space-y-3">
        {sections.map((sec, index) => {
          const Icon = SECTION_ICONS[sec.key] || Layers;
          const isFirst = index === 0;
          const isLast = index === sections.length - 1;

          return (
            <div
              key={sec.id}
              className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 flex items-center justify-between gap-4 ${
                sec.isActive
                  ? 'bg-white border-[#DFD0EC] hover:border-[#7043A0] shadow-xs hover:shadow-md'
                  : 'bg-zinc-100/80 border-zinc-200 opacity-60'
              }`}
            >
              {/* Left: Position Badge + Icon + Section Info */}
              <div className="flex items-center gap-3.5 sm:gap-4 flex-1 min-w-0">
                {/* Numeric Position Badge */}
                <div className="w-9 h-9 rounded-2xl bg-[#F8F5FA] border border-[#DFD0EC] flex items-center justify-center font-black text-xs text-[#3F235F] shrink-0 shadow-2xs">
                  #{index + 1}
                </div>

                {/* Section Icon Box */}
                <div className="p-3 bg-gradient-to-br from-[#3F235F] to-[#7043A0] text-white rounded-2xl shrink-0 shadow-xs">
                  <Icon size={20} className="text-amber-200" />
                </div>

                {/* Title & Description */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-bold text-xs sm:text-sm text-zinc-900 truncate">
                      {sec.title}
                    </h3>
                    <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-[#FAF7FC] border border-[#DFD0EC] text-[#7043A0]">
                      {sec.key}
                    </span>
                  </div>
                  {sec.description && (
                    <p className="text-[11px] text-zinc-500 font-light truncate mt-0.5">
                      {sec.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Right: Actions (Move Up, Move Down, Toggle Visibility) */}
              <div className="flex items-center gap-2 shrink-0">
                {/* Visibility Toggle Button */}
                <button
                  type="button"
                  onClick={() => toggleStatus(sec.id, sec.isActive)}
                  className={`p-2.5 rounded-xl border text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                    sec.isActive
                      ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                      : 'bg-zinc-200 text-zinc-600 border-zinc-300 hover:bg-zinc-300'
                  }`}
                  title={sec.isActive ? 'Sección Visible (Clic para ocultar)' : 'Sección Oculta (Clic para mostrar)'}
                >
                  {sec.isActive ? (
                    <>
                      <Eye size={15} />
                      <span className="hidden sm:inline text-[10.5px]">Visible</span>
                    </>
                  ) : (
                    <>
                      <EyeOff size={15} />
                      <span className="hidden sm:inline text-[10.5px]">Oculta</span>
                    </>
                  )}
                </button>

                {/* Move Up Button */}
                <button
                  type="button"
                  onClick={() => moveUp(index)}
                  disabled={isFirst}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isFirst
                      ? 'text-zinc-300 border-zinc-200 cursor-not-allowed bg-zinc-50'
                      : 'text-[#3F235F] hover:text-white bg-white hover:bg-[#3F235F] border-[#DFD0EC] hover:border-[#3F235F] shadow-2xs active:scale-95'
                  }`}
                  title="Mover una posición arriba"
                >
                  <ArrowUp size={16} />
                </button>

                {/* Move Down Button */}
                <button
                  type="button"
                  onClick={() => moveDown(index)}
                  disabled={isLast}
                  className={`p-2.5 rounded-xl border transition cursor-pointer ${
                    isLast
                      ? 'text-zinc-300 border-zinc-200 cursor-not-allowed bg-zinc-50'
                      : 'text-[#3F235F] hover:text-white bg-white hover:bg-[#3F235F] border-[#DFD0EC] hover:border-[#3F235F] shadow-2xs active:scale-95'
                  }`}
                  title="Mover una posición abajo"
                >
                  <ArrowDown size={16} />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info Box */}
      <div className="p-4 rounded-2xl bg-[#F8F5FA] border border-[#DFD0EC] flex items-center justify-between text-xs text-zinc-600">
        <span className="flex items-center gap-2">
          <RoisinDiamond size={14} color="#7043A0" />
          Los cambios de orden y visibilidad se reflejan de inmediato en la tienda pública al guardar.
        </span>
        <button
          type="button"
          onClick={handleSaveOrder}
          disabled={loading}
          className="btn-purple-diamond px-4 py-2 rounded-xl text-[11px] font-bold uppercase tracking-wider shadow-xs cursor-pointer"
        >
          {loading ? 'Guardando...' : 'Aplicar Cambios'}
        </button>
      </div>
    </div>
  );
}
