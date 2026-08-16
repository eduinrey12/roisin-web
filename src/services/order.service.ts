import prisma from '@/lib/db';
import { getCart } from './cart.service';
import { validateCoupon } from './coupon.service';
import { adjustStock } from './inventory.service';
import { OrderStatus, Prisma } from '@prisma/client';

export interface CheckoutInput {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  regionId: string;
  couponCode?: string;
}

export async function createOrderFromCart(
  guestToken: string | undefined,
  userId: string | undefined,
  input: CheckoutInput
) {
  const cart = await getCart(guestToken, userId);
  if (!cart || cart.items.length === 0) {
    throw new Error('El carrito de compras está vacío');
  }

  // Calculate subtotal
  let subtotal = 0;
  for (const item of cart.items) {
    const itemPrice = Number(item.variant.price);
    const optionsPrice = item.options.reduce(
      (sum, opt) => sum + Number(opt.option.priceModifier || 0),
      0
    );
    subtotal += (itemPrice + optionsPrice) * item.quantity;
  }

  // Validate and apply shipping region
  const region = await prisma.shippingRegion.findUnique({
    where: { id: input.regionId },
  });
  if (!region) {
    throw new Error('Zona de envío no válida');
  }
  const shippingCost = Number(region.baseRate);

  // Validate and apply coupon
  let discount = 0;
  let validCoupon = null;
  if (input.couponCode) {
    try {
      validCoupon = await validateCoupon(input.couponCode);
      discount = (subtotal * validCoupon.discountPercentage) / 100;
    } catch (err: any) {
      throw new Error(err.message || 'Cupón inválido');
    }
  }

  const total = subtotal - discount + shippingCost;
  const orderNumber = `ROI-${Math.floor(100000 + Math.random() * 900000)}`;

  // Create order in an ACID transaction with stock deduction
  const order = await prisma.$transaction(async (tx) => {
    // 1. Create the order record
    const createdOrder = await tx.order.create({
      data: {
        orderNumber,
        userId: userId || null,
        customerEmail: input.email,
        customerName: `${input.firstName} ${input.lastName}`.trim(),
        customerPhone: input.phone,
        shippingAddress: input.address,
        city: input.city,
        province: input.province,
        subtotal: new Prisma.Decimal(subtotal.toFixed(2)),
        shippingCost: new Prisma.Decimal(shippingCost.toFixed(2)),
        discount: new Prisma.Decimal(discount.toFixed(2)),
        total: new Prisma.Decimal(total.toFixed(2)),
        status: 'PENDING',
        couponId: validCoupon?.id || null,
        items: {
          create: cart.items.map((item) => {
            const itemPrice = Number(item.variant.price);
            const optionsPrice = item.options.reduce(
              (sum, opt) => sum + Number(opt.option.priceModifier || 0),
              0
            );
            return {
              quantity: item.quantity,
              price: new Prisma.Decimal((itemPrice + optionsPrice).toFixed(2)),
              variantId: item.variantId,
            };
          }),
        },
      },
      include: {
        items: {
          include: {
            variant: {
              include: {
                product: true,
              },
            },
          },
        },
      },
    });

    // 2. Decrement inventory for each item
    for (const item of cart.items) {
      let inv = await tx.inventoryItem.findUnique({
        where: { variantId: item.variantId },
      });
      if (!inv) {
        inv = await tx.inventoryItem.create({
          data: { variantId: item.variantId, quantity: 0 },
        });
      }

      await tx.inventoryItem.update({
        where: { id: inv.id },
        data: { quantity: Math.max(0, inv.quantity - item.quantity) },
      });

      await tx.inventoryMovement.create({
        data: {
          inventoryItemId: inv.id,
          quantityChange: -item.quantity,
          reason: 'ORDER_PLACED',
          referenceId: createdOrder.id,
        },
      });
    }

    // 3. Increment coupon usage if used
    if (validCoupon) {
      await tx.coupon.update({
        where: { id: validCoupon.id },
        data: { currentUses: { increment: 1 } },
      });
    }

    // 4. Empty the cart
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id },
    });

    return createdOrder;
  });

  return order;
}

