'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Eye, ShoppingBag, ArrowRight } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    basePrice: any;
    description?: string | null;
    category?: { name: string; slug: string } | null;
    images: { url: string; altText?: string | null; isPrimary: boolean }[];
    variants?: { id: string; sku: string; price: any; compareAtPrice?: any; inventory?: { quantity: number } | null }[];
    optionGroupLinks?: any[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);

  const primaryImg =
    product.images.find((i) => i.isPrimary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop';

  const secondaryImg = product.images[1]?.url || primaryImg;
  const price = Number(product.basePrice);

  return (
    <>
      <div className="group relative flex flex-col justify-between bg-white rounded-3xl border border-[#F0E6E8] overflow-hidden luxury-card-hover shadow-xs">
        {/* 1. Top Image Section with Diamond Pill */}
        <div className="relative aspect-[4/4.2] bg-[#FAF7F8] overflow-hidden">
          <Link href={`/productos/${product.slug}`} className="block relative w-full h-full">
            <Image
              src={primaryImg}
              alt={product.title}
              fill
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              className="object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
            />
          </Link>

          {/* Category Diamond Badge */}
          {product.category && (
            <div className="absolute top-3.5 left-3.5 z-10">
              <span className="diamond-tag text-[9px] uppercase font-bold tracking-[0.2em] px-3 py-1 rounded-full text-zinc-800 flex items-center gap-1.5 shadow-xs">
                <RoisinDiamond size={10} color="#E2A3B0" />
                {product.category.name}
              </span>
            </div>
          )}

          {/* Sparkle subtle decoration on corner */}
          <div className="absolute top-3.5 right-3.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <RoisinDiamond size={12} color="#E2A3B0" />
          </div>

          {/* Desktop Hover Action Overlay */}
          <div className="hidden lg:flex absolute inset-x-3 bottom-3 z-20 items-center gap-2 opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={() => setQuickViewOpen(true)}
              className="flex-1 bg-white/95 hover:bg-white text-zinc-900 text-[11px] uppercase tracking-wider font-bold py-2.5 px-3 rounded-xl shadow-md border border-[#EFCFD6] backdrop-blur-xs flex items-center justify-center gap-1.5 transition active:scale-95"
            >
              <ShoppingBag size={13} className="text-[#BE6C7C]" />
              Compra Rápida
            </button>
            <Link
              href={`/productos/${product.slug}`}
              className="p-2.5 bg-zinc-900 hover:bg-black text-white rounded-xl shadow-md transition active:scale-95 flex items-center justify-center"
              aria-label="Ver detalles completos de la joya"
            >
              <Eye size={15} />
            </Link>
          </div>
        </div>

        {/* 2. Geometric Diamond Facet Notch Line */}
        <div className="relative w-full flex items-center justify-center -my-3 z-10 pointer-events-none">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#EFCFD6] to-transparent" />
          <div className="absolute bg-white px-2 py-0.5 rounded-full border border-[#EFCFD6] shadow-2xs">
            <RoisinDiamond size={11} color="#E2A3B0" />
          </div>
        </div>

        {/* 3. Product Content Area */}
        <div className="p-5 pt-6 flex flex-col justify-between flex-1 space-y-4">
          <div>
            <Link href={`/productos/${product.slug}`} className="block group-hover:text-[#BE6C7C] transition">
              <h3 className="font-serif text-base font-bold text-zinc-900 leading-snug line-clamp-1">
                {product.title}
              </h3>
            </Link>
            <p className="text-[11px] text-zinc-400 font-medium mt-0.5">
              Plata de Ley 925 & Oro 18k
            </p>
          </div>

          {/* Price & Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-[#FAF4F5]">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-semibold">
                Precio
              </span>
              <span className="font-serif text-lg font-bold text-zinc-900">
                ${price.toFixed(2)}
              </span>
            </div>

            {/* Mobile / Tablet Button (Always visible on touch devices) */}
            <div className="flex items-center gap-1.5 lg:hidden">
              <button
                onClick={() => setQuickViewOpen(true)}
                className="p-2 bg-[#FAF4F5] text-zinc-800 hover:bg-[#F6E8EB] border border-[#EFCFD6] rounded-xl text-xs font-semibold"
                aria-label="Compra rápida"
              >
                <ShoppingBag size={15} />
              </button>
              <Link
                href={`/productos/${product.slug}`}
                className="p-2 bg-zinc-900 text-white rounded-xl text-xs font-semibold flex items-center justify-center"
                aria-label="Ver joya"
              >
                <ArrowRight size={14} />
              </Link>
            </div>

            {/* Desktop Link (Subtle Arrow button) */}
            <Link
              href={`/productos/${product.slug}`}
              className="hidden lg:inline-flex items-center gap-1 text-[11px] uppercase tracking-widest font-bold text-zinc-800 hover:text-[#BE6C7C] transition py-1"
            >
              Ver Joya <ArrowRight size={13} />
            </Link>
          </div>
        </div>
      </div>

      {/* Quick View Modal */}
      <QuickViewModal
        product={product as any}
        isOpen={quickViewOpen}
        onClose={() => setQuickViewOpen(false)}
      />
    </>
  );
}
