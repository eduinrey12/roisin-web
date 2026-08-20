'use server';

import { createOrderFromCart } from '@/services/order.service';
import { validateCoupon } from '@/services/coupon.service';
import {
  createOrUpdatePayment,
  submitPaymentEvidence,
  processCardPayment,
} from '@/services/payment.service';
import { checkoutSchema } from '@/lib/validations';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import { PaymentMethod } from '@prisma/client';
import { serializePlain } from '@/lib/utils';

export async function validateCouponAction(code: string) {
  try {
    const coupon = await validateCoupon(code);
    return {
      success: true,
      coupon: {
        id: coupon.id,
        code: coupon.code,
        discountPercentage: coupon.discountPercentage,
      },
    };
  } catch (err: any) {
    return { success: false, error: err.message || 'Cupón inválido' };
  }
}

export async function submitOrderAction(formData: unknown) {
  try {
    const data = checkoutSchema.parse(formData);
    const cookieStore = await cookies();
    const guestToken = cookieStore.get('guest_token')?.value;
    const user = await getCurrentUser();

    const order = await createOrderFromCart(guestToken, user?.id, data);
    return { success: true, orderId: order.id, orderNumber: order.orderNumber };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al procesar el pedido' };
  }
}

export async function selectPaymentMethodAction(
  orderId: string,
  method: PaymentMethod
) {
  try {
    const payment = await createOrUpdatePayment(orderId, method);
    return { success: true, payment: serializePlain(payment) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al registrar método de pago' };
  }
}

export async function processCardPaymentAction(
  orderId: string,
  cardData: {
    cardNumber: string;
    cardHolder: string;
    expiryDate: string;
    cvv: string;
    installments?: number;
  }
) {
  try {
    const payment = await processCardPayment(orderId, cardData);
    return { success: true, payment: serializePlain(payment) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al procesar el pago con tarjeta' };
  }
}

export async function submitEvidenceAction(
  orderId: string,
  evidenceUrl: string,
  referenceNumber?: string
) {
  try {
    const payment = await submitPaymentEvidence(orderId, evidenceUrl, referenceNumber);
    return { success: true, payment: serializePlain(payment) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al enviar comprobante' };
  }
}

