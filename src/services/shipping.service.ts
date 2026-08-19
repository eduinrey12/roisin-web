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

