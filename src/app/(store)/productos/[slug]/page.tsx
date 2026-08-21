import { getProductBySlug, getRelatedProducts } from '@/services/catalog.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductGallery from '@/components/storefront/ProductGallery';
import AddToCartSection from '@/components/storefront/AddToCartSection';
import ProductCard from '@/components/storefront/ProductCard';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { serializePlain } from '@/lib/utils';
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

  const primaryImg = product.images?.find((i: any) => i.isPrimary)?.url || product.images?.[0]?.url;

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
  const rawProduct = await getProductBySlug(slug);

  if (!rawProduct) {
    notFound();
  }

  let optionGroupLinks = rawProduct.optionGroupLinks;
  if (!optionGroupLinks || optionGroupLinks.length === 0) {
    const { getOrCreatePresentationOptionGroup } = await import('@/services/catalog.service');
    const defaultGroup = await getOrCreatePresentationOptionGroup();
    if (defaultGroup) {
      optionGroupLinks = [
        {
          productId: rawProduct.id,
          groupId: defaultGroup.id,
          group: defaultGroup,
        } as any,
      ];
    }
  }

  const enhancedProduct = serializePlain({
    ...rawProduct,
    optionGroupLinks,
  });
  const product = enhancedProduct;

  // Fetch related/cross-sell products by collection, category or catalog highlights
  const collectionIds = rawProduct.collections?.map((c: any) => c.collectionId) || [];
  const rawRelatedProducts = await getRelatedProducts({
    currentProductId: rawProduct.id,
    categoryId: rawProduct.categoryId,
    categorySlug: rawProduct.category?.slug,
    collectionIds,
    limit: 8,
  });

  const filteredRelated = serializePlain(rawRelatedProducts);

  // Schema.org JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: (product.images || []).map((i: any) => i.url),
    description: product.shortDescription || product.description,
    sku: product.variants[0]?.sku || product.id,
    brand: {
      '@type': 'Brand',
      name: 'ROISIN Joyas',
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'USD',
      price: Number(product.basePrice).toFixed(2),
      availability: 'https://schema.org/InStock',
    },
  };

  return (
    <div className="max-w-[1480px] mx-auto px-4 sm:px-8 lg:px-12 xl:px-16 py-6 sm:py-10 space-y-12">
      {/* Schema.org Injection */}
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

      {/* Main Grid: Gallery (Left - 6 cols, Sticky Scroll) + Purchasing Details (Right - 6 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start">
        {/* Left Column: Sticky Gallery with Direct Navigation Arrows & Discount Badge */}
        <div className="lg:col-span-6 lg:sticky lg:top-24 self-start">
          <ProductGallery
            images={product.images}
            title={product.title}
            discountPercent={product.discountPercent}
            compareAtPrice={product.compareAtPrice}
            basePrice={product.basePrice}
          />
        </div>

        {/* Right Column: Title -> Short Desc -> Long Desc -> Price -> Variants -> Presentations Carousel -> Dedication -> Add to Cart */}
        <div className="lg:col-span-6 flex flex-col">
          <AddToCartSection product={enhancedProduct} />
        </div>
      </div>

      {/* Related Products Section ("Otras personas combinaron con") */}
      {filteredRelated.length > 0 && (
        <section className="pt-12 border-t border-[#DFD0EC] space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-1">
            <span className="text-xs uppercase font-bold tracking-[0.25em] text-[#3F235F] inline-flex items-center gap-1.5">
              <RoisinDiamond size={11} color="#7043A0" /> Combinaciones Ideales
            </span>
            <h2 className="font-sans text-2xl sm:text-3xl font-bold text-zinc-900">
              Otras personas combinaron con
            </h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-5">
            {filteredRelated.map((p: any) => (
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


