'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, Sparkles } from 'lucide-react';
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
  const router = useRouter();

  const primaryImg =
    product.images.find((i) => i.isPrimary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop';

  const price = Number(product.basePrice);

  const handleCardClick = (e: React.MouseEvent) => {
    // Navigate to product detail if clicked anywhere on the card
    router.push(`/productos/${product.slug}`);
  };

  const handleCategoryClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  const handleQuickBuyClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setQuickViewOpen(true);
  };

  return (
    <>
      <div
        onClick={handleCardClick}
        className="group relative flex flex-col justify-between bg-white rounded-3xl border border-[#FAD1DC] overflow-hidden luxury-card-hover diamond-card-glow cursor-pointer select-none transition-all duration-300"
      >
        {/* 1. Top Image Section */}
        <div className="relative aspect-[4/4.3] bg-[#FFF8FA] overflow-hidden">
          <Image
            src={primaryImg}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
          />

          {/* Category Diamond Badge (Zone 1: Click takes to category) */}
          {product.category && (
            <div className="absolute top-3.5 left-3.5 z-20">
              <Link
                href={`/productos?category=${product.category.slug}`}
                onClick={handleCategoryClick}
                className="diamond-tag text-[9px] uppercase font-bold tracking-[0.2em] px-3.5 py-1.2 rounded-full text-zinc-900 flex items-center gap-1.5 shadow-xs hover:bg-[#FFF5F7] hover:border-[#E65573] hover:text-[#B22343] transition"
              >
                <RoisinDiamond size={10} color="#E65573" />
                {product.category.name}
              </Link>
            </div>
          )}

          {/* Sparkle subtle decoration */}
          <div className="absolute top-3.5 right-3.5 opacity-40 group-hover:opacity-100 transition-opacity">
            <RoisinDiamond size={13} color="#F08097" />
          </div>

          {/* Desktop Hover Action: ONLY Compra Rápida button (Zone 2) */}
          <div className="hidden lg:flex absolute inset-x-4 bottom-3.5 z-20 items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleQuickBuyClick}
              className="w-full btn-pink-diamond text-xs uppercase tracking-wider font-bold py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shimmer-button"
            >
              <ShoppingBag size={14} />
              Compra Rápida
            </button>
          </div>
        </div>

        {/* 2. Geometric Diamond Facet Notch Line */}
        <div className="relative w-full flex items-center justify-center -my-3 z-10 pointer-events-none">
          <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#FAD1DC] to-transparent" />
          <div className="absolute bg-white px-2.5 py-0.5 rounded-full border border-[#FAD1DC] shadow-xs">
            <RoisinDiamond size={11} color="#E65573" />
          </div>
        </div>

        {/* 3. Product Content Area (Zone 3: Click anywhere opens product) */}
        <div className="p-5 pt-6 flex flex-col justify-between flex-1 space-y-4">
          <div className="space-y-1">
            <h3 className="font-serif text-base font-bold text-zinc-900 leading-snug line-clamp-1 group-hover:text-[#D33658] transition-colors">
              {product.title}
            </h3>
            <p className="text-[11px] text-zinc-400 font-medium">
              Plata de Ley 925 & Oro 18k
            </p>
          </div>

          {/* Price & Mobile Action Row */}
          <div className="flex items-center justify-between pt-2.5 border-t border-[#FFF0F3]">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-bold">
                Precio
              </span>
              <span className="font-serif text-xl font-bold text-zinc-900">
                ${price.toFixed(2)}
              </span>
            </div>

            {/* Mobile / Tablet Tap Action Button */}
            <div className="lg:hidden">
              <button
                onClick={handleQuickBuyClick}
                className="btn-pink-diamond p-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm"
                aria-label="Compra rápida"
              >
                <ShoppingBag size={14} />
                <span className="text-[11px]">Añadir</span>
              </button>
            </div>

            {/* Desktop Link indicator */}
            <span className="hidden lg:inline-flex items-center gap-1 text-[11px] uppercase font-bold tracking-widest text-[#D33658] group-hover:text-[#93203A] transition-colors">
              Ver Joya <span className="transition-transform duration-300 group-hover:translate-x-1">→</span>
            </span>
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
