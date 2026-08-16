import { getOrderById } from '@/services/order.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { CheckCircle2, MessageCircle, Package, ArrowRight, ShieldCheck } from 'lucide-react';
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

  const whatsappMessage = `Hola Roisin Joyas, deseo consultar el estado de mi pedido ${order.orderNumber}.`;
  const whatsappUrl = `https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || '593999999999'}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="bg-white p-8 sm:p-12 rounded-3xl border border-gray-100 shadow-sm text-center space-y-8">
        {/* Success Icon */}
        <div className="inline-flex p-4 bg-emerald-50 text-emerald-600 rounded-full">
          <CheckCircle2 size={48} />
        </div>

        <div className="space-y-2">
          <span className="text-xs uppercase font-bold tracking-[0.25em] text-emerald-700">
            ¡Compra Exitosa!
          </span>
          <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
            Gracias por tu compra, {order.customerName.split(' ')[0]}
          </h1>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Hemos recibido tu pedido con el código{' '}
            <strong className="text-gray-900 font-mono text-sm">{order.orderNumber}</strong>. Te enviaremos actualizaciones por correo y WhatsApp.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-zinc-50 p-6 rounded-2xl border border-zinc-200/60 text-left space-y-4 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-zinc-200">
            <span className="text-zinc-500 font-semibold uppercase tracking-wider">Detalles del Envío</span>
            <span className="font-bold text-zinc-900">{order.status}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-zinc-700">
            <div>
              <p className="text-[11px] text-zinc-400 uppercase font-semibold">Cliente</p>
              <p className="font-medium text-black mt-0.5">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-[11px] text-zinc-400 uppercase font-semibold">Dirección de Entrega</p>
              <p className="font-medium text-black mt-0.5">{order.shippingAddress}</p>
              <p>{order.city}, {order.province}</p>
            </div>
          </div>

          {/* Purchased Items */}
          <div className="pt-4 border-t border-zinc-200 space-y-2">
            <p className="text-[11px] text-zinc-400 uppercase font-semibold">Artículos ({order.items.length})</p>
            <div className="divide-y divide-zinc-200/60">
              {order.items.map((item) => {
                const product = item.variant.product;
                const img = product.images?.[0]?.url || '/placeholder.png';
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10 rounded-lg overflow-hidden bg-white border border-zinc-200 shrink-0">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-semibold text-black">{product.title}</p>
                        <p className="text-[11px] text-zinc-500">
                          SKU: {item.variant.sku} • Cant: {item.quantity}
                        </p>
                      </div>
                    </div>
                    <span className="font-bold text-black">${Number(item.price).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-zinc-200 space-y-1.5 text-zinc-600">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-emerald-600 font-medium">
                <span>Descuento aplicado</span>
                <span>-${Number(order.discount).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between">
              <span>Envío</span>
              <span>${Number(order.shippingCost).toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm font-bold text-black pt-2 border-t border-zinc-300">
              <span>Total Pagado</span>
              <span>${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps & Support Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-widest font-bold px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2 shadow-sm"
          >
            <MessageCircle size={16} /> Contactar por WhatsApp
          </a>

          <Link
            href="/productos"
            className="w-full sm:w-auto bg-black hover:bg-zinc-800 text-white text-xs uppercase tracking-widest font-bold px-6 py-3.5 rounded-xl transition flex items-center justify-center gap-2"
          >
            Seguir Explorando <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
