'use client';

import { useState } from 'react';
import {
  adminUpdateProductStatusAction,
  adminDeleteProductAction,
} from '@/lib/actions/admin.actions';
import Image from 'next/image';
import Link from 'next/link';
import { Trash2, CheckCircle2, XCircle, ExternalLink } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

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
    if (!confirm('¿Estás seguro de desactivar esta joya? (Baja lógica, sus datos históricos se mantienen).')) return;
    setLoadingId(id);
    const res = await adminDeleteProductAction(id);
    setLoadingId(null);
    if (res.success) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="bg-white rounded-3xl border border-[#DFD0EC] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#DFD0EC] bg-[#F8F5FA] text-zinc-900 font-bold">
              <th className="p-4 uppercase tracking-wider">Joya / Pieza</th>
              <th className="p-4 uppercase tracking-wider">Categoría</th>
              <th className="p-4 uppercase tracking-wider">Precio</th>
              <th className="p-4 uppercase tracking-wider">Variantes</th>
              <th className="p-4 uppercase tracking-wider">Stock Total</th>
              <th className="p-4 uppercase tracking-wider">Visibilidad</th>
              <th className="p-4 uppercase tracking-wider text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFD0EC]/60">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-[#F8F5FA]/50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-14 h-14 rounded-2xl bg-[#F8F5FA] overflow-hidden border border-[#DFD0EC] shrink-0 shadow-2xs">
                      <Image src={product.imageUrl} alt="" fill sizes="56px" className="object-cover" />
                    </div>
                    <div className="space-y-0.5">
                      <Link
                        href={`/productos/${product.slug}`}
                        target="_blank"
                        className="font-bold text-zinc-900 hover:text-[#3F235F] transition flex items-center gap-1.5"
                      >
                        {product.title} <ExternalLink size={12} className="text-[#7043A0]" />
                      </Link>
                      <span className="text-[11px] text-zinc-400 font-mono block">/{product.slug}</span>
                    </div>
                  </div>
                </td>
                <td className="p-4">
                  <span className="inline-flex items-center gap-1 text-[#3F235F] bg-[#F8F5FA] px-2.5 py-1 rounded-full border border-[#DFD0EC] font-bold text-[11px]">
                    <RoisinDiamond size={10} color="#7043A0" />
                    {product.categoryName}
                  </span>
                </td>
                <td className="p-4 font-sans font-bold text-[#3F235F] text-sm">
                  ${product.basePrice.toFixed(2)}
                </td>
                <td className="p-4 text-zinc-600 font-medium">{product.variantsCount} medidas/opciones</td>
                <td className="p-4">
                  <span
                    className={`font-bold px-2.5 py-1 rounded-full text-[11px] ${
                      product.totalStock <= 5
                        ? 'bg-red-50 text-red-700 border border-red-200'
                        : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {product.totalStock} u. disponibles
                  </span>
                </td>
                <td className="p-4">
                  <button
                    onClick={() => handleToggleStatus(product.id, product.isActive)}
                    disabled={loadingId === product.id}
                    className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition cursor-pointer ${
                      product.isActive
                        ? 'bg-emerald-100 text-emerald-900 hover:bg-emerald-200'
                        : 'bg-[#F8F5FA] text-zinc-500 hover:bg-[#F0E9F5] border border-[#DFD0EC]'
                    }`}
                  >
                    {product.isActive ? (
                      <>
                        <CheckCircle2 size={12} className="text-emerald-700" /> Publicado
                      </>
                    ) : (
                      <>
                        <XCircle size={12} className="text-zinc-400" /> Oculto
                      </>
                    )}
                  </button>
                </td>
                <td className="p-4 text-right">
                  <button
                    onClick={() => handleDelete(product.id)}
                    disabled={loadingId === product.id}
                    className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer"
                    title="Desactivar joya"
                    aria-label="Desactivar joya"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="p-10 text-center text-zinc-400 font-light">
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

