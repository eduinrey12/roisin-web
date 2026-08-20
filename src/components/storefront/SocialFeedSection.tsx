'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Play, Heart, MessageCircle, ExternalLink, X, ChevronLeft, ChevronRight } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

function InstagramIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

function TikTokIcon({ size = 16, className = '' }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
    >
      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743 2.896 2.896 0 0 1 2.305-4.639c.314 0 .628.05.922.148V9.379a6.29 6.29 0 0 0-.922-.069 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 10.82 4.478 6.29 6.29 0 0 0 1.86-4.478V8.697a8.21 8.21 0 0 0 4.771 1.516V6.768a4.845 4.845 0 0 1-1-.082z" />
    </svg>
  );
}

const SOCIAL_POSTS = [
  {
    id: '1',
    imageUrl: 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop',
    type: 'image',
    caption: 'Brillo eterno en Plata de Ley 925 con circonias suizas de corte diamante ✨ #RoisinJoyas',
    likes: '1.2k',
    comments: '84',
  },
  {
    id: '2',
    imageUrl: 'https://images.unsplash.com/photo-1605100804763-247f67b3557e?q=80&w=800&auto=format&fit=crop',
    type: 'image',
    caption: 'El anillo solitario perfecto para una propuesta inolvidable 💍💎 #DiamanteMorado',
    likes: '2.5k',
    comments: '192',
  },
  {
    id: '3',
    imageUrl: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?q=80&w=800&auto=format&fit=crop',
    type: 'video',
    videoUrl: 'https://cdn.pixabay.com/video/2021/04/23/71941-540702677_tiny.mp4',
    caption: 'Unboxing de nuestro empaque de regalo de lujo con dedicatoria personalizada 🎁💜',
    likes: '3.8k',
    comments: '310',
  },
  {
    id: '4',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?q=80&w=800&auto=format&fit=crop',
    type: 'image',
    caption: 'Combinación perfecta: aretes huggies y cadena en baño de oro 18k hipoalergénico ✨',
    likes: '980',
    comments: '62',
  },
  {
    id: '5',
    imageUrl: 'https://images.unsplash.com/photo-1611591475103-4fa1b7765a7f?q=80&w=800&auto=format&fit=crop',
    type: 'image',
    caption: 'Detalles que enamoran a primera vista. Hecho a mano con dedicación artesanal.',
    likes: '1.7k',
    comments: '115',
  },
  {
    id: '6',
    imageUrl: 'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=800&auto=format&fit=crop',
    type: 'image',
    caption: 'Tu joya favorita siempre contigo en nuestro joyero aterciopelado de viaje 🌸',
    likes: '1.4k',
    comments: '93',
  },
];

