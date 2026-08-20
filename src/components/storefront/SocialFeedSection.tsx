'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { Play, Heart, MessageCircle, ExternalLink, X } from 'lucide-react';
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

export default function SocialFeedSection() {
  const [activeMedia, setActiveMedia] = useState<{ url: string; type: string; caption: string } | null>(null);

  const socialPosts = [
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
          {socialPosts.map((post) => (
            <div
              key={post.id}
              onClick={() =>
                setActiveMedia({
                  url: post.videoUrl || post.imageUrl,
                  type: post.type,
                  caption: post.caption,
                })
              }
              className="group relative aspect-square rounded-2xl overflow-hidden cursor-pointer border border-[#DFD0EC] bg-[#1B1124] shadow-xs hover:shadow-xl hover:border-[#7043A0] transition-all duration-300 select-none"
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
                  Ver Publicación
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

      {/* Social Post Modal */}
      {activeMedia && (
        <div
          onClick={() => setActiveMedia(null)}
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative bg-[#1B1124] rounded-3xl overflow-hidden max-w-lg w-full max-h-[85vh] shadow-2xl border border-[#DFD0EC]/30 flex flex-col"
          >
            <div className="p-4 flex items-center justify-between border-b border-white/10 text-white">
              <span className="text-xs font-bold uppercase tracking-wider flex items-center gap-2">
                <InstagramIcon size={15} className="text-[#DFD0EC]" /> @roisinjoyas
              </span>
              <button
                onClick={() => setActiveMedia(null)}
                className="p-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
                aria-label="Cerrar modal"
              >
                <X size={18} />
              </button>
            </div>

            <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
              {activeMedia.type === 'video' ? (
                <video src={activeMedia.url} controls autoPlay className="w-full h-full object-contain" />
              ) : (
                <Image src={activeMedia.url} alt="Instagram Post" fill className="object-cover" />
              )}
            </div>

            <div className="p-4 text-xs text-zinc-300 font-light leading-relaxed">
              {activeMedia.caption}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
