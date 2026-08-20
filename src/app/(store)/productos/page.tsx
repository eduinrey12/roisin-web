import { getProducts, getCategories, getCollections, getMaxProductPrice } from '@/services/catalog.service';
import ProductCard from '@/components/storefront/ProductCard';
import CatalogFilterBar from '@/components/storefront/CatalogFilterBar';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo de Joyas en Plata 925 y Oro 18k | ROISIN Diamante Morado',
  description:
    'Explora nuestra colección completa de anillos de promesa, collares, pulseras tennis y aretes con envíos a todo Ecuador.',
};

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    collection?: string;
    promo?: string;
    ofertas?: string;
    q?: string;
    sort?: string;
    minPrice?: string;
    maxPrice?: string;
  }>;
}) {
  const { category, collection, promo, ofertas, q, sort, minPrice, maxPrice } = await searchParams;

  const [productsResult, categories, collections, maxPriceInDb] = await Promise.all([
    getProducts({
      categorySlug: category,
      collectionSlug: collection,
      promoId: promo,
      onlyDiscounts: ofertas === 'true',
      query: q,
      sort: sort as any,
      minPrice: minPrice ? Number(minPrice) : undefined,
      maxPrice: maxPrice ? Number(maxPrice) : undefined,
    }),
    getCategories(),
    getCollections(),
    getMaxProductPrice(),
  ]);

  const { products, total } = productsResult;
  const activeCategory = categories.find((c) => c.slug === category);
  const activeCollection = collections.find((c) => c.slug === collection);

  return (
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 space-y-8">
      {/* 1. Header & Breadcrumbs */}
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-[11px] text-zinc-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-[#3F235F] transition">Inicio</Link>
          <span>/</span>
          <span className="text-zinc-900 font-semibold">Catálogo</span>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-[#3F235F] font-bold">{activeCategory.name}</span>
            </>
          )}
          {activeCollection && (
            <>
              <span>/</span>
              <span className="text-[#7043A0] font-bold">{activeCollection.name}</span>
            </>
          )}
          {ofertas === 'true' && (
            <>
              <span>/</span>
              <span className="text-[#3F235F] font-bold">Descuentos & Ofertas</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-1">
          <div>
            <div className="inline-flex items-center gap-2 text-xs uppercase font-bold tracking-[0.28em] text-[#3F235F] mb-1">
              <RoisinDiamond size={13} color="#7043A0" /> Alta Joyería • Diamante Morado
            </div>
            <h1 className="font-sans text-3xl sm:text-4xl md:text-5xl font-bold text-zinc-900 leading-tight">
              {ofertas === 'true'
                ? 'Piezas con Descuento Especial'
                : activeCategory
                ? activeCategory.name
                : activeCollection
                ? activeCollection.name
                : 'Colección Completa de Joyería'}
            </h1>
            <p className="text-xs sm:text-sm text-zinc-500 mt-1 font-light">
              Mostrando {products.length} de {total} piezas en Plata de Ley 925 y Baño de Oro 18k
            </p>
          </div>

          {/* Quick Search Form */}
          <form method="GET" action="/productos" className="relative w-full sm:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" size={16} />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Buscar joyas..."
              className="w-full pl-11 pr-4 py-2.5 text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-full focus:outline-none focus:border-[#7043A0] focus:bg-white transition placeholder:text-zinc-400 shadow-2xs"
            />
            {category && <input type="hidden" name="category" value={category} />}
            {collection && <input type="hidden" name="collection" value={collection} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </form>
        </div>
      </div>

      {/* 2. Interactive Filter & Sorting Bar with Dynamic Max Price and Collections */}
      <CatalogFilterBar
        categories={categories.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        collections={collections.map((c) => ({ id: c.id, name: c.name, slug: c.slug }))}
        totalProducts={total}
        maxCatalogPrice={maxPriceInDb > 5 ? maxPriceInDb : 120}
      />

      {/* 3. Product Cards Grid */}
      {products.length === 0 ? (
        <div className="text-center py-20 space-y-4 bg-[#F8F5FA] rounded-3xl border border-[#DFD0EC] p-8">
          <div className="p-4 bg-white rounded-full w-16 h-16 mx-auto flex items-center justify-center border border-[#DFD0EC] shadow-xs">
            <SlidersHorizontal className="text-[#3F235F]" size={28} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-sans text-xl font-bold text-zinc-900">
              No encontramos joyas con estos filtros
            </h3>
            <p className="text-xs text-zinc-500 leading-relaxed font-light">
              Intenta ampliando el rango de presupuesto o explorando todas nuestras categorías disponibles.
            </p>
          </div>
          <div className="pt-2">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 text-xs uppercase tracking-widest btn-purple-diamond px-8 py-3.5 rounded-full font-bold transition shadow-md cursor-pointer"
            >
              Ver Todas las Joyas
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-5">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              product={{
                id: p.id,
                title: p.title,
                slug: p.slug,
                tag: p.tag,
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
          ))}
        </div>
      )}
    </div>
  );
}

