import { getOrderById } from '@/services/order.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, MessageCircle, Package, ArrowRight, Sparkles, Heart } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { STORE_CONFIG } from '@/lib/config/store';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '¡Pedido Confirmado! | ROISIN',
};

export default async function OrderSuccessPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  const whatsappMessage = `Hola ${STORE_CONFIG.name}, acabo de realizar mi pedido #${order.orderNumber} por $${Number(order.total).toFixed(2)}.`;
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-14 sm:py-16">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-[#EFCFD6] shadow-sm text-center space-y-8">
        {/* Success Icon with Diamond Backdrop */}
        <div className="inline-flex p-4 bg-[#FAF4F5] text-[#BE6C7C] rounded-full border border-[#EFCFD6]">
          <RoisinDiamond size={48} color="#BE6C7C" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#BE6C7C] block">
            ¡Compra Confirmada con Éxito!
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-zinc-900">
            Gracias por elegirnos, {order.customerName.split(' ')[0]}
          </h1>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Hemos registrado tu pedido con el código{' '}
            <strong className="text-zinc-900 font-mono text-sm font-bold">{order.orderNumber}</strong>. Prepararemos tu joya con nuestro empaque exclusivo.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-[#FAF4F5] p-6 sm:p-7 rounded-2xl border border-[#EFCFD6] text-left space-y-4 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-[#EFCFD6]">
            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
              Detalles de Entrega
            </span>
            <span className="font-bold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
              {order.status}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-700">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Destinatario</p>
              <p className="font-semibold text-zinc-900 mt-0.5">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Dirección</p>
              <p className="font-semibold text-zinc-900 mt-0.5">{order.shippingAddress}</p>
              <p>{order.city}, {order.province}</p>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="pt-4 border-t border-[#EFCFD6] space-y-2">
            <p className="text-[10px] text-zinc-400 uppercase font-bold">Joyas Seleccionadas ({order.items.length})</p>
            <div className="divide-y divide-[#EFCFD6]/60">
              {order.items.map((item) => {
                const product = item.variant.product;
                const img = product.images?.[0]?.url || 'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop';
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white border border-[#EFCFD6] shrink-0">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-serif font-bold text-zinc-900">{product.title}</p>
                        <p className="text-[10px] text-zinc-500">
                          SKU: {item.variant.sku} • Cantidad: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-zinc-900">${Number(item.price).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-[#EFCFD6] space-y-1.5 text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Descuento aplicado</span>
                <span>-${Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Envío</span>
              <span>${Number(order.shippingCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-[#EFCFD6]">
              <span>Total Pagado</span>
              <span className="font-serif text-lg">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps & Support Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-widest font-bold px-7 py-4 rounded-2xl transition flex items-center justify-center gap-2 shadow-xs"
          >
            <MessageCircle size={16} /> Consultar por WhatsApp
          </a>

          <Link
            href="/productos"
            className="w-full sm:w-auto bg-zinc-900 hover:bg-black text-white text-xs uppercase tracking-widest font-bold px-7 py-4 rounded-2xl transition flex items-center justify-center gap-2"
          >
            Seguir Explorando Joyas <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
