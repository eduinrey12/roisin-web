import { getProducts, getCategories } from '@/services/catalog.service';
import ProductCard from '@/components/storefront/ProductCard';
import CatalogFilterBar from '@/components/storefront/CatalogFilterBar';
import Link from 'next/link';
import { Search, SlidersHorizontal, Sparkles } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo de Joyas en Plata 925 y Oro 18k | ROISIN',
  description:
    'Explora nuestra colección completa de anillos de promesa, collares, pulseras tennis y aretes con envíos a todo Ecuador.',
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string; sort?: string; minPrice?: string; maxPrice?: string }>;
}) {
  const { category, q, sort, minPrice, maxPrice } = await searchParams;

  const { products, total } = await getProducts({
    categorySlug: category,
    query: q,
    sort: sort as any,
    minPrice: minPrice ? Number(minPrice) : undefined,
    maxPrice: maxPrice ? Number(maxPrice) : undefined,
  });

  const categories = await getCategories();
  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 space-y-8">
      {/* 1. Header & Breadcrumbs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-[#BE6C7C] transition">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Catálogo</span>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-[#BE6C7C] font-semibold">{activeCategory.name}</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.25em] text-[#BE6C7C] mb-1">
              <RoisinDiamond size={11} color="#E2A3B0" /> Joyería de Autor
            </div>
            <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 leading-tight">
              {activeCategory ? activeCategory.name : 'Colección Completa'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1">
              Mostrando {products.length} de {total} piezas exclusivas en Plata 925 y Baño de Oro 18k
            </p>
          </div>

          {/* Quick Search Form */}
          <form method="GET" action="/productos" className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Buscar joyas..."
              className="w-full pl-9 pr-4 py-2.5 text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-full focus:outline-none focus:border-[#BE6C7C] focus:bg-white transition placeholder:text-zinc-400"
            />
            {category && <input type="hidden" name="category" value={category} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </form>
        </div>
      </div>

      {/* 2. Interactive Filter & Sorting Bar */}
      <CatalogFilterBar
        categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        totalProducts={total}
      />

      {/* 3. Product Cards Grid */}
      {products.length === 0 ? (
        <div className="text-center py-24 space-y-5 bg-[#FAF4F5] rounded-3xl border border-[#EFCFD6] p-8">
          <div className="p-4 bg-white rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-[#EFCFD6] shadow-xs">
            <SlidersHorizontal className="text-[#BE6C7C]" size={28} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-serif text-xl font-bold text-zinc-900">
              No encontramos joyas con estos filtros
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed">
              Intenta ampliando el rango de presupuesto o explorando todas nuestras categorías disponibles.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest bg-zinc-900 text-white px-7 py-3.5 rounded-full font-bold hover:bg-black transition shadow-sm"
            >
              Ver Todas las Joyas
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                title: p.title,
                slug: p.slug,
                basePrice: p.basePrice,
                category: p.category,
                images: p.images,
                variants: p.variants,
                description: p.description,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
