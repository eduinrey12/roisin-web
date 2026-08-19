'use client';

import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
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
  Eye,
  X,
  Maximize2,
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
          images?: { id?: string; url: string; altText?: string | null }[];
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
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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

  // Modal for previewing packaging photos in full size
  const [previewOption, setPreviewOption] = useState<{
    groupId: string;
    optionId: string;
    name: string;
    description?: string | null;
    priceModifier: any;
    images: string[];
    selectedImgIdx: number;
  } | null>(null);

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
    const amount = direction === 'left' ? -220 : 220;
    packScrollRef.current.scrollBy({ left: amount, behavior: 'smooth' });
  };

  const handleOpenPreview = (groupId: string, opt: any, e: React.MouseEvent) => {
    e.stopPropagation();
    const imgs =
      opt.images && opt.images.length > 0
        ? opt.images.map((i: any) => i.url)
        : [opt.imageUrl || 'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'];

    setPreviewOption({
      groupId,
      optionId: opt.id,
      name: opt.name,
      description: opt.description,
      priceModifier: opt.priceModifier,
      images: imgs,
      selectedImgIdx: 0,
    });
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
        {/* 1. NOMBRE PRINCIPAL DEL PRODUCTO (Color morado principal, tamaño equilibrado) */}
        <div className="space-y-1">
          <h1 className="font-sans text-xl sm:text-2xl font-bold text-[#3F235F] leading-tight">
            {product.title}
          </h1>

          {/* 2. DESCRIPCIÓN CORTA (Color negro en negrita) */}
          {product.shortDescription && (
            <p className="text-sm sm:text-base font-bold text-black leading-snug">
              {product.shortDescription}
            </p>
          )}
        </div>

        {/* 3. DESCRIPCIÓN LARGA / DETALLES DE LA JOYA */}
        <div className="bg-[#FAF8FC] p-4 rounded-2xl border border-[#DFD0EC] space-y-1.5">
          <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-1.5">
            <RoisinDiamond size={11} color="#7043A0" /> Detalles de la Joya
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed font-light whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* 4. PRECIO & DISPONIBILIDAD */}
        <div className="flex items-baseline justify-between border-b border-[#DFD0EC] pb-3 pt-1">
          <div className="flex items-baseline gap-3">
            <span className="font-sans text-2xl sm:text-3xl font-bold text-[#3F235F]">
              ${finalUnitPrice.toFixed(2)}
            </span>
            {compareAt && compareAt > finalUnitPrice && (
              <span className="text-sm text-zinc-400 line-through font-normal">
                ${compareAt.toFixed(2)}
              </span>
            )}
            {product.discountPercent && product.discountPercent > 0 && (
              <span className="bg-[#3F235F] text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-xs leading-normal">
                -{product.discountPercent}% OFF
              </span>
            )}
          </div>

          <span
            className={`text-xs font-bold px-3 py-1 rounded-full ${
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
          <div className="space-y-3.5 pt-1 border-t border-[#DFD0EC]">
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
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
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
                  className="text-[10.5px] font-bold text-[#3F235F] hover:text-[#7043A0] inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] transition cursor-pointer shadow-2xs"
                >
                  <Ruler size={12} className="text-[#7043A0]" /> Guía de Tallas
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
                      className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
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
          <div className="space-y-2 pt-1 border-t border-[#DFD0EC]">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-800 block">
                Seleccionar Medida / Variante
              </label>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-[10.5px] font-bold text-[#3F235F] hover:text-[#7043A0] inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] transition cursor-pointer shadow-2xs"
              >
                <Ruler size={12} className="text-[#7043A0]" /> Guía de Tallas
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
                    className={`px-4 py-2 text-xs font-bold rounded-xl border transition cursor-pointer ${
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
          <div className="pt-1 border-t border-[#DFD0EC]">
            <button
              type="button"
              onClick={() => setSizeGuideOpen(true)}
              className="w-full flex items-center justify-between p-3 bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] hover:border-[#7043A0] rounded-xl transition group cursor-pointer shadow-2xs"
            >
              <div className="flex items-center gap-2 text-xs font-bold text-zinc-900 group-hover:text-[#3F235F]">
                <Ruler size={15} className="text-[#7043A0]" />
                <span>¿Dudas con tu medida? Consulta la Guía Oficial</span>
              </div>
              <span className="text-[11px] font-bold text-[#7043A0] group-hover:translate-x-1 transition-transform">
                Ver Guía →
              </span>
            </button>
          </div>
        )}

        {/* 6. SELECTOR COMPACTO DE PRESENTACIÓN & EMPAQUE CON PADDING AMPLIO */}
        {product.optionGroupLinks && product.optionGroupLinks.length > 0 && (
          <div className="space-y-3 pt-3 border-t border-[#DFD0EC]">
            {product.optionGroupLinks.map((link) => (
              <div key={link.group.id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Gift size={15} className="text-[#7043A0]" />
                    <label className="text-xs uppercase font-bold tracking-wider text-zinc-900">
                      {link.group.name}
                    </label>
                  </div>

                  {/* Carousel Navigation Arrows */}
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => scrollPack('left')}
                      className="p-1.5 rounded-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] text-zinc-700 hover:text-[#3F235F] transition cursor-pointer shadow-2xs"
                      aria-label="Presentaciones anteriores"
                    >
                      <ChevronLeft size={15} />
                    </button>
                    <button
                      type="button"
                      onClick={() => scrollPack('right')}
                      className="p-1.5 rounded-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] text-zinc-700 hover:text-[#3F235F] transition cursor-pointer shadow-2xs"
                      aria-label="Ver más presentaciones"
                    >
                      <ChevronRight size={15} />
                    </button>
                  </div>
                </div>

                {/* Horizontal Scrollable Presentations Carousel (Flush alignment, no negative margins, solid borders) */}
                <div
                  ref={packScrollRef}
                  className="flex gap-3.5 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory py-2.5 px-0.5"
                >
                  {link.group.options.map((opt) => {
                    const isSelected = selectedOptions[link.group.id] === opt.id;
                    const modifier = Number(opt.priceModifier || 0);

                    return (
                      <div
                        key={opt.id}
                        onClick={() =>
                          setSelectedOptions({
                            ...selectedOptions,
                            [link.group.id]: opt.id,
                          })
                        }
                        className={`group relative flex-none w-[180px] sm:w-[200px] flex flex-col rounded-2xl overflow-hidden border-2 text-left transition-all duration-200 cursor-pointer snap-start ${
                          isSelected
                            ? 'border-[#3F235F] bg-[#FAF8FC] shadow-sm'
                            : 'border-[#DFD0EC] bg-white hover:border-[#7043A0] hover:shadow-2xs'
                        }`}
                      >
                        {/* Packaging Photo with Zoom Preview Button */}
                        <div className="relative aspect-[16/11] bg-[#F0E9F5] overflow-hidden">
                          <Image
                            src={
                              opt.imageUrl ||
                              'https://images.unsplash.com/photo-1549465220-1a8b9238cd48?q=80&w=800&auto=format&fit=crop'
                            }
                            alt={opt.name}
                            fill
                            sizes="200px"
                            className="object-cover group-hover:scale-105 transition-transform duration-300"
                          />

                          {/* Hover Action: Ver Fotos Ampliadas */}
                          <button
                            type="button"
                            onClick={(e) => handleOpenPreview(link.group.id, opt, e)}
                            className="absolute top-2 left-2 bg-black/60 hover:bg-[#3F235F] text-white px-2 py-0.5 rounded-full backdrop-blur-xs transition shadow-xs flex items-center gap-1 z-20 text-[9px] font-bold opacity-90 group-hover:opacity-100"
                            title="Ver fotos en detalle"
                          >
                            <Eye size={10} />
                            <span>Fotos</span>
                          </button>

                          {/* Selected Checkmark */}
                          {isSelected && (
                            <div className="absolute top-2 right-2 bg-[#3F235F] text-white p-1 rounded-full shadow-md z-10">
                              <Check size={11} />
                            </div>
                          )}

                          {/* Compact Price Badge */}
                          <div className="absolute bottom-1.5 left-1.5 z-10">
                            <span
                              className={`text-[9.5px] font-black uppercase px-2 py-0.5 rounded-full shadow-xs leading-none inline-block tracking-wide ${
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
                        <div className="p-2.5 space-y-0.5 bg-white">
                          <h4 className="font-sans text-xs font-bold text-zinc-900 leading-snug line-clamp-1">
                            {opt.name}
                          </h4>
                          {opt.description && (
                            <p className="text-[9.5px] text-zinc-500 font-light line-clamp-2 leading-tight">
                              {opt.description}
                            </p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 7. DEDICATORIA PERMANENTE PARA TARJETA DE REGALO */}
        <div className="pt-3 border-t border-[#DFD0EC] space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-[#3F235F]">
              <PenTool size={13} className="text-[#7043A0]" />
              <span>Dedicatoria para Tarjeta de Regalo (Opcional)</span>
            </div>
            {dedication.length > 0 && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                Dedicatoria agregada
              </span>
            )}
          </div>

          <div className="bg-[#FAF8FC] p-3 rounded-2xl border border-[#DFD0EC] space-y-1.5">
            <label className="text-[10.5px] text-zinc-600 font-medium block">
              Escribe el mensaje que imprimiremos en la tarjeta de regalo de lujo:
            </label>
            <textarea
              value={dedication}
              onChange={(e) => setDedication(e.target.value.slice(0, 250))}
              rows={2}
              placeholder="Ejemplo: Para el amor de mi vida, gracias por iluminar cada uno de mis días. Te amo infinitamente."
              className="w-full p-2.5 text-xs bg-white border border-[#DFD0EC] rounded-xl text-zinc-900 focus:outline-none focus:border-[#7043A0] transition resize-none placeholder:text-zinc-400 leading-relaxed shadow-2xs"
            />
            <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
              <span className="text-[#3F235F] font-semibold">Tarjeta personalizada incluida</span>
              <span>{dedication.length} / 250 caracteres</span>
            </div>
          </div>
        </div>

        {/* 8. CANTIDAD & BOTONES DE COMPRA */}
        <div className="space-y-2.5 pt-2 border-t border-[#DFD0EC]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Cantidad:
            </span>
            <div className="flex items-center border border-[#DFD0EC] rounded-xl overflow-hidden bg-white shadow-2xs">
              <button
                type="button"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-1 text-zinc-600 hover:bg-[#F8F5FA] font-bold text-xs cursor-pointer"
                disabled={quantity <= 1}
              >
                -
              </button>
              <span className="px-3 py-1 text-xs font-bold text-zinc-900">{quantity}</span>
              <button
                type="button"
                onClick={() => setQuantity(Math.min(stock, quantity + 1))}
                className="px-3 py-1 text-zinc-600 hover:bg-[#F8F5FA] font-bold text-xs cursor-pointer"
                disabled={quantity >= stock}
              >
                +
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {/* Add to Cart Button */}
            <button
              type="button"
              onClick={() => handleAction(false)}
              disabled={isOutOfStock || isAdding}
              className="btn-purple-outline w-full py-3.5 px-5 rounded-2xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAdding ? (
                <span className="animate-pulse">Añadiendo...</span>
              ) : addedSuccess ? (
                <>
                  <Check size={15} className="text-emerald-600" />
                  <span>¡Añadido!</span>
                </>
              ) : (
                <>
                  <ShoppingBag size={15} />
                  <span>Añadir al Carrito</span>
                </>
              )}
            </button>

            {/* Buy Now (Direct Checkout) Button */}
            <button
              type="button"
              onClick={() => handleAction(true)}
              disabled={isOutOfStock || isAdding}
              className="btn-purple-diamond w-full py-3.5 px-5 rounded-2xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 shadow-md cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed shimmer-button"
            >
              <Zap size={15} />
              <span>Comprar Ahora</span>
            </button>
          </div>
        </div>

        {/* 9. GARANTÍAS DE CONFIANZA */}
        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <div className="flex items-center gap-2 p-2.5 bg-[#FAF8FC] rounded-xl border border-[#DFD0EC]">
            <ShieldCheck size={16} className="text-[#7043A0] shrink-0" />
            <span className="text-[10.5px] font-bold text-zinc-800">
              Plata 925 & Oro 18k Genuinos
            </span>
          </div>
          <div className="flex items-center gap-2 p-2.5 bg-[#FAF8FC] rounded-xl border border-[#DFD0EC]">
            <Truck size={16} className="text-[#7043A0]" shrink-0 />
            <span className="text-[10.5px] font-bold text-zinc-800">
              Envíos a Todo Ecuador
            </span>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal isOpen={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} />

      {/* Packaging Multi-Photo Preview Lightbox Modal via Portal */}
      {mounted &&
        previewOption &&
        createPortal(
          <div
            className="fixed inset-0 z-[999999] bg-black/90 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 select-none"
            onClick={() => setPreviewOption(null)}
          >
            <div
              className="relative w-full max-w-lg bg-[#FAF8FC] rounded-3xl overflow-hidden shadow-2xl border border-white/20 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 border-b border-[#DFD0EC] bg-white">
                <div className="flex items-center gap-2">
                  <Gift size={18} className="text-[#7043A0]" />
                  <h3 className="font-sans font-bold text-zinc-900 text-sm sm:text-base">
                    {previewOption.name}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOption(null)}
                  className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-500 hover:text-zinc-900 transition cursor-pointer"
                  aria-label="Cerrar vista previa"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Main Active Photo Container */}
              <div className="relative aspect-square sm:aspect-[4/3] w-full bg-zinc-950 overflow-hidden flex items-center justify-center">
                <Image
                  src={previewOption.images[previewOption.selectedImgIdx]}
                  alt={previewOption.name}
                  fill
                  sizes="(max-width: 600px) 100vw, 600px"
                  className="object-contain"
                />

                {/* Slider Arrows if more than 1 image */}
                {previewOption.images.length > 1 && (
                  <>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewOption({
                          ...previewOption,
                          selectedImgIdx:
                            previewOption.selectedImgIdx > 0
                              ? previewOption.selectedImgIdx - 1
                              : previewOption.images.length - 1,
                        });
                      }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-md"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setPreviewOption({
                          ...previewOption,
                          selectedImgIdx:
                            previewOption.selectedImgIdx < previewOption.images.length - 1
                              ? previewOption.selectedImgIdx + 1
                              : 0,
                        });
                      }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/60 hover:bg-black/90 text-white transition cursor-pointer shadow-md"
                    >
                      <ChevronRight size={20} />
                    </button>
                  </>
                )}

                {/* Photo Counter */}
                {previewOption.images.length > 1 && (
                  <div className="absolute bottom-3 right-3 bg-black/70 text-white text-[10px] font-bold px-2.5 py-1 rounded-full backdrop-blur-xs">
                    {previewOption.selectedImgIdx + 1} de {previewOption.images.length}
                  </div>
                )}
              </div>

              {/* Thumbnails Row if multiple photos */}
              {previewOption.images.length > 1 && (
                <div className="flex gap-2 p-3 bg-zinc-100 border-b border-[#DFD0EC] overflow-x-auto justify-center">
                  {previewOption.images.map((imgUrl, idx) => (
                    <button
                      key={imgUrl + idx}
                      type="button"
                      onClick={() =>
                        setPreviewOption({ ...previewOption, selectedImgIdx: idx })
                      }
                      className={`relative w-12 h-12 rounded-xl overflow-hidden border-2 transition cursor-pointer ${
                        previewOption.selectedImgIdx === idx
                          ? 'border-[#3F235F] ring-2 ring-[#7043A0]'
                          : 'border-zinc-300 opacity-60 hover:opacity-100'
                      }`}
                    >
                      <Image src={imgUrl} alt="" fill sizes="48px" className="object-cover" />
                    </button>
                  ))}
                </div>
              )}

              {/* Modal Footer Description & Selection CTA */}
              <div className="p-4 bg-white space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-zinc-900">
                    {previewOption.description || 'Presentación oficial de lujo ROISIN.'}
                  </span>
                  <span
                    className={`text-xs font-black uppercase px-3 py-1 rounded-full shadow-xs ${
                      Number(previewOption.priceModifier) > 0
                        ? 'bg-gradient-to-r from-[#3F235F] to-[#7043A0] text-white'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    {Number(previewOption.priceModifier) > 0
                      ? `+$${Number(previewOption.priceModifier).toFixed(2)}`
                      : 'Incluida'}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setSelectedOptions({
                      ...selectedOptions,
                      [previewOption.groupId]: previewOption.optionId,
                    });
                    setPreviewOption(null);
                  }}
                  className="btn-purple-diamond w-full py-3 rounded-2xl text-xs uppercase font-bold tracking-wider flex items-center justify-center gap-2 shadow-md cursor-pointer"
                >
                  <Check size={15} />
                  <span>Elegir esta Presentación para mi Pedido</span>
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
    </>
  );
}
