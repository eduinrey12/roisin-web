import prisma from '@/lib/db';
import { Prisma } from '@prisma/client';

export async function getActiveShippingRegions() {
  return prisma.shippingRegion.findMany({
    where: { isActive: true },
    orderBy: { baseRate: 'asc' },
  });
}

export async function getShippingRegionById(id: string) {
  return prisma.shippingRegion.findUnique({
    where: { id },
  });
}

export async function adminGetAllShippingRegions() {
  return prisma.shippingRegion.findMany({
    orderBy: { baseRate: 'asc' },
  });
}

export async function adminCreateShippingRegion(data: {
  name: string;
  baseRate: number;
  description?: string;
}) {
  return prisma.shippingRegion.create({
    data: {
      name: data.name,
      baseRate: new Prisma.Decimal(data.baseRate),
      description: data.description || null,
      isActive: true,
    },
  });
}

export async function adminUpdateShippingRegion(
  id: string,
  data: { name?: string; baseRate?: number; description?: string; isActive?: boolean }
) {
  return prisma.shippingRegion.update({
    where: { id },
    data: {
      ...(data.name && { name: data.name }),
      ...(data.baseRate !== undefined && { baseRate: new Prisma.Decimal(data.baseRate) }),
      ...(data.description !== undefined && { description: data.description }),
      ...(data.isActive !== undefined && { isActive: data.isActive }),
    },
  });
}

export async function adminDeleteShippingRegion(id: string) {
  // Soft delete to maintain historical order referential integrity
  return prisma.shippingRegion.update({
    where: { id },
    data: { isActive: false },
  });
}

export async function getGiftCardConfig() {
  try {
    const priceSetting = await prisma.storeSetting.findUnique({
      where: { key: 'gift_card_price' },
    });
    const firstFreeSetting = await prisma.storeSetting.findUnique({
      where: { key: 'gift_card_first_free' },
    });

    return {
      price: priceSetting ? Number(priceSetting.value) || 2.5 : 2.5,
      firstFree: firstFreeSetting ? firstFreeSetting.value === 'true' : true,
    };
  } catch {
    return { price: 2.5, firstFree: true };
  }
}

export async function adminUpdateGiftCardConfig(price: number, firstFree: boolean = true) {
  await prisma.storeSetting.upsert({
    where: { key: 'gift_card_price' },
    update: { value: price.toFixed(2), type: 'number', label: 'Precio Tarjeta de Regalo Adicional' },
    create: { key: 'gift_card_price', value: price.toFixed(2), type: 'number', label: 'Precio Tarjeta de Regalo Adicional' },
  });

  await prisma.storeSetting.upsert({
    where: { key: 'gift_card_first_free' },
    update: { value: String(firstFree), type: 'boolean', label: 'Primera Tarjeta de Regalo Gratis' },
    create: { key: 'gift_card_first_free', value: String(firstFree), type: 'boolean', label: 'Primera Tarjeta de Regalo Gratis' },
  });

  return { price, firstFree };
}


