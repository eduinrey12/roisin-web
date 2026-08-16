'use client';

import { useRouter, useSearchParams } from 'next/navigation';

export default function ProductSortSelect({ currentSort }: { currentSort?: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sort', e.target.value);
    router.push(`/productos?${params.toString()}`);
  };

  return (
    <select
      value={currentSort || 'newest'}
      onChange={handleChange}
      className="text-xs bg-gray-50 border border-gray-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-black cursor-pointer"
      aria-label="Ordenar productos"
    >
      <option value="newest">Más Recientes</option>
      <option value="price_asc">Precio: Menor a Mayor</option>
      <option value="price_desc">Precio: Mayor a Menor</option>
    </select>
  );
}
