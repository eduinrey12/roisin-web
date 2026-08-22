'use client';

import { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: { url: string; altText?: string | null; label?: string | null; isPrimary: boolean }[];
  title: string;
  selectedImageIndex?: number;
  discountPercent?: number | null;
  compareAtPrice?: any;
  basePrice?: any;
}

export default function ProductGallery({
  images,
  title,
  selectedImageIndex,
  discountPercent,
  compareAtPrice,
  basePrice,
}: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (selectedImageIndex !== undefined && selectedImageIndex >= 0 && selectedImageIndex < images.length) {
      setSelectedIdx(selectedImageIndex);
    } else {
      setSelectedIdx(0);
    }
  }, [selectedImageIndex, images]);

  const activeImages =
    images.length > 0
      ? images
      : [
          {
            url: 'https://images.unsplash.com/photo-1605100804763-247f6612d4a5?q=80&w=800&auto=format&fit=crop',
            altText: title,
            label: null,
            isPrimary: true,
          },
        ];

  const currentImage = activeImages[selectedIdx] || activeImages[0];

  const priceNum = Number(basePrice) || 0;
  const compareNum = compareAtPrice ? Number(compareAtPrice) : null;
  const hasDiscount = Boolean(
    (discountPercent && discountPercent > 0) ||
    (compareNum && compareNum > priceNum)
  );

  const discountBadgeText = discountPercent
    ? `-${discountPercent}% OFF`
    : compareNum && compareNum > priceNum
    ? `-${Math.round(((compareNum - priceNum) / compareNum) * 100)}% OFF`
    : null;

  const handlePrev = useCallback(() => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : activeImages.length - 1));
  }, [activeImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIdx((prev) => (prev < activeImages.length - 1 ? prev + 1 : 0));
  }, [activeImages.length]);

  // Lock body scroll and handle keyboard navigation when modal is open
  useEffect(() => {
    if (!isModalOpen) return;

    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isModalOpen, handlePrev, handleNext]);

  return (
    <>
      {/* Sticky Gallery Container on Desktop */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 lg:sticky lg:top-24 self-start items-start w-full">
        {/* 1. Left Vertical Thumbnails Column with generous padding */}
        {activeImages.length > 0 && (
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden no-scrollbar w-full sm:w-20 lg:w-22 shrink-0 max-h-[580px] p-2">
            {activeImages.map((img, idx) => (
              <button
                key={img.url + idx}
                onClick={() => setSelectedIdx(idx)}
                className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all duration-200 cursor-pointer ${
                  selectedIdx === idx
                    ? 'border-[#3F235F] ring-2 ring-[#7043A0]/40 shadow-md'
                    : 'border-[#DFD0EC] hover:border-[#7043A0] opacity-75 hover:opacity-100 bg-[#F8F5FA]'
                }`}
                aria-label={`Ver imagen ${idx + 1}`}
              >
                <Image
                  src={img.url}
                  alt=""
                  fill
                  sizes="80px"
                  unoptimized={img.url?.startsWith('/api/uploads/')}
                  className="object-cover object-center"
                />
                {img.label && (
                  <span className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[8px] uppercase font-bold text-center py-0.5 truncate px-1">
                    {img.label}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* 2. Main Showcase Image with Zoom Click Action & Direct Arrow Navigation */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="relative aspect-square lg:aspect-[4/3.8] w-full flex-1 bg-[#F8F5FA] rounded-3xl overflow-hidden border border-[#DFD0EC] shadow-md group cursor-zoom-in min-h-[360px] sm:min-h-[440px] lg:min-h-[520px]"
        >
          <Image
            src={currentImage.url}
            alt={currentImage.altText || title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            unoptimized={currentImage.url?.startsWith('/api/uploads/')}
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-104"
          />

          {/* Discount Badge on Top-Left */}
          {hasDiscount && discountBadgeText && (
            <div className="absolute top-3.5 left-3.5 z-20">
              <span className="bg-gradient-to-r from-[#3F235F] to-[#7043A0] text-white text-xs uppercase font-extrabold px-3 py-1 rounded-full shadow-md tracking-wider leading-normal inline-block">
                {discountBadgeText}
              </span>
            </div>
          )}

          {/* Hover Zoom Indicator */}
          <div className="absolute top-3.5 right-3.5 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md z-20">
            <Maximize2 size={16} />
          </div>

          {/* Direct Prev / Next Navigation Arrows on Main Image (Cycles with 1 click) */}
          {activeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-[#3F235F] border border-[#DFD0EC] hover:border-[#7043A0] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center opacity-85 group-hover:opacity-100"
                aria-label="Foto anterior"
                title="Foto anterior"
              >
                <ChevronLeft size={20} />
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2 sm:p-2.5 rounded-full bg-white/90 hover:bg-white text-[#3F235F] border border-[#DFD0EC] hover:border-[#7043A0] shadow-md hover:shadow-lg transition-all duration-200 cursor-pointer active:scale-95 flex items-center justify-center opacity-85 group-hover:opacity-100"
                aria-label="Foto siguiente"
                title="Foto siguiente"
              >
                <ChevronRight size={20} />
              </button>

              {/* Photo Counter Badge */}
              <div className="absolute bottom-3 right-3 z-10">
                <span className="bg-black/50 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs">
                  {selectedIdx + 1} / {activeImages.length}
                </span>
              </div>
            </>
          )}

          {currentImage.label && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="bg-white/90 backdrop-blur-xs text-[#3F235F] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-[#DFD0EC] shadow-xs">
                {currentImage.label}
              </span>
            </div>
          )}
        </div>
      </div>


      {/* 3. Fullscreen Clean Image Modal via React Portal (Renders at body root, above header/all elements) */}
      {mounted &&
        isModalOpen &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex flex-col items-center justify-between p-4 sm:p-6 overflow-hidden select-none"
            onClick={() => setIsModalOpen(false)}
          >
            {/* Top Header Bar */}
            <div className="w-full max-w-6xl flex items-center justify-between z-30 shrink-0">
              <div className="flex items-center gap-2 text-white">
                <span className="text-sm font-bold truncate max-w-sm sm:max-w-md">{title}</span>
                {activeImages.length > 1 && (
                  <span className="text-xs text-zinc-400 font-medium">
                    ({selectedIdx + 1} / {activeImages.length})
                  </span>
                )}
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(false);
                }}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shadow-lg"
                aria-label="Cerrar vista completa"
              >
                <X size={22} />
              </button>
            </div>

            {/* Center Image Container (Strictly Fits Viewport Height, No Overflow) */}
            <div
              className="relative flex-1 w-full max-w-5xl my-2 flex items-center justify-center min-h-0"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Previous Arrow */}
              {activeImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePrev();
                  }}
                  className="absolute left-2 sm:left-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-lg border border-white/10"
                  aria-label="Imagen anterior"
                >
                  <ChevronLeft size={24} />
                </button>
              )}

              {/* Photo in Full View */}
              <div className="relative w-full h-full">
                <Image
                  src={currentImage.url}
                  alt={currentImage.altText || title}
                  fill
                  priority
                  sizes="100vw"
                  unoptimized={currentImage.url?.startsWith('/api/uploads/')}
                  className="object-contain"
                />
              </div>

              {/* Next Arrow */}
              {activeImages.length > 1 && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNext();
                  }}
                  className="absolute right-2 sm:right-4 z-20 p-2.5 sm:p-3 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-lg border border-white/10"
                  aria-label="Imagen siguiente"
                >
                  <ChevronRight size={24} />
                </button>
              )}
            </div>

            {/* Bottom Thumbnails Strip */}
            {activeImages.length > 1 && (
              <div
                className="w-full max-w-md flex items-center justify-center gap-2 z-30 shrink-0 overflow-x-auto py-1"
                onClick={(e) => e.stopPropagation()}
              >
                {activeImages.map((img, idx) => (
                  <button
                    key={img.url + idx}
                    type="button"
                    onClick={() => setSelectedIdx(idx)}
                    className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition cursor-pointer shrink-0 ${
                      selectedIdx === idx
                        ? 'border-white ring-2 ring-white/60 shadow-lg scale-105'
                        : 'border-white/30 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <Image
                      src={img.url}
                      alt=""
                      fill
                      sizes="48px"
                      unoptimized={img.url?.startsWith('/api/uploads/')}
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>,
          document.body
        )}
    </>
  );
}
