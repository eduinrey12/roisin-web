'use client';

import React, { useRef, useState, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, ChevronRight, ArrowRight, Sparkles } from 'lucide-react';
import ProductCard from '@/components/storefront/ProductCard';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface NewArrivalsSectionProps {
  products: any[];
}

export default function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
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
  }, [products]);

  if (!products || products.length === 0) return null;

  // Show exactly up to 7 products in the horizontal row
  const displayProducts = products.slice(0, 7);

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
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative group/arrivals">
      {/* Centered Clean Title */}
      <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
        <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight flex items-center justify-center gap-2.5">
          <RoisinDiamond size={18} color="#7043A0" />
          <span>Nuevos Ingresos</span>
          <RoisinDiamond size={18} color="#7043A0" />
        </h2>
        <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-md mx-auto">
          Descubre los diseños más recientes incorporados a nuestra colección de alta joyería.
        </p>
      </div>

      {/* Navigation Arrows */}
      {canScrollLeft && (
        <button
          onClick={scrollLeft}
          className="absolute left-2 sm:left-4 top-[58%] -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-[#3F235F]/95 hover:bg-[#552E80] text-white shadow-xl backdrop-blur-md transition active:scale-90 cursor-pointer flex items-center justify-center diamond-glow"
          aria-label="Anterior"
        >
          <ChevronLeft size={20} className="stroke-[2.5]" />
        </button>
      )}

      {canScrollRight && (
        <button
          onClick={scrollRight}
          className="absolute right-2 sm:right-4 top-[58%] -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-[#3F235F]/95 hover:bg-[#552E80] text-white shadow-xl backdrop-blur-md transition active:scale-90 cursor-pointer flex items-center justify-center diamond-glow"
          aria-label="Siguiente"
        >
          <ChevronRight size={20} className="stroke-[2.5]" />
        </button>
      )}

      {/* Single Horizontal Row: 7 Products + 1 'Ver Más' Card */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex gap-4 sm:gap-5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 items-stretch"
      >
        {displayProducts.map((p) => (
          <div
            key={p.id}
            className="flex-none w-[72vw] sm:w-[260px] lg:w-[285px] snap-start"
          >
            <ProductCard
              isMostDesired={false}
              product={{
                id: p.id,
                title: p.title,
                slug: p.slug,
                tag: p.tag || 'Nuevo',
                shortDescription: p.shortDescription,
                basePrice: p.basePrice,
                compareAtPrice: p.compareAtPrice,
                discountPercent: p.discountPercent,
                category: p.category,
                images: p.images,
                variants: p.variants,
                description: p.description,
              }}
            />
          </div>
        ))}

        {/* 8th Final Card: "Ver más" in Single Horizontal Row */}
        <Link
          href="/productos?sort=newest"
          className="flex-none w-[72vw] sm:w-[260px] lg:w-[285px] rounded-3xl bg-gradient-to-br from-[#2A1442] via-[#3F235F] to-[#1B1124] text-white border border-[#552E80] shadow-md hover:shadow-2xl hover:border-[#DFD0EC] transition-all duration-300 p-6 flex flex-col justify-between items-center text-center group snap-start select-none"
        >
          <div className="pt-6 space-y-3 flex flex-col items-center">
            <div className="p-4 bg-white/10 rounded-2xl text-[#DFD0EC] border border-white/20 group-hover:scale-110 group-hover:bg-white/20 transition-all">
              <Sparkles size={28} className="text-amber-200" />
            </div>
            <span className="text-[10.5px] uppercase font-bold tracking-widest text-[#DFD0EC]/70">
              Colección Completa
            </span>
            <h3 className="font-sans text-lg sm:text-xl font-extrabold text-white leading-snug">
              Explorar Todas las Novedades
            </h3>
            <p className="text-xs text-zinc-300 font-light max-w-[200px] leading-relaxed">
              Encuentra los últimos anillos, collares, pulseras y aretes añadidos al catálogo.
            </p>
          </div>

          <div className="pt-6 pb-2 w-full">
            <span className="w-full inline-flex items-center justify-center gap-2 btn-purple-diamond text-xs uppercase font-extrabold tracking-wider py-3 px-4 rounded-2xl shadow-lg group-hover:translate-y-[-2px] transition-transform">
              <span>Ver Más</span>
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </Link>
      </div>
    </section>
  );
}
