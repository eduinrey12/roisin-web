'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import {
  ShoppingBag,
  Check,
  Truck,
  Sparkles,
  ArrowRight,
  Heart,
  HelpCircle,
  PenTool,
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
          priceModifier: any;
          isDefault: boolean;
        }[];
      };
    }[];
  };
  onVariantChange?: (variantId: string) => void;
}

export default function AddToCartSection({ product, onVariantChange }: AddToCartSectionProps) {
  const router = useRouter();
  const { addItem, openCart, loading } = useCartStore();
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants[0]?.id || ''
  );
  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>(() => {
    const initial: Record<string, string> = {};
    product.optionGroupLinks?.forEach((link) => {
      const defaultOpt =
        link.group.options.find((o) => o.isDefault) || link.group.options[0];
      if (defaultOpt) {
        initial[link.group.id] = defaultOpt.id;
      }
    });
    return initial;
  });
  const [dedication, setDedication] = useState('');
  const [showDedicationField, setShowDedicationField] = useState(false);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const variantPrice = currentVariant ? Number(currentVariant.price) : Number(product.basePrice);
  const compareAt = currentVariant?.compareAtPrice
    ? Number(currentVariant.compareAtPrice)
    : product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null;

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

  const handleSelectVariant = (variantId: string) => {
    setSelectedVariantId(variantId);
    if (onVariantChange) {
      onVariantChange(variantId);
    }
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
        {/* 1. Price Header & Availability Badge (Without parenthesis count as requested in Requirement 6) */}
        <div className="flex items-baseline justify-between border-b border-[#DFD0EC] pb-4">
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
              <span className="bg-[#3F235F] text-white text-[10px] uppercase font-black px-2.5 py-0.5 rounded-full shadow-xs">
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

        {/* 2. Short Description (Element #2 in Requirement 8) */}
        {product.shortDescription && (
          <div className="bg-[#F8F5FA] p-3.5 rounded-2xl border border-[#DFD0EC]">
            <p className="text-xs text-zinc-700 leading-relaxed font-medium">
              {product.shortDescription}
            </p>
          </div>
        )}

        {/* 3. Long Description / Details (Element #3 in Requirement 8) */}
        <div className="space-y-2">
          <h3 className="text-xs uppercase font-bold tracking-wider text-zinc-900 flex items-center gap-1.5">
            <RoisinDiamond size={11} color="#7043A0" /> Detalles de la Joya
          </h3>
          <p className="text-xs text-zinc-600 leading-relaxed font-light whitespace-pre-line">
            {product.description}
          </p>
        </div>

        {/* 4. Tallas / Medidas / Atributos + Guía de Tallas (Element #4 in Requirement 8 & 12) */}
        {product.variants.length > 1 && (
          <div className="space-y-2.5 pt-2 border-t border-[#DFD0EC]">
            <div className="flex justify-between items-center">
              <label className="text-xs uppercase font-bold tracking-wider text-zinc-800 block">
                Seleccionar Medida / Talla
              </label>
              <button
                type="button"
                onClick={() => setSizeGuideOpen(true)}
                className="text-[11px] font-bold text-[#3F235F] hover:text-[#7043A0] inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F8F5FA] hover:bg-[#F0E9F5] border border-[#DFD0EC] transition cursor-pointer shadow-2xs"
              >
                <HelpCircle size={13} className="text-[#7043A0]" /> Guía de Tallas
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
                    onClick={() => handleSelectVariant(v.id)}
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
        )}

        {/* Presentation Options if any */}
        {product.optionGroupLinks && product.optionGroupLinks.length > 0 && (
          <div className="space-y-3 pt-2 border-t border-[#DFD0EC]">
            {product.optionGroupLinks.map((link) => (
              <div key={link.group.id} className="space-y-2">
                <label className="text-xs uppercase font-bold tracking-wider text-zinc-800 block">
                  {link.group.name}
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
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
                        className={`flex justify-between items-center p-3 text-left rounded-2xl border text-xs transition cursor-pointer ${
                          isSelected
                            ? 'border-[#3F235F] bg-[#F0E9F5] font-bold text-zinc-900 ring-1 ring-[#7043A0]'
                            : 'border-[#DFD0EC] bg-white text-zinc-700 hover:border-[#7043A0]'
                        }`}
                      >
                        <span className="font-medium">{opt.name}</span>
                        <span className="font-bold text-[#3F235F]">
                          {modifier > 0 ? `+$${modifier.toFixed(2)}` : 'Incluido'}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 5. Dedicatoria Opcional para Tarjeta (Element #5 in Requirement 8) */}
        <div className="pt-2 border-t border-[#DFD0EC] space-y-2.5">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowDedicationField(!showDedicationField)}
              className="flex items-center gap-1.5 text-xs uppercase font-bold tracking-wider text-[#3F235F] hover:text-[#7043A0] transition cursor-pointer"
            >
              <PenTool size={13} />
              <span>Dedicatoria para Regalo (Opcional)</span>
              <span className="text-[10px] text-zinc-400 font-normal">
                {showDedicationField ? '▲' : '▼'}
              </span>
            </button>
            {dedication && (
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded-full">
                Dedicatoria agregada
              </span>
            )}
          </div>

          {(showDedicationField || dedication.length > 0) && (
            <div className="bg-[#F8F5FA] p-3.5 rounded-2xl border border-[#DFD0EC] space-y-2 animate-fade-in">
              <label className="text-[11px] text-zinc-600 font-medium block">
                Escribe el mensaje que imprimiremos en la tarjeta de regalo de lujo:
              </label>
              <textarea
                value={dedication}
                onChange={(e) => setDedication(e.target.value.slice(0, 250))}
                rows={3}
                placeholder="Ejemplo: Para el amor de mi vida, gracias por iluminar cada uno de mis días. Te amo infinitamente."
                className="w-full p-3 text-xs bg-white border border-[#DFD0EC] rounded-xl text-zinc-900 focus:outline-none focus:border-[#7043A0] transition resize-none placeholder:text-zinc-400"
              />
              <div className="flex justify-between items-center text-[10px] text-zinc-400 font-medium">
                <span>Tarjeta personalizada incluida sin costo</span>
                <span>{dedication.length} / 250 caracteres</span>
              </div>
            </div>
          )}
        </div>

        {/* 6. Quantity & Action Buttons (Element #6 in Requirement 8) */}
        <div className="space-y-3 pt-3 border-t border-[#DFD0EC]">
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">
              Cantidad:
            </span>
            <div className="flex items-center border border-[#DFD0EC] rounded-2xl overflow-hidden bg-white">
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
              disabled={loading || isAdding || isOutOfStock}
              className="w-full btn-purple-outline py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              {addedSuccess ? (
                <>
                  <Check size={17} className="text-emerald-600" /> ¡En el Carrito!
                </>
              ) : (
                <>
                  <ShoppingBag size={16} /> Añadir al Carrito
                </>
              )}
            </button>

            {/* Buy Now Button */}
            <button
              type="button"
              onClick={() => handleAction(true)}
              disabled={loading || isAdding || isOutOfStock}
              className="w-full btn-purple-diamond py-3.5 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-md shimmer-button cursor-pointer"
            >
              Comprar Ahora • ${(finalUnitPrice * quantity).toFixed(2)}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>

        {/* Trust Badges */}
        <div className="pt-3 border-t border-[#DFD0EC] grid grid-cols-2 gap-3 text-[11px] text-zinc-600">
          <div className="flex items-center gap-2">
            <RoisinDiamond size={13} color="#7043A0" />
            <span>Plata 925 & Oro 18k Certificado</span>
          </div>
          <div className="flex items-center gap-2">
            <Truck size={14} className="text-[#3F235F]" />
            <span>Entrega Segura en Todo Ecuador</span>
          </div>
        </div>
      </div>

      {/* Size Guide Modal */}
      <SizeGuideModal
        isOpen={sizeGuideOpen}
        onClose={() => setSizeGuideOpen(false)}
      />
    </>
  );
}

