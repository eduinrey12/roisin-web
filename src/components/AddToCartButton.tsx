'use client';

import { useCartStore } from '@/lib/store/cartStore';

export default function AddToCartButton({ variantId }: { variantId: string }) {
  const addItem = useCartStore(s => s.addItem);

  const handleAdd = () => {
    addItem(variantId, 1);
  };

  return (
    <button 
      onClick={handleAdd}
      className="bg-black text-white px-8 py-4 rounded-lg font-medium hover:bg-gray-800 transition mt-auto w-full sm:w-auto"
    >
      Añadir al carrito
    </button>
  );
}
