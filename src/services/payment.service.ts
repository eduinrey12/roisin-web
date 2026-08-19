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
    method === 'CREDIT_CARD' ? 'PROCESSING' : 'PAYMENT_PENDING';

  if (existing) {
    const updatedPayment = await prisma.payment.update({
      where: { id: existing.id },
      data: {
        method,
        status: method === 'CREDIT_CARD' ? 'COMPLETED' : 'PENDING',
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
      status: method === 'CREDIT_CARD' ? 'COMPLETED' : 'PENDING',
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: nextOrderStatus },
  });

  return payment;
}

export async function processCardPayment(
  orderId: string,
  cardData: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    installments?: number;
  }
) {
  const order = await prisma.order.findUnique({
    where: { id: orderId },
  });

  if (!order) throw new Error('Orden no encontrada');

  const cleanNumber = cardData.cardNumber.replace(/\s+/g, '');
  const lastFour = cleanNumber.slice(-4);
  const cardBrand = cleanNumber.startsWith('4')
    ? 'Visa'
    : cleanNumber.startsWith('5')
    ? 'Mastercard'
    : cleanNumber.startsWith('3')
    ? 'American Express'
    : 'Tarjeta';

  const payment = await prisma.payment.upsert({
    where: { orderId },
    create: {
      orderId,
      method: 'CREDIT_CARD',
      status: 'COMPLETED',
      amount: order.total,
      cardLastFour: lastFour,
      cardBrand,
      installments: cardData.installments || 1,
      referenceNumber: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
    },
    update: {
      method: 'CREDIT_CARD',
      status: 'COMPLETED',
      cardLastFour: lastFour,
      cardBrand,
      installments: cardData.installments || 1,
      referenceNumber: `AUTH-${Math.floor(100000 + Math.random() * 900000)}`,
    },
  });

  await prisma.order.update({
    where: { id: orderId },
    data: { status: 'PROCESSING' },
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

