import prisma from '@/lib/db';

export async function adjustStock(
  variantId: string,
  quantityChange: number,
  reason: 'ORDER_PLACED' | 'ORDER_CANCELLED' | 'RESTOCK' | 'MANUAL_ADJUSTMENT',
  referenceId?: string
) {
  return prisma.$transaction(async (tx) => {
    let inventory = await tx.inventoryItem.findUnique({
      where: { variantId },
    });

    if (!inventory) {
      inventory = await tx.inventoryItem.create({
        data: { variantId, quantity: 0 },
      });
    }

    const newQuantity = inventory.quantity + quantityChange;
    if (newQuantity < 0 && reason === 'ORDER_PLACED') {
      throw new Error(`Stock insuficiente para la variante ${variantId}`);
    }

    const updated = await tx.inventoryItem.update({
      where: { id: inventory.id },
      data: { quantity: Math.max(0, newQuantity) },
    });

    await tx.inventoryMovement.create({
      data: {
        inventoryItemId: inventory.id,
        quantityChange,
        reason,
        referenceId: referenceId || null,
      },
    });

    return updated;
  });
}

export async function adminGetInventoryOverview() {
  return prisma.inventoryItem.findMany({
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { where: { isPrimary: true } },
            },
          },
        },
      },
      movements: {
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
    orderBy: { quantity: 'asc' },
  });
}

export async function adminGetStockAlerts(threshold = 5) {
  return prisma.inventoryItem.findMany({
    where: { quantity: { lte: threshold } },
    include: {
      variant: {
        include: { product: true },
      },
    },
  });
}
