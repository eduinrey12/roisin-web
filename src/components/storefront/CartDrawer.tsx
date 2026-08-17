'use client';

import { useCartStore } from '@/lib/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles, Truck, ShieldCheck } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();

  if (!isOpen) return null;

  const items = cart?.items || [];
  const totalItems = items.reduce((acc: number, i: any) => acc + i.quantity, 0);

  const subtotal = items.reduce((sum: number, item: any) => {
    const itemPrice = Number(item.variant.price);
    const optionsPrice = (item.options || []).reduce(
      (optSum: number, o: any) => optSum + Number(o.option.priceModifier || 0),
      0
    );
    return sum + (itemPrice + optionsPrice) * item.quantity;
  }, 0);

  // Free shipping threshold at $70
  const freeShippingThreshold = 70;
  const progressPercent = Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out border-l border-[#FAD1DC]">
        {/* 1. Luminous Pink Diamond Header */}
        <div className="p-5 border-b border-[#FAD1DC] flex justify-between items-center bg-[#FFF5F7]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-2xl border border-[#FAD1DC] shadow-xs">
              <RoisinDiamond size={20} color="#E65573" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-[#D33658] block">
                Bolsa de Joyas
              </span>
              <h2 className="font-serif text-base font-bold text-zinc-900 leading-tight">
                Tus Piezas Seleccionadas ({totalItems})
              </h2>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white rounded-full transition text-zinc-400 hover:text-black border border-transparent hover:border-[#FAD1DC]"
            aria-label="Cerrar bolsa"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Free Shipping Progress Bar */}
        {items.length > 0 && (
          <div className="bg-[#FFF8FA] p-3.5 px-5 border-b border-[#FAD1DC] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-zinc-800">
                <Truck size={14} className="text-[#D33658]" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700">¡Felicidades! Tienes Envío Express Gratis</span>
                ) : (
                  <span>
                    Te faltan <strong className="text-[#D33658] font-serif">${remainingForFreeShipping.toFixed(2)}</strong> para Envío Gratis
                  </span>
                )}
              </span>
              <span className="text-zinc-500 font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#FAD1DC]/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#F08097] via-[#E65573] to-[#C22648] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 divide-y divide-transparent">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="p-5 bg-[#FFF5F7] rounded-full text-[#E65573] border border-[#FAD1DC] shadow-sm">
                <RoisinDiamond size={48} color="#E65573" />
              </div>
              <div className="space-y-1 max-w-[260px]">
                <h3 className="font-serif text-lg font-bold text-zinc-900">Tu bolsa está vacía</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">
                  Descubre nuestras exclusivas piezas en Plata 925 y Oro 18k para iluminar tu colección.
                </p>
              </div>
              <Link
                href="/productos"
                onClick={closeCart}
                className="btn-pink-diamond text-xs uppercase tracking-widest px-8 py-3.5 rounded-full font-bold transition shadow-md shimmer-button"
              >
                Explorar Colecciones <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            items.map((item: any) => {
              const product = item.variant.product;
              const primaryImg =
                product.images?.[0]?.url ||
                'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop';
              const itemPrice = Number(item.variant.price);
              const optionsPrice = (item.options || []).reduce(
                (optSum: number, o: any) => optSum + Number(o.option.priceModifier || 0),
                0
              );
              const unitTotal = itemPrice + optionsPrice;

              return (
                <div
                  key={item.id}
                  className="bg-[#FFF8FA] p-4 rounded-3xl border border-[#FAD1DC] shadow-2xs flex gap-3.5 transition-all hover:border-[#E65573]"
                >
                  <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden shrink-0 relative border border-[#FAD1DC] shadow-2xs">
                    <Image
                      src={primaryImg}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/productos/${product.slug}`}
                          onClick={closeCart}
                          className="font-serif font-bold text-sm text-zinc-900 hover:text-[#D33658] transition truncate"
                        >
                          {product.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded-lg shrink-0"
                          title="Eliminar joya"
                          aria-label="Eliminar joya"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                        Talla: <span className="font-bold text-zinc-800">{item.variant.sku.split('-').pop() || item.variant.sku}</span>
                      </p>

                      {item.options && item.options.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.options.map((opt: any) => (
                            <span
                              key={opt.id}
                              className="inline-flex items-center gap-1 text-[9.5px] text-[#D33658] bg-white px-2 py-0.5 rounded-full border border-[#FAD1DC] font-bold"
                            >
                              <RoisinDiamond size={8} color="#E65573" />
                              {opt.option.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#FAD1DC]/60">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#FAD1DC] rounded-xl overflow-hidden bg-white shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-zinc-600 hover:bg-[#FFF5F7] transition text-xs font-bold"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-zinc-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-zinc-600 hover:bg-[#FFF5F7] transition text-xs font-bold"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-serif font-bold text-base text-zinc-900">
                        ${(unitTotal * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. Footer with Radiant Pink Diamond Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#FAD1DC] bg-[#FFF5F7] space-y-3.5 shadow-lg">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider text-zinc-600 font-bold">
                Subtotal Estimado
              </span>
              <span className="font-serif text-2xl font-bold text-zinc-900">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-light">
              <ShieldCheck size={14} className="text-[#D33658]" />
              <span>Garantía de autenticidad en metales nobles y empaque de regalo</span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full btn-pink-diamond py-4 px-6 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition shadow-xl active:scale-[0.99] shimmer-button"
            >
              Finalizar Pedido Seguro <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
