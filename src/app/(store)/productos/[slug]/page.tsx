import { getProductBySlug, getProducts } from '@/services/catalog.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/storefront/ProductGallery';
import AddToCartSection from '@/components/storefront/AddToCartSection';
import ProductCard from '@/components/storefront/ProductCard';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { Sparkles, ShieldCheck, Truck, RefreshCw, Heart, Gift } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Joya no encontrada | ROISIN' };

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

  // Fetch related products from the same category or general catalog
  const { products: relatedProducts } = await getProducts({
    categorySlug: product.category?.slug,
    limit: 4,
  });

  const filteredRelated = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-10 sm:py-12 space-y-16">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="text-[11px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
        <Link href="/" className="hover:text-[#D33658] transition">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-[#D33658] transition">Catálogo</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              href={`/productos?category=${product.category.slug}`}
              className="hover:text-[#D33658] transition"
            >
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-zinc-900 font-semibold truncate max-w-[200px] sm:max-w-none">
          {product.title}
        </span>
      </nav>

      {/* Main Grid: Gallery + Purchasing Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-10 lg:gap-16 items-start">
        {/* Left Column: Gallery */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Right Column: Details & Purchasing */}
        <div className="flex flex-col space-y-7">
          <div className="space-y-1.5">
            {product.category && (
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.25em] text-[#D33658]">
                <RoisinDiamond size={11} color="#E65573" />
                {product.category.name}
              </span>
            )}
            <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Interactive Pricing, Variant Selection and AddToCart */}
          <AddToCartSection product={product} />

          {/* Description & Materials Accordion */}
          <div className="pt-6 border-t border-[#FAD1DC] space-y-4">
            <h2 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-2">
              <RoisinDiamond size={13} color="#E65573" /> Descripción & Detalles de la Joya
            </h2>
            <div className="text-xs text-zinc-600 leading-relaxed whitespace-pre-line space-y-2 font-light">
              <p>{product.description}</p>
            </div>
          </div>

          {/* Luxury Gift Presentation Box Info */}
          <div className="bg-[#FFF5F7] p-6 rounded-3xl border border-[#FAD1DC] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
              <Gift size={16} className="text-[#D33658]" />
              <span>Experiencia de Regalo ROISIN</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed font-light">
              Tu joya se entrega cuidadosamente protegida en un estuche de terciopelo o caja rígida de regalo lista para entregar, con tarjeta de dedicatoria incluida.
            </p>
          </div>

          {/* Care Tips */}
          <div className="bg-white p-6 rounded-3xl border border-[#FAD1DC] space-y-2 text-xs">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <Sparkles size={15} className="text-[#E65573]" /> Cuidados y Mantenimiento:
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
              Para conservar el brillo intacto de la plata 925 y el baño de oro 18k, evita el contacto directo con perfumes o químicos agresivos. Limpia suavemente con un paño de microfibra tras cada uso.
            </p>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {filteredRelated.length > 0 && (
        <section className="pt-16 border-t border-[#FAD1DC] space-y-8">
          <div className="text-center max-w-xl mx-auto space-y-1.5">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#D33658]">
              Sugerencias para Ti
            </span>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-zinc-900">
              También te podría enamorar
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {filteredRelated.map((p) => (
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
        </section>
      )}
    </div>
  );
}
