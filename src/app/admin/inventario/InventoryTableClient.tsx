'use client';

import { useState } from 'react';
import { adminAdjustStockAction } from '@/lib/actions/admin.actions';
import Image from 'next/image';
import { Plus, Minus, History, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface Movement {
  id: string;
  change: number;
  reason: string;
  date: string;
}

interface InventoryItemData {
  id: string;
  variantId: string;
  sku: string;
  productTitle: string;
  price: number;
  quantity: number;
  imageUrl: string;
  lastMovements: Movement[];
}

export default function InventoryTableClient({ items: initialItems }: { items: InventoryItemData[] }) {
  const [items, setItems] = useState<InventoryItemData[]>(initialItems);
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleAdjust = async (variantId: string, delta: number) => {
    setLoadingId(variantId);
    const res = await adminAdjustStockAction(variantId, delta);
    setLoadingId(null);

    if (res.success && res.updated) {
      setItems((prev) =>
        prev.map((i) => (i.variantId === variantId ? { ...i, quantity: res.updated.quantity } : i))
      );
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-zinc-200 shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-zinc-200 bg-zinc-50/70 text-zinc-600">
              <th className="p-4 font-bold uppercase tracking-wider">Joya / Variante</th>
              <th className="p-4 font-bold uppercase tracking-wider">SKU</th>
              <th className="p-4 font-bold uppercase tracking-wider">Precio</th>
              <th className="p-4 font-bold uppercase tracking-wider">Existencias</th>
              <th className="p-4 font-bold uppercase tracking-wider">Estado de Stock</th>
              <th className="p-4 font-bold uppercase tracking-wider text-right">Ajuste Rápido</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-zinc-50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3">
                    <div className="relative w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden border border-zinc-200 shrink-0">
                      <Image src={item.imageUrl} alt="" fill className="object-cover" />
                    </div>
                    <span className="font-bold text-black">{item.productTitle}</span>
                  </div>
                </td>
                <td className="p-4 font-mono text-zinc-700">{item.sku}</td>
                <td className="p-4 font-semibold text-black">${item.price.toFixed(2)}</td>
                <td className="p-4">
                  <span className="text-sm font-bold text-black">{item.quantity}</span>
                  <span className="text-zinc-400 text-[10px] block">unidades</span>
                </td>
                <td className="p-4">
                  {item.quantity <= 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-red-100 text-red-800">
                      <AlertTriangle size={12} /> Agotado
                    </span>
                  ) : item.quantity <= 5 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-amber-100 text-amber-800">
                      <AlertTriangle size={12} /> Stock Bajo
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                      <CheckCircle2 size={12} /> Óptimo
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1.5 bg-zinc-100 p-1 rounded-xl border border-zinc-200">
                    <button
                      onClick={() => handleAdjust(item.variantId, -5)}
                      disabled={loadingId === item.variantId || item.quantity < 5}
                      className="px-2 py-1 bg-white hover:bg-zinc-200 rounded-lg text-zinc-700 font-bold disabled:opacity-30 transition"
                      title="Restar 5 unidades"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleAdjust(item.variantId, -1)}
                      disabled={loadingId === item.variantId || item.quantity < 1}
                      className="p-1.5 bg-white hover:bg-zinc-200 rounded-lg text-zinc-700 font-bold disabled:opacity-30 transition"
                      title="Restar 1 unidad"
                    >
                      <Minus size={12} />
                    </button>
                    <button
                      onClick={() => handleAdjust(item.variantId, 1)}
                      disabled={loadingId === item.variantId}
                      className="p-1.5 bg-white hover:bg-zinc-200 rounded-lg text-zinc-700 font-bold disabled:opacity-30 transition"
                      title="Añadir 1 unidad"
                    >
                      <Plus size={12} />
                    </button>
                    <button
                      onClick={() => handleAdjust(item.variantId, 5)}
                      disabled={loadingId === item.variantId}
                      className="px-2 py-1 bg-white hover:bg-zinc-200 rounded-lg text-zinc-700 font-bold disabled:opacity-30 transition"
                      title="Añadir 5 unidades"
                    >
                      +5
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={6} className="p-8 text-center text-zinc-400">
                  No hay inventario registrado en el sistema.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
