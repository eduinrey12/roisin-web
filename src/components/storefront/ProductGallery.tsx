'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { Maximize2, X, ChevronLeft, ChevronRight } from 'lucide-react';

interface ProductGalleryProps {
  images: { url: string; altText?: string | null; label?: string | null; isPrimary: boolean }[];
  title: string;
  selectedImageIndex?: number;
}

export default function ProductGallery({
  images,
  title,
  selectedImageIndex,
}: ProductGalleryProps) {
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    if (selectedImageIndex !== undefined && selectedImageIndex >= 0 && selectedImageIndex < images.length) {
      setSelectedIdx(selectedImageIndex);
    }
  }, [selectedImageIndex, images.length]);

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

  const handlePrev = useCallback(() => {
    setSelectedIdx((prev) => (prev > 0 ? prev - 1 : activeImages.length - 1));
  }, [activeImages.length]);

  const handleNext = useCallback(() => {
    setSelectedIdx((prev) => (prev < activeImages.length - 1 ? prev + 1 : 0));
  }, [activeImages.length]);

  // Keyboard navigation for modal
  useEffect(() => {
    if (!isModalOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsModalOpen(false);
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isModalOpen, handlePrev, handleNext]);

  return (
    <>
      {/* Sticky Gallery Container on Desktop */}
      <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 lg:sticky lg:top-24 self-start items-start w-full">
        {/* 1. Left Vertical Thumbnails Column */}
        {activeImages.length > 1 && (
          <div className="flex sm:flex-col gap-3 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden no-scrollbar w-full sm:w-22 shrink-0 max-h-[540px] p-1.5">
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

        {/* 2. Main Showcase Image with Zoom Click Action */}
        <div
          onClick={() => setIsModalOpen(true)}
          className="relative aspect-square sm:aspect-[4/3.8] w-full flex-1 bg-[#F8F5FA] rounded-3xl overflow-hidden border border-[#DFD0EC] shadow-md group cursor-zoom-in min-h-[340px] sm:min-h-[420px] lg:min-h-[460px]"
        >
          <Image
            src={currentImage.url}
            alt={currentImage.altText || title}
            fill
            priority
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-104"
          />

          {/* Hover Zoom Indicator */}
          <div className="absolute top-3.5 right-3.5 bg-black/40 hover:bg-black/60 text-white p-2 rounded-full backdrop-blur-xs opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-md">
            <Maximize2 size={16} />
          </div>

          {currentImage.label && (
            <div className="absolute bottom-3 left-3 z-10">
              <span className="bg-white/90 backdrop-blur-xs text-[#3F235F] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-[#DFD0EC] shadow-xs">
                {currentImage.label}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* 3. Fullscreen Image Modal / Lightbox */}
      {isModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/92 backdrop-blur-md flex items-center justify-center p-4 sm:p-8 select-none"
          onClick={() => setIsModalOpen(false)}
        >
          {/* Close Button */}
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsModalOpen(false);
            }}
            className="absolute top-5 right-5 z-20 p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shadow-lg"
            aria-label="Cerrar vista completa"
          >
            <X size={24} />
          </button>

          {/* Navigation Arrows */}
          {activeImages.length > 1 && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrev();
                }}
                className="absolute left-4 sm:left-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shadow-lg"
                aria-label="Imagen anterior"
              >
                <ChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleNext();
                }}
                className="absolute right-4 sm:right-8 z-20 p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition cursor-pointer shadow-lg"
                aria-label="Imagen siguiente"
              >
                <ChevronRight size={28} />
              </button>
            </>
          )}

          {/* Large Image Container */}
          <div
            className="relative w-full max-w-4xl h-[75vh] sm:h-[85vh] flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative w-full h-full">
              <Image
                src={currentImage.url}
                alt={currentImage.altText || title}
                fill
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-contain"
              />
            </div>

            {/* Bottom Title & Counter Bar */}
            <div className="mt-4 flex items-center gap-3 bg-black/60 backdrop-blur-xs text-white px-4 py-1.5 rounded-full border border-white/15 text-xs">
              <span className="font-semibold truncate max-w-xs">{title}</span>
              {activeImages.length > 1 && (
                <span className="text-zinc-400">
                  ({selectedIdx + 1} de {activeImages.length})
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
