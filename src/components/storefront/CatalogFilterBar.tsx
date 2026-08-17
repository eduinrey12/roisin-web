'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Check, ChevronDown, Sparkles, RotateCcw, Search } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface Category {
  id: string;
  name: string;
  slug: string;
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
  const currentMaxPrice = Number(searchParams.get('maxPrice')) || 100;
  const currentQuery = searchParams.get('q') || '';

  // Local states
  const [maxPrice, setMaxPrice] = useState<number>(currentMaxPrice);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);
  const hasActiveFilters = Boolean(currentCategory || currentQuery || currentMaxPrice < 100 || currentSort !== 'newest');

  return (
    <>
      {/* Desktop & Tablet Filter Bar */}
      <div className="bg-white rounded-3xl border border-[#FAD1DC] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* 1. Custom Premium Category Select Input */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="w-full sm:w-72 bg-[#FFF5F7] hover:bg-[#FDE8ED] border border-[#FAD1DC] rounded-2xl px-4 py-3 text-xs font-bold text-zinc-900 flex items-center justify-between transition-all duration-200 shadow-2xs group"
            >
              <div className="flex items-center gap-2.5 truncate">
                <RoisinDiamond size={14} color="#E65573" />
                <span className="truncate">
                  {activeCategoryObj ? activeCategoryObj.name : 'Todas las Joyas (Catálogo)'}
                </span>
              </div>
              <ChevronDown
                size={16}
                className={`text-[#E65573] transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Custom Luxury Dropdown Menu */}
            {isDropdownOpen && (
              <div className="absolute top-full left-0 mt-2 w-full sm:w-80 bg-white rounded-3xl p-3 shadow-2xl border border-[#FAD1DC] z-50 animate-fade-in space-y-1">
                <button
                  type="button"
                  onClick={() => {
                    updateFilters({ category: null });
                    setIsDropdownOpen(false);
                  }}
                  className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition ${
                    !currentCategory
                      ? 'btn-pink-diamond shadow-xs'
                      : 'hover:bg-[#FFF5F7] text-zinc-800'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <RoisinDiamond size={12} color={!currentCategory ? '#FFFFFF' : '#E65573'} />
                    <span>Todas las Colecciones</span>
                  </div>
                  {!currentCategory && <Check size={14} />}
                </button>

                {categories.map((cat) => {
                  const isSelected = currentCategory === cat.slug;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => {
                        updateFilters({ category: cat.slug });
                        setIsDropdownOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition ${
                        isSelected
                          ? 'btn-pink-diamond shadow-xs'
                          : 'hover:bg-[#FFF5F7] text-zinc-800'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <RoisinDiamond size={12} color={isSelected ? '#FFFFFF' : '#E65573'} />
                        <span>{cat.name}</span>
                      </div>
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {/* 2. Interactive Budget Slider, Sort & Mobile Trigger */}
          <div className="flex items-center justify-between lg:justify-end gap-3.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#FAD1DC]">
            {/* Mobile Filter Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-[#FFF5F7] text-zinc-900 border border-[#FAD1DC] px-4 py-2.5 rounded-2xl text-xs font-bold"
            >
              <SlidersHorizontal size={14} className="text-[#E65573]" />
              Filtros & Presupuesto
              {hasActiveFilters && (
                <span className="w-2 h-2 rounded-full bg-[#E65573]" />
              )}
            </button>

            {/* Desktop Budget Slider */}
            <div className="hidden lg:flex items-center gap-3 bg-[#FFF5F7] border border-[#FAD1DC] px-4 py-2.5 rounded-2xl">
              <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider whitespace-nowrap">
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
                className="w-28 accent-[#E65573] cursor-pointer"
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
                className="text-xs bg-[#FFF5F7] border border-[#FAD1DC] rounded-2xl px-4 py-2.5 font-bold text-zinc-900 focus:outline-none focus:border-[#E65573] cursor-pointer"
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
                className="p-2.5 text-zinc-400 hover:text-[#D33658] hover:bg-[#FFF5F7] rounded-2xl transition"
                title="Limpiar filtros"
                aria-label="Limpiar todos los filtros"
              >
                <RotateCcw size={16} />
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
              <div className="flex items-center justify-between border-b border-[#FAD1DC] pb-4">
                <div className="flex items-center gap-2">
                  <RoisinDiamond size={18} color="#E65573" />
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
                  Categoría de Joya
                </span>
                <div className="space-y-1.5">
                  <button
                    onClick={() => {
                      updateFilters({ category: null });
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between ${
                      !currentCategory ? 'btn-pink-diamond' : 'bg-[#FFF5F7] text-zinc-900'
                    }`}
                  >
                    <span>Todas las Colecciones</span>
                    {!currentCategory && <Check size={14} />}
                  </button>
                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateFilters({ category: c.slug });
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between ${
                        currentCategory === c.slug ? 'btn-pink-diamond' : 'bg-[#FFF5F7] text-zinc-900'
                      }`}
                    >
                      <span>{c.name}</span>
                      {currentCategory === c.slug && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Range Slider */}
              <div className="space-y-3 bg-[#FFF5F7] p-4 rounded-3xl border border-[#FAD1DC]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-800 uppercase tracking-wider">Presupuesto Máximo</span>
                  <span className="font-bold text-[#D33658] text-sm">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="100"
                  step="5"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className="w-full accent-[#E65573] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                  <span>$15</span>
                  <span>$100</span>
                </div>
              </div>
            </div>

            {/* Mobile Drawer Footer Actions */}
            <div className="space-y-2 pt-4 border-t border-[#FAD1DC]">
              <button
                onClick={() => {
                  handlePriceCommit();
                  setIsDrawerOpen(false);
                }}
                className="w-full btn-pink-diamond py-4 rounded-2xl text-xs uppercase tracking-wider font-bold shadow-md"
              >
                Aplicar Filtros
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-transparent text-zinc-500 hover:text-red-600 py-2 text-xs font-bold text-center"
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
