import { adminGetAllOrders } from '@/services/order.service';
import OrdersTableClient from './OrdersTableClient';
import RoisinDiamond from '@/components/branding/RoisinDiamond';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await adminGetAllOrders();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 border-b border-[#DFD0EC] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 text-[10px] uppercase font-bold tracking-[0.25em] text-[#3F235F] mb-1">
            <RoisinDiamond size={13} color="#7043A0" /> Control de Ventas
          </div>
          <h1 className="font-sans text-3xl sm:text-4xl font-bold text-zinc-900 leading-tight">
            Gestión de Pedidos & Comprobantes
          </h1>
          <p className="text-xs text-zinc-500 font-light mt-0.5">
            Verificación de transferencias bancarias, tarjetas, actualización de estados de envío en español y dedicatorias de regalo.
          </p>
        </div>
      </div>

      <OrdersTableClient
        orders={orders.map((o) => ({
          id: o.id,
          orderNumber: o.orderNumber,
          customerName: o.customerName,
          customerEmail: o.customerEmail,
          customerPhone: o.customerPhone,
          shippingAddress: o.shippingAddress,
          city: o.city,
          province: o.province,
          dedication: o.dedication,
          total: Number(o.total),
          status: o.status,
          createdAt: o.createdAt.toISOString(),
          payment: o.payment
            ? {
                id: o.payment.id,
                method: o.payment.method,
                status: o.payment.status,
                cardLastFour: o.payment.cardLastFour,
                cardBrand: o.payment.cardBrand,
                installments: o.payment.installments,
                evidenceUrl: o.payment.evidenceUrl,
                referenceNumber: o.payment.referenceNumber,
              }
            : null,
          items: o.items.map((i) => ({
            id: i.id,
            productTitle: i.variant.product.title,
            sku: i.variant.sku,
            quantity: i.quantity,
            price: Number(i.price),
            dedication: i.dedication,
          })),
        }))}
      />
    </div>
  );
}

