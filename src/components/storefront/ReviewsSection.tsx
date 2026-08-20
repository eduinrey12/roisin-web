'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Star, Play, CheckCircle2, X } from 'lucide-react';
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
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: string; title: string } | null>(null);

  if (!reviews || reviews.length === 0) return null;

  return (
    <>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Centered Clean Title */}
        <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
          <div className="inline-flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-[0.3em] text-[#3F235F]">
            <RoisinDiamond size={13} color="#7043A0" />
            <span>Testimonios Auténticos</span>
            <RoisinDiamond size={13} color="#7043A0" />
          </div>
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
            Reseñas
          </h2>
          <p className="text-xs text-zinc-500 font-light max-w-md mx-auto">
            Descubre las fotos, videos y experiencias de clientas que ya brillan con ROISIN Joyas.
          </p>
        </div>

        {/* Reviews Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
          {reviews.map((rev) => {
            const hasMedia = Boolean(rev.mediaUrl && rev.mediaType !== 'NONE');
            const isVideo = rev.mediaType === 'VIDEO';

            return (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-[#DFD0EC] p-6 sm:p-7 shadow-xs hover:shadow-xl hover:border-[#7043A0] transition-all duration-300 flex flex-col justify-between space-y-4 diamond-glow group"
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
                  <p className="text-xs sm:text-sm text-zinc-700 leading-relaxed font-light italic">
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
                    className="relative aspect-[16/9] rounded-2xl overflow-hidden cursor-pointer border border-[#DFD0EC] group/media shadow-2xs hover:shadow-md transition-all"
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
