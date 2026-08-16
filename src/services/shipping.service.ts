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

export async function adminUpdateShippingRegion(id: string, baseRate: number) {
  return prisma.shippingRegion.update({
    where: { id },
    data: { baseRate: new Prisma.Decimal(baseRate) },
  });
}
