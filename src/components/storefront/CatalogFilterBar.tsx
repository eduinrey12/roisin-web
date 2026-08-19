'use client';

import { useState, useTransition, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SlidersHorizontal, X, Check, ChevronDown, RotateCcw } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface Collection {
  id: string;
  name: string;
  slug: string;
}

interface CatalogFilterBarProps {
  categories: Category[];
  collections?: Collection[];
  totalProducts: number;
  maxCatalogPrice?: number;
}

export default function CatalogFilterBar({
  categories,
  collections = [],
  totalProducts,
  maxCatalogPrice = 120,
}: CatalogFilterBarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const currentCategory = searchParams.get('category') || '';
  const currentCollection = searchParams.get('collection') || '';
  const currentSort = searchParams.get('sort') || 'newest';
  const currentMaxPrice = Number(searchParams.get('maxPrice')) || maxCatalogPrice;
  const currentQuery = searchParams.get('q') || '';
  const isOnlyDiscounts = searchParams.get('ofertas') === 'true';

  // Local states
  const [maxPrice, setMaxPrice] = useState<number>(currentMaxPrice);
  const [isCatDropdownOpen, setIsCatDropdownOpen] = useState(false);
  const [isColDropdownOpen, setIsColDropdownOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const catDropdownRef = useRef<HTMLDivElement>(null);
  const colDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMaxPrice(currentMaxPrice);
  }, [currentMaxPrice]);

  // Close dropdowns on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (catDropdownRef.current && !catDropdownRef.current.contains(e.target as Node)) {
        setIsCatDropdownOpen(false);
      }
      if (colDropdownRef.current && !colDropdownRef.current.contains(e.target as Node)) {
        setIsColDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const updateFilters = (paramsToUpdate: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(paramsToUpdate).forEach(([key, value]) => {
      if (value === null || value === '' || (key === 'maxPrice' && Number(value) >= maxCatalogPrice)) {
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
    updateFilters({ maxPrice: maxPrice < maxCatalogPrice ? String(maxPrice) : null });
  };

  const clearAllFilters = () => {
    setMaxPrice(maxCatalogPrice);
    startTransition(() => {
      router.push('/productos');
    });
    setIsDrawerOpen(false);
  };

  const activeCategoryObj = categories.find((c) => c.slug === currentCategory);
  const activeCollectionObj = collections.find((col) => col.slug === currentCollection);
  const hasActiveFilters = Boolean(
    currentCategory ||
    currentCollection ||
    currentQuery ||
    isOnlyDiscounts ||
    currentMaxPrice < maxCatalogPrice ||
    currentSort !== 'newest'
  );

  return (
    <>
      {/* Desktop & Tablet Filter Bar */}
      <div className="bg-white rounded-3xl border border-[#DFD0EC] p-4 sm:p-5 shadow-xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Selectors Row: Categorías & Colecciones */}
          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            {/* 1. Category Select Input */}
            <div className="relative w-full sm:w-60" ref={catDropdownRef}>
              <button
                type="button"
                onClick={() => setIsCatDropdownOpen(!isCatDropdownOpen)}
                className="w-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] rounded-2xl px-4 py-2.5 text-xs font-bold text-zinc-900 flex items-center justify-between transition-all duration-200 shadow-2xs group cursor-pointer"
              >
                <div className="flex items-center gap-2 truncate">
                  <RoisinDiamond size={13} color="#7043A0" />
                  <span className="truncate">
                    {isOnlyDiscounts
                      ? '🔥 Descuentos'
                      : activeCategoryObj
                      ? activeCategoryObj.name
                      : 'Categorías'}
                  </span>
                </div>
                <ChevronDown
                  size={15}
                  className={`text-[#7043A0] transition-transform duration-200 ${
                    isCatDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Custom Luxury Dropdown Menu */}
              {isCatDropdownOpen && (
                <div className="absolute top-full left-0 mt-2 w-full sm:w-72 bg-white rounded-3xl p-3 shadow-2xl border border-[#DFD0EC] z-50 animate-fade-in space-y-1">
                  <button
                    type="button"
                    onClick={() => {
                      updateFilters({ category: null, ofertas: null });
                      setIsCatDropdownOpen(false);
                    }}
                    className={`w-full p-2.5 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                      !currentCategory && !isOnlyDiscounts
                        ? 'btn-purple-diamond shadow-xs'
                        : 'hover:bg-[#F8F5FA] text-zinc-800'
                    }`}
                  >
                    <span>Todas las Categorías</span>
                    {!currentCategory && !isOnlyDiscounts && <Check size={14} />}
                  </button>

                  {categories.map((cat) => {
                    const isSelected = currentCategory === cat.slug && !isOnlyDiscounts;
                    return (
                      <button
                        key={cat.id}
                        type="button"
                        onClick={() => {
                          updateFilters({ category: cat.slug, ofertas: null });
                          setIsCatDropdownOpen(false);
                        }}
                        className={`w-full p-2.5 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'btn-purple-diamond shadow-xs'
                            : 'hover:bg-[#F8F5FA] text-zinc-800'
                        }`}
                      >
                        <span>{cat.name}</span>
                        {isSelected && <Check size={14} />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Collection Select Input */}
            {collections.length > 0 && (
              <div className="relative w-full sm:w-60" ref={colDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsColDropdownOpen(!isColDropdownOpen)}
                  className="w-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] rounded-2xl px-4 py-2.5 text-xs font-bold text-zinc-900 flex items-center justify-between transition-all duration-200 shadow-2xs group cursor-pointer"
                >
                  <div className="flex items-center gap-2 truncate">
                    <RoisinDiamond size={13} color="#7043A0" />
                    <span className="truncate">
                      {activeCollectionObj ? activeCollectionObj.name : 'Colecciones'}
                    </span>
                  </div>
                  <ChevronDown
                    size={15}
                    className={`text-[#7043A0] transition-transform duration-200 ${
                      isColDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isColDropdownOpen && (
                  <div className="absolute top-full left-0 mt-2 w-full sm:w-72 bg-white rounded-3xl p-3 shadow-2xl border border-[#DFD0EC] z-50 animate-fade-in space-y-1">
                    <button
                      type="button"
                      onClick={() => {
                        updateFilters({ collection: null });
                        setIsColDropdownOpen(false);
                      }}
                      className={`w-full p-2.5 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                        !currentCollection
                          ? 'btn-purple-diamond shadow-xs'
                          : 'hover:bg-[#F8F5FA] text-zinc-800'
                      }`}
                    >
                      <span>Todas las Colecciones</span>
                      {!currentCollection && <Check size={14} />}
                    </button>

                    {collections.map((col) => {
                      const isSelected = currentCollection === col.slug;
                      return (
                        <button
                          key={col.id}
                          type="button"
                          onClick={() => {
                            updateFilters({ collection: col.slug });
                            setIsColDropdownOpen(false);
                          }}
                          className={`w-full p-2.5 rounded-2xl text-left text-xs font-bold flex items-center justify-between transition cursor-pointer ${
                            isSelected
                              ? 'btn-purple-diamond shadow-xs'
                              : 'hover:bg-[#F8F5FA] text-zinc-800'
                          }`}
                        >
                          <span>{col.name}</span>
                          {isSelected && <Check size={14} />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* 2. Dynamic Budget Slider ($5 to maxCatalogPrice) & Sort */}
          <div className="flex items-center justify-between lg:justify-end gap-3.5 pt-2 lg:pt-0 border-t lg:border-t-0 border-[#DFD0EC]">
            {/* Mobile Filter Trigger Button */}
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="lg:hidden flex items-center gap-2 bg-[#F8F5FA] text-zinc-900 border border-[#DFD0EC] px-4 py-2.5 rounded-2xl text-xs font-bold cursor-pointer"
            >
              <SlidersHorizontal size={14} className="text-[#7043A0]" />
              Filtros & Presupuesto
              {hasActiveFilters && <span className="w-2 h-2 rounded-full bg-[#3F235F]" />}
            </button>

            {/* Desktop Dynamic Budget Slider starting from $5 up to highest catalog price */}
            <div className="hidden lg:flex items-center gap-3 bg-[#F8F5FA] border border-[#DFD0EC] px-4 py-2.5 rounded-2xl">
              <span className="text-[11px] font-bold text-zinc-700 uppercase tracking-wider whitespace-nowrap">
                Rango: $5 - ${maxPrice}
              </span>
              <input
                type="range"
                min="5"
                max={maxCatalogPrice}
                step="1"
                value={maxPrice}
                onChange={(e) => handlePriceChange(Number(e.target.value))}
                onMouseUp={handlePriceCommit}
                onTouchEnd={handlePriceCommit}
                className="w-28 accent-[#3F235F] cursor-pointer"
                aria-label="Filtro dinámico de presupuesto"
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
                className="text-xs bg-[#F8F5FA] border border-[#DFD0EC] rounded-2xl px-4 py-2.5 font-bold text-zinc-900 focus:outline-none focus:border-[#7043A0] cursor-pointer"
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
                className="p-2.5 text-zinc-400 hover:text-[#3F235F] hover:bg-[#F0E9F5] rounded-2xl transition cursor-pointer"
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
              <div className="flex items-center justify-between border-b border-[#DFD0EC] pb-4">
                <div className="flex items-center gap-2">
                  <RoisinDiamond size={18} color="#7043A0" />
                  <h3 className="font-sans text-lg font-bold text-zinc-900">Filtros de Joyas</h3>
                </div>
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-zinc-400 hover:text-zinc-700 rounded-full cursor-pointer"
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
                      updateFilters({ category: null, ofertas: null });
                      setIsDrawerOpen(false);
                    }}
                    className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between cursor-pointer ${
                      !currentCategory && !isOnlyDiscounts
                        ? 'btn-purple-diamond'
                        : 'bg-[#F8F5FA] text-zinc-900'
                    }`}
                  >
                    <span>Todas las Categorías</span>
                    {!currentCategory && !isOnlyDiscounts && <Check size={14} />}
                  </button>

                  {categories.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => {
                        updateFilters({ category: c.slug, ofertas: null });
                        setIsDrawerOpen(false);
                      }}
                      className={`w-full p-3 rounded-2xl text-left text-xs font-bold flex items-center justify-between cursor-pointer ${
                        currentCategory === c.slug && !isOnlyDiscounts
                          ? 'btn-purple-diamond'
                          : 'bg-[#F8F5FA] text-zinc-900'
                      }`}
                    >
                      <span>{c.name}</span>
                      {currentCategory === c.slug && !isOnlyDiscounts && <Check size={14} />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Dynamic Price Range Slider starting from $5 */}
              <div className="space-y-3 bg-[#F8F5FA] p-4 rounded-3xl border border-[#DFD0EC]">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-bold text-zinc-800 uppercase tracking-wider">
                    Presupuesto Máximo
                  </span>
                  <span className="font-bold text-[#3F235F] text-sm">${maxPrice}</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max={maxCatalogPrice}
                  step="1"
                  value={maxPrice}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className="w-full accent-[#3F235F] cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-zinc-400 font-bold">
                  <span>$5</span>
                  <span>${maxCatalogPrice}</span>
                </div>
              </div>
            </div>

            {/* Mobile Drawer Footer Actions */}
            <div className="space-y-2 pt-4 border-t border-[#DFD0EC]">
              <button
                onClick={() => {
                  handlePriceCommit();
                  setIsDrawerOpen(false);
                }}
                className="w-full btn-purple-diamond py-3.5 rounded-2xl text-xs uppercase tracking-wider font-bold shadow-md cursor-pointer"
              >
                Aplicar Filtros
              </button>
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="w-full bg-transparent text-zinc-500 hover:text-red-600 py-2 text-xs font-bold text-center cursor-pointer"
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

