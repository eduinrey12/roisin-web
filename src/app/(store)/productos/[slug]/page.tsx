import { getProductBySlug, getProducts } from '@/services/catalog.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/storefront/ProductGallery';
import AddToCartSection from '@/components/storefront/AddToCartSection';
import ProductCard from '@/components/storefront/ProductCard';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { Sparkles, Truck, Gift } from 'lucide-react';
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
    description: product.shortDescription || product.description.substring(0, 160),
    openGraph: {
      title: `${product.title} - ROISIN Joyas`,
      description: product.shortDescription || product.description.substring(0, 160),
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
    <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-8 sm:py-12 space-y-14">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb Navigation */}
      <nav className="text-[11px] text-zinc-500 uppercase tracking-widest flex items-center gap-2">
        <Link href="/" className="hover:text-[#3F235F] transition">Inicio</Link>
        <span>/</span>
        <Link href="/productos" className="hover:text-[#3F235F] transition">Catálogo</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link
              href={`/productos?category=${product.category.slug}`}
              className="hover:text-[#3F235F] transition"
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

      {/* Main Grid: Gallery (Left) + Purchasing Details in Exact Order (Right) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-14 items-start">
        {/* Left Column: Gallery with thumbnails and variant image switching */}
        <ProductGallery images={product.images} title={product.title} />

        {/* Right Column: Title -> Short Desc -> Long Desc -> Variants -> Dedication -> Add to Cart */}
        <div className="flex flex-col space-y-6">
          <div className="space-y-1.5">
            {product.category && (
              <span className="inline-flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F]">
                <RoisinDiamond size={11} color="#7043A0" />
                {product.category.name}
              </span>
            )}
            {/* 1. Title / Name */}
            <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
              {product.title}
            </h1>
          </div>

          {/* Interactive Pricing, Short/Long Description, Size Selector, Dedication, AddToCart/BuyNow */}
          <AddToCartSection product={product} />

          {/* Luxury Gift Presentation Box Info */}
          <div className="bg-[#F8F5FA] p-5 rounded-3xl border border-[#DFD0EC] space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 uppercase tracking-wider">
              <Gift size={16} className="text-[#3F235F]" />
              <span>Experiencia de Regalo ROISIN Diamante Morado</span>
            </div>
            <p className="text-[11px] text-zinc-600 leading-relaxed font-light">
              Tu joya se entrega protegida en un estuche rígido de lujo con lazo de seda y tarjeta para dedicatoria personalizada lista para entregar.
            </p>
          </div>

          {/* Care Tips */}
          <div className="bg-white p-5 rounded-3xl border border-[#DFD0EC] space-y-2 text-xs">
            <h3 className="font-semibold text-zinc-900 flex items-center gap-2">
              <Sparkles size={15} className="text-[#7043A0]" /> Cuidados y Mantenimiento:
            </h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed font-light">
              Para conservar el brillo intacto de la plata 925 y el baño de oro 18k, evita el contacto con perfumes o químicos agresivos. Limpia suavemente con el paño de microfibra tras cada uso.
            </p>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {filteredRelated.length > 0 && (
        <section className="pt-12 border-t border-[#DFD0EC] space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#3F235F]">
              Sugerencias para Ti
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900">
              También te podría enamorar
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {filteredRelated.map((p) => (
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
        </section>
      )}
    </div>
  );
}

