'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useCartStore } from '@/lib/store/cartStore';
import {
  ShoppingBag,
  Check,
  Truck,
  Sparkles,
  ArrowRight,
  PenTool,
  Ruler,
  Gift,
  ShieldCheck,
  Zap,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import SizeGuideModal from './SizeGuideModal';

interface AddToCartSectionProps {
  product: {
    id: string;
    title: string;
    shortDescription?: string | null;
    description: string;
    basePrice: any;
    compareAtPrice?: any;
    discountPercent?: number | null;
    tag?: string | null;
    variants: {
      id: string;
      sku: string;
      price: any;
      compareAtPrice?: any;
      inventory?: { quantity: number } | null;
      attributes?: {
        attributeValue: { value: string; attribute: { name: string } };
      }[];
    }[];
    optionGroupLinks?: {
      group: {
        id: string;
        name: string;
        description?: string | null;
        options: {
          id: string;
          name: string;
          description?: string | null;
          priceModifier: any;
          imageUrl?: string | null;
          isDefault: boolean;
        }[];
      };
    }[];
  };
  onVariantChange?: (variantId: string) => void;
}

export default function AddToCartSection({ product, onVariantChange }: AddToCartSectionProps) {
  const router = useRouter();
  const { addItem, openCart } = useCartStore();
  const packScrollRef = useRef<HTMLDivElement>(null);

  // --- Attribute & Variant Extraction ---
  const { colorAttrValues, sizeAttrValues, hasMultiAttributes } = useMemo(() => {
    const colors = new Set<string>();
    const sizes = new Set<string>();

    product.variants.forEach((v) => {
      v.attributes?.forEach((a) => {
        const attrName = a.attributeValue.attribute.name.toLowerCase();
        if (attrName.includes('color') || attrName.includes('material') || attrName.includes('acabado')) {
          colors.add(a.attributeValue.value);
        } else if (
          attrName.includes('talla') ||
          attrName.includes('medida') ||
          attrName.includes('longitud') ||
          attrName.includes('tamaño')
        ) {
          sizes.add(a.attributeValue.value);
        }
      });
    });

    const colorList = Array.from(colors);
    const sizeList = Array.from(sizes);

    return {
      colorAttrValues: colorList,
      sizeAttrValues: sizeList,
      hasMultiAttributes: colorList.length > 0 && sizeList.length > 0,
    };
  }, [product.variants]);

  // Initial selections
  const [selectedColor, setSelectedColor] = useState<string>(colorAttrValues[0] || '');
  const [selectedSize, setSelectedSize] = useState<string>(sizeAttrValues[0] || '');
  const [selectedVariantId, setSelectedVariantId] = useState<string>(product.variants[0]?.id || '');

  // Options (Presentation / Packaging)
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.optionGroupLinks?.forEach((link) => {
      const defaultOpt = link.group.options.find((o) => o.isDefault) || link.group.options[0];
      if (defaultOpt) {
        initial[link.group.id] = defaultOpt.id;
      }
    });
    return initial;
  });

  const [dedication, setDedication] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  // Sync variant when color or size changes in multi-attribute mode
  useEffect(() => {
    if (!hasMultiAttributes) return;

    let match = product.variants.find((v) => {
      const attrs = v.attributes || [];
      const hasColor = attrs.some((a) => a.attributeValue.value === selectedColor);
      const hasSize = attrs.some((a) => a.attributeValue.value === selectedSize);
      return hasColor && hasSize;
    });

    if (!match) {
      match = product.variants.find((v) => {
        const attrs = v.attributes || [];
        return attrs.some((a) => a.attributeValue.value === selectedColor);
      });
      if (match) {
        const sizeAttr = match.attributes?.find((a) => {
          const name = a.attributeValue.attribute.name.toLowerCase();
          return name.includes('talla') || name.includes('medida');
        });
        if (sizeAttr) {
          setSelectedSize(sizeAttr.attributeValue.value);
        }
      }
    }

    if (match && match.id !== selectedVariantId) {
      setSelectedVariantId(match.id);
      if (onVariantChange) onVariantChange(match.id);
    }
  }, [selectedColor, selectedSize, hasMultiAttributes, product.variants, selectedVariantId, onVariantChange]);

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const variantPrice = currentVariant ? Number(currentVariant.price) : Number(product.basePrice);
  const compareAt = currentVariant?.compareAtPrice
    ? Number(currentVariant.compareAtPrice)
    : product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;

  // Calculate Packaging price additions
  let optionsModifierTotal = 0;
  product.optionGroupLinks?.forEach((link) => {
    const selectedOptId = selectedOptions[link.group.id];
    const optionObj = link.group.options.find((o) => o.id === selectedOptId);
    if (optionObj) {
      optionsModifierTotal += Number(optionObj.priceModifier || 0);
    }
  });

  const finalUnitPrice = variantPrice + optionsModifierTotal;
  const stock = currentVariant?.inventory?.quantity ?? 10;
  const isOutOfStock = stock <= 0;

  const handleSelectSingleVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    if (onVariantChange) onVariantChange(variantId);
  };

  const scrollPack = (direction: 'left' | 'right') => {
    if (!packScrollRef.current) return;
    const amount = direction === 'left' ? -280 : 280;
    packScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleAction = async (directCheckout = false) => {
    if (!currentVariant || isOutOfStock) return;
    setIsAdding(true);
    const optionIds = Object.values(selectedOptions);

    try {
      const success = await addItem(
        currentVariant.id,
        quantity,
        optionIds,
        dedication.trim() || undefined
      );
      if (success) {
        setAddedSuccess(true);
        setTimeout(() => {
          setIsAdding(false);
          setAddedSuccess(false);
          if (directCheckout) {
            router.push('/checkout');
          } else {
            openCart();
          }
        }, 400);
      }
    } catch {
      setIsAdding(false);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* 1. NOMBRE PRINCIPAL DEL PRODUCTO */}
        <div className="space-y-1.5">
          <h1 className="font-sans text-2xl sm:text-3xl lg:text-4xl font-bold text-zinc-900 leading-tight">
            {product.title}
          </h1>

          {/* 2. DESCRIPCIÓN CORTA */}
          {product.shortDescription && (
            <p className="text-xs sm:text-sm text-zinc-600 font-medium leading-relaxed">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* 3. DESCRIPCIÓN LARGA / DETALLES */}
        <div className="bg-[#FAF8FC] p-4 sm:p-5 rounded-3xl border border-[#DFD0EC] space-y-2">
          <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-1.5">
            <RoisinDiamond size={11} color="#7043A0" /> Detalles de la Joya
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed font-light whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* 4. PRECIO & DISPONIBILIDAD */}
        <div className="flex items-baseline justify-between border-b border-[#DFD0EC] pb-4 pt-1">
          <div className="flex items-baseline gap-3">
            <span className="font-sans text-3xl sm:text-4xl font-bold text-[#3F235F]">
              ${finalUnitPrice.toFixed(2)}
            </span>
            {compareAt && compareAt > finalUnitPrice && (
              <span className="text-base text-zinc-400 line-through font-normal">
                ${compareAt.toFixed(2)}
              </span>
            )}
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="bg-[#3F235F] text-white text-[11px] uppercase font-black px-3 py-0.5 rounded-full shadow-xs leading-normal">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>

          <span
            className={`text-xs font-bold px-3.5 py-1 rounded-full ${
              isOutOfStock
                ? 'bg-red-50 text-red-700 border border-red-200'
                : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
            }`}
          >
            {isOutOfStock ? 'Agotado' : 'En Stock'}
          </span>
        </div>

        {/* 5. VARIANTES CONECTADAS (Color / Material & Tallas) */}
        {hasMultiAttributes ? (
          <div className="space-y-4 pt-2 border-t border-[#DFD0EC]">
            {/* 5A. Selector de Color / Material */}
            <div className="space-y-2">
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-800 flex items-center justify-between">
                <span>Color / Material:</span>
                <span className="text-[#7043A0] font-bold lowercase first-letter:uppercase">
                  {selectedColor}
                </span>
              </label>
              <div className="flex flex-wrap gap-2.5">
                {colorAttrValues.map((color) => {
                  const isSelected = color === selectedColor;
                  return (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setSelectedColor(color)}
                      className={`px-4 py-2 text-xs font-bold rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'btn-purple-diamond shadow-xs'
                          : 'border-[#DFD0EC] bg-[#F8F5FA] text-zinc-800 hover:border-[#7043A0]'
                      }`}
                    >
                      {color}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5B. Selector de Talla / Medida */}
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase font-bold tracking-wider text-zinc-800 block">
                  Medida / Talla:
                </label>
                <button
                  type="button"
                  onClick={() => setSizeGuideOpen(true)}
                  className="text-[11px] font-bold text-[#3F235F] hover:text-[#7043A0] inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] transition cursor-pointer shadow-2xs"
                >
                  <Ruler size={13} className="text-[#7043A0]" /> Guía de Tallas
                </button>
              </div>

              <div className="flex flex-wrap gap-2.5">
                {sizeAttrValues.map((size) => {
                  const availableForColor = product.variants.some((v) => {
                    const attrs = v.attributes || [];
                    const matchesColor = attrs.some((a) => a.attributeValue.value === selectedColor);
                    const matchesSize = attrs.some((a) => a.attributeValue.value === size);
                    return matchesColor && matchesSize;
                  });

                  const isSelected = size === selectedSize;

                  return (
                    <button
                      key={size}
                      type="button"
                      disabled={!availableForColor}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs font-bold rounded-2xl border transition cursor-pointer ${
                        isSelected
                          ? 'btn-purple-diamond shadow-xs'
                          : availableForColor
                          ? 'border-[#DFD0EC] bg-[#F8F5FA] text-zinc-800 hover:border-[#7043A0]'
                          : 'border-zinc-200 bg-zinc-100 text-zinc-400 opacity-50 cursor-not-allowed line-through'
                      }`}
                    >
                      {size}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        ) : product.variants.length > 1 ? (
          /* Single-Attribute Variant List */
          <div className="space-y-3 pt-2 border-t border-[#DFD0EC]">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-800 block">
                Seleccionar Medida / Variante
              </label>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-[11px] font-bold text-[#3F235F] hover:text-[#7043A0] inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] transition cursor-pointer shadow-2xs"
              >
                <Ruler size={13} className="text-[#7043A0]" /> Guía de Tallas
              </button>
            </div>
            <div className="flex flex-wrap gap-2.5">
              {product.variants.map((v) => {
                const label =
                  v.attributes?.map((a) => a.attributeValue.value).join(' - ') ||
                  v.sku.split('-').pop() ||
                  v.sku;
                const isSelected = v.id === selectedVariantId;

                return (
                  <button
                    key={v.id}
                    onClick={() => handleSelectSingleVariant(v.id)}
                    className={`px-4 py-2.5 text-xs font-bold rounded-2xl border transition cursor-pointer ${
                      isSelected
                        ? 'btn-purple-diamond shadow-xs'
                        : 'border-[#DFD0EC] bg-[#F8F5FA] text-zinc-800 hover:border-[#7043A0]'
                    }`}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          /* Single variant default button */
          <div className="pt-2 border-t border-[#DFD0EC]">
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="w-full flex items-center justify-between p-3.5 bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] hover:border-[#7043A0] rounded-2xl transition group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2.5 text-xs font-bold text-zinc-900 group-hover:text-[#3F235F]">
                <Ruler size={16} className="text-[#7043A0]" />
                <span>¿Dudas con tu medida? Consulta la Guía Oficial</span>
              </div>
              <span className="text-[11px] font-bold text-[#7043A0] group-hover:translate-x-1 transition-transform">
                Ver Guía →
              </span>
            </button>
          </div>
        )}

        {/* 6. SELECTOR HORIZONTAL DE PRESENTACIÓN & EMPAQUE CON FLECHAS DE NAVEGACIÓN Y PRECIOS DESTACADOS */}
        {product.optionGroupLinks && product.optionGroupLinks.length > 0 && (
          <div className="space-y-3 pt-4 border-t border-[#DFD0EC]">
            {product.optionGroupLinks.map((link) => (
              <div key={link.group.id} className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift size={16} className="text-[#7043A0]" />
                    <label className="text-xs uppercase font-bold tracking-wider text-zinc-900">
                      {link.group.name}
                    </label>
                  </div>

                  {/* Carousel Navigation Arrows */}
                  <div className="flex items-center gap-1.5">
                    <button
                      type="button"
                      onClick={() => scrollPack('left')}
                      className="p-1.5 rounded-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] text-zinc-700 hover:text-[#3F235F] transition cursor-pointer shadow-2xs"
                      aria-label="Presentaciones anteriores"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollPack('right')}
                      className="p-1.5 rounded-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] text-zinc-700 hover:text-[#3F235F] transition cursor-pointer shadow-2xs"
                      aria-label="Ver más presentaciones"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scrollable Presentations Carousel */}
                <div
                  ref={packScrollRef}
                  className="flex gap-3.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2 px-1 -mx-1"
                >
                  {link.group.options.map((opt) => {
                    const isSelected = selectedOptions[link.group.id] === opt.id;
                    const modifier = Number(opt.priceModifier || 0);

                    return (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() =>
                          setSelectedOptions({
                            ...selectedOptions,
                            [link.group.id]: opt.id,
                          })
                        }
                        className={`group relative flex-none w-[240px] sm:w-[260px] flex flex-col rounded-3xl overflow-hidden border-2 text-left transition-all duration-200 cursor-pointer snap-start ${
                          isSelected
                            ? 'border-[#3F235F] ring-2 ring-[#7043A0]/40 shadow-md bg-[#F8F5FA]'
                            : 'border-[#DFD0EC] bg-white hover:border-[#7043A0] hover:shadow-xs'
                        }`}
                      >
                        {/* Packaging Photo */}
                        <div className="relative aspect-[16/11] bg-[#F0E9F5] overflow-hidden">
                          <Image
                            src={
                              opt.imageUrl ||
                              'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'
                            }
                            alt={opt.name}
                            fill
                            sizes="260px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                          {isSelected && (
                            <div className="absolute top-2.5 right-2.5 bg-[#3F235F] text-white p-1.5 rounded-full shadow-md z-10">
                              <Check size={13} />
                            </div>
                          )}

                          {/* Large Prominent Price Badge */}
                          <div className="absolute bottom-2.5 left-2.5 z-10">
                            <span
                              className={`text-xs sm:text-[13px] font-black uppercase px-3.5 py-1.5 rounded-full shadow-lg leading-normal inline-block tracking-wide ${
                                modifier > 0
                                  ? 'bg-gradient-to-r from-[#3F235F] to-[#7043A0] text-white'
                                  : 'bg-white/95 text-zinc-900 border border-[#DFD0EC]'
                              }`}
                            >
                              {modifier > 0 ? `+$${modifier.toFixed(2)}` : 'Incluida'}
                            </span>
                          </div>
                        </div>

                        {/* Label & Description */}
                        <div className="p-3.5 space-y-1">
                          <h4 className="font-sans text-xs sm:text-[13px] font-bold text-zinc-900 leading-snug line-clamp-1">
                            {opt.name}
                          </h4>
                          {opt.description && (
                            <p className="text-[10.5px] text-zinc-500 font-light line-clamp-2 leading-tight">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 7. DEDICATORIA PERMANENTE PARA TARJETA DE REGALO */}
        <div className="pt-4 border-t border-[#DFD0EC] space-y-2.5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-[#3F235F]">
              <PenTool size={14} className="text-[#7043A0]" />
              <span>Dedicatoria para Tarjeta de Regalo (Opcional)</span>
            </div>
            {dedication.length > 0 && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full">
                Dedicatoria agregada
              </span>
            )}
          </div>

          <div className="bg-[#F8F5FA] p-3.5 rounded-2xl border border-[#DFD0EC] space-y-2">
            <label className="text-[11px] text-zinc-600 font-medium block">
              Escribe el mensaje que imprimiremos en la tarjeta de regalo de lujo:
            </label>
            <textarea
              value={dedication}
              onChange={(e) => setDedication(e.target.value.slice(0, 250))}
              rows={3}
              placeholder="Ejemplo: Para el amor de mi vida, gracias por iluminar cada uno de mis días. Te amo infinitamente."
              className="w-full p-3 text-xs bg-white border border-[#DFD0EC] rounded-xl text-zinc-900 focus:outline-none focus:border-[#7043A0] transition resize-none placeholder:text-zinc-400 leading-relaxed shadow-2xs"
            />
            <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
              <span className="text-[#3F235F] font-semibold">Tarjeta personalizada incluida</span>
              <span>{dedication.length} / 250 caracteres</span>
            </div>
          </div>
        </div>

        {/* 8. CANTIDAD & BOTONES DE COMPRA */}
        <div className="space-y-3 pt-3 border-t border-[#DFD0EC]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Cantidad:
            </span>
            <div className="flex items-center border border-[#DFD0EC] rounded-2xl overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3.5 py-1.5 text-zinc-600 hover:bg-[#F8F5FA] font-bold text-sm cursor-pointer"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 py-1 text-xs font-bold text-zinc-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="px-3.5 py-1.5 text-zinc-600 hover:bg-[#F8F5FA] font-bold text-sm cursor-pointer"
                disabled={quantity >= stock}
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={() => handleAction(false)}
              disabled={isOutOfStock || isAdding}
              className="btn-purple-outline w-full py-4 px-6 rounded-2xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <span className="animate-pulse">Añadiendo...</span>
              ) : addedSuccess ? (
                <>
                  <Check size={16} className="text-emerald-600" />
                  <span>¡Añadido!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={16} />
                  <span>Añadir al Carrito</span>
                </>
              )}
            </button>

            {/* Buy Now (Direct Checkout) Button */}
            <button
              type="button"
              onClick={() => handleAction(true)}
              disabled={isOutOfStock || isAdding}
              className="btn-purple-diamond w-full py-4 px-6 rounded-2xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shimmer-button"
            >
              <Zap size={16} />
              <span>Comprar Ahora</span>
            </button>
          </div>
        </div>

        {/* 9. GARANTÍAS DE CONFIANZA */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <div className="flex items-center gap-2 p-3 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC]">
            <ShieldCheck size={18} className="text-[#7043A0] shrink-0" />
            <span className="text-[11px] font-bold text-zinc-800">
              Plata 925 & Oro 18k Genuinos
            </span>
          </div>
          <div className="flex items-center gap-2 p-3 bg-[#F8F5FA] rounded-2xl border border-[#DFD0EC]">
            <Truck size={18} className="text-[#7043A0] shrink-0" />
            <span className="text-[11px] font-bold text-zinc-800">
              Envíos Seguros a Todo Ecuador
            </span>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />
    </>
  );
}
