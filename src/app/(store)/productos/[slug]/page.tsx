import { getProductBySlug, getRelatedProducts } from '@/services/catalog.service';
import { getCurrentUser } from '@/lib/auth';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import ProductDetailClient from './ProductDetailClient';
import ProductCard from '@/components/storefront/ProductCard';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { serializePlain } from '@/lib/utils';
import { Sparkles, Truck, Gift, EyeOff } from 'lucide-react';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';
  const product = await getProductBySlug(slug, { allowInactive: isAdmin });
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
  const user = await getCurrentUser();
  const isAdmin = user?.role === 'ADMIN';

  const rawProduct = await getProductBySlug(slug, { allowInactive: isAdmin });

  if (!rawProduct) {
    notFound();
  }

  if (!rawProduct.isActive && !isAdmin) {
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

      {/* Admin Hidden Preview Banner */}
      {!rawProduct.isActive && isAdmin && (
        <div className="p-4 sm:p-5 rounded-2xl bg-amber-50 border-2 border-amber-300 text-amber-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-2.5 rounded-xl bg-amber-200/80 text-amber-900 shrink-0">
              <EyeOff size={22} />
            </div>
            <div className="space-y-0.5">
              <span className="font-bold text-xs uppercase tracking-wider block text-amber-900 flex items-center gap-2">
                Modo Vista Previa (Solo Administrador)
                <span className="text-[10px] bg-amber-200 text-amber-900 font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Borrador Oculto
                </span>
              </span>
              <p className="text-xs text-amber-800 font-light leading-relaxed">
                Esta joya está guardada como <strong>Borrador Oculto</strong>. Los clientes no pueden verla en la tienda hasta que decidas publicarla.
              </p>
            </div>
          </div>
          <Link
            href={`/admin/productos/${rawProduct.id}/editar`}
            className="self-start sm:self-auto px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold shrink-0 transition shadow-xs cursor-pointer hover:scale-105 active:scale-95"
          >
            Editar / Publicar Joya
          </Link>
        </div>
      )}

      {/* Synchronized Product Detail & Dynamic Gallery */}
      <ProductDetailClient product={enhancedProduct} />

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


