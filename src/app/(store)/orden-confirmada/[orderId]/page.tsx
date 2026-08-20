import { getOrderById } from '@/services/order.service';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { MessageCircle, ArrowRight, PenTool } from 'lucide-react';
import RoisinDiamond from '@/components/branding/RoisinDiamond';
import { STORE_CONFIG } from '@/lib/config/store';
import { getOrderStatusLabel, getOrderStatusColor, getPaymentMethodLabel } from '@/lib/utils';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: '¡Pedido Confirmado! | ROISIN Diamante Morado',
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

  const whatsappMessage = `Hola ${STORE_CONFIG.name}, acabo de realizar mi pedido #${order.orderNumber} por un total de $${Number(order.total).toFixed(2)}.`;
  const whatsappUrl = `https://wa.me/${STORE_CONFIG.whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`;

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <div className="bg-white p-6 sm:p-12 rounded-3xl border border-[#DFD0EC] shadow-sm text-center space-y-8">
        {/* Success Icon: Brand Diamond (No Circular Enclosure) */}
        <div className="flex items-center justify-center pt-2">
          <RoisinDiamond size={56} color="#7043A0" />
        </div>

        <div className="space-y-2">
          <span className="text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F] block">
            ¡Compra Confirmada con Éxito!
          </span>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900">
            Gracias por elegirnos, {order.customerName.split(' ')[0]}
          </h1>
          <p className="text-xs text-zinc-500 max-w-md mx-auto">
            Hemos registrado tu pedido con el código{' '}
            <strong className="text-zinc-900 font-mono text-sm font-bold">{order.orderNumber}</strong>. Prepararemos tu joya con nuestro empaque exclusivo de Diamante Morado.
          </p>
        </div>

        {/* Order Summary Card */}
        <div className="bg-[#F8F5FA] p-6 sm:p-7 rounded-2xl border border-[#DFD0EC] text-left space-y-4 text-xs">
          <div className="flex justify-between items-center pb-3 border-b border-[#DFD0EC]">
            <span className="text-zinc-500 font-bold uppercase tracking-wider text-[11px]">
              Detalles del Pedido
            </span>
            <span
              className={`font-bold px-3 py-1 rounded-full border text-[11px] ${getOrderStatusColor(
                order.status
              )}`}
            >
              {getOrderStatusLabel(order.status)}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-zinc-600">
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Cliente</p>
              <p className="font-medium text-zinc-900">{order.customerName}</p>
              <p>{order.customerEmail}</p>
              <p>{order.customerPhone}</p>
            </div>
            <div>
              <p className="text-[10px] text-zinc-400 uppercase font-bold">Destino de Entrega</p>
              <p className="font-medium text-zinc-900">{order.city}, {order.province}</p>
              <p>{order.shippingAddress}</p>
            </div>
          </div>

          {/* Dedication Message on Order */}
          {order.dedication && (
            <div className="p-3 bg-white rounded-xl border border-[#DFD0EC] space-y-1">
              <div className="flex items-center gap-1.5 text-[#3F235F] font-bold text-[11px]">
                <PenTool size={13} /> Dedicatoria para la Tarjeta de Regalo:
              </div>
              <p className="italic text-zinc-700 text-xs whitespace-pre-line">&ldquo;{order.dedication}&rdquo;</p>
            </div>
          )}

          {/* Purchased Items */}
          <div className="pt-4 border-t border-[#DFD0EC] space-y-2">
            <p className="text-[10px] text-zinc-400 uppercase font-bold">Joyas Seleccionadas ({order.items.length})</p>
            <div className="divide-y divide-[#DFD0EC]/60">
              {order.items.map((item) => {
                const product = item.variant.product;
                const img =
                  product.images?.[0]?.url ||
                  'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?q=80&w=800&auto=format&fit=crop';
                return (
                  <div key={item.id} className="py-2.5 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="relative w-11 h-11 rounded-xl overflow-hidden bg-white border border-[#DFD0EC] shrink-0">
                        <Image src={img} alt="" fill className="object-cover" />
                      </div>
                      <div>
                        <p className="font-sans font-bold text-zinc-900">{product.title}</p>
                        <p className="text-[10px] text-zinc-500">
                          SKU: {item.variant.sku} • Cantidad: {item.quantity}
                        </p>
                        {item.dedication && (
                          <p className="text-[10px] text-zinc-400 italic">
                            Nota: &ldquo;{item.dedication}&rdquo;
                          </p>
                        )}
                      </div>
                    </div>
                    <span className="font-sans font-bold text-[#3F235F]">${Number(item.price).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Totals */}
          <div className="pt-4 border-t border-[#DFD0EC] space-y-1.5 text-zinc-600">
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
            {Number((order as any).giftCardFee) > 0 && (
              <div className="flex justify-between text-[#7043A0] font-semibold">
                <span>Tarjetas de regalo adicionales</span>
                <span>+${Number((order as any).giftCardFee).toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm font-bold text-zinc-900 pt-2 border-t border-[#DFD0EC]">
              <span>Total Pagado</span>
              <span className="font-sans text-xl text-[#3F235F] font-bold">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Next Steps & Support Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="w-full sm:w-auto bg-emerald-600 hover:bg-emerald-700 text-white text-xs uppercase tracking-widest font-bold px-7 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <MessageCircle size={16} /> Consultar por WhatsApp
          </a>

          <Link
            href="/productos"
            className="w-full sm:w-auto btn-purple-diamond text-white text-xs uppercase tracking-widest font-bold px-8 py-3.5 rounded-2xl transition flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            Seguir Explorando Joyas <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

