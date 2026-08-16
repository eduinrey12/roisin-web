import prisma from '@/lib/db';

export async function validateCoupon(code: string) {
  if (!code) throw new Error('Código de cupón requerido');

  const coupon = await prisma.coupon.findUnique({
    where: { code: code.trim().toUpperCase() },
  });

  if (!coupon) throw new Error('El cupón no existe');
  if (!coupon.isActive) throw new Error('El cupón no está activo');
  if (coupon.validUntil && coupon.validUntil < new Date()) {
    throw new Error('El cupón ha expirado');
  }
  if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
    throw new Error('El cupón ha alcanzado el límite máximo de usos');
  }

  return coupon;
}

export async function adminGetAllCoupons() {
  return prisma.coupon.findMany({
    orderBy: { createdAt: 'desc' },
  });
}

export async function adminCreateCoupon(data: {
  code: string;
  discountPercentage: number;
  maxUses?: number;
  validUntil?: Date;
}) {
  return prisma.coupon.create({
    data: {
      code: data.code.trim().toUpperCase(),
      discountPercentage: data.discountPercentage,
      maxUses: data.maxUses || null,
      validUntil: data.validUntil || null,
      isActive: true,
    },
  });
}

export async function adminToggleCoupon(id: string, isActive: boolean) {
  return prisma.coupon.update({
    where: { id },
    data: { isActive },
  });
}
