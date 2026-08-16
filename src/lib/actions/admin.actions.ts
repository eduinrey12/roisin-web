'use server';

import { requireAdmin } from '@/lib/auth';
import {
  adminCreateProduct,
  adminUpdateProductStatus,
  adminDeleteProduct,
} from '@/services/catalog.service';
import { adminUpdateOrderStatus } from '@/services/order.service';
import { adminCreateCoupon, adminToggleCoupon } from '@/services/coupon.service';
import { adjustStock } from '@/services/inventory.service';
import { adminVerifyPayment } from '@/services/payment.service';
import { productSchema, couponSchema } from '@/lib/validations';
import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

export async function adminCreateProductAction(formData: unknown) {
  try {
    await requireAdmin();
    const data = productSchema.parse(formData);
    const product = await adminCreateProduct(data);
    revalidatePath('/admin/productos');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true, product };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear producto' };
  }
}

export async function adminUpdateProductStatusAction(id: string, isActive: boolean) {
  try {
    await requireAdmin();
    await adminUpdateProductStatus(id, isActive);
    revalidatePath('/admin/productos');
    revalidatePath('/productos');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminDeleteProductAction(id: string) {
  try {
    await requireAdmin();
    await adminDeleteProduct(id);
    revalidatePath('/admin/productos');
    revalidatePath('/productos');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminUpdateOrderStatusAction(orderId: string, status: OrderStatus) {
  try {
    await requireAdmin();
    const order = await adminUpdateOrderStatus(orderId, status);
    revalidatePath('/admin/pedidos');
    revalidatePath('/admin');
    return { success: true, order };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminCreateCouponAction(formData: unknown) {
  try {
    await requireAdmin();
    const data = couponSchema.parse(formData);
    const coupon = await adminCreateCoupon({
      ...data,
      validUntil: data.validUntil ? new Date(data.validUntil) : undefined,
    });
    revalidatePath('/admin/cupones');
    return { success: true, coupon };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminToggleCouponAction(id: string, isActive: boolean) {
  try {
    await requireAdmin();
    await adminToggleCoupon(id, isActive);
    revalidatePath('/admin/cupones');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminAdjustStockAction(variantId: string, quantityChange: number) {
  try {
    await requireAdmin();
    const updated = await adjustStock(
      variantId,
      quantityChange,
      'MANUAL_ADJUSTMENT'
    );
    revalidatePath('/admin/inventario');
    return { success: true, updated };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

export async function adminVerifyPaymentAction(paymentId: string, isApproved: boolean) {
  try {
    await requireAdmin();
    await adminVerifyPayment(paymentId, isApproved);
    revalidatePath('/admin/pedidos');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}
