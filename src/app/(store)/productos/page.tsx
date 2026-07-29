import { getProducts, getCategories } from '@/lib/api/catalog';
import Link from 'next/link';

export default async function CatalogPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; q?: string }>;
}) {
  const { category, q } = await searchParams;
  const products = await getProducts(category);
  const categories = await getCategories();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Catálogo de Productos</h1>
      
      <div className="flex flex-col md:flex-row gap-8">
        <aside className="w-full md:w-64 shrink-0">
          <div className="sticky top-8">
            <h2 className="text-xl font-semibold mb-4">Categorías</h2>
            <ul className="space-y-2">
              <li>
                <Link href="/productos" className={`block hover:text-blue-600 ${!category ? 'font-bold' : ''}`}>
                  Todos los productos
                </Link>
              </li>
              {categories.map((c) => (
                <li key={c.id}>
                  <Link href={`/productos?category=${c.slug}`} className={`block hover:text-blue-600 ${category === c.slug ? 'font-bold' : ''}`}>
                    {c.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </aside>
        
        <main className="flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((p) => (
              <Link key={p.id} href={`/productos/${p.slug}`} className="group block border rounded-lg overflow-hidden hover:shadow-lg transition">
                <div className="aspect-square bg-gray-100 relative">
                  {p.images[0] && (
                    <img src={p.images[0].url} alt={p.images[0].altText || p.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform duration-300" />
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-medium text-lg">{p.title}</h3>
                  <p className="text-gray-600 mt-1">${p.basePrice}</p>
                </div>
              </Link>
            ))}
            {products.length === 0 && (
              <div className="col-span-full py-12 text-center text-gray-500">
                No se encontraron productos en esta categoría.
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}
