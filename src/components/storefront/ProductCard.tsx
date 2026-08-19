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
        className={`group relative flex flex-col justify-between bg-white rounded-3xl overflow-hidden luxury-card-hover cursor-pointer select-none transition-all duration-300 shadow-sm hover:shadow-xl ${
          isMostDesired
            ? 'ring-2 ring-[#7043A0]/60'
            : ''
        }`}
      >
        {/* 1. Top Image Section */}
        <div className="relative bg-[#F8F5FA] overflow-hidden aspect-[4/3.8]">
          <Image
            src={primaryImg}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
          />

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-3 left-3 z-20">
              <Link
                href={`/productos?category=${product.category.slug}`}
                onClick={handleCategoryClick}
                className="text-[11px] uppercase font-bold tracking-wider px-3 py-1 rounded-full text-zinc-900 bg-white/95 shadow-sm hover:bg-[#F0E9F5] hover:text-[#3F235F] transition leading-normal inline-block"
              >
                {product.category.name}
              </Link>
            </div>
          )}

          {/* Top-Right Badges: Discount or Tag */}
          <div className="absolute top-3 right-3 z-20 flex flex-col items-end gap-1.5">
            {hasDiscount && discountBadgeText && (
              <span className="bg-gradient-to-r from-[#3F235F] to-[#7043A0] text-white text-xs uppercase font-black px-3 py-1 rounded-full shadow-md tracking-wider leading-normal inline-block">
                {discountBadgeText}
              </span>
            )}
            {product.tag && (
              <span className="bg-white/95 text-[#3F235F] border border-[#DFD0EC] text-[10.5px] uppercase font-bold px-3 py-1 rounded-full shadow-xs leading-normal inline-block">
                {product.tag}
              </span>
            )}
          </div>

          {/* Desktop Hover Action: Compra Rápida button */}
          <div className="hidden lg:flex absolute inset-x-4 bottom-3 z-20 items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleQuickBuyClick}
              className="w-full btn-purple-diamond text-xs uppercase tracking-wider font-bold py-2.5 px-4 rounded-2xl flex items-center justify-center gap-2 transition active:scale-95 shadow-lg shimmer-button cursor-pointer"
            >
              <ShoppingBag size={14} />
              Compra Rápida
            </button>
          </div>
        </div>

        {/* 2. Geometric Diamond Facet Divider */}
        <div className="relative w-full flex items-center justify-center my-1 z-10 pointer-events-none">
          <div className="w-full h-[1px] bg-gradient-to-r from-transparent via-[#DFD0EC] to-transparent" />
          <div className="absolute bg-white px-3 py-1 rounded-full border border-[#DFD0EC] shadow-2xs flex items-center justify-center">
            <RoisinDiamond size={13} color="#7043A0" />
          </div>
        </div>

        {/* 3. Product Content Area with ample margin */}
        <div className="p-4 sm:p-5 pt-2 flex flex-col justify-between flex-1 space-y-3">
          <div className="space-y-1">
            <h3 className="font-sans text-sm sm:text-base font-bold text-zinc-900 leading-snug line-clamp-1 group-hover:text-[#3F235F] transition-colors">
              {product.title}
            </h3>
            <p className="text-xs text-zinc-500 font-medium truncate">
              {product.shortDescription || 'Plata de Ley 925 & Baño de Oro 18k'}
            </p>
          </div>

          {/* Price & Mobile Action Row */}
          <div className="flex items-center justify-between pt-2 border-t border-[#F8F5FA]">
            <div>
              <span className="text-[10px] text-zinc-400 block uppercase tracking-wider font-bold">
                Precio
              </span>
              <div className="flex items-baseline gap-2">
                <span className="font-sans text-lg sm:text-xl font-bold text-[#3F235F]">
                  ${price.toFixed(2)}
                </span>
                {compareAt && compareAt > price && (
                  <span className="text-xs text-zinc-400 line-through font-normal">
                    ${compareAt.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Action Button */}
            <div className="lg:hidden">
              <button
                onClick={handleQuickBuyClick}
                className="btn-purple-diamond p-2.5 rounded-2xl text-xs font-bold flex items-center gap-1.5 shadow-xs cursor-pointer"
                aria-label="Compra rápida"
              >
                <ShoppingBag size={14} />
                <span className="text-[11px]">Añadir</span>
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

