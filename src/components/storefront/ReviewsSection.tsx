'use client';

import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
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
  const [selectedMediaIdx, setSelectedMediaIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const reviewsWithMedia = reviews.filter((r) => Boolean(r.mediaUrl && r.mediaType !== 'NONE'));

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

  const handlePrevMedia = useCallback(() => {
    if (selectedMediaIdx === null || reviewsWithMedia.length === 0) return;
    setSelectedMediaIdx((prev) =>
      prev !== null && prev > 0 ? prev - 1 : reviewsWithMedia.length - 1
    );
  }, [selectedMediaIdx, reviewsWithMedia.length]);

  const handleNextMedia = useCallback(() => {
    if (selectedMediaIdx === null || reviewsWithMedia.length === 0) return;
    setSelectedMediaIdx((prev) =>
      prev !== null && prev < reviewsWithMedia.length - 1 ? prev + 1 : 0
    );
  }, [selectedMediaIdx, reviewsWithMedia.length]);

  // Lock body scroll and keyboard events
  useEffect(() => {
    if (selectedMediaIdx === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedMediaIdx(null);
      if (e.key === 'ArrowLeft') handlePrevMedia();
      if (e.key === 'ArrowRight') handleNextMedia();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedMediaIdx, handlePrevMedia, handleNextMedia]);

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

  const activeReview = selectedMediaIdx !== null ? reviewsWithMedia[selectedMediaIdx] : null;

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
            const mediaIndexInList = reviewsWithMedia.findIndex((r) => r.id === rev.id);

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
                    onClick={() => {
                      if (mediaIndexInList >= 0) {
                        setSelectedMediaIdx(mediaIndexInList);
                      }
                    }}
                    className="relative aspect-[16/9.5] rounded-2xl overflow-hidden cursor-zoom-in border border-[#DFD0EC] group/media shadow-2xs hover:shadow-md transition-all"
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
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover/media:opacity-100 transition-opacity flex items-end p-2.5">
                          <span className="text-[10px] text-white font-bold tracking-wide">Ver Foto Completa ↗</span>
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

      {/* Fullscreen Modal via React Portal (Exact behavior of Product Gallery) */}
      {mounted &&
        activeReview &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none animate-fade-in"
            onClick={() => setSelectedMediaIdx(null)}
          >
            {/* Top Header Bar */}
            <div className="w-full max-w-6xl flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-2.5 text-white">
                <span className="text-sm font-bold truncate max-w-sm sm:max-w-md">
                  Reseña de {activeReview.authorName}
                </span>
                {activeReview.isVerified && (
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
                    Compra Verificada
                  </span>
                )}
                {reviewsWithMedia.length > 1 && selectedMediaIdx !== null && (
                  <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                    ({selectedMediaIdx + 1} / {reviewsWithMedia.length})
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedMediaIdx(null);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shadow-lg"
                aria-label="Cerrar vista completa"
              >
                <X size={22} />
              </button>
            </div>

            {/* Center Media Container strictly fitting viewport */}
            <div
              className="relative flex-1 w-full max-w-5xl my-2 flex items-center justify-center min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Arrow */}
              {reviewsWithMedia.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrevMedia();
                  }}
                  className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-lg border border-white/10"
                  aria-label="Reseña anterior"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Media Content */}
              <div className="relative w-full h-full flex items-center justify-center">
                {activeReview.mediaType === 'VIDEO' ? (
                  <video
                    src={activeReview.mediaUrl!}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full object-contain rounded-2xl"
                  />
                ) : (
                  <Image
                    src={activeReview.mediaUrl!}
                    alt={`Reseña de ${activeReview.authorName}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain"
                  />
                )}
              </div>

              {/* Next Arrow */}
              {reviewsWithMedia.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNextMedia();
                  }}
                  className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-lg border border-white/10"
                  aria-label="Reseña siguiente"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Bottom Caption Bar */}
            <div
              className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center z-30 shrink-0 text-white space-y-1.5 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-1 text-amber-300">
                {[...Array(activeReview.rating || 5)].map((_, i) => (
                  <Star key={i} size={14} className="fill-amber-300 text-amber-300" />
                ))}
              </div>
              <p className="text-xs text-zinc-200 font-light italic max-w-xl mx-auto line-clamp-2">
                &ldquo;{activeReview.comment}&rdquo;
              </p>
              {activeReview.productTitle && (
                <span className="inline-block text-[10px] font-bold text-amber-300">
                  Joya: {activeReview.productTitle}
                </span>
              )}
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

