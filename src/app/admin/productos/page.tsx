import { adminGetAllProducts } from '@/services/catalog.service';
import Link from 'next/link';
import { Plus, PlusCircle, Sparkles } from 'lucide-react';
import ProductListClient from './ProductListClient';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await adminGetAllProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#FAD1DC] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#D33658] mb-1">
            <RoisinDiamond size={13} color="#E65573" /> Colecciones & Piezas
          </div>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
            Catálogo de Joyería
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Administra tus joyas en Plata 925 y Oro 18k, precios, fotos, variantes y stock disponible ({products.length} piezas).
          </p>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="btn-pink-diamond text-xs uppercase tracking-wider font-bold px-6 py-3.5 rounded-2xl flex items-center gap-2 shadow-md shimmer-button"
        >
          <PlusCircle size={16} /> Crear Nueva Joya
        </Link>
      </div>

      <ProductListClient
        products={products.map((p) => ({
          id: p.id,
          title: p.title,
          slug: p.slug,
          basePrice: Number(p.basePrice),
          categoryName: p.category.name,
          isActive: p.isActive,
          imageUrl: p.images[0]?.url || 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop',
          variantsCount: p.variants.length,
          totalStock: p.variants.reduce((acc, v) => acc + (v.inventory?.quantity || 0), 0),
        }))}
      />
    </div>
  );
}
