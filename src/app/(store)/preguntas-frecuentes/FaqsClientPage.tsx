'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronDown, HelpCircle, MessageCircle, Sparkles, ShieldCheck, Truck, Gift, CreditCard, Ruler } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import Link from 'next/link';
import { STORE_CONFIG } from '@/lib/config/store';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
  sortOrder: number;
}

const CATEGORY_ICONS: Record<string, any> = {
  'Garantía & Materiales': ShieldCheck,
  'Envíos & Tiempos': Truck,
  'Empaques & Regalos': Gift,
  'Pagos & Seguridad': CreditCard,
  'Tallas & Medidas': Ruler,
  'General': Sparkles,
};

export default function FaqsClientPage({ initialFaqs }: { initialFaqs: FaqItem[] }) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('TODAS');
  const [openFaqId, setOpenFaqId] = useState<string | null>(null);

  // Extract unique categories
  const categories = useMemo(() => {
    const set = new Set<string>();
    initialFaqs.forEach((f) => {
      if (f.category) set.add(f.category);
    });
    return Array.from(set);
  }, [initialFaqs]);

  // Filtered FAQs
  const filteredFaqs = useMemo(() => {
    return initialFaqs.filter((f) => {
      const matchCategory =
        selectedCategory === 'TODAS' ||
        (f.category && f.category.toLowerCase() === selectedCategory.toLowerCase());

      const matchQuery =
        !searchQuery.trim() ||
        f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.answer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (f.category && f.category.toLowerCase().includes(searchQuery.toLowerCase()));

      return matchCategory && matchQuery;
    });
  }, [initialFaqs, selectedCategory, searchQuery]);

  const toggleFaq = (id: string) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${STORE_CONFIG.name}, tengo una consulta sobre sus joyas y me gustaría recibir asesoría.`
  )}`;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-12">
      {/* 1. Hero Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#3F235F] py-1.5 px-4 rounded-full bg-[#F8F5FA] border border-[#DFD0EC] shadow-2xs">
          <RoisinDiamond size={13} color="#7043A0" />
          <span>Centro de Ayuda Oficial</span>
        </div>

        <h1 className="font-sans text-3xl sm:text-5xl font-bold text-zinc-900 leading-tight">
          Preguntas Frecuentes
        </h1>

        <p className="text-xs sm:text-sm text-zinc-500 font-light leading-relaxed">
          Encuentra respuestas claras y detalladas sobre autenticidad de Plata 925, envíos asegurados a todo el Ecuador, dedicatorias personalizadas y garantía.
        </p>

        {/* Live Search Bar */}
        <div className="pt-2 max-w-md mx-auto">
          <div className="flex items-center w-full bg-[#F8F5FA] border border-[#DFD0EC] focus-within:border-[#7043A0] focus-within:bg-white rounded-full p-1.5 pl-4 transition shadow-xs">
            <Search className="text-[#7043A0] shrink-0" size={18} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar por palabra clave: garantía, plata, envío, tallas..."
              className="w-full bg-transparent px-3 py-1.5 text-xs text-zinc-900 focus:outline-none placeholder:text-zinc-400"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-xs text-zinc-400 hover:text-zinc-700 px-3 py-1 font-bold"
              >
                ✕
              </button>
            )}
          </div>
        </div>
      </div>

      {/* 2. Category Filter Pills */}
      <div className="flex items-center justify-center gap-2 overflow-x-auto no-scrollbar py-1">
        <button
          type="button"
          onClick={() => setSelectedCategory('TODAS')}
          className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border ${
            selectedCategory === 'TODAS'
              ? 'bg-[#3F235F] text-white border-[#3F235F] shadow-md'
              : 'bg-[#F8F5FA] text-zinc-700 border-[#DFD0EC] hover:border-[#7043A0]'
          }`}
        >
          Todas ({initialFaqs.length})
        </button>

        {categories.map((cat) => {
          const Icon = CATEGORY_ICONS[cat] || Sparkles;
          const count = initialFaqs.filter((f) => f.category === cat).length;
          const isSelected = selectedCategory === cat;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-2xl text-xs font-bold transition-all cursor-pointer shrink-0 border flex items-center gap-1.5 ${
                isSelected
                  ? 'bg-[#3F235F] text-white border-[#3F235F] shadow-md'
                  : 'bg-[#F8F5FA] text-zinc-700 border-[#DFD0EC] hover:border-[#7043A0]'
              }`}
            >
              <Icon size={14} className={isSelected ? 'text-[#DFD0EC]' : 'text-[#7043A0]'} />
              <span>{cat}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-white/20 text-white' : 'bg-white text-zinc-500'}`}>
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* 3. Accordion FAQ List */}
      <div className="space-y-3.5 max-w-3xl mx-auto">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-16 bg-[#F8F5FA] rounded-3xl border border-[#DFD0EC] p-8 space-y-3">
            <HelpCircle size={32} className="text-[#7043A0] mx-auto" />
            <h3 className="font-bold text-sm text-zinc-900">No encontramos resultados para tu búsqueda</h3>
            <p className="text-xs text-zinc-500 max-w-md mx-auto">
              Intenta con otros términos o contáctanos directamente para brindarte asistencia personalizada en tiempo real.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('TODAS');
              }}
              className="text-xs font-bold text-[#3F235F] underline pt-2 cursor-pointer"
            >
              Restablecer filtros
            </button>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isOpen = openFaqId === faq.id;

            return (
              <div
                key={faq.id}
                className="bg-white rounded-3xl border border-[#DFD0EC] overflow-hidden shadow-xs transition-all duration-200 hover:border-[#7043A0]"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(faq.id)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer focus:outline-none"
                >
                  <div className="space-y-1">
                    {faq.category && (
                      <span className="text-[10px] uppercase font-bold text-[#7043A0] tracking-wider block">
                        {faq.category}
                      </span>
                    )}
                    <h2 className="font-sans text-sm sm:text-base font-bold text-zinc-900 leading-snug">
                      {faq.question}
                    </h2>
                  </div>

                  <div
                    className={`p-2 rounded-full bg-[#F8F5FA] text-[#3F235F] transition-transform duration-300 shrink-0 border border-[#DFD0EC] ${
                      isOpen ? 'rotate-180 bg-[#3F235F] text-white border-[#3F235F]' : ''
                    }`}
                  >
                    <ChevronDown size={16} />
                  </div>
                </button>

                {isOpen && (
                  <div className="px-5 sm:px-6 pb-6 pt-1 text-xs sm:text-sm text-zinc-600 font-light leading-relaxed border-t border-[#F8F5FA] animate-fade-in whitespace-pre-line">
                    {faq.answer}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* 4. Help Banner at Bottom */}
      <div className="bg-gradient-to-r from-[#2A1442] via-[#3F235F] to-[#552E80] rounded-3xl p-8 sm:p-10 text-white text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl max-w-4xl mx-auto">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-extrabold tracking-widest text-amber-300">
            <Sparkles size={12} />
            <span>Asesoría Personalizada de Alta Joyería</span>
          </div>
          <h3 className="font-sans text-2xl font-bold">
            ¿No encontraste lo que buscabas?
          </h3>
          <p className="text-xs text-[#DFD0EC] leading-relaxed font-light">
            Nuestros asesores expertos en Alta Joyería y Diamante Morado están disponibles para resolver tus consultas por WhatsApp.
          </p>
        </div>

        <a
          href={whatsappUrl}
          target="_blank"
          rel="noreferrer"
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3.5 rounded-full text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition active:scale-95 shadow-lg shrink-0 cursor-pointer"
        >
          <MessageCircle size={17} />
          <span>Contactar por WhatsApp</span>
        </a>
      </div>
    </div>
  );
}
