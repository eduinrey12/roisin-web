import { getOrderById } from '@/services/order.service';
import { notFound } from 'next/navigation';
import PaymentClientForm from './PaymentClientForm';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Completar Pago del Pedido | ROISIN',
};

export default async function PaymentPage({
  params,
}: {
  params: Promise<{ orderId: string }>;
}) {
  const { orderId } = await params;
  const order = await getOrderById(orderId);

  if (!order) {
    notFound();
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="text-center space-y-2 mb-10">
        <span className="text-xs uppercase font-bold tracking-widest text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
          Pedido {order.orderNumber} Registrado
        </span>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold text-gray-900">
          Selecciona tu Método de Pago
        </h1>
        <p className="text-xs text-gray-500 max-w-md mx-auto">
          Monto total a pagar: <strong className="text-gray-900 text-sm">${Number(order.total).toFixed(2)}</strong>
        </p>
      </div>

      <PaymentClientForm
        order={{
          id: order.id,
          orderNumber: order.orderNumber,
          total: Number(order.total),
          customerName: order.customerName,
          payment: order.payment
            ? {
                method: order.payment.method,
                status: order.payment.status,
                evidenceUrl: order.payment.evidenceUrl,
              }
            : null,
        }}
      />
    </div>
  );
}
