'use client';

import { useState, useTransition } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Check, ArrowUpDown, DollarSign, RotateCcw } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface Category {
  id: string;
  name: string;
  slug: string;
  _count?: { products: number };
}

interface CatalogFilterBarProps {
  categories: Category[];
  totalProducts: number;
}

export default function CatalogFilterBar({ categories, totalProducts }: CatalogFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMinPrice = Number(searchParams.get('minPrice')) || 0;
  const currentMaxPrice = Number(searchParams.get('maxPrice')) || 100;
  const currentQuery = searchParams.get('q') || '';

  // Local state for interactive slider
  const [maxPrice, setMaxPrice] = useState<number>(currentMaxPrice);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const updateFilters = (paramsToUpdate: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value === null || value === '' || (key === 'maxPrice' && value === '100')) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    startTransition(() => {
      router.push(`/productos?${params.toString()}`);
    });
  };

  const handlePriceChange = (value: number) => {
    setMaxPrice(value);
  };

  const handlePriceCommit = () => {
    updateFilters({ maxPrice: maxPrice < 100 ? String(maxPrice) : null });
  };

  const clearAllFilters = () => {
    setMaxPrice(100);
    startTransition(() => {
      router.push('/productos');
    });
    setIsDrawerOpen(false);
  };

  const hasActiveFilters = Boolean(currentCategory || currentQuery || currentMaxPrice < 100 || currentSort !== 'newest');

  return (
    <>
      {/* Desktop & Tablet Filter Bar */}
      <div className="bg-white rounded-2xl border border-[#F0E6E8] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 1. Category Quick Chips */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
            <button
              onClick={() => updateFilters({ category: null })}
              className={`px-4 py-2 rounded-full text-xs uppercase font-bold tracking-wider transition shrink-0 ${
                !currentCategory
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-[#FAF4F5] text-zinc-700 hover:bg-[#F6E8EB] border border-[#EFCFD6]'
              }`}
            >
              Todas las Joyas
            </button>

            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateFilters({ category: cat.slug })}
                className={`px-4 py-2 rounded-full text-xs uppercase font-bold tracking-wider transition shrink-0 flex items-center gap-1.5 ${
                  currentCategory === cat.slug
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'bg-[#FAF4F5] text-zinc-700 hover:bg-[#F6E8EB] border border-[#EFCFD6]'
                }`}
              >
                <RoisinDiamond size={10} color={currentCategory === cat.slug ? '#E2A3B0' : '#BE6C7C'} />
                {cat.name}
              </button>
            ))}
          </div>

          {/* 2. Actions: Price Range, Sort, Mobile Drawer Trigger */}
          <div className="flex items-center justify-between lg:justify-end gap-3 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#F0E6E8]">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-[#FAF4F5] text-zinc-800 border border-[#EFCFD6] px-4 py-2 rounded-xl text-xs font-bold"
            >
              <SlidersHorizontal size={14} className="text-[#BE6C7C]" />
              Filtros & Precio
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#BE6C7C]" />
              )}
            </button>

            {/* Desktop Interactive Budget Slider */}
            <div className="hidden lg:flex items-center gap-3 bg-[#FAF4F5] border border-[#EFCFD6] px-4 py-2 rounded-xl">
              <span className="text-[11px] font-bold text-zinc-600 uppercase tracking-wider whitespace-nowrap">
                Hasta ${maxPrice}
              </span>
              <input
                type="range"
                min="15"
                max="100"
                step="5"
                value={maxPrice}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                onMouseUp={handlePriceCommit}
                onTouchEnd={handlePriceCommit}
                className="w-24 accent-[#BE6C7C] cursor-pointer"
                aria-label="Filtro de presupuesto máximo"
              />
            </div>

            {/* Sort Selector */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-zinc-500 uppercase tracking-wider hidden sm:inline">
                Ordenar:
              </span>
              <select
                value={currentSort}
                onChange={(e) => updateFilters({ sort: e.target.value })}
                className="text-xs bg-[#FAF4F5] border border-[#EFCFD6] rounded-xl px-3.5 py-2 font-medium text-zinc-800 focus:outline-none focus:border-[#BE6C7C] cursor-pointer"
                aria-label="Ordenar productos"
              >
                <option value="newest">Más Recientes</option>
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
              </select>
            </div>

            {/* Reset Filters */}
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="p-2 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition"
                title="Limpiar filtros"
                aria-label="Limpiar todos los filtros"
              >
                <RotateCcw size={15} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Filters Slide-in Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end animate-fade-in lg:hidden">
          <div
            onClick={() => setIsDrawerOpen(false)}
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
          />

          <div className="relative bg-white w-full max-w-xs h-full p-6 shadow-2xl overflow-y-auto space-y-6 flex flex-col justify-between z-10 animate-slide-left">
            <div className="space-y-6">
              <div className="flex items-center justify-between border-b border-[#F0E6E8] pb-4">
                <div className="flex items-center gap-2">
                  <RoisinDiamond size={16} color="#E2A3B0" />
                  <h3 className="font-serif text-lg font-bold text-zinc-900">Filtros de Joyas</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Category Options */}
              <div className="space-y-2.5">
                <span className="text-xs uppercase font-bold tracking-wider text-zinc-500 block">
                  Categoría
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      updateFilters({ category: null });
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between ${
                      !currentCategory ? 'bg-zinc-900 text-white' : 'bg-[#FAF4F5] text-zinc-800'
                    }`}
                  >
                    <span>Todas las Joyas</span>
                    {!currentCategory && <Check size={14} />}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateFilters({ category: c.slug });
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-xl text-left text-xs font-semibold flex items-center justify-between ${
                        currentCategory === c.slug ? 'bg-zinc-900 text-white' : 'bg-[#FAF4F5] text-zinc-800'
                      }`}
                    >
                      <span>{c.name}</span>
                      {currentCategory === c.slug && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider in Mobile Drawer */}
              <div className="space-y-3 bg-[#FAF4F5] p-4 rounded-2xl border border-[#EFCFD6]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-700 uppercase tracking-wider">Presupuesto Máximo</span>
                  <span className="font-bold text-[#BE6C7C] text-sm">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className="w-full accent-[#BE6C7C] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400">
                  <span>$15</span>
                  <span>$100</span>
                </div>
              </div>
            </div>

            {/* Mobile Drawer Footer Actions */}
            <div className="space-y-2 pt-4 border-t border-[#F0E6E8]">
              <button
                onClick={() => {
                  handlePriceCommit();
                  setIsDrawerOpen(false);
                }}
                className="w-full bg-zinc-900 text-white py-3.5 rounded-xl text-xs uppercase tracking-wider font-bold shadow-md"
              >
                Aplicar Filtros
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-transparent text-zinc-500 hover:text-red-600 py-2 text-xs font-medium text-center"
                >
                  Restablecer Filtros
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
