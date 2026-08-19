import prisma from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

const CART_INCLUDE = {
  items: {
    include: {
      variant: {
        include: {
          product: {
            include: {
              images: { orderBy: { sortOrder: 'asc' as const } },
            },
          },
        },
      },
      options: {
        include: {
          option: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' as const },
  },
};

export async function getCart(guestToken?: string, userId?: string) {
  if (!guestToken && !userId) return null;

  let cart = null;
  if (userId) {
    cart = await prisma.cart.findFirst({
      where: { userId },
      include: CART_INCLUDE,
    });
  } else if (guestToken) {
    cart = await prisma.cart.findUnique({
      where: { guestToken },
      include: CART_INCLUDE,
    });
  }

  return cart;
}

export async function getOrCreateCart(guestToken?: string, userId?: string) {
  let cart = await getCart(guestToken, userId);

  if (!cart) {
    const token = userId ? null : guestToken || uuidv4();
    cart = await prisma.cart.create({
      data: {
        guestToken: token,
        userId: userId || null,
      },
      include: CART_INCLUDE,
    });
  }

  return cart;
}

export async function addItemToCart(
  guestToken: string | undefined,
  userId: string | undefined,
  variantId: string,
  quantity = 1,
  optionIds: string[] = [],
  dedication?: string
) {
  const cart = await getOrCreateCart(guestToken, userId);

  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_variantId: {
        cartId: cart.id,
        variantId,
      },
    },
    include: { options: true },
  });

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: {
        quantity: existingItem.quantity + quantity,
        ...(dedication !== undefined && { dedication }),
      },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        variantId,
        quantity,
        dedication: dedication || null,
        options: {
          create: optionIds.map((optionId) => ({
            optionId,
          })),
        },
      },
    });
  }

  return getCart(cart.guestToken || undefined, cart.userId || undefined);
}

export async function updateItemQuantity(itemId: string, quantity: number) {
  if (quantity <= 0) {
    return removeItemFromCart(itemId);
  }

  return prisma.cartItem.update({
    where: { id: itemId },
    data: { quantity },
  });
}

export async function removeItemFromCart(itemId: string) {
  return prisma.cartItem.delete({
    where: { id: itemId },
  });
}

export async function mergeCarts(guestToken: string, userId: string) {
  const guestCart = await prisma.cart.findUnique({
    where: { guestToken },
    include: { items: { include: { options: true } } },
  });

  if (!guestCart || guestCart.items.length === 0) {
    return getOrCreateCart(undefined, userId);
  }

  const userCart = await getOrCreateCart(undefined, userId);

  for (const item of guestCart.items) {
    const existingInUserCart = await prisma.cartItem.findUnique({
      where: {
        cartId_variantId: {
          cartId: userCart.id,
          variantId: item.variantId,
        },
      },
    });

    if (existingInUserCart) {
      await prisma.cartItem.update({
        where: { id: existingInUserCart.id },
        data: { quantity: existingInUserCart.quantity + item.quantity },
      });
    } else {
      await prisma.cartItem.create({
        data: {
          cartId: userCart.id,
          variantId: item.variantId,
          quantity: item.quantity,
          options: {
            create: item.options.map((opt) => ({
              optionId: opt.optionId,
            })),
          },
        },
      });
    }
  }

  await prisma.cart.delete({ where: { id: guestCart.id } });
  return getCart(undefined, userId);
}
