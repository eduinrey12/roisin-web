import prisma from '@/lib/db';
import { PaymentMethod, PaymentStatus, OrderStatus } from '@prisma/client';

export async function createOrUpdatePayment(
  orderId: string,
  method: PaymentMethod
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error('Orden no encontrada');

  const existing = await prisma.payment.findUnique({
    where: { orderId },
  });

  const nextOrderStatus: OrderStatus =
    method === 'BANK_TRANSFER' ? 'PAYMENT_PENDING' : 'PROCESSING';

  if (existing) {
    const updatedPayment = await prisma.payment.update({
      where: { id: existing.id },
      data: {
        method,
        status: 'PENDING',
      },
    });

    await prisma.order.update({
      where: { id: orderId },
      data: { status: nextOrderStatus },
    });

    return updatedPayment;
  }

  const payment = await prisma.payment.create({
    data: {
      orderId,
      method,
      amount: order.total,
      status: 'PENDING',
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: nextOrderStatus },
  });

  return payment;
}

export async function submitPaymentEvidence(
  orderId: string,
  evidenceUrl: string,
  referenceNumber?: string
) {
  const payment = await prisma.payment.findUnique({
    where: { orderId },
  });

  if (!payment) throw new Error('Registro de pago no encontrado');

  const updatedPayment = await prisma.payment.update({
    where: { id: payment.id },
    data: {
      evidenceUrl,
      referenceNumber: referenceNumber || null,
      status: 'VERIFYING',
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PROCESSING' },
  });

  return updatedPayment;
}

export async function adminVerifyPayment(paymentId: string, isApproved: boolean) {
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
  });
  if (!payment) throw new Error('Pago no encontrado');

  const newStatus: PaymentStatus = isApproved ? 'COMPLETED' : 'FAILED';
  const newOrderStatus: OrderStatus = isApproved ? 'PROCESSING' : 'PAYMENT_PENDING';

  return prisma.$transaction([
    prisma.payment.update({
      where: { id: paymentId },
      data: { status: newStatus },
    }),
    prisma.order.update({
      where: { id: payment.orderId },
      data: { status: newOrderStatus },
    }),
  ]);
}
