'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingBag, Check, ShieldCheck, Truck, Sparkles, ArrowRight, Heart, MessageCircle } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { STORE_CONFIG } from '@/lib/config/store';

interface AddToCartSectionProps {
  product: {
    id: string;
    title: string;
    basePrice: any;
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
}

export default function AddToCartSection({ product }: AddToCartSectionProps) {
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
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const currentVariant =
    product.variants.find((v) => v.id === selectedVariantId) || product.variants[0];

  const variantPrice = currentVariant ? Number(currentVariant.price) : Number(product.basePrice);

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

  const handleAction = async (directCheckout = false) => {
    if (!currentVariant || isOutOfStock) return;
    setIsAdding(true);
    const optionIds = Object.values(selectedOptions);

    try {
      const success = await addItem(currentVariant.id, quantity, optionIds);
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

  const whatsappInquiryUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(
    `Hola ${STORE_CONFIG.name}, deseo consultar la disponibilidad de la joya: ${product.title}`
  )}`;

  return (
    <div className="space-y-6">
      {/* 1. Price Header & Availability Badge */}
      <div className="flex items-baseline justify-between border-b border-[#F0E6E8] pb-4">
        <div className="flex items-baseline gap-3">
          <span className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            ${finalUnitPrice.toFixed(2)}
          </span>
          {currentVariant?.compareAtPrice && Number(currentVariant.compareAtPrice) > finalUnitPrice && (
            <span className="text-base text-zinc-400 line-through">
              ${Number(currentVariant.compareAtPrice).toFixed(2)}
            </span>
          )}
        </div>

        <span
          className={`text-xs font-semibold px-3 py-1 rounded-full ${
            isOutOfStock
              ? 'bg-red-50 text-red-700 border border-red-200'
              : 'bg-emerald-50 text-emerald-800 border border-emerald-200/80'
          }`}
        >
          {isOutOfStock ? 'Agotado' : `En Stock (${stock} disponibles)`}
        </span>
      </div>

      {/* 2. Variant / Size Selector */}
      {product.variants.length > 1 && (
        <div className="space-y-2.5">
          <div className="flex justify-between items-center">
            <label className="text-xs uppercase font-bold tracking-wider text-zinc-800 block">
              Seleccionar Medida / Talla
            </label>
            <a
              href={whatsappInquiryUrl}
              target="_blank"
              rel="noreferrer"
              className="text-[11px] font-semibold text-[#BE6C7C] hover:underline inline-flex items-center gap-1"
            >
              <MessageCircle size={12} /> ¿Dudas con tu talla?
            </a>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v) => {
              const label =
                v.attributes?.map((a) => a.attributeValue.value).join(' - ') || v.sku.split('-').pop() || v.sku;
              const isSelected = v.id === selectedVariantId;

              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-2xl border transition ${
                    isSelected
                      ? 'border-zinc-900 bg-zinc-900 text-white shadow-xs'
                      : 'border-[#EFCFD6] bg-[#FAF4F5] text-zinc-800 hover:border-[#BE6C7C]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Option Groups (Packaging / Gift Presentation) */}
      {product.optionGroupLinks && product.optionGroupLinks.length > 0 && (
        <div className="space-y-4 pt-2">
          {product.optionGroupLinks.map((link) => (
            <div key={link.group.id} className="space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase font-bold tracking-wider text-zinc-800 block">
                  {link.group.name}
                </label>
                {link.group.description && (
                  <span className="text-[11px] text-zinc-400">{link.group.description}</span>
                )}
              </div>

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
                      className={`flex justify-between items-center p-3 text-left rounded-2xl border text-xs transition ${
                        isSelected
                          ? 'border-[#BE6C7C] bg-[#FAF4F5] font-semibold text-zinc-900 ring-1 ring-[#BE6C7C]'
                          : 'border-[#F0E6E8] bg-white text-zinc-700 hover:border-[#EFCFD6]'
                      }`}
                    >
                      <span className="font-medium">{opt.name}</span>
                      <span className="font-semibold text-[#BE6C7C]">
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

      {/* 4. Quantity & Dual Action Buttons */}
      <div className="space-y-3 pt-4 border-t border-[#F0E6E8]">
        <div className="flex items-center gap-3">
          <span className="text-xs font-bold text-zinc-800 uppercase tracking-wider">Cantidad:</span>
          <div className="flex items-center border border-[#EFCFD6] rounded-xl overflow-hidden bg-white">
            <button
              type="button"
              onClick={() => setQuantity(Math.max(1, quantity - 1))}
              className="px-3.5 py-1.5 text-zinc-600 hover:bg-[#FAF4F5] font-bold text-sm"
              disabled={quantity <= 1}
            >
              -
            </button>
            <span className="px-3 py-1 text-xs font-bold text-zinc-900">{quantity}</span>
            <button
              type="button"
              onClick={() => setQuantity(Math.min(stock, quantity + 1))}
              className="px-3.5 py-1.5 text-zinc-600 hover:bg-[#FAF4F5] font-bold text-sm"
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
            className="w-full bg-[#FAF4F5] hover:bg-[#F6E8EB] text-zinc-900 border border-[#EFCFD6] py-4 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50"
          >
            {addedSuccess ? (
              <>
                <Check size={17} className="text-emerald-600" /> ¡En la Bolsa!
              </>
            ) : (
              <>
                <ShoppingBag size={16} /> Añadir a la Bolsa
              </>
            )}
          </button>

          {/* Buy Now (Direct Checkout) Button */}
          <button
            type="button"
            onClick={() => handleAction(true)}
            disabled={loading || isAdding || isOutOfStock}
            className="w-full bg-zinc-900 hover:bg-black text-white py-4 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-md shimmer-button"
          >
            Comprar Ahora • ${(finalUnitPrice * quantity).toFixed(2)}
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* 5. Trust Badges */}
      <div className="pt-4 border-t border-[#F0E6E8] grid grid-cols-2 gap-3 text-[11px] text-zinc-600">
        <div className="flex items-center gap-2">
          <RoisinDiamond size={13} color="#E2A3B0" />
          <span>Plata 925 & Oro 18k Certificado</span>
        </div>
        <div className="flex items-center gap-2">
          <Truck size={14} className="text-[#BE6C7C]" />
          <span>Entrega Rápida en Ecuador 24h</span>
        </div>
      </div>
    </div>
  );
}
