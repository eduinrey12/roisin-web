import { adminGetAllProducts } from '@/services/catalog.service';
import Link from 'next/link';
import Image from 'next/image';
import { Plus, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import ProductListClient from './ProductListClient';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const products = await adminGetAllProducts();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900">Catálogo de Productos</h1>
          <p className="text-xs text-zinc-500 mt-1">
            Administra tus joyas, imágenes, precios e inventario
          </p>
        </div>

        <Link
          href="/admin/productos/nuevo"
          className="inline-flex items-center gap-2 text-xs uppercase tracking-widest font-bold bg-black text-white px-5 py-3 rounded-xl hover:bg-zinc-800 transition shadow-sm"
        >
          <Plus size={16} /> Crear Nueva Joya
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
          imageUrl: p.images[0]?.url || '/placeholder.png',
          variantsCount: p.variants.length,
          totalStock: p.variants.reduce((acc, v) => acc + (v.inventory?.quantity || 0), 0),
        }))}
      />
    </div>
  );
}
