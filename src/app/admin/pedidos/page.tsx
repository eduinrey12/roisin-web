import { adminGetAllOrders } from '@/services/order.service';
import OrdersTableClient from './OrdersTableClient';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await adminGetAllOrders();

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-serif text-3xl font-bold text-zinc-900">Gestión de Pedidos</h1>
          <p className="text-xs text-zinc-500 mt-1">Control de estados, envíos y comprobantes de pago</p>
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
          total: Number(o.total),
          status: o.status,
          createdAt: o.createdAt.toISOString(),
          payment: o.payment
            ? {
                id: o.payment.id,
                method: o.payment.method,
                status: o.payment.status,
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
          })),
        }))}
      />
    </div>
  );
}
