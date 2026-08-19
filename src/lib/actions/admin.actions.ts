'use server';

import { requireAdmin } from '@/lib/auth';
import {
  adminCreateProduct,
  adminUpdateProductStatus,
  adminDeleteProduct,
  adminCreateCategory,
  adminUpdateCategory,
  adminDeleteCategory,
  adminCreateCollection,
  adminUpdateCollection,
  adminDeleteCollection,
  adminCreatePromotion,
  adminUpdatePromotion,
  adminDeletePromotion,
} from '@/services/catalog.service';
import { adminUpdateOrderStatus } from '@/services/order.service';
import { adminCreateCoupon, adminToggleCoupon } from '@/services/coupon.service';
import { adjustStock } from '@/services/inventory.service';
import { adminVerifyPayment } from '@/services/payment.service';
import {
  adminCreateShippingRegion,
  adminUpdateShippingRegion,
  adminDeleteShippingRegion,
} from '@/services/shipping.service';
import { productSchema, couponSchema } from '@/lib/validations';
import { OrderStatus } from '@prisma/client';
import { revalidatePath } from 'next/cache';

// ==================== PRODUCT ACTIONS ====================
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
    revalidatePath('/');
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
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message };
  }
}

// ==================== CATEGORY ACTIONS ====================
export async function adminCreateCategoryAction(data: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
}) {
  try {
    await requireAdmin();
    const category = await adminCreateCategory(data);
    revalidatePath('/admin/categorias');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true, category };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear categoría' };
  }
}

export async function adminUpdateCategoryAction(
  id: string,
  data: { name?: string; slug?: string; description?: string; imageUrl?: string; isActive?: boolean }
) {
  try {
    await requireAdmin();
    const category = await adminUpdateCategory(id, data);
    revalidatePath('/admin/categorias');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true, category };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar categoría' };
  }
}

export async function adminDeleteCategoryAction(id: string) {
  try {
    await requireAdmin();
    await adminDeleteCategory(id);
    revalidatePath('/admin/categorias');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar categoría' };
  }
}

// ==================== COLLECTION ACTIONS ====================
export async function adminCreateCollectionAction(data: {
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string;
  bannerUrl?: string;
}) {
  try {
    await requireAdmin();
    const collection = await adminCreateCollection(data);
    revalidatePath('/admin/colecciones');
    revalidatePath('/');
    revalidatePath('/productos');
    return { success: true, collection };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear colección' };
  }
}

export async function adminUpdateCollectionAction(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    imageUrl?: string;
    bannerUrl?: string;
    isActive?: boolean;
  }
) {
  try {
    await requireAdmin();
    const collection = await adminUpdateCollection(id, data);
    revalidatePath('/admin/colecciones');
    revalidatePath('/');
    revalidatePath('/productos');
    return { success: true, collection };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar colección' };
  }
}

export async function adminDeleteCollectionAction(id: string) {
  try {
    await requireAdmin();
    await adminDeleteCollection(id);
    revalidatePath('/admin/colecciones');
    revalidatePath('/');
    revalidatePath('/productos');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar colección' };
  }
}

// ==================== PROMOTION ACTIONS ====================
export async function adminCreatePromotionAction(data: {
  title: string;
  subtitle?: string;
  badge?: string;
  discountText?: string;
  imageUrl: string;
  targetUrl: string;
  sortOrder?: number;
}) {
  try {
    await requireAdmin();
    const promotion = await adminCreatePromotion(data);
    revalidatePath('/admin/promociones');
    revalidatePath('/');
    return { success: true, promotion };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear promoción' };
  }
}

export async function adminUpdatePromotionAction(
  id: string,
  data: {
    title?: string;
    subtitle?: string;
    badge?: string;
    discountText?: string;
    imageUrl?: string;
    targetUrl?: string;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  try {
    await requireAdmin();
    const promotion = await adminUpdatePromotion(id, data);
    revalidatePath('/admin/promociones');
    revalidatePath('/');
    return { success: true, promotion };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar promoción' };
  }
}

export async function adminDeletePromotionAction(id: string) {
  try {
    await requireAdmin();
    await adminDeletePromotion(id);
    revalidatePath('/admin/promociones');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar promoción' };
  }
}

// ==================== SHIPPING REGION ACTIONS ====================
export async function adminCreateShippingRegionAction(data: {
  name: string;
  baseRate: number;
  description?: string;
}) {
  try {
    await requireAdmin();
    const region = await adminCreateShippingRegion(data);
    revalidatePath('/admin/envios');
    revalidatePath('/checkout');
    return { success: true, region };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear zona de envío' };
  }
}

export async function adminUpdateShippingRegionAction(
  id: string,
  data: { name?: string; baseRate?: number; description?: string; isActive?: boolean }
) {
  try {
    await requireAdmin();
    const region = await adminUpdateShippingRegion(id, data);
    revalidatePath('/admin/envios');
    revalidatePath('/checkout');
    return { success: true, region };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar zona de envío' };
  }
}

export async function adminDeleteShippingRegionAction(id: string) {
  try {
    await requireAdmin();
    await adminDeleteShippingRegion(id);
    revalidatePath('/admin/envios');
    revalidatePath('/checkout');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar zona de envío' };
  }
}

// ==================== ORDER ACTIONS ====================
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

// ==================== COUPON ACTIONS ====================
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

// ==================== INVENTORY ACTIONS ====================
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

// ==================== PAYMENT ACTIONS ====================
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

// ==================== STORE SETTINGS ACTIONS ====================
export async function adminUpdateFreeShippingThresholdAction(threshold: number) {
  try {
    await requireAdmin();
    const prisma = (await import('@/lib/db')).default;
    const updated = await prisma.storeSetting.upsert({
      where: { key: 'free_shipping_threshold' },
      update: { value: String(threshold) },
      create: {
        key: 'free_shipping_threshold',
        value: String(threshold),
        label: 'Monto mínimo para Envío Gratis ($)',
        type: 'number',
      },
    });
    revalidatePath('/admin/envios');
    revalidatePath('/checkout');
    revalidatePath('/');
    return { success: true, threshold: Number(updated.value) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar umbral de envío' };
  }
}

export async function getFreeShippingThreshold(): Promise<number> {
  try {
    const prisma = (await import('@/lib/db')).default;
    const setting = await prisma.storeSetting.findUnique({
      where: { key: 'free_shipping_threshold' },
    });
    if (setting && !isNaN(Number(setting.value))) {
      return Number(setting.value);
    }
    return 50.0;
  } catch {
    return 50.0;
  }
}

