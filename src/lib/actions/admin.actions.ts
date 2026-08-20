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
  adminCreateReview,
  adminUpdateReview,
  adminDeleteReview,
  adminCreateFaq,
  adminUpdateFaq,
  adminToggleFaqHomeStatus,
  adminDeleteFaq,
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
import { serializePlain } from '@/lib/utils';

// ==================== PRODUCT ACTIONS ====================
export async function adminCreateProductAction(formData: unknown) {
  try {
    await requireAdmin();
    const data = productSchema.parse(formData);
    const product = await adminCreateProduct(data);
    revalidatePath('/admin/productos');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true, product: serializePlain(product) };
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
    return { success: true, category: serializePlain(category) };
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
    return { success: true, category: serializePlain(category) };
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
    return { success: true, collection: serializePlain(collection) };
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
    return { success: true, collection: serializePlain(collection) };
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
  imageUrl: string;
  targetType?: 'COLLECTION' | 'PRODUCTS' | 'CUSTOM_URL';
  collectionId?: string | null;
  productIds?: string[];
  discountPercent?: number | null;
  targetUrl?: string;
  sortOrder?: number;
}) {
  try {
    await requireAdmin();
    const promotion = await adminCreatePromotion(data);
    revalidatePath('/admin/promociones');
    revalidatePath('/');
    return { success: true, promotion: serializePlain(promotion) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear promoción' };
  }
}

export async function adminUpdatePromotionAction(
  id: string,
  data: {
    title?: string;
    imageUrl?: string;
    targetType?: 'COLLECTION' | 'PRODUCTS' | 'CUSTOM_URL';
    collectionId?: string | null;
    productIds?: string[];
    discountPercent?: number | null;
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
    return { success: true, promotion: serializePlain(promotion) };
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

// ==================== REVIEW ACTIONS ====================
export async function adminCreateReviewAction(data: {
  authorName: string;
  location?: string;
  rating?: number;
  comment: string;
  mediaUrl?: string;
  mediaType?: 'IMAGE' | 'VIDEO' | 'NONE';
  productTitle?: string;
  isVerified?: boolean;
  sortOrder?: number;
}) {
  try {
    await requireAdmin();
    const review = await adminCreateReview(data);
    revalidatePath('/admin/resenas');
    revalidatePath('/');
    return { success: true, review: serializePlain(review) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear reseña' };
  }
}

export async function adminUpdateReviewAction(
  id: string,
  data: {
    authorName?: string;
    location?: string;
    rating?: number;
    comment?: string;
    mediaUrl?: string;
    mediaType?: 'IMAGE' | 'VIDEO' | 'NONE';
    productTitle?: string;
    isVerified?: boolean;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  try {
    await requireAdmin();
    const review = await adminUpdateReview(id, data);
    revalidatePath('/admin/resenas');
    revalidatePath('/');
    return { success: true, review: serializePlain(review) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar reseña' };
  }
}

export async function adminDeleteReviewAction(id: string) {
  try {
    await requireAdmin();
    await adminDeleteReview(id);
    revalidatePath('/admin/resenas');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar reseña' };
  }
}

// ==================== FAQ ACTIONS ====================
export async function adminCreateFaqAction(data: {
  question: string;
  answer: string;
  category?: string;
  sortOrder?: number;
  showOnHome?: boolean;
}) {
  try {
    await requireAdmin();
    const faq = await adminCreateFaq(data);
    revalidatePath('/admin/faqs');
    revalidatePath('/preguntas-frecuentes');
    revalidatePath('/');
    return { success: true, faq: serializePlain(faq) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear FAQ' };
  }
}

export async function adminUpdateFaqAction(
  id: string,
  data: {
    question?: string;
    answer?: string;
    category?: string;
    sortOrder?: number;
    showOnHome?: boolean;
    isActive?: boolean;
  }
) {
  try {
    await requireAdmin();
    const faq = await adminUpdateFaq(id, data);
    revalidatePath('/admin/faqs');
    revalidatePath('/preguntas-frecuentes');
    revalidatePath('/');
    return { success: true, faq: serializePlain(faq) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar FAQ' };
  }
}

export async function adminToggleFaqHomeStatusAction(id: string, showOnHome: boolean) {
  try {
    await requireAdmin();
    const faq = await adminToggleFaqHomeStatus(id, showOnHome);
    revalidatePath('/admin/faqs');
    revalidatePath('/preguntas-frecuentes');
    revalidatePath('/');
    return { success: true, faq: serializePlain(faq) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al cambiar visibilidad en portada' };
  }
}

export async function adminDeleteFaqAction(id: string) {
  try {
    await requireAdmin();
    await adminDeleteFaq(id);
    revalidatePath('/admin/faqs');
    revalidatePath('/preguntas-frecuentes');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar FAQ' };
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
    return { success: true, region: serializePlain(region) };
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
    return { success: true, region: serializePlain(region) };
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
    return { success: true, order: serializePlain(order) };
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
    return { success: true, coupon: serializePlain(coupon) };
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
    return { success: true, updated: serializePlain(updated) };
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
    const cleanValue = isNaN(Number(threshold)) ? 50.0 : Number(threshold);
    let val = cleanValue.toFixed(2);

    if ((prisma as any).storeSetting) {
      const updated = await (prisma as any).storeSetting.upsert({
        where: { key: 'free_shipping_threshold' },
        update: { value: val },
        create: {
          key: 'free_shipping_threshold',
          value: val,
          label: 'Monto mínimo para Envío Gratis ($)',
          type: 'number',
        },
      });
      val = updated.value;
    } else {
      await prisma.$executeRawUnsafe(
        `INSERT INTO StoreSetting (id, \`key\`, \`value\`, \`type\`, \`label\`, createdAt, updatedAt)
         VALUES (UUID(), 'free_shipping_threshold', ?, 'number', 'Monto mínimo para Envío Gratis ($)', NOW(), NOW())
         ON DUPLICATE KEY UPDATE \`value\` = ?, updatedAt = NOW()`,
        val,
        val
      );
    }

    revalidatePath('/admin/envios');
    revalidatePath('/checkout');
    revalidatePath('/');
    return { success: true, threshold: Number(val) };
  } catch (err: any) {
    console.error('Error in adminUpdateFreeShippingThresholdAction:', err);
    return { success: false, error: err.message || 'Error al actualizar umbral de envío' };
  }
}

export async function getFreeShippingThreshold(): Promise<number> {
  try {
    const prisma = (await import('@/lib/db')).default;
    if ((prisma as any).storeSetting) {
      const setting = await (prisma as any).storeSetting.findUnique({
        where: { key: 'free_shipping_threshold' },
      });
      if (setting && !isNaN(Number(setting.value))) {
        return Number(setting.value);
      }
    } else {
      const rows: any = await prisma.$queryRawUnsafe(
        `SELECT \`value\` FROM StoreSetting WHERE \`key\` = 'free_shipping_threshold' LIMIT 1`
      );
      if (rows && rows[0]?.value && !isNaN(Number(rows[0].value))) {
        return Number(rows[0].value);
      }
    }
    return 50.0;
  } catch {
    return 50.0;
  }
}

// ==================== PRESENTATION / PACKAGING ACTIONS ====================
export async function adminCreatePresentationOptionAction(formData: {
  name: string;
  description?: string;
  priceModifier: number;
  imageUrl?: string;
  images?: string[];
  isDefault?: boolean;
  sortOrder?: number;
}) {
  try {
    await requireAdmin();
    const { adminCreatePresentationOption } = await import('@/services/catalog.service');
    const option = await adminCreatePresentationOption(formData);
    revalidatePath('/admin/presentaciones');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true, option: serializePlain(option) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al crear opción de presentación' };
  }
}

export async function adminUpdatePresentationOptionAction(
  id: string,
  data: {
    name?: string;
    description?: string;
    priceModifier?: number;
    imageUrl?: string;
    images?: string[];
    isDefault?: boolean;
    sortOrder?: number;
    isActive?: boolean;
  }
) {
  try {
    await requireAdmin();
    const { adminUpdatePresentationOption } = await import('@/services/catalog.service');
    const option = await adminUpdatePresentationOption(id, data);
    revalidatePath('/admin/presentaciones');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true, option: serializePlain(option) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar opción' };
  }
}

export async function adminDeletePresentationOptionAction(id: string) {
  try {
    await requireAdmin();
    const { adminDeletePresentationOption } = await import('@/services/catalog.service');
    await adminDeletePresentationOption(id);
    revalidatePath('/admin/presentaciones');
    revalidatePath('/productos');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar opción' };
  }
}


// ==================== HOME SECTIONS ORDER & VISIBILITY ACTIONS ====================
export async function adminUpdateHomeSectionsOrderAction(sectionUpdates: { id: string; sortOrder: number }[]) {
  try {
    await requireAdmin();
    const { adminUpdateHomeSectionOrder } = await import('@/services/catalog.service');
    await adminUpdateHomeSectionOrder(sectionUpdates);
    revalidatePath('/admin/secciones');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar orden de secciones' };
  }
}

export async function adminToggleHomeSectionStatusAction(id: string, isActive: boolean) {
  try {
    await requireAdmin();
    const { adminToggleHomeSectionStatus } = await import('@/services/catalog.service');
    await adminToggleHomeSectionStatus(id, isActive);
    revalidatePath('/admin/secciones');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al cambiar visibilidad de sección' };
  }
}

export async function adminResetHomeSectionsOrderAction() {
  try {
    await requireAdmin();
    const { adminResetHomeSectionsOrder } = await import('@/services/catalog.service');
    await adminResetHomeSectionsOrder();
    revalidatePath('/admin/secciones');
    revalidatePath('/');
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al restablecer orden de secciones' };
  }
}


