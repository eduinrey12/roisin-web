'use client';

import { useCartStore } from '@/lib/store/cartStore';
import Image from 'next/image';
import Link from 'next/link';
import { X, Plus, Minus, Trash2, ShoppingBag, ArrowRight } from 'lucide-react';

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
      <aside className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-50 flex flex-col transform transition-transform duration-300 ease-out">
        {/* Header */}
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-black" />
            <h2 className="text-base font-bold uppercase tracking-wider text-black">
              Bolsa de Compras ({items.reduce((acc: number, i: any) => acc + i.quantity, 0)})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-2 hover:bg-gray-200/60 rounded-full transition text-gray-500 hover:text-black"
            aria-label="Cerrar bolsa"
          >
            <X size={20} />
          </button>
        </div>

        {/* Items List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 divide-y divide-gray-100">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-16 space-y-4">
              <div className="p-4 bg-gray-50 rounded-full text-gray-400">
                <ShoppingBag size={48} strokeWidth={1.5} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-gray-900">Tu bolsa está vacía</h3>
                <p className="text-xs text-gray-500 mt-1 max-w-[240px]">
                  Descubre nuestras exclusivas piezas en plata y oro para llenar tu colección.
                </p>
              </div>
              <Link
                href="/productos"
                onClick={closeCart}
                className="mt-4 inline-flex items-center gap-2 text-xs uppercase tracking-widest bg-black text-white px-6 py-3 rounded-full font-medium hover:bg-gray-800 transition"
              >
                Ver Catálogo <ArrowRight size={14} />
              </Link>
            </div>
          ) : (
            items.map((item: any) => {
              const product = item.variant.product;
              const primaryImg = product.images?.[0]?.url || '/placeholder.png';
              const itemPrice = Number(item.variant.price);
              const optionsPrice = (item.options || []).reduce(
                (optSum: number, o: any) => optSum + Number(o.option.priceModifier || 0),
                0
              );
              const unitTotal = itemPrice + optionsPrice;

              return (
                <div key={item.id} className="pt-4 first:pt-0 flex gap-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0 relative border border-gray-100">
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
                          className="font-medium text-sm text-gray-900 hover:underline line-clamp-1"
                        >
                          {product.title}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-gray-400 hover:text-red-600 transition p-1"
                          title="Eliminar"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>

                      <p className="text-xs text-gray-500 mt-0.5">SKU: {item.variant.sku}</p>

                      {item.options && item.options.length > 0 && (
                        <div className="mt-1">
                          {item.options.map((opt: any) => (
                            <span
                              key={opt.id}
                              className="inline-block text-[11px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60 mr-1"
                            >
                              {opt.option.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex justify-between items-center mt-3">
                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-gray-200 rounded-md">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="p-1 text-gray-600 hover:bg-gray-100 transition"
                          aria-label="Disminuir cantidad"
                        >
                          <Minus size={14} />
                        </button>
                        <span className="px-2.5 text-xs font-semibold">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="p-1 text-gray-600 hover:bg-gray-100 transition"
                          aria-label="Aumentar cantidad"
                        >
                          <Plus size={14} />
                        </button>
                      </div>

                      <span className="font-bold text-sm text-gray-900">
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
          <div className="p-5 border-t border-gray-100 bg-gray-50/50 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs uppercase tracking-wider text-gray-500 font-semibold">
                Subtotal estimado
              </span>
              <span className="text-lg font-bold text-gray-900">${subtotal.toFixed(2)}</span>
            </div>
            <p className="text-[11px] text-gray-500">
              Impuestos y costos de envío calculados en el checkout.
            </p>

            <Link
              href="/checkout"
              onClick={closeCart}
              className="w-full bg-black text-white py-3.5 px-6 rounded-lg text-xs uppercase tracking-widest font-semibold flex items-center justify-center gap-2 hover:bg-gray-800 transition shadow-sm active:scale-[0.99]"
            >
              Iniciar Checkout Seguro <ArrowRight size={16} />
            </Link>
          </div>
        )}
      </aside>
    </>
  );
}
