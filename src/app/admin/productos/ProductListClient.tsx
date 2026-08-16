'use client';

import { useState } from 'react';
import {
  adminUpdateProductStatusAction,
  adminDeleteProductAction,
} from '@/lib/actions/admin.actions';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';

interface ProductItem {
  id: string;
  title: string;
  slug: string;
  basePrice: number;
  categoryName: string;
  isActive: boolean;
  imageUrl: string;
  variantsCount: number;
  totalStock: number;
}

export default function ProductListClient({ products: initialProducts }: { products: ProductItem[] }) {
  const [products, setProducts] = useState<ProductItem[]>(initialProducts);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleToggleStatus = async (id: string, current: boolean) => {
    setLoadingId(id);
    const res = await adminUpdateProductStatusAction(id, !current);
    setLoadingId(null);
    if (res.success) {
      setProducts(products.map((p) => (p.id === id ? { ...p, isActive: !current } : p)));
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este producto? Esta acción no se puede deshacer.')) return;
    setLoadingId(id);
    const res = await adminDeleteProductAction(id);
    setLoadingId(null);
    if (res.success) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-600">
              <th className="p-4 font-bold uppercase tracking-wider">Joya / Producto</th>
              <th className="p-4 font-bold uppercase tracking-wider">Categoría</th>
              <th className="p-4 font-bold uppercase tracking-wider">Precio Base</th>
              <th className="p-4 font-bold uppercase tracking-wider">Variantes</th>
              <th className="p-4 font-bold uppercase tracking-wider">Stock Total</th>
              <th className="p-4 font-bold uppercase tracking-wider">Estado</th>
              <th className="p-4 font-bold uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-zinc-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0">
                      <Image src={product.imageUrl} alt="" fill sizes="48px" className="object-cover" />
                    </div>
                    <div>
                      <Link
                        href={`/productos/${product.slug}`}
                        target="_blank"
                        className="font-bold text-black hover:underline flex items-center gap-1"
                      >
                        {product.title} <ExternalLink size={12} className="text-zinc-400" />
                      </Link>
                      <span className="text-[11px] text-zinc-400 font-mono">/{product.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4 text-zinc-700 font-medium">{product.categoryName}</td>
                <td className="p-4 font-bold text-black">${product.basePrice.toFixed(2)}</td>
                <td className="p-4 text-zinc-600">{product.variantsCount} opciones</td>
                <td className="p-4">
                  <span
                    className={`font-semibold ${
                      product.totalStock <= 5 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {product.totalStock} u.
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleStatus(product.id, product.isActive)}
                    disabled={loadingId === product.id}
                    className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition ${
                      product.isActive
                        ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                        : 'bg-zinc-200 text-zinc-600 hover:bg-zinc-300'
                    }`}
                  >
                    {product.isActive ? (
                      <>
                        <CheckCircle2 size={12} /> Activo
                      </>
                    ) : (
                      <>
                        <XCircle size={12} /> Oculto
                      </>
                    )}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={loadingId === product.id}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                    title="Eliminar joya"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="p-8 text-center text-zinc-400">
                  No hay productos registrados en el catálogo.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
