'use client';

import { useState } from 'react';
import { adminAdjustStockAction } from '@/lib/actions/admin.actions';
import Image from 'next/image';
import { Plus, Minus, AlertTriangle, CheckCircle2 } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

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
    <div className="bg-white rounded-3xl border border-[#DFD0EC] shadow-xs overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#DFD0EC] bg-[#F8F5FA] text-zinc-900 font-bold">
              <th className="p-4 uppercase tracking-wider">Joya / Variante</th>
              <th className="p-4 uppercase tracking-wider">SKU</th>
              <th className="p-4 uppercase tracking-wider">Precio</th>
              <th className="p-4 uppercase tracking-wider">Existencias</th>
              <th className="p-4 uppercase tracking-wider">Nivel de Stock</th>
              <th className="p-4 uppercase tracking-wider text-right">Ajuste Rápido (+/-)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DFD0EC]/60">
            {items.map((item) => (
              <tr key={item.id} className="hover:bg-[#F8F5FA]/50 transition">
                <td className="p-4">
                  <div className="flex items-center gap-3.5">
                    <div className="relative w-12 h-12 rounded-2xl bg-[#F8F5FA] overflow-hidden border border-[#DFD0EC] shrink-0 shadow-2xs">
                      <Image src={item.imageUrl} alt="" fill className="object-cover" />
                    </div>
                    <span className="font-bold text-zinc-900">{item.productTitle}</span>
                  </div>
                </td>
                <td className="p-4 font-mono font-bold text-zinc-700">{item.sku}</td>
                <td className="p-4 font-sans font-bold text-[#3F235F] text-sm">${item.price.toFixed(2)}</td>
                <td className="p-4">
                  <span className="text-base font-sans font-bold text-zinc-900">{item.quantity}</span>
                  <span className="text-zinc-400 text-[10px] block font-light">unidades</span>
                </td>
                <td className="p-4">
                  {item.quantity <= 0 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-red-50 text-red-700 border border-red-200">
                      <AlertTriangle size={12} /> Agotado
                    </span>
                  ) : item.quantity <= 5 ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200">
                      <AlertTriangle size={12} /> Stock Crítico
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200">
                      <CheckCircle2 size={12} /> Óptimo
                    </span>
                  )}
                </td>
                <td className="p-4 text-right">
                  <div className="inline-flex items-center gap-1 bg-[#F8F5FA] p-1 rounded-2xl border border-[#DFD0EC] shadow-2xs">
                    <button
                      onClick={() => handleAdjust(item.variantId, -5)}
                      disabled={loadingId === item.variantId || item.quantity < 5}
                      className="px-2.5 py-1 bg-white hover:bg-[#F0E9F5] rounded-xl text-zinc-700 hover:text-[#3F235F] font-bold disabled:opacity-30 transition cursor-pointer text-[11px]"
                      title="Restar 5 unidades"
                    >
                      -5
                    </button>
                    <button
                      onClick={() => handleAdjust(item.variantId, -1)}
                      disabled={loadingId === item.variantId || item.quantity < 1}
                      className="p-1.5 bg-white hover:bg-[#F0E9F5] rounded-xl text-zinc-700 hover:text-[#3F235F] font-bold disabled:opacity-30 transition cursor-pointer"
                      title="Restar 1 unidad"
                    >
                      <Minus size={13} />
                    </button>
                    <button
                      onClick={() => handleAdjust(item.variantId, 1)}
                      disabled={loadingId === item.variantId}
                      className="p-1.5 bg-white hover:bg-[#F0E9F5] rounded-xl text-zinc-700 hover:text-[#3F235F] font-bold disabled:opacity-30 transition cursor-pointer"
                      title="Añadir 1 unidad"
                    >
                      <Plus size={13} />
                    </button>
                    <button
                      onClick={() => handleAdjust(item.variantId, 5)}
                      disabled={loadingId === item.variantId}
                      className="px-2.5 py-1 bg-white hover:bg-[#F0E9F5] rounded-xl text-zinc-700 hover:text-[#3F235F] font-bold disabled:opacity-30 transition cursor-pointer text-[11px]"
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
                <td colSpan={6} className="p-10 text-center text-zinc-400 font-light">
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

