'use client';

import React, { useRef, useState, useEffect } from 'react';
import Image from 'next/image';
import { Star, Play, CheckCircle2, X, ChevronLeft, ChevronRight } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface ReviewItem {
  id: string;
  authorName: string;
  location?: string | null;
  rating: number;
  comment: string;
  mediaUrl?: string | null;
  mediaType?: 'IMAGE' | 'VIDEO' | 'NONE' | string;
  productTitle?: string | null;
  isVerified?: boolean;
}

interface ReviewsSectionProps {
  reviews: ReviewItem[];
}

export default function ReviewsSection({ reviews }: ReviewsSectionProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: string; title: string } | null>(null);

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
  }, [reviews]);

  if (!reviews || reviews.length === 0) return null;

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
    <>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 relative group/reviews">
        {/* Centered Clean Title */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight flex items-center justify-center gap-2.5">
            <RoisinDiamond size={18} color="#7043A0" />
            <span>Reseñas</span>
            <RoisinDiamond size={18} color="#7043A0" />
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-md mx-auto">
            Descubre las fotos, videos y experiencias de clientas que ya brillan con ROISIN Joyas.
          </p>
        </div>

        {/* Navigation Arrows */}
        {canScrollLeft && (
          <button
            onClick={scrollLeft}
            className="absolute left-2 sm:left-4 top-[58%] -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-[#3F235F]/95 hover:bg-[#552E80] text-white shadow-xl backdrop-blur-md transition active:scale-90 cursor-pointer flex items-center justify-center diamond-glow"
            aria-label="Reseña anterior"
          >
            <ChevronLeft size={20} className="stroke-[2.5]" />
          </button>
        )}

        {canScrollRight && (
          <button
            onClick={scrollRight}
            className="absolute right-2 sm:right-4 top-[58%] -translate-y-1/2 z-20 p-2.5 sm:p-3 rounded-full bg-[#3F235F]/95 hover:bg-[#552E80] text-white shadow-xl backdrop-blur-md transition active:scale-90 cursor-pointer flex items-center justify-center diamond-glow"
            aria-label="Reseña siguiente"
          >
            <ChevronRight size={20} className="stroke-[2.5]" />
          </button>
        )}

        {/* Single Horizontal Row / Carousel */}
        <div
          ref={scrollContainerRef}
          onScroll={checkScroll}
          className="flex gap-4 sm:gap-6 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 items-stretch"
        >
          {reviews.map((rev) => {
            const hasMedia = Boolean(rev.mediaUrl && rev.mediaType !== 'NONE');
            const isVideo = rev.mediaType === 'VIDEO';

            return (
              <div
                key={rev.id}
                className="flex-none w-[84vw] sm:w-[350px] lg:w-[390px] bg-white rounded-3xl border border-[#DFD0EC] p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-[#7043A0] transition-all duration-300 flex flex-col justify-between space-y-4 diamond-glow group snap-start select-none"
              >
                <div className="space-y-3.5">
                  {/* Top Row: Stars + Verified Badge */}
                  <div className="flex items-center justify-between">
                    <div className="flex text-amber-400 gap-0.5">
                      {[...Array(rev.rating || 5)].map((_, i) => (
                        <Star key={i} size={15} className="fill-amber-400 text-amber-400" />
                      ))}
                    </div>
                    {rev.isVerified && (
                      <span className="inline-flex items-center gap-1 text-[10.5px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 size={12} /> Compra Verificada
                      </span>
                    )}
                  </div>

                  {/* Review Text */}
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-light italic line-clamp-3">
                    &ldquo;{rev.comment}&rdquo;
                  </p>

                  {/* Product Tag if present */}
                  {rev.productTitle && (
                    <div className="pt-1">
                      <span className="inline-block text-[10px] font-bold text-[#3F235F] bg-[#F8F5FA] px-2.5 py-1 rounded-lg border border-[#DFD0EC]/60">
                        Joya: {rev.productTitle}
                      </span>
                    </div>
                  )}
                </div>

                {/* Media Thumbnail (Photo or Video) */}
                {hasMedia && rev.mediaUrl && (
                  <div
                    onClick={() =>
                      setActiveMedia({
                        url: rev.mediaUrl!,
                        type: rev.mediaType || 'IMAGE',
                        title: rev.authorName,
                      })
                    }
                    className="relative aspect-[16/9.5] rounded-2xl overflow-hidden cursor-pointer border border-[#DFD0EC] group/media shadow-2xs hover:shadow-md transition-all"
                  >
                    {isVideo ? (
                      <div className="w-full h-full bg-zinc-900 flex items-center justify-center relative">
                        <video src={rev.mediaUrl} className="w-full h-full object-cover opacity-80" muted playsInline />
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                          <div className="p-3 bg-[#3F235F]/90 rounded-full text-white shadow-lg group-hover/media:scale-110 transition-transform">
                            <Play size={20} className="fill-white translate-x-0.5" />
                          </div>
                        </div>
                        <span className="absolute bottom-2 right-2 text-[9px] font-black uppercase tracking-wider bg-black/60 text-white px-2 py-0.5 rounded-md backdrop-blur-xs">
                          Video Reseña
                        </span>
                      </div>
                    ) : (
                      <div className="relative w-full h-full">
                        <Image
                          src={rev.mediaUrl}
                          alt={`Foto de reseña por ${rev.authorName}`}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover/media:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity flex items-end p-2.5">
                          <span className="text-[10px] text-white font-bold">Ver Foto Completa ↗</span>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Author Info */}
                <div className="pt-3 border-t border-[#F8F5FA] flex items-center justify-between">
                  <div>
                    <h4 className="text-xs font-extrabold text-zinc-900">{rev.authorName}</h4>
                    {rev.location && <span className="text-[10px] text-zinc-400 font-light">{rev.location}</span>}
                  </div>
                  <RoisinDiamond size={13} color="#7043A0" className="opacity-60" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Modal for viewing Review Photo/Video in high resolution */}
      {activeMedia && (
        <div
          onClick={() => setActiveMedia(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1B1124] rounded-3xl overflow-hidden max-w-2xl w-full max-h-[85vh] shadow-2xl border border-[#DFD0EC]/30 flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10 text-white">
              <span className="text-xs font-bold uppercase tracking-wider">
                Reseña de {activeMedia.title}
              </span>
              <button
                onClick={() => setActiveMedia(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-[4/3] sm:aspect-[16/10] w-full bg-black flex items-center justify-center overflow-hidden">
              {activeMedia.type === 'VIDEO' ? (
                <video src={activeMedia.url} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <Image
                  src={activeMedia.url}
                  alt={`Reseña de ${activeMedia.title}`}
                  fill
                  className="object-contain"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
