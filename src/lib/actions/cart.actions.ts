'use server';

import {
  getOrCreateCart,
  addItemToCart,
  updateItemQuantity,
  removeItemFromCart,
  getCart,
} from '@/services/cart.service';
import { getCurrentUser } from '@/lib/auth';
import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { serializePlain } from '@/lib/utils';

async function getTokens() {
  const cookieStore = await cookies();
  let guestToken = cookieStore.get('guest_token')?.value;

  if (!guestToken) {
    guestToken = uuidv4();
    cookieStore.set('guest_token', guestToken, {
      httpOnly: false, // Accessible to client if needed for tracking
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: '/',
    });
  }

  const user = await getCurrentUser();
  return { guestToken, userId: user?.id };
}

export async function fetchCartAction() {
  const { guestToken, userId } = await getTokens();
  const cart = await getOrCreateCart(guestToken, userId);
  return { success: true, cart: serializePlain(cart) };
}

export async function addToCartAction(
  variantId: string,
  quantity = 1,
  optionIds: string[] = [],
  dedication?: string
) {
  try {
    const { guestToken, userId } = await getTokens();
    const cart = await addItemToCart(guestToken, userId, variantId, quantity, optionIds, dedication);
    return { success: true, cart: serializePlain(cart) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al agregar al carrito' };
  }
}

export async function updateQuantityAction(itemId: string, quantity: number) {
  try {
    await updateItemQuantity(itemId, quantity);
    const { guestToken, userId } = await getTokens();
    const cart = await getCart(guestToken, userId);
    return { success: true, cart: serializePlain(cart) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al actualizar cantidad' };
  }
}

export async function removeItemAction(itemId: string) {
  try {
    await removeItemFromCart(itemId);
    const { guestToken, userId } = await getTokens();
    const cart = await getCart(guestToken, userId);
    return { success: true, cart: serializePlain(cart) };
  } catch (err: any) {
    return { success: false, error: err.message || 'Error al eliminar producto' };
  }
}

