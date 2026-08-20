import React from 'react';
import Link from 'next/link';
import ProductCard from '@/components/storefront/ProductCard';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { ArrowRight } from 'lucide-react';

interface NewArrivalsSectionProps {
  products: any[];
}

export default function NewArrivalsSection({ products }: NewArrivalsSectionProps) {
  if (!products || products.length === 0) return null;

  return (
    <section className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10">
      {/* Centered Clean Title */}
      <div className="text-center max-w-xl mx-auto mb-10 space-y-2">
        <div className="inline-flex items-center justify-center gap-2 text-xs uppercase font-bold tracking-[0.3em] text-[#3F235F]">
          <RoisinDiamond size={13} color="#7043A0" />
          <span>Últimas Creaciones</span>
          <RoisinDiamond size={13} color="#7043A0" />
        </div>
        <h2 className="font-sans text-2xl sm:text-3xl md:text-4xl font-bold text-zinc-900 tracking-tight">
          Nuevos Ingresos
        </h2>
        <p className="text-xs text-zinc-500 font-light max-w-md mx-auto">
          Descubre los diseños más recientes incorporados a nuestra colección de alta joyería.
        </p>
      </div>

      {/* Standard Product Cards Grid (Keeps standard layout as requested in point 11) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
        {products.map((p) => (
          <div key={p.id} className="flex flex-col">
            <ProductCard
              isMostDesired={false}
              product={{
                id: p.id,
                title: p.title,
                slug: p.slug,
                tag: p.tag || 'Nuevo',
                shortDescription: p.shortDescription,
                basePrice: p.basePrice,
                compareAtPrice: p.compareAtPrice,
                discountPercent: p.discountPercent,
                category: p.category,
                images: p.images,
                variants: p.variants,
                description: p.description,
              }}
            />
          </div>
        ))}
      </div>

      {/* Link to catalog */}
      <div className="text-center pt-8">
        <Link
          href="/productos?sort=newest"
          className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-widest text-[#3F235F] hover:text-[#7043A0] bg-[#F8F5FA] hover:bg-[#F0E9F5] px-6 py-3 rounded-full border border-[#DFD0EC] transition-all shadow-2xs hover:shadow-xs group"
        >
          <span>Ver Todas las Novedades</span>
          <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
        </Link>
      </div>
    </section>
  );
}
