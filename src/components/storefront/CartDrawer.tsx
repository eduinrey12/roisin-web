'use client';

import { useState, useEffect } from 'react';
import { useCartStore } from '@/lib/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ArrowRight, Truck, ShieldCheck, PenTool } from 'lucide-react';
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

  // Dynamic Free Shipping Threshold (configured from admin panel)
  const [freeShippingThreshold, setFreeShippingThreshold] = useState<number>(50.0);

  useEffect(() => {
    fetch('/api/settings/free-shipping')
      .then((res) => res.json())
      .then((data) => {
        if (data?.threshold && !isNaN(Number(data.threshold))) {
          setFreeShippingThreshold(Number(data.threshold));
        }
      })
      .catch(() => {});
  }, [isOpen]);

  const progressPercent = freeShippingThreshold <= 0 ? 100 : Math.min(100, (subtotal / freeShippingThreshold) * 100);
  const remainingForFreeShipping = Math.max(0, freeShippingThreshold - subtotal);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out border-l border-[#DFD0EC]">
        {/* 1. Purple Diamond Header */}
        <div className="p-5 border-b border-[#DFD0EC] flex justify-between items-center bg-[#F8F5FA]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white rounded-2xl border border-[#DFD0EC] shadow-xs">
              <RoisinDiamond size={20} color="#7043A0" />
            </div>
            <div>
              <span className="text-[9px] uppercase font-bold tracking-[0.25em] text-[#3F235F] block">
                Carrito de Joyas
              </span>
              <h2 className="font-sans text-base font-bold text-zinc-900 leading-tight">
                Tus Piezas Seleccionadas ({totalItems})
              </h2>
            </div>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-white rounded-full transition text-zinc-400 hover:text-zinc-900 border border-transparent hover:border-[#DFD0EC] cursor-pointer"
            aria-label="Cerrar carrito"
          >
            <X size={18} />
          </button>
        </div>

        {/* 2. Free Shipping Progress Bar */}
        {items.length > 0 && (
          <div className="bg-[#F0E9F5]/50 p-3.5 px-5 border-b border-[#DFD0EC] space-y-1.5 text-xs">
            <div className="flex items-center justify-between text-[11px] font-bold">
              <span className="flex items-center gap-1.5 text-zinc-800">
                <Truck size={14} className="text-[#3F235F]" />
                {remainingForFreeShipping === 0 ? (
                  <span className="text-emerald-700">¡Felicidades! Tienes Envío Express Gratis</span>
                ) : (
                  <span>
                    Te faltan <strong className="text-[#3F235F] font-bold">${remainingForFreeShipping.toFixed(2)}</strong> para Envío Gratis
                  </span>
                )}
              </span>
              <span className="text-zinc-500 font-bold">{Math.round(progressPercent)}%</span>
            </div>
            <div className="w-full h-1.5 bg-[#DFD0EC]/60 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-[#9C77C2] via-[#7043A0] to-[#3F235F] transition-all duration-500 rounded-full"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        )}

        {/* 3. Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3.5 divide-y divide-transparent">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="p-5 bg-[#F8F5FA] rounded-full text-[#7043A0] border border-[#DFD0EC] shadow-sm">
                <RoisinDiamond size={48} color="#7043A0" />
              </div>
              <div className="space-y-1 max-w-[260px]">
                <h3 className="font-sans text-lg font-bold text-zinc-900">Tu carrito está vacío</h3>
                <p className="text-xs text-zinc-500 font-light leading-relaxed">
                  Descubre nuestras exclusivas piezas en Plata 925 y Oro 18k para iluminar tu colección.
                </p>
              </div>
              <Link
                href="/productos"
                onClick={closeCart}
                className="inline-flex items-center justify-center gap-2 btn-purple-diamond text-xs uppercase tracking-wider px-8 py-3.5 rounded-full font-bold transition shadow-md cursor-pointer"
              >
                <span>Explorar Colecciones</span>
                <ArrowRight size={14} />
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
                  className="bg-[#F8F5FA] p-4 rounded-3xl border border-[#DFD0EC] shadow-2xs flex gap-3.5 transition-all hover:border-[#7043A0]"
                >
                  <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden shrink-0 relative border border-[#DFD0EC] shadow-2xs">
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
                          className="font-sans font-bold text-sm text-zinc-900 hover:text-[#3F235F] transition truncate"
                        >
                          {product.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-400 hover:text-red-600 transition p-1 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                          title="Eliminar joya"
                          aria-label="Eliminar joya"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <p className="text-[11px] text-zinc-500 mt-0.5 font-medium">
                        Talla: <span className="font-bold text-zinc-800">{item.variant.sku.split('-').pop() || item.variant.sku}</span>
                      </p>

                      {/* Dedication Display in Cart Item */}
                      {item.dedication && (
                        <div className="mt-1 flex items-start gap-1 p-1.5 bg-white rounded-xl border border-[#DFD0EC] text-[10px] text-zinc-600">
                          <PenTool size={11} className="text-[#7043A0] shrink-0 mt-0.5" />
                          <span className="italic line-clamp-2">&ldquo;{item.dedication}&rdquo;</span>
                        </div>
                      )}

                      {item.options && item.options.length > 0 && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.options.map((opt: any) => (
                            <span
                              key={opt.id}
                              className="inline-flex items-center gap-1 text-[9.5px] text-[#3F235F] bg-white px-2 py-0.5 rounded-full border border-[#DFD0EC] font-bold"
                            >
                              <RoisinDiamond size={8} color="#7043A0" />
                              {opt.option.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3 pt-2 border-t border-[#DFD0EC]/60">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#DFD0EC] rounded-xl overflow-hidden bg-white shadow-2xs">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-zinc-600 hover:bg-[#F8F5FA] transition text-xs font-bold cursor-pointer"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2.5 text-xs font-bold text-zinc-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-zinc-600 hover:bg-[#F8F5FA] transition text-xs font-bold cursor-pointer"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-sans font-bold text-base text-[#3F235F]">
                        ${(unitTotal * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* 4. Footer with Purple Diamond Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#DFD0EC] bg-[#F8F5FA] space-y-3.5 shadow-lg">
            <div className="flex justify-between items-baseline">
              <span className="text-xs uppercase tracking-wider text-zinc-600 font-bold">
                Subtotal Estimado
              </span>
              <span className="font-sans text-2xl font-bold text-[#3F235F]">
                ${subtotal.toFixed(2)}
              </span>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-zinc-500 font-light">
              <ShieldCheck size={14} className="text-[#3F235F]" />
              <span>Garantía de autenticidad en metales nobles y empaque de regalo</span>
            </div>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full btn-purple-diamond py-4 px-6 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 transition shadow-xl active:scale-[0.99] cursor-pointer"
            >
              Finalizar Pedido Seguro <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}

