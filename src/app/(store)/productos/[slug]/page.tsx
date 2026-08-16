import { getProductBySlug } from '@/services/catalog.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/storefront/ProductGallery';
import AddToCartSection from '@/components/storefront/AddToCartSection';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Producto no encontrado | ROISIN' };

  const primaryImg = product.images.find((i) => i.isPrimary)?.url || product.images[0]?.url;

  return {
    title: `${product.title} | ROISIN Joyas`,
    description: product.description.substring(0, 160),
    openGraph: {
      title: `${product.title} - ROISIN Joyas`,
      description: product.description.substring(0, 160),
      url: `https://roisinjoyas.com/productos/${product.slug}`,
      images: primaryImg ? [{ url: primaryImg }] : [],
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0];

  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: product.images.map((i) => i.url),
    description: product.description,
    sku: product.variants[0]?.sku || product.slug,
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: Number(product.basePrice).toFixed(2),
      availability: 'https://schema.org/InStock',
      url: `https://roisinjoyas.com/productos/${product.slug}`,
    },
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="mb-8 text-xs text-gray-500 uppercase tracking-widest flex items-center gap-2">
        <Link href="/" className="hover:text-black transition">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-black transition">Catálogo</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              href={`/productos?category=${product.category.slug}`}
              className="hover:text-black transition"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-black font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.title}
        </span>
      </nav>

      {/* Main Grid: Gallery + Purchasing Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-16 items-start">
        {/* Left Column: Gallery */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Right Column: Details & Purchasing */}
        <div className="flex flex-col space-y-6">
          <div>
            {product.category && (
              <span className="text-[11px] uppercase font-bold tracking-[0.2em] text-gray-500 block mb-1">
                {product.category.name}
              </span>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Interactive Pricing, Variant Selection and AddToCart */}
          <AddToCartSection product={product} />

          {/* Description & Materials Accordion/Details */}
          <div className="pt-6 border-t border-gray-100 space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-wider text-gray-900">
              Descripción y Detalles
            </h2>
            <div className="text-xs text-gray-600 leading-relaxed whitespace-pre-line space-y-2">
              <p>{product.description}</p>
            </div>
          </div>

          {/* Care Tips */}
          <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100 space-y-1.5 text-xs text-zinc-600">
            <h3 className="font-semibold text-zinc-900">Cuidados de tu joya Roisin:</h3>
            <p className="text-[11px] text-zinc-500">
              Evita el contacto directo con perfumes o cloro. Guarda tu joya en su bolsa de terciopelo o caja individual para mantener su brillo intacto.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