export async function getOrderById(orderId: string) {
  return prisma.order.findUnique({
    where: { id: orderId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
        },
      },
      payment: true,
      coupon: true,
    },
  });
}

export async function getUserOrders(userId: string) {
  return prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          variant: {
            include: {
              product: {
                include: {
                  images: { orderBy: { sortOrder: 'asc' } },
                },
              },
            },
          },
        },
      },
      payment: true,
    },
    orderBy: { createdAt: 'desc' },
  });
}

// Admin Operations
export async function adminGetAllOrders(status?: OrderStatus) {
  return prisma.order.findMany({
    where: status ? { status } : undefined,
    include: {
      payment: true,
      coupon: true,
      items: {
        include: {
          variant: {
            include: {
              product: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
}

export async function adminUpdateOrderStatus(orderId: string, status: OrderStatus) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      include: {
        items: true,
      },
    });

    if (!order) throw new Error('Orden no encontrada');

    const wasCancelled = order.status === 'CANCELLED';
    const isNowCancelled = status === 'CANCELLED';

    // 1. If cancelling an active order -> restore inventory & coupon usage
    if (!wasCancelled && isNowCancelled) {
      for (const item of order.items) {
        let inv = await tx.inventoryItem.findUnique({
          where: { variantId: item.variantId },
        });

        if (!inv) {
          inv = await tx.inventoryItem.create({
            data: { variantId: item.variantId, quantity: 0 },
          });
        }

        await tx.inventoryItem.update({
          where: { id: inv.id },
          data: { quantity: inv.quantity + item.quantity },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: inv.id,
            quantityChange: item.quantity,
            reason: 'ORDER_CANCELLED',
            referenceId: order.id,
          },
        });
      }

      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { currentUses: { decrement: 1 } },
        });
      }
    }

    // 2. If re-activating a previously cancelled order -> re-deduct inventory & coupon usage
    if (wasCancelled && !isNowCancelled) {
      for (const item of order.items) {
        let inv = await tx.inventoryItem.findUnique({
          where: { variantId: item.variantId },
        });

        if (!inv) {
          inv = await tx.inventoryItem.create({
            data: { variantId: item.variantId, quantity: 0 },
          });
        }

        if (inv.quantity < item.quantity) {
          throw new Error(
            `Stock insuficiente para reactivar el pedido. Variante ${item.variantId} solo tiene ${inv.quantity} unidades.`
          );
        }

        await tx.inventoryItem.update({
          where: { id: inv.id },
          data: { quantity: inv.quantity - item.quantity },
        });

        await tx.inventoryMovement.create({
          data: {
            inventoryItemId: inv.id,
            quantityChange: -item.quantity,
            reason: 'ORDER_PLACED',
            referenceId: order.id,
          },
        });
      }

      if (order.couponId) {
        await tx.coupon.update({
          where: { id: order.couponId },
          data: { currentUses: { increment: 1 } },
        });
      }
    }

    return tx.order.update({
      where: { id: orderId },
      data: { status },
    });
  });
}

export async function adminGetDashboardMetrics() {
  const [totalOrders, pendingOrders, allOrders, activeCoupons, lowStockCount] =
    await Promise.all([
      prisma.order.count(),
      prisma.order.count({ where: { status: { in: ['PENDING', 'PAYMENT_PENDING', 'PROCESSING'] } } }),
      prisma.order.findMany({
        where: { status: { not: 'CANCELLED' } },
        select: { total: true },
      }),
      prisma.coupon.count({ where: { isActive: true } }),
      prisma.inventoryItem.count({ where: { quantity: { lte: 5 } } }),
    ]);

  const totalSales = allOrders.reduce((acc, curr) => acc + Number(curr.total), 0);

  const recentOrders = await prisma.order.findMany({
    take: 5,
    orderBy: { createdAt: 'desc' },
    include: {
      payment: true,
    },
  });

  return {
    totalSales,
    totalOrders,
    pendingOrders,
    activeCoupons,
    lowStockCount,
    recentOrders,
  };
}
