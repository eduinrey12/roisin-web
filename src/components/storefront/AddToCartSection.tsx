'use client';

import { useState } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import { ShoppingBag, Check, ShieldCheck, Truck, Sparkles } from 'lucide-react';

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
  const { addItem, loading } = useCartStore();
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

  const handleAddToCart = async () => {
    if (!currentVariant || isOutOfStock) return;
    const optionIds = Object.values(selectedOptions);
    const success = await addItem(currentVariant.id, quantity, optionIds);
    if (success) {
      setAddedSuccess(true);
      setTimeout(() => setAddedSuccess(false), 2500);
    }
  };

  return (
    <div className="space-y-6">
      {/* Price Header */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-gray-900">
          ${finalUnitPrice.toFixed(2)}
        </span>
        {currentVariant?.compareAtPrice && Number(currentVariant.compareAtPrice) > finalUnitPrice && (
          <span className="text-lg text-gray-400 line-through">
            ${Number(currentVariant.compareAtPrice).toFixed(2)}
          </span>
        )}
        <span className="text-xs bg-emerald-50 text-emerald-700 font-semibold px-2.5 py-0.5 rounded-full border border-emerald-200/60">
          {isOutOfStock ? 'Agotado' : 'Disponible en Stock'}
        </span>
      </div>

      {/* Variant Selector */}
      {product.variants.length > 1 && (
        <div className="space-y-2.5">
          <label className="text-xs uppercase font-bold tracking-wider text-gray-700 block">
            Selecciona Opción / Talla
          </label>
          <div className="flex flex-wrap gap-2.5">
            {product.variants.map((v) => {
              const label =
                v.attributes?.map((a) => a.attributeValue.value).join(' - ') || v.sku;
              const isSelected = v.id === selectedVariantId;

              return (
                <button
                  key={v.id}
                  onClick={() => setSelectedVariantId(v.id)}
                  className={`px-4 py-2.5 text-xs font-semibold rounded-xl border transition ${
                    isSelected
                      ? 'border-black bg-black text-white shadow-xs'
                      : 'border-gray-200 bg-white text-gray-800 hover:border-gray-400'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Option Groups (Packaging / Gift Presentation) */}
      {product.optionGroupLinks && product.optionGroupLinks.length > 0 && (
        <div className="space-y-4 pt-2">
          {product.optionGroupLinks.map((link) => (
            <div key={link.group.id} className="space-y-2.5">
              <div className="flex justify-between items-center">
                <label className="text-xs uppercase font-bold tracking-wider text-gray-700 block">
                  {link.group.name}
                </label>
                {link.group.description && (
                  <span className="text-[11px] text-gray-400">{link.group.description}</span>
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
                      className={`flex justify-between items-center p-3 text-left rounded-xl border text-xs transition ${
                        isSelected
                          ? 'border-black bg-zinc-50 text-black ring-1 ring-black'
                          : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                      }`}
                    >
                      <span className="font-medium">{opt.name}</span>
                      <span className="font-semibold text-gray-900">
                        {modifier > 0 ? `+$${modifier.toFixed(2)}` : 'Gratis'}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Quantity and CTA Button */}
      <div className="flex flex-col sm:flex-row gap-4 pt-4 border-t border-gray-100">
        <div className="flex items-center border border-gray-300 rounded-xl h-12 w-32 justify-between px-3">
          <button
            type="button"
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="text-gray-500 hover:text-black font-bold text-base px-2"
          >
            -
          </button>
          <span className="text-sm font-bold text-gray-900">{quantity}</span>
          <button
            type="button"
            onClick={() => setQuantity(quantity + 1)}
            className="text-gray-500 hover:text-black font-bold text-base px-2"
          >
            +
          </button>
        </div>

        <button
          type="button"
          onClick={handleAddToCart}
          disabled={loading || isOutOfStock}
          className={`flex-1 h-12 rounded-xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition active:scale-[0.98] ${
            addedSuccess
              ? 'bg-emerald-600 text-white'
              : isOutOfStock
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-black text-white hover:bg-zinc-800 shadow-md'
          }`}
        >
          {addedSuccess ? (
            <>
              <Check size={18} /> ¡Añadido a la bolsa!
            </>
          ) : (
            <>
              <ShoppingBag size={18} />
              {isOutOfStock ? 'Agotado' : `Añadir • $${(finalUnitPrice * quantity).toFixed(2)}`}
            </>
          )}
        </button>
      </div>

      {/* Trust & Guarantee Badges */}
      <div className="pt-6 border-t border-gray-100 grid grid-cols-2 gap-4 text-xs text-gray-600">
        <div className="flex items-center gap-2.5">
          <Sparkles className="text-amber-600 shrink-0" size={18} />
          <span>Plata 925 auténtica & Hipoalergénico</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Truck className="text-blue-600 shrink-0" size={18} />
          <span>Entrega en 24h a 48h en Ecuador</span>
        </div>
      </div>
    </div>
  );
}
