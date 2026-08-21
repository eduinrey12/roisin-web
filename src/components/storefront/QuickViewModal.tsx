'use client';

import { useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/lib/store/cartStore';
import { X, ShoppingBag, ArrowRight, Check } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

interface Variant {
  id: string;
  sku: string;
  price: any;
  compareAtPrice?: any;
  inventory?: { quantity: number } | null;
}

interface OptionGroup {
  id: string;
  name: string;
  description?: string | null;
  options: {
    id: string;
    name: string;
    priceModifier: any;
    isDefault: boolean;
  }[];
}

interface QuickViewProduct {
  id: string;
  title: string;
  slug: string;
  basePrice: any;
  description?: string;
  category?: { name: string; slug: string };
  images: { url: string; altText?: string | null; isPrimary: boolean }[];
  variants?: Variant[];
  optionGroupLinks?: { group: OptionGroup }[];
}

interface QuickViewModalProps {
  product: QuickViewProduct | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickViewModal({ product, isOpen, onClose }: QuickViewModalProps) {
  const router = useRouter();
  const { addItem, openCart } = useCartStore();

  const [selectedVariantId, setSelectedVariantId] = useState<string>('');
  const [selectedOptionIds, setSelectedOptionIds] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  if (!isOpen || !product) return null;

  const variants = product.variants || [];
  const activeVariant =
    variants.find((v) => v.id === selectedVariantId) || variants[0] || null;

  if (!selectedVariantId && activeVariant) {
    setSelectedVariantId(activeVariant.id);
  }

  const variantPrice = activeVariant ? Number(activeVariant.price) : Number(product.basePrice);
  const optionsPrice =
    product.optionGroupLinks?.reduce((sum, link) => {
      const selected = link.group.options.find((opt) => selectedOptionIds.includes(opt.id));
      return sum + (selected ? Number(selected.priceModifier) : 0);
    }, 0) || 0;

  const currentStock = activeVariant?.inventory?.quantity ?? 10;
  const isOutOfStock = currentStock <= 0;

  const primaryImage =
    product.images?.find((i: any) => i.isPrimary)?.url ||
    product.images?.[0]?.url ||
    'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop';

  const handleToggleOption = (optionId: string, isDefault = false) => {
    if (selectedOptionIds.includes(optionId)) {
      if (!isDefault) {
        setSelectedOptionIds(selectedOptionIds.filter((id) => id !== optionId));
      }
    } else {
      setSelectedOptionIds([...selectedOptionIds, optionId]);
    }
  };

  const handleAddToCart = async (directCheckout = false) => {
    if (!activeVariant || isOutOfStock) return;

    setIsAdding(true);
    try {
      await addItem(activeVariant.id, quantity, selectedOptionIds);
      setAddedSuccess(true);

      setTimeout(() => {
        setIsAdding(false);
        setAddedSuccess(false);
        onClose();

        if (directCheckout) {
          router.push('/checkout');
        } else {
          openCart();
        }
      }, 400);
    } catch (err) {
      console.error('Error al agregar:', err);
      setIsAdding(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 animate-fade-in">
      {/* Backdrop */}
      <div
        onClick={onClose}
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
      />

      {/* Modal Container */}
      <div className="relative bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-[#DFD0EC] overflow-hidden z-10 flex flex-col md:flex-row max-h-[90vh]">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-2 bg-white/90 hover:bg-white text-zinc-500 hover:text-black rounded-full shadow-xs transition border border-[#DFD0EC] cursor-pointer"
          aria-label="Cerrar vista rápida"
        >
          <X size={18} />
        </button>

        {/* Product Image Side */}
        <div className="relative w-full md:w-5/12 bg-[#F8F5FA] aspect-square md:aspect-auto flex items-center justify-center p-6 border-b md:border-b-0 md:border-r border-[#DFD0EC]">
          <div className="relative w-full h-full min-h-[220px] rounded-2xl overflow-hidden shadow-xs">
            <Image
              src={primaryImage}
              alt={product.title}
              fill
              sizes="(max-width: 768px) 100vw, 300px"
              className="object-cover object-center"
            />
          </div>
          {product.category && (
            <span className="absolute top-4 left-4 diamond-tag text-[9px] uppercase font-bold tracking-widest px-3 py-1 rounded-full text-zinc-900 flex items-center gap-1.5 shadow-xs">
              <RoisinDiamond size={10} color="#7043A0" />
              {product.category.name}
            </span>
          )}
        </div>

        {/* Product Details & Selection Side */}
        <div className="w-full md:w-7/12 p-6 sm:p-7 overflow-y-auto space-y-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F]">
                Compra Rápida
              </span>
              <h3 className="font-sans text-xl sm:text-2xl font-bold text-zinc-900 leading-snug mt-0.5">
                {product.title}
              </h3>
              <p className="text-xs text-zinc-500 mt-1 line-clamp-2">
                {product.description || 'Joyería fina en Plata de Ley 925 y Oro 18k garantizado.'}
              </p>
            </div>

            {/* Price & Stock Badge */}
            <div className="flex items-baseline justify-between border-y border-[#DFD0EC] py-3">
              <div>
                <span className="text-[10px] uppercase text-zinc-400 block font-bold">Precio</span>
                <span className="font-sans text-2xl font-bold text-[#3F235F]">
                  ${(variantPrice + optionsPrice).toFixed(2)}
                </span>
              </div>

              <span
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                  isOutOfStock
                    ? 'bg-red-50 text-red-700 border border-red-200'
                    : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                }`}
              >
                {isOutOfStock ? 'Agotado' : 'En Stock'}
              </span>
            </div>

            {/* Variants / Sizes Selection */}
            {variants.length > 1 && (
              <div className="space-y-2">
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-700 block">
                  Seleccionar Talla / Medida
                </label>
                <div className="flex flex-wrap gap-2">
                  {variants.map((v) => (
                    <button
                      key={v.id}
                      onClick={() => setSelectedVariantId(v.id)}
                      className={`px-3.5 py-2 text-xs rounded-2xl font-bold transition border cursor-pointer ${
                        selectedVariantId === v.id
                          ? 'btn-purple-diamond shadow-xs'
                          : 'bg-[#F8F5FA] text-zinc-800 border-[#DFD0EC] hover:border-[#7043A0]'
                      }`}
                    >
                      {v.sku.split('-').pop() || v.sku}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Option Groups (Packaging / Gift) */}
            {product.optionGroupLinks && product.optionGroupLinks.length > 0 && (
              <div className="space-y-2">
                <label className="text-[11px] uppercase font-bold tracking-wider text-zinc-700 block">
                  Presentación & Regalo
                </label>
                <div className="space-y-1.5">
                  {product.optionGroupLinks[0].group.options.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => handleToggleOption(opt.id, opt.isDefault)}
                      className={`w-full p-3 rounded-2xl border text-left text-xs flex items-center justify-between transition cursor-pointer ${
                        selectedOptionIds.includes(opt.id) || (selectedOptionIds.length === 0 && opt.isDefault)
                          ? 'border-[#7043A0] bg-[#F8F5FA] font-bold text-zinc-900 ring-1 ring-[#7043A0]'
                          : 'border-[#DFD0EC]/80 hover:border-[#DFD0EC] text-zinc-700'
                      }`}
                    >
                      <span>{opt.name}</span>
                      <span className="text-[11px] text-[#3F235F] font-bold">
                        {Number(opt.priceModifier) > 0 ? `+$${Number(opt.priceModifier).toFixed(2)}` : 'Incluido'}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div className="flex items-center gap-3 pt-1">
              <span className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Cantidad:</span>
              <div className="flex items-center border border-[#DFD0EC] rounded-2xl overflow-hidden bg-white">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="px-3.5 py-1 text-sm font-bold text-zinc-600 hover:bg-[#F8F5FA] cursor-pointer"
                  disabled={quantity <= 1}
                >
                  -
                </button>
                <span className="px-3 py-1 text-xs font-bold text-zinc-900">{quantity}</span>
                <button
                  onClick={() => setQuantity(Math.min(currentStock, quantity + 1))}
                  className="px-3.5 py-1 text-sm font-bold text-zinc-600 hover:bg-[#F8F5FA] cursor-pointer"
                  disabled={quantity >= currentStock}
                >
                  +
                </button>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2.5 pt-4 border-t border-[#DFD0EC]">
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAddToCart(false)}
                disabled={isAdding || isOutOfStock}
                className="w-full btn-purple-outline py-3.5 rounded-2xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 cursor-pointer"
              >
                {addedSuccess ? (
                  <>
                    <Check size={16} className="text-emerald-600" /> ¡Agregado!
                  </>
                ) : (
                  <>
                    <ShoppingBag size={15} /> Añadir
                  </>
                )}
              </button>

              <button
                onClick={() => handleAddToCart(true)}
                disabled={isAdding || isOutOfStock}
                className="w-full btn-purple-diamond py-3.5 rounded-2xl text-xs uppercase tracking-wider font-bold flex items-center justify-center gap-2 transition active:scale-95 disabled:opacity-50 shadow-md cursor-pointer"
              >
                Comprar Ahora <ArrowRight size={15} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

