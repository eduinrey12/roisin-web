'use client';

import { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react';

interface PromotionItem {
  id: string;
  title: string;
  imageUrl: string;
  targetType?: string | null;
  collectionId?: string | null;
  collection?: { id: string; name: string; slug: string } | null;
  targetUrl?: string | null;
  sortOrder?: number;
}

interface PromotionsCarouselProps {
  promotions: PromotionItem[];
}

export default function PromotionsCarousel({ promotions }: PromotionsCarouselProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setCanScrollLeft(scrollLeft > 10);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [promotions]);

  if (!promotions || promotions.length === 0) return null;

  const scrollLeft = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.7;
      container.scrollBy({ left: -scrollAmount, behavior: 'smooth' });
    }
  };

  const scrollRight = () => {
    if (scrollContainerRef.current) {
      const container = scrollContainerRef.current;
      const scrollAmount = container.clientWidth * 0.7;
      container.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const getDestinationUrl = (promo: PromotionItem) => {
    if (promo.targetType === 'COLLECTION' && promo.collection?.slug) {
      return `/productos?collection=${promo.collection.slug}`;
    }
    if (promo.targetType === 'PRODUCTS') {
      return `/productos?promo=${promo.id}`;
    }
    return promo.targetUrl || '/productos';
  };

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative group/carousel">
      {/* 1. Left Navigation Arrow */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-6 sm:left-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-3.5 rounded-full bg-[#3F235F]/90 hover:bg-[#552E80] text-white border border-[#DFD0EC]/60 hover:border-white shadow-xl backdrop-blur-md transition-all duration-300 active:scale-90 cursor-pointer flex items-center justify-center diamond-glow"
          aria-label="Promoción anterior"
        >
          <ChevronLeft size={20} className="stroke-[2.5]" />
        </button>
      )}

      {/* 2. Right Navigation Arrow */}
      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-6 sm:right-8 top-1/2 -translate-y-1/2 z-20 p-3 sm:p-3.5 rounded-full bg-[#3F235F]/90 hover:bg-[#552E80] text-white border border-[#DFD0EC]/60 hover:border-white shadow-xl backdrop-blur-md transition-all duration-300 active:scale-90 cursor-pointer flex items-center justify-center diamond-glow"
          aria-label="Promoción siguiente"
        >
          <ChevronRight size={20} className="stroke-[2.5]" />
        </button>
      )}

      {/* 3. Horizontal Panoramas with Peek Layout (2 to 3 cards + partial view of next) */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1"
      >
        {promotions.map((promo) => {
          const href = getDestinationUrl(promo);
          return (
            <Link
              key={promo.id}
              href={href}
              className="group relative flex-none w-[84vw] sm:w-[calc(48%-12px)] lg:w-[calc(36%-14px)] aspect-[16/9] sm:aspect-[16/9.5] rounded-2xl overflow-hidden border border-[#DFD0EC] shadow-sm hover:shadow-2xl hover:border-[#7043A0] transition-all duration-400 bg-[#1B1124] snap-start select-none"
            >
              {/* Pure Graphic Banner Image */}
              <Image
                src={promo.imageUrl}
                alt={promo.title || 'Promoción ROISIN'}
                fill
                sizes="(max-width: 640px) 85vw, (max-width: 1024px) 50vw, 36vw"
                className="object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
                priority
              />

              {/* Subtle hover gradient shadow at bottom */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              {/* Luxurious Floating "Ver más" Button on Hover */}
              <div className="absolute inset-x-0 bottom-4 sm:bottom-5 z-10 flex justify-center items-center opacity-0 translate-y-3 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300 ease-out px-4 pointer-events-none">
                <span className="inline-flex items-center gap-2 btn-purple-diamond text-xs uppercase tracking-widest font-extrabold px-6 py-2.5 rounded-full shadow-xl border border-white/30 backdrop-blur-xs">
                  <span>Ver más</span>
                  <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
