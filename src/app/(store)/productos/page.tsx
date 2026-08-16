import { getProducts, getCategories } from '@/services/catalog.service';
import ProductCard from '@/components/storefront/ProductCard';
import ProductSortSelect from '@/components/storefront/ProductSortSelect';
import Link from 'next/link';
import { Search, SlidersHorizontal } from 'lucide-react';
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
  searchParams: Promise<{ category?: string; q?: string; sort?: string }>;
}) {
  const { category, q, sort } = await searchParams;
  const { products, total } = await getProducts({
    categorySlug: category,
    query: q,
    sort: sort as any,
  });
  const categories = await getCategories();

  const activeCategory = categories.find((c) => c.slug === category);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header & Breadcrumb */}
      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-gray-500 uppercase tracking-widest">
          <Link href="/" className="hover:text-black transition">Inicio</Link>
          <span>/</span>
          <span className="text-black font-semibold">Catálogo</span>
          {activeCategory && (
            <>
              <span>/</span>
              <span className="text-black font-semibold">{activeCategory.name}</span>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pt-2">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
              {activeCategory ? activeCategory.name : 'Catálogo de Joyas'}
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Mostrando {products.length} de {total} piezas exclusivas
            </p>
          </div>

          {/* Search form */}
          <form method="GET" action="/productos" className="relative w-full sm:w-72">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input
              type="text"
              name="q"
              defaultValue={q || ''}
              placeholder="Buscar joyas..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-50 border border-gray-200 rounded-full focus:outline-none focus:border-black focus:bg-white transition"
            />
            {category && <input type="hidden" name="category" value={category} />}
            {sort && <input type="hidden" name="sort" value={sort} />}
          </form>
        </div>
      </div>

      {/* Category Pills & Filters */}
      <div className="flex items-center justify-between gap-4 border-y border-gray-100 py-3 overflow-x-auto scrollbar-none">
        <div className="flex items-center gap-2 shrink-0">
          <Link
            href="/productos"
            className={`text-xs uppercase tracking-wider px-4 py-2 rounded-full font-medium transition ${
              !category
                ? 'bg-black text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Todos
          </Link>
          {categories.map((c) => (
            <Link
              key={c.id}
              href={`/productos?category=${c.slug}${q ? `&q=${q}` : ''}${sort ? `&sort=${sort}` : ''}`}
              className={`text-xs uppercase tracking-wider px-4 py-2 rounded-full font-medium transition shrink-0 ${
                category === c.slug
                  ? 'bg-black text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {c.name}
            </Link>
          ))}
        </div>

        {/* Sort Filter */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="text-xs text-gray-500 hidden sm:inline">Ordenar:</span>
          <ProductSortSelect currentSort={sort} />
        </div>
      </div>

      {/* Product Grid */}
      {products.length === 0 ? (
        <div className="text-center py-24 space-y-4 bg-gray-50 rounded-2xl border border-gray-100">
          <SlidersHorizontal className="mx-auto text-gray-400" size={40} />
          <h3 className="text-lg font-bold text-gray-900">No encontramos productos</h3>
          <p className="text-xs text-gray-500 max-w-sm mx-auto">
            Intenta buscando con otros términos o explora todas nuestras categorías disponibles.
          </p>
          <Link
            href="/productos"
            className="inline-block text-xs uppercase tracking-widest bg-black text-white px-6 py-3 rounded-full font-semibold hover:bg-gray-800 transition"
          >
            Ver todos los productos
          </Link>
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
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
