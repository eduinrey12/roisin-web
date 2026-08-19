'use client';

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import QuickViewModal from './QuickViewModal';

interface ProductCardProps {
  product: {
    id: string;
    title: string;
    slug: string;
    basePrice: any;
    compareAtPrice?: any;
    discountPercent?: number | null;
    tag?: string | null;
    shortDescription?: string | null;
    description?: string | null;
    category?: { name: string; slug: string } | null;
    images: { url: string; altText?: string | null; label?: string | null; isPrimary: boolean }[];
    variants?: { id: string; sku: string; price: any; compareAtPrice?: any; inventory?: { quantity: number } | null }[];
    optionGroupLinks?: any[];
  };
  isMostDesired?: boolean;
}

export default function ProductCard({ product, isMostDesired = false }: ProductCardProps) {
  const [quickViewOpen, setQuickViewOpen] = useState(false);
  const router = useRouter();

  const primaryImg =
    product.images.find((i) => i.isPrimary)?.url ||
    product.images[0]?.url ||
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop';

  const price = Number(product.basePrice);
  const compareAt = product.compareAtPrice ? Number(product.compareAtPrice) : null;
  const hasDiscount = Boolean(
    (product.discountPercent && product.discountPercent > 0) ||
    (compareAt && compareAt > price)
  );

  const discountBadgeText = product.discountPercent
    ? `-${product.discountPercent}%`
    : compareAt && compareAt > price
    ? `-${Math.round(((compareAt - price) / compareAt) * 100)}%`
    : null;

  const handleCardClick = () => {
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
        className={`group relative flex flex-col justify-between bg-white rounded-3xl border overflow-hidden luxury-card-hover cursor-pointer select-none transition-all duration-300 ${
          isMostDesired
            ? 'border-[#7043A0] shadow-md ring-1 ring-[#7043A0]/30'
            : 'border-[#DFD0EC] shadow-2xs hover:border-[#7043A0]'
        }`}
      >
        {/* 1. Top Image Section */}
        <div className="relative bg-[#F8F5FA] overflow-hidden aspect-[4/3.7]">
          <Image
            src={primaryImg}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
          />

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-2.5 left-2.5 z-20">
              <Link
                href={`/productos?category=${product.category.slug}`}
                onClick={handleCategoryClick}
                className="diamond-tag text-[9px] uppercase font-bold tracking-[0.16em] px-2.5 py-0.5 rounded-full text-zinc-900 shadow-xs hover:bg-[#F0E9F5] hover:border-[#7043A0] hover:text-[#3F235F] transition"
              >
                {product.category.name}
              </Link>
            </div>
          )}

          {/* Top-Right Badges: Discount or Tag */}
          <div className="absolute top-2.5 right-2.5 z-20 flex flex-col items-end gap-1">
            {hasDiscount && discountBadgeText && (
              <span className="bg-gradient-to-r from-[#3F235F] to-[#7043A0] text-white text-[9.5px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider">
                {discountBadgeText}
              </span>
            )}
            {product.tag && (
              <span className="bg-white/95 text-[#3F235F] border border-[#DFD0EC] text-[8.5px] uppercase font-bold px-2 py-0.5 rounded-full shadow-xs">
                {product.tag}
              </span>
            )}
          </div>

          {/* Desktop Hover Action: Compra Rápida button */}
          <div className="hidden lg:flex absolute inset-x-3 bottom-2.5 z-20 items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleQuickBuyClick}
              className="w-full btn-purple-diamond text-[10.5px] uppercase tracking-wider font-bold py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shimmer-button cursor-pointer"
            >
              <ShoppingBag size={13} />
              Compra Rápida
            </button>
          </div>
        </div>

        {/* 2. Geometric Diamond Facet Divider with Enriched Diamond Badge */}
        <div className="relative w-full flex items-center justify-center -my-3 z-10 pointer-events-none">
          <div className="w-full h-[1.5px] bg-gradient-to-r from-transparent via-[#DFD0EC] to-transparent" />
          <div className="absolute bg-white px-2.5 py-1 rounded-full border border-[#DFD0EC] shadow-xs flex items-center justify-center">
            <RoisinDiamond size={13} color="#7043A0" />
          </div>
        </div>

        {/* 3. Product Content Area */}
        <div className="p-3.5 sm:p-4 pt-4 flex flex-col justify-between flex-1 space-y-2.5">
          <div className="space-y-0.5">
            <h3 className="font-sans text-xs sm:text-sm font-bold text-zinc-900 leading-snug line-clamp-1 group-hover:text-[#3F235F] transition-colors">
              {product.title}
            </h3>
            <p className="text-[10px] text-zinc-400 font-medium truncate">
              {product.shortDescription || 'Plata de Ley 925 & Baño de Oro 18k'}
            </p>
          </div>

          {/* Price & Mobile Action Row */}
          <div className="flex items-center justify-between pt-1.5 border-t border-[#F8F5FA]">
            <div>
              <span className="text-[9px] text-zinc-400 block uppercase tracking-wider font-bold">
                Precio
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="font-sans text-base sm:text-lg font-bold text-[#3F235F]">
                  ${price.toFixed(2)}
                </span>
                {compareAt && compareAt > price && (
                  <span className="text-[11px] text-zinc-400 line-through font-normal">
                    ${compareAt.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Action Button */}
            <div className="lg:hidden">
              <button
                onClick={handleQuickBuyClick}
                className="btn-purple-diamond p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer"
                aria-label="Compra rápida"
              >
                <ShoppingBag size={13} />
                <span className="text-[10px]">Añadir</span>
              </button>
            </div>
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

