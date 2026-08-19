'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface PromotionItem {
  id: string;
  title: string;
  subtitle?: string | null;
  badge?: string | null;
  discountText?: string | null;
  imageUrl: string;
  targetUrl: string;
  sortOrder?: number;
}

interface PromotionsCarouselProps {
  promotions: PromotionItem[];
}

export default function PromotionsCarousel({ promotions }: PromotionsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  if (!promotions || promotions.length === 0) return null;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.75;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      <div className="space-y-4">
        {/* Header with Title & Navigation Arrow Controls */}
        <div className="flex items-center justify-between pb-1">
          <div className="flex items-center gap-2">
            <RoisinDiamond size={15} color="#7043A0" />
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#3F235F]">
              Promociones & Colecciones Destacadas
            </span>
          </div>

          {/* Navigation Controls (< / >) */}
          <div className="flex items-center gap-2">
            <button
              onClick={scrollLeft}
              className="p-2 rounded-full bg-white hover:bg-[#F0E9F5] border border-[#DFD0EC] text-[#3F235F] hover:border-[#7043A0] transition shadow-xs cursor-pointer active:scale-90"
              aria-label="Promoción anterior"
            >
              <ChevronLeft size={18} />
            </button>
            <button
              onClick={scrollRight}
              className="p-2 rounded-full bg-white hover:bg-[#F0E9F5] border border-[#DFD0EC] text-[#3F235F] hover:border-[#7043A0] transition shadow-xs cursor-pointer active:scale-90"
              aria-label="Promoción siguiente"
            >
              <ChevronRight size={18} />
            </button>
          </div>
        </div>

        {/* Carousel Container showing 2 to 3 cards visible */}
        <div
          ref={scrollContainerRef}
          className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-1"
        >
          {promotions.map((promo) => (
            <Link
              key={promo.id}
              href={promo.targetUrl || '/productos'}
              className="group relative flex-none w-[82vw] sm:w-[calc(50%-10px)] lg:w-[calc(33.333%-14px)] aspect-square sm:aspect-[1/1] sm:h-[340px] lg:h-[360px] rounded-3xl overflow-hidden border border-[#DFD0EC] shadow-xs hover:shadow-xl hover:border-[#7043A0] transition-all duration-300 flex flex-col justify-end p-5 sm:p-6 bg-[#1B1124] snap-start"
            >
              <Image
                src={promo.imageUrl}
                alt={promo.title}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover object-center group-hover:scale-106 transition-transform duration-700 opacity-80 group-hover:opacity-90"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#1B1124]/95 via-[#1B1124]/40 to-transparent" />

              {/* Promo Badges & Content */}
              <div className="relative z-10 space-y-2">
                <div className="flex items-center justify-between gap-2">
                  {promo.badge && (
                    <span className="bg-white text-[#3F235F] text-[10.5px] uppercase font-bold tracking-wider px-3.5 py-1 rounded-full shadow-xs leading-normal inline-block">
                      {promo.badge}
                    </span>
                  )}
                  {promo.discountText && (
                    <span className="bg-gradient-to-r from-[#7043A0] to-[#3F235F] text-white text-[10.5px] uppercase font-black tracking-wider px-3.5 py-1 rounded-full shadow-sm leading-normal inline-block">
                      {promo.discountText}
                    </span>
                  )}
                </div>

                <h3 className="font-sans text-base sm:text-lg font-bold text-white leading-snug group-hover:text-[#DFD0EC] transition-colors">
                  {promo.title}
                </h3>

                {promo.subtitle && (
                  <p className="text-xs text-zinc-300 font-light line-clamp-1">
                    {promo.subtitle}
                  </p>
                )}

                <div className="pt-1.5">
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#DFD0EC] group-hover:text-white transition-colors">
                    Ver Joyas <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