export default function SocialFeedSection() {
  const [selectedPostIdx, setSelectedPostIdx] = useState<number | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handlePrevPost = useCallback(() => {
    if (selectedPostIdx === null) return;
    setSelectedPostIdx((prev) =>
      prev !== null && prev > 0 ? prev - 1 : SOCIAL_POSTS.length - 1
    );
  }, [selectedPostIdx]);

  const handleNextPost = useCallback(() => {
    if (selectedPostIdx === null) return;
    setSelectedPostIdx((prev) =>
      prev !== null && prev < SOCIAL_POSTS.length - 1 ? prev + 1 : 0
    );
  }, [selectedPostIdx]);

  // Lock body scroll and handle keyboard navigation
  useEffect(() => {
    if (selectedPostIdx === null) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedPostIdx(null);
      if (e.key === 'ArrowLeft') handlePrevPost();
      if (e.key === 'ArrowRight') handleNextPost();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedPostIdx, handlePrevPost, handleNextPost]);

  const activePost = selectedPostIdx !== null ? SOCIAL_POSTS[selectedPostIdx] : null;

  return (
    <>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Centered Clean Title */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight flex items-center justify-center gap-2.5">
            <RoisinDiamond size={18} color="#7043A0" />
            <span>Síguenos en Redes Sociales</span>
            <RoisinDiamond size={18} color="#7043A0" />
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-md mx-auto">
            Únete a nuestra comunidad de Instagram y TikTok. Etiquétanos como <span className="font-bold text-[#3F235F]">@roisinjoyas</span> para compartir tu brillo.
          </p>
        </div>

        {/* Social Feed Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {SOCIAL_POSTS.map((post, idx) => (
            <div
              key={post.id}
              onClick={() => setSelectedPostIdx(idx)}
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-zoom-in border border-[#DFD0EC] bg-[#1B1124] shadow-xs hover:shadow-xl hover:border-[#7043A0] transition-all duration-300 select-none"
            >
              <Image
                src={post.imageUrl}
                alt={post.caption}
                fill
                sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                className="object-cover object-center group-hover:scale-110 transition-transform duration-700 ease-out"
              />

              {/* Video Badge */}
              {post.type === 'video' && (
                <div className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-black/60 text-white backdrop-blur-xs">
                  <Play size={12} className="fill-white translate-x-0.5" />
                </div>
              )}

              {/* Hover Dark Overlay with Likes & Comments */}
              <div className="absolute inset-0 bg-[#3F235F]/85 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3 text-white">
                <div className="flex justify-end">
                  <InstagramIcon size={16} className="text-[#DFD0EC]" />
                </div>
                <div className="flex items-center justify-center gap-3 text-xs font-bold">
                  <span className="flex items-center gap-1">
                    <Heart size={13} className="fill-white" /> {post.likes}
                  </span>
                  <span className="flex items-center gap-1">
                    <MessageCircle size={13} className="fill-white" /> {post.comments}
                  </span>
                </div>
                <span className="text-[9px] uppercase font-bold text-center tracking-wider text-[#DFD0EC]">
                  Ver Publicación ↗
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Social CTAs */}
        <div className="flex flex-wrap items-center justify-center gap-3.5 pt-8">
          <a
            href="https://instagram.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 btn-purple-diamond text-xs uppercase tracking-wider font-extrabold px-6 py-3 rounded-full shadow-md active:scale-95 transition"
          >
            <InstagramIcon size={16} />
            <span>Instagram @roisinjoyas</span>
            <ExternalLink size={13} />
          </a>

          <a
            href="https://tiktok.com"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#F8F5FA] hover:bg-[#F0E9F5] text-zinc-900 text-xs uppercase tracking-wider font-bold px-6 py-3 rounded-full border border-[#DFD0EC] transition shadow-2xs hover:border-[#7043A0]"
          >
            <TikTokIcon size={16} />
            <span>TikTok @roisinjoyas</span>
            <ExternalLink size={13} />
          </a>
        </div>
      </section>

      {/* Fullscreen Modal via React Portal (Exact behavior of Product Gallery) */}
      {mounted &&
        activePost &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none animate-fade-in"
            onClick={() => setSelectedPostIdx(null)}
          >
            {/* Top Header Bar */}
            <div className="w-full max-w-6xl flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-2.5 text-white">
                <div className="flex items-center gap-1.5 text-sm font-bold">
                  <InstagramIcon size={17} className="text-[#DFD0EC]" />
                  <span>@roisinjoyas</span>
                </div>
                {selectedPostIdx !== null && (
                  <span className="text-xs text-zinc-400 font-medium hidden sm:inline">
                    ({selectedPostIdx + 1} / {SOCIAL_POSTS.length})
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setSelectedPostIdx(null);
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
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevPost();
                }}
                className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-lg border border-white/10"
                aria-label="Publicación anterior"
              >
                <ChevronLeft size={24} />
              </button>

              {/* Media Content */}
              <div className="relative w-full h-full flex items-center justify-center">
                {activePost.type === 'video' ? (
                  <video
                    src={activePost.videoUrl!}
                    controls
                    autoPlay
                    playsInline
                    className="max-h-full max-w-full object-contain rounded-2xl"
                  />
                ) : (
                  <Image
                    src={activePost.imageUrl}
                    alt={activePost.caption}
                    fill
                    priority
                    sizes="100vw"
                    className="object-contain"
                  />
                )}
              </div>

              {/* Next Arrow */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextPost();
                }}
                className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-lg border border-white/10"
                aria-label="Publicación siguiente"
              >
                <ChevronRight size={24} />
              </button>
            </div>

            {/* Bottom Caption Bar */}
            <div
              className="w-full max-w-2xl bg-white/10 backdrop-blur-md rounded-2xl p-4 text-center z-30 shrink-0 text-white space-y-2 border border-white/10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-center gap-4 text-xs font-bold text-[#DFD0EC]">
                <span className="flex items-center gap-1.5">
                  <Heart size={14} className="fill-white text-white" /> {activePost.likes}
                </span>
                <span className="flex items-center gap-1.5">
                  <MessageCircle size={14} className="fill-white text-white" /> {activePost.comments}
                </span>
              </div>
              <p className="text-xs text-zinc-200 font-light max-w-xl mx-auto line-clamp-2">
                {activePost.caption}
              </p>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}

