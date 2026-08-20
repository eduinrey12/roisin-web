'use client';

import React, { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface FaqItem {
  id: string;
  question: string;
  answer: string;
  category?: string | null;
}

interface FaqSectionProps {
  faqs: FaqItem[];
}

export default function FaqSection({ faqs }: FaqSectionProps) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  if (!faqs || faqs.length === 0) return null;

  const toggleAccordion = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section className="max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8">
      {/* Centered Clean Section Title */}
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
        <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight flex items-center justify-center gap-2.5">
          <RoisinDiamond size={18} color="#7043A0" />
          <span>Preguntas Frecuentes</span>
          <RoisinDiamond size={18} color="#7043A0" />
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-md mx-auto">
          Todo lo que necesitas saber sobre nuestras joyas, envíos, dedicatorias y garantías.
        </p>
      </div>

      {/* Accordion List */}
      <div className="space-y-3.5">
        {faqs.map((faq, idx) => {
          const isOpen = openIndex === idx;

          return (
            <div
              key={faq.id}
              className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
                isOpen
                  ? 'bg-[#FAF7FC] border-[#7043A0] shadow-sm'
                  : 'bg-white border-[#DFD0EC] hover:border-[#7043A0]/60 shadow-2xs'
              }`}
            >
              <button
                type="button"
                onClick={() => toggleAccordion(idx)}
                className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer"
                aria-expanded={isOpen}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2 rounded-xl border transition-colors shrink-0 ${
                      isOpen
                        ? 'bg-[#3F235F] text-white border-[#3F235F]'
                        : 'bg-[#F8F5FA] text-[#3F235F] border-[#DFD0EC]'
                    }`}
                  >
                    <HelpCircle size={16} />
                  </div>
                  <div>
                    {faq.category && (
                      <span className="text-[9.5px] uppercase tracking-wider font-extrabold text-[#7043A0] block mb-0.5">
                        {faq.category}
                      </span>
                    )}
                    <h3 className="font-sans text-sm sm:text-base font-bold text-zinc-900 leading-snug">
                      {faq.question}
                    </h3>
                  </div>
                </div>

                <div
                  className={`p-1.5 rounded-full border transition-transform duration-300 shrink-0 ${
                    isOpen
                      ? 'bg-[#3F235F] text-white rotate-180 border-[#3F235F]'
                      : 'bg-[#F8F5FA] text-zinc-600 border-[#DFD0EC]'
                  }`}
                >
                  <ChevronDown size={16} />
                </div>
              </button>

              {isOpen && (
                <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-xs sm:text-sm text-zinc-600 font-light leading-relaxed border-t border-[#DFD0EC]/60 pt-3.5 animate-fade-in">
                  {faq.answer}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
