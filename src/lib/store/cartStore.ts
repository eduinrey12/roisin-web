import { create } from 'zustand';
import Cookies from 'js-cookie';
import { v4 as uuidv4 } from 'uuid';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api/v1';

interface CartState {
  cart: any;
  isOpen: boolean;
  guestToken: string;
  initCart: () => Promise<void>;
  addItem: (variantId: string, quantity: number) => Promise<void>;
  updateQuantity: (itemId: string, quantity: number) => Promise<void>;
  toggleCart: () => void;
  mergeCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  cart: null,
  isOpen: false,
  guestToken: '',

  initCart: async () => {
    let token = Cookies.get('guest_token');
    if (!token) {
      token = uuidv4();
      Cookies.set('guest_token', token, { expires: 30 });
    }
    set({ guestToken: token });

    const authToken = Cookies.get('access_token');
    const headers: Record<string, string> = {
      'x-guest-token': token,
    };
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    try {
      const res = await fetch(`${API_URL}/carts`, { headers });
      if (res.ok) {
        const cart = await res.json();
        set({ cart });
      }
    } catch (e) {
      console.error(e);
    }
  },

  addItem: async (variantId, quantity) => {
    const { guestToken } = get();
    const authToken = Cookies.get('access_token');
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-guest-token': guestToken,
    };
    if (authToken) headers['Authorization'] = `Bearer ${authToken}`;

    const res = await fetch(`${API_URL}/carts/items`, {
      method: 'POST',
      headers,
      body: JSON.stringify({ variantId, quantity }),
    });
    if (res.ok) {
      const cart = await res.json();
      set({ cart, isOpen: true });
    }
  },

  updateQuantity: async (itemId, quantity) => {
    // Basic implementation for update...
  },

  toggleCart: () => set((state) => ({ isOpen: !state.isOpen })),

  mergeCart: async () => {
    const { guestToken } = get();
    const authToken = Cookies.get('access_token');
    if (!authToken || !guestToken) return;

    await fetch(`${API_URL}/carts/merge`, {
      method: 'POST',
      headers: {
        'x-guest-token': guestToken,
        'Authorization': `Bearer ${authToken}`
      }
    });
    get().initCart();
  }
}));
