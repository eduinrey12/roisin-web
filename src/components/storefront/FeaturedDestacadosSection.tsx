'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ShoppingBag, ArrowRight, Sparkles, Gem } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import QuickViewModal from './QuickViewModal';

interface ProductItem {
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
  variants?: any[];
  optionGroupLinks?: any[];
}

interface FeaturedDestacadosSectionProps {
  products: ProductItem[];
}

export default function FeaturedDestacadosSection({ products }: FeaturedDestacadosSectionProps) {
  const router = useRouter();
  const [selectedQuickViewProduct, setSelectedQuickViewProduct] = useState<ProductItem | null>(null);

  if (!products || products.length === 0) return null;

  // Bento Grid: 1 Top Featured (#1 best seller / most popular) + 5 Secondary products (#2 to #6) + 1 'Ver Más' Card (Total 7 slots)
  const mainProduct = products[0];
  const secondaryProducts = products.slice(1, 6);

  const renderProductImage = (p: ProductItem) => {
    return (
      p.images.find((i) => i.isPrimary)?.url ||
      p.images[0]?.url ||
      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop'
    );
  };

  const getDiscountBadge = (p: ProductItem) => {
    const price = Number(p.basePrice);
    const compareAt = p.compareAtPrice ? Number(p.compareAtPrice) : null;
    if (p.discountPercent && p.discountPercent > 0) {
      return `-${p.discountPercent}%`;
    }
    if (compareAt && compareAt > price) {
      return `-${Math.round(((compareAt - price) / compareAt) * 100)}%`;
    }
    return null;
  };

  return (
    <>
      <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
        {/* Centered Clean Section Title */}
        <div className="text-center max-w-xl mx-auto mb-8 sm:mb-10 space-y-2">
          <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight flex items-center justify-center gap-2.5">
            <RoisinDiamond size={18} color="#7043A0" />
            <span>Destacados</span>
            <RoisinDiamond size={18} color="#7043A0" />
          </h2>
          <p className="text-xs sm:text-sm text-zinc-500 font-light max-w-md mx-auto">
            Nuestras piezas más icónicas en Plata de Ley 925 y Baño de Oro 18k con mayor preferencia.
          </p>
        </div>

        {/* Bento Grid: 1 Large Card (Left) + 5 Compact Product Cards + 1 'Ver Más' Card (Right 3x2 Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6 items-stretch">
          {/* 1. Large Featured Card (Left Column, spans 5 cols out of 12 on large screens) */}
          {mainProduct && (
            <div
              onClick={() => router.push(`/productos/${mainProduct.slug}`)}
              className="lg:col-span-5 group relative flex flex-col justify-between rounded-3xl overflow-hidden bg-gradient-to-br from-[#2A1442] via-[#3F235F] to-[#1B1124] text-white border border-[#552E80] shadow-xl hover:shadow-2xl hover:border-[#DFD0EC] transition-all duration-300 cursor-pointer select-none"
            >
              {/* Image Section */}
              <div className="relative bg-[#1A1024] aspect-[4/3.8] lg:aspect-auto lg:h-[380px] w-full overflow-hidden">
                <Image
                  src={renderProductImage(mainProduct)}
                  alt={mainProduct.title}
                  fill
                  sizes="(max-width: 1024px) 100vw, 42vw"
                  className="object-cover object-center group-hover:scale-106 transition-transform duration-700 ease-out opacity-90 group-hover:opacity-100"
                  priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#2A1442] via-transparent to-transparent opacity-80" />

                {/* Badges */}
                <div className="absolute top-3.5 left-3.5 z-20 flex items-center gap-2">
                  <span className="bg-gradient-to-r from-amber-400 to-amber-500 text-zinc-950 text-[10px] uppercase font-black tracking-wider px-3 py-1 rounded-full shadow-md flex items-center gap-1">
                    <Sparkles size={11} className="fill-zinc-950" /> Más Deseada
                  </span>
                  {mainProduct.category && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-black/40 text-white backdrop-blur-md border border-white/20">
                      {mainProduct.category.name}
                    </span>
                  )}
                </div>

                {getDiscountBadge(mainProduct) && (
                  <div className="absolute top-3.5 right-3.5 z-20">
                    <span className="bg-gradient-to-r from-[#7043A0] to-[#3F235F] text-white text-[11px] uppercase font-black px-3 py-1 rounded-full shadow-md border border-white/20">
                      {getDiscountBadge(mainProduct)}
                    </span>
                  </div>
                )}
              </div>

              {/* Main Product Info */}
              <div className="p-5 sm:p-6 flex flex-col justify-between flex-1 space-y-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-[#DFD0EC]/70">
                    #1 Más Vendida
                  </span>
                  <h3 className="font-sans text-lg sm:text-xl font-extrabold text-white leading-snug group-hover:text-[#DFD0EC] transition-colors">
                    {mainProduct.title}
                  </h3>
                  <p className="text-xs text-zinc-300 font-light line-clamp-2 leading-relaxed">
                    {mainProduct.shortDescription || 'Plata de Ley 925 Certificada & Baño de Oro 18k con empaque de lujo.'}
                  </p>
                </div>

                {/* Price & Action */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider font-bold text-[#DFD0EC]/60 block">
                      Precio Exclusivo
                    </span>
                    <div className="flex items-baseline gap-2">
                      <span className="font-sans text-2xl font-black text-amber-300">
                        ${Number(mainProduct.basePrice).toFixed(2)}
                      </span>
                      {mainProduct.compareAtPrice && Number(mainProduct.compareAtPrice) > Number(mainProduct.basePrice) && (
                        <span className="text-xs text-zinc-400 line-through font-normal">
                          ${Number(mainProduct.compareAtPrice).toFixed(2)}
                        </span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedQuickViewProduct(mainProduct);
                    }}
                    className="px-5 py-2.5 rounded-2xl bg-white text-[#3F235F] hover:bg-[#F0E9F5] text-xs uppercase font-extrabold tracking-wider transition active:scale-95 shadow-md flex items-center gap-1.5 cursor-pointer"
                  >
                    <ShoppingBag size={14} />
                    <span>Ver Joya</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* 2. Secondary 5 Products + 1 'Ver Más' Card (Right Column, spans 7 cols out of 12: 3x2 grid) */}
          <div className="lg:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-3.5 sm:gap-4.5">
            {secondaryProducts.map((p) => {
              const price = Number(p.basePrice);
              const compareAt = p.compareAtPrice ? Number(p.compareAtPrice) : null;
              const discountText = getDiscountBadge(p);

              return (
                <div
                  key={p.id}
                  onClick={() => router.push(`/productos/${p.slug}`)}
                  className="group relative flex flex-col justify-between bg-white rounded-2xl overflow-hidden border border-[#DFD0EC] shadow-2xs hover:shadow-xl hover:border-[#7043A0] transition-all duration-300 cursor-pointer select-none"
                >
                  {/* Compact Image */}
                  <div className="relative bg-[#F8F5FA] aspect-[4/3.4] overflow-hidden">
                    <Image
                      src={renderProductImage(p)}
                      alt={p.title}
                      fill
                      sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                      className="object-cover object-center group-hover:scale-106 transition-transform duration-500 ease-out"
                    />

                    {/* Category or Discount Badge */}
                    {discountText ? (
                      <div className="absolute top-2 right-2 z-10">
                        <span className="bg-gradient-to-r from-[#3F235F] to-[#7043A0] text-white text-[9.5px] uppercase font-black px-2 py-0.5 rounded-full shadow-xs">
                          {discountText}
                        </span>
                      </div>
                    ) : p.category ? (
                      <div className="absolute top-2 left-2 z-10">
                        <span className="bg-white/95 text-zinc-900 text-[9px] uppercase font-bold px-2 py-0.5 rounded-full shadow-2xs">
                          {p.category.name}
                        </span>
                      </div>
                    ) : null}

                    {/* Desktop Quick Buy Floating Button */}
                    <div className="hidden sm:flex absolute inset-x-2 bottom-2 z-10 items-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuickViewProduct(p);
                        }}
                        className="w-full btn-purple-diamond text-[10px] uppercase font-bold tracking-wider py-1.5 px-2 rounded-xl flex items-center justify-center gap-1 shadow-sm cursor-pointer"
                      >
                        <ShoppingBag size={11} /> Compra Rápida
                      </button>
                    </div>
                  </div>

                  {/* Compact Info */}
                  <div className="p-3 pt-2.5 flex flex-col justify-between flex-1 space-y-2">
                    <div>
                      <h4 className="font-sans text-xs font-bold text-zinc-900 group-hover:text-[#3F235F] transition-colors line-clamp-1">
                        {p.title}
                      </h4>
                      <p className="text-[10px] text-zinc-500 truncate font-light mt-0.5">
                        {p.shortDescription || 'Plata de Ley 925 & Oro 18k'}
                      </p>
                    </div>

                    {/* Compact Price */}
                    <div className="flex items-center justify-between pt-1.5 border-t border-[#F8F5FA]">
                      <div className="flex items-baseline gap-1">
                        <span className="font-sans text-sm sm:text-base font-extrabold text-[#3F235F]">
                          ${price.toFixed(2)}
                        </span>
                        {compareAt && compareAt > price && (
                          <span className="text-[10px] text-zinc-400 line-through">
                            ${compareAt.toFixed(2)}
                          </span>
                        )}
                      </div>

                      {/* Mobile Trigger Button */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedQuickViewProduct(p);
                        }}
                        className="sm:hidden p-1.5 rounded-lg btn-purple-diamond text-[10px] cursor-pointer"
                        aria-label="Ver producto"
                      >
                        <ShoppingBag size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 6th Slot: Luxury "Ver Más Joyas" CTA Card */}
            <Link
              href="/productos"
              className="group relative flex flex-col justify-between rounded-2xl overflow-hidden bg-gradient-to-br from-[#2A1442] via-[#3F235F] to-[#1B1124] text-white border border-[#552E80] shadow-2xs hover:shadow-xl hover:border-[#DFD0EC] transition-all duration-300 p-4 text-center select-none"
            >
              <div className="flex-1 flex flex-col items-center justify-center space-y-2 py-2">
                <div className="w-10 h-10 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center text-amber-300 group-hover:scale-110 group-hover:bg-white/20 transition-all shadow-sm">
                  <Gem size={20} className="drop-shadow-2xs" />
                </div>
                <span className="text-[9.5px] uppercase font-bold tracking-widest text-[#DFD0EC]/70 block">
                  Catálogo
                </span>
                <h4 className="font-sans text-xs sm:text-sm font-bold text-white leading-snug">
                  Ver Más Joyas Destacadas
                </h4>
                <p className="text-[10px] text-zinc-300 font-light line-clamp-2">
                  Explora toda nuestra colección exclusiva en Plata 925.
                </p>
              </div>

              <div className="pt-2">
                <span className="w-full inline-flex items-center justify-center gap-1.5 btn-purple-diamond text-[10.5px] uppercase font-bold tracking-wider py-2 px-3 rounded-xl shadow-md group-hover:translate-y-[-1px] transition-transform">
                  <span>Explorar</span>
                  <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick View Modal */}
      {selectedQuickViewProduct && (
        <QuickViewModal
          product={selectedQuickViewProduct as any}
          isOpen={Boolean(selectedQuickViewProduct)}
          onClose={() => setSelectedQuickViewProduct(null)}
        />
      )}
    </>
  );
}
