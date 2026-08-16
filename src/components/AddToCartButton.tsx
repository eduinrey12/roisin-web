'use client';

import { useCartStore } from '@/lib/store/cartStore';

export default function AddToCartButton({ variantId }: { variantId: string }) {
  const addItem = useCartStore((s) => s.addItem);

  const handleAdd = () => {
    addItem(variantId, 1);
  };

  return (
    <button
      onClick={handleAdd}
      className="bg-black text-white px-8 py-3.5 rounded-xl font-medium hover:bg-zinc-800 transition mt-auto w-full sm:w-auto text-xs uppercase tracking-wider"
    >
      Añadir a la bolsa
    </button>
  );
}
