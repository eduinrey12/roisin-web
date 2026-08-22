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
    product.images?.find((i: any) => i.isPrimary)?.url ||
    product.images?.[0]?.url ||
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
        className={`group relative flex flex-col justify-between rounded-3xl overflow-hidden luxury-card-hover cursor-pointer select-none transition-all duration-300 ${
          isMostDesired
            ? 'bg-gradient-to-br from-[#3F235F] via-[#301A4A] to-[#1B1124] text-white shadow-xl ring-1 ring-[#7043A0]/50'
            : 'bg-white text-zinc-900 shadow-sm hover:shadow-xl'
        }`}
      >
        {/* 1. Top Image Section */}
        <div className="relative bg-[#F8F5FA] overflow-hidden aspect-[4/3.4]">
          <Image
            src={primaryImg}
            alt={product.title}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            unoptimized={primaryImg?.startsWith('/api/uploads/')}
            className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out"
          />

          {/* Category Badge */}
          {product.category && (
            <div className="absolute top-2.5 left-2.5 z-20">
              <Link
                href={`/productos?category=${product.category.slug}`}
                onClick={handleCategoryClick}
                className={`text-[10.5px] uppercase font-bold tracking-wider px-2.5 py-0.5 rounded-full shadow-xs transition leading-normal inline-block ${
                  isMostDesired
                    ? 'text-white bg-black/40 backdrop-blur-xs hover:bg-black/60 border border-white/20'
                    : 'text-zinc-900 bg-white/95 hover:bg-[#F0E9F5] hover:text-[#3F235F]'
                }`}
              >
                {product.category.name}
              </Link>
            </div>
          )}

          {/* Top-Right Badge: Discount */}
          {hasDiscount && discountBadgeText && (
            <div className="absolute top-2.5 right-2.5 z-20">
              <span className="bg-gradient-to-r from-[#3F235F] to-[#7043A0] text-white text-[11px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-md tracking-wider leading-normal inline-block">
                {discountBadgeText}
              </span>
            </div>
          )}

          {/* Desktop Hover Action: Compra Rápida button */}
          <div className="hidden lg:flex absolute inset-x-3 bottom-2.5 z-20 items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
            <button
              onClick={handleQuickBuyClick}
              className={`w-full text-xs uppercase tracking-wider font-bold py-2 px-3 rounded-2xl flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md cursor-pointer ${
                isMostDesired
                  ? 'bg-white text-[#3F235F] hover:bg-[#F0E9F5]'
                  : 'btn-purple-diamond shimmer-button'
              }`}
            >
              <ShoppingBag size={13} />
              Compra Rápida
            </button>
          </div>
        </div>

        {/* 2. Geometric Diamond Facet Divider */}
        <div className="relative w-full flex items-center justify-center my-0.5 z-10 pointer-events-none">
          <div
            className={`w-full h-[1px] bg-gradient-to-r from-transparent ${
              isMostDesired ? 'via-[#DFD0EC]/30' : 'via-[#DFD0EC]'
            } to-transparent`}
          />
          <div
            className={`absolute px-2.5 py-0.5 rounded-full shadow-2xs flex items-center justify-center border ${
              isMostDesired
                ? 'bg-[#2A1442] border-[#552E80]'
                : 'bg-white border-[#DFD0EC]'
            }`}
          >
            <RoisinDiamond size={11} color={isMostDesired ? '#DFD0EC' : '#7043A0'} />
          </div>
        </div>

        {/* 3. Product Content Area */}
        <div className="p-3.5 sm:p-4 pt-1 flex flex-col justify-between flex-1 space-y-2.5">
          <div className="space-y-0.5">
            <h3
              className={`font-sans text-xs sm:text-sm font-bold leading-snug line-clamp-1 transition-colors ${
                isMostDesired
                  ? 'text-white group-hover:text-[#DFD0EC]'
                  : 'text-zinc-900 group-hover:text-[#3F235F]'
              }`}
            >
              {product.title}
            </h3>
            <p
              className={`text-[10.5px] font-medium truncate ${
                isMostDesired ? 'text-[#DFD0EC]/80' : 'text-zinc-500'
              }`}
            >
              {product.shortDescription || 'Plata de Ley 925 & Baño de Oro 18k'}
            </p>
          </div>

          {/* Price & Mobile Action Row */}
          <div
            className={`flex items-center justify-between pt-1.5 border-t ${
              isMostDesired ? 'border-white/10' : 'border-[#F8F5FA]'
            }`}
          >
            <div>
              <span
                className={`text-[9.5px] block uppercase tracking-wider font-bold ${
                  isMostDesired ? 'text-[#DFD0EC]/70' : 'text-zinc-400'
                }`}
              >
                Precio
              </span>
              <div className="flex items-baseline gap-1.5">
                <span
                  className={`font-sans text-base sm:text-lg font-bold ${
                    isMostDesired ? 'text-amber-300' : 'text-[#3F235F]'
                  }`}
                >
                  ${price.toFixed(2)}
                </span>
                {compareAt && compareAt > price && (
                  <span
                    className={`text-[11px] line-through font-normal ${
                      isMostDesired ? 'text-zinc-400' : 'text-zinc-400'
                    }`}
                  >
                    ${compareAt.toFixed(2)}
                  </span>
                )}
              </div>
            </div>

            {/* Mobile Action Button */}
            <div className="lg:hidden">
              <button
                onClick={handleQuickBuyClick}
                className={`p-2 rounded-xl text-xs font-bold flex items-center gap-1 shadow-xs cursor-pointer ${
                  isMostDesired
                    ? 'bg-white text-[#3F235F]'
                    : 'btn-purple-diamond'
                }`}
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

