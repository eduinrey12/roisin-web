import { create } from 'zustand';
import {
  fetchCartAction,
  addToCartAction,
  updateQuantityAction,
  removeItemAction,
} from '@/lib/actions/cart.actions';

interface CartState {
  cart: any;
  isOpen: boolean;
  loading: boolean;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  initCart: () => Promise<void>;
  addItem: (variantId: string, quantity?: number, optionIds?: string[]) => Promise<boolean>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  removeItem: (itemId: string) => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  loading: false,

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),
  openCart: () => set({ isOpen: true }),
  closeCart: () => set({ isOpen: false }),

  initCart: async () => {
    try {
      const res = await fetchCartAction();
      if (res.success) {
        set({ cart: res.cart });
      }
    } catch (err) {
      console.error('Error al inicializar carrito:', err);
    }
  },

  addItem: async (variantId: string, quantity = 1, optionIds: string[] = []) => {
    set({ loading: true });
    try {
      const res = await addToCartAction(variantId, quantity, optionIds);
      if (res.success) {
        set({ cart: res.cart, isOpen: true, loading: false });
        return true;
      }
      set({ loading: false });
      return false;
    } catch (err) {
      console.error('Error al añadir:', err);
      set({ loading: false });
      return false;
    }
  },

  updateQuantity: async (itemId: string, quantity: number) => {
    try {
      const res = await updateQuantityAction(itemId, quantity);
      if (res.success) {
        set({ cart: res.cart });
      }
    } catch (err) {
      console.error('Error al actualizar cantidad:', err);
    }
  },

  removeItem: async (itemId: string) => {
    try {
      const res = await removeItemAction(itemId);
      if (res.success) {
        set({ cart: res.cart });
      }
    } catch (err) {
      console.error('Error al remover item:', err);
    }
  },
}));
