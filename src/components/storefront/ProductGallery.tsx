'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

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

  return (
    <div className="flex flex-col-reverse sm:flex-row gap-3 sm:gap-4 lg:sticky lg:top-28 items-start">
      {/* 1. Left Vertical Thumbnails Column (capped to main image height, smooth hidden scroll) */}
      {activeImages.length > 1 && (
        <div className="flex sm:flex-col gap-2.5 overflow-x-auto sm:overflow-y-auto sm:overflow-x-hidden no-scrollbar w-full sm:w-20 shrink-0 max-h-[460px] pb-1 sm:pb-0">
          {activeImages.map((img, idx) => (
            <button
              key={img.url + idx}
              onClick={() => setSelectedIdx(idx)}
              className={`relative w-16 h-16 sm:w-20 sm:h-20 rounded-2xl overflow-hidden border-2 shrink-0 transition-all duration-200 cursor-pointer ${
                selectedIdx === idx
                  ? 'border-[#3F235F] ring-2 ring-[#7043A0]/30 shadow-md scale-102'
                  : 'border-[#DFD0EC] hover:border-[#7043A0] opacity-70 hover:opacity-100 bg-[#F8F5FA]'
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

      {/* 2. Main Image Showcase Container (Right Side) */}
      <div className="relative aspect-square sm:aspect-[4/3.8] w-full max-w-[480px] bg-[#F8F5FA] rounded-3xl overflow-hidden border border-[#DFD0EC] shadow-md group">
        <Image
          src={currentImage.url}
          alt={currentImage.altText || title}
          fill
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover object-center transition-transform duration-500 ease-out group-hover:scale-104"
        />

        {currentImage.label && (
          <div className="absolute bottom-3 left-3 z-10">
            <span className="bg-white/90 backdrop-blur-xs text-[#3F235F] text-[10px] uppercase font-bold tracking-wider px-3 py-1 rounded-full border border-[#DFD0EC] shadow-xs">
              {currentImage.label}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

