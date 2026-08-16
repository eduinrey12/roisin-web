'use client';

import { useCartStore } from '@/lib/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight, Sparkles } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export default function CartDrawer() {
  const { cart, isOpen, closeCart, updateQuantity, removeItem } = useCartStore();

  if (!isOpen) return null;

  const items = cart?.items || [];
  const subtotal = items.reduce((sum: number, item: any) => {
    const itemPrice = Number(item.variant.price);
    const optionsPrice = (item.options || []).reduce(
      (optSum: number, o: any) => optSum + Number(o.option.priceModifier || 0),
      0
    );
    return sum + (itemPrice + optionsPrice) * item.quantity;
  }, 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 transition-opacity animate-fade-in"
        onClick={closeCart}
      />

      {/* Drawer Panel */}
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out border-l border-[#F0E6E8]">
        {/* Header */}
        <div className="p-5 border-b border-[#F0E6E8] flex justify-between items-center bg-[#FAF4F5]">
          <div className="flex items-center gap-2">
            <RoisinDiamond size={18} color="#BE6C7C" />
            <h2 className="text-sm font-serif font-bold uppercase tracking-wider text-zinc-900">
              Bolsa de Joyas ({items.reduce((acc: number, i: any) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-[#F6E8EB] rounded-full transition text-zinc-500 hover:text-black"
            aria-label="Cerrar bolsa"
          >
            <X size={18} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-[#FAF4F5]">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="p-4 bg-[#FAF4F5] rounded-full text-[#BE6C7C] border border-[#EFCFD6]">
                <ShoppingBag size={40} strokeWidth={1.5} />
              </div>
              <div className="space-y-1">
                <h3 className="font-serif text-lg font-bold text-zinc-900">Tu bolsa está vacía</h3>
                <p className="text-xs text-zinc-500 max-w-[240px] mx-auto">
                  Descubre nuestras exclusivas piezas en plata y oro para llenar tu colección.
                </p>
              </div>
              <Link
                href="/productos"
                onClick={closeCart}
                className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest bg-zinc-900 text-white px-7 py-3.5 rounded-full font-bold hover:bg-black transition shadow-xs"
              >
                Ver Colección <ArrowRight size={14} />
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
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  <div className="w-20 h-20 bg-[#FAF7F8] rounded-2xl overflow-hidden shrink-0 relative border border-[#F0E6E8]">
                    <Image
                      src={primaryImg}
                      alt={product.title}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start gap-2">
                        <Link
                          href={`/productos/${product.slug}`}
                          onClick={closeCart}
                          className="font-serif font-bold text-sm text-zinc-900 hover:text-[#BE6C7C] transition line-clamp-1"
                        >
                          {product.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-zinc-400 hover:text-red-600 transition p-1"
                          title="Eliminar"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>

                      <p className="text-[11px] text-zinc-500 mt-0.5">Talla: {item.variant.sku.split('-').pop() || item.variant.sku}</p>

                      {item.options && item.options.length > 0 && (
                        <div className="mt-1">
                          {item.options.map((opt: any) => (
                            <span
                              key={opt.id}
                              className="inline-block text-[10px] text-[#BE6C7C] bg-[#FAF4F5] px-2 py-0.5 rounded-full border border-[#EFCFD6] mr-1 font-medium"
                            >
                              {opt.option.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#EFCFD6] rounded-xl overflow-hidden bg-white">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2.5 py-1 text-zinc-600 hover:bg-[#FAF4F5] transition text-xs font-bold"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="px-2 text-xs font-bold text-zinc-900">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2.5 py-1 text-zinc-600 hover:bg-[#FAF4F5] transition text-xs font-bold"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <span className="font-serif font-bold text-sm text-zinc-900">
                        ${(unitTotal * item.quantity).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer with Checkout CTA */}
        {items.length > 0 && (
          <div className="p-5 border-t border-[#F0E6E8] bg-[#FAF4F5] space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-zinc-600 font-bold">
                Subtotal Estimado
              </span>
              <span className="font-serif text-xl font-bold text-zinc-900">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-zinc-500 font-light">
              Envíos y tarifas calculados al continuar.
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full bg-zinc-900 text-white py-4 px-6 rounded-2xl text-xs uppercase tracking-widest font-bold flex items-center justify-center gap-2 hover:bg-black transition shadow-md active:scale-[0.99] shimmer-button"
            >
              Finalizar Pedido Seguro <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
