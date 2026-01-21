import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ProductDTO } from '../api/types';

interface CartItem extends ProductDTO {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  pickupStoreId: number | null;
  
  // Actions
  addItem: (product: ProductDTO, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  setPickupStore: (storeId: number) => void;
  clearCart: () => void;
  
  // Getters
  getItemCount: () => number;
  getTotalAmount: () => number;
  getItem: (productId: number) => CartItem | undefined;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      pickupStoreId: null,

      addItem: (product: ProductDTO, quantity = 1) => {
        const { items } = get();
        const existingItem = items.find(item => item.productId === product.productId);

        if (existingItem) {
          set({
            items: items.map(item =>
              item.productId === product.productId
                ? { ...item, quantity: item.quantity + quantity }
                : item
            ),
          });
        } else {
          set({
            items: [...items, { ...product, quantity }],
          });
        }
      },

      removeItem: (productId: number) => {
        set({
          items: get().items.filter(item => item.productId !== productId),
        });
      },

      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set({
          items: get().items.map(item =>
            item.productId === productId ? { ...item, quantity } : item
          ),
        });
      },

      setPickupStore: (storeId: number) => {
        set({ pickupStoreId: storeId });
      },

      clearCart: () => {
        set({ items: [], pickupStoreId: null });
      },

      getItemCount: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      getTotalAmount: () => {
        return get().items.reduce((total, item) => total + item.basePrice * item.quantity, 0);
      },

      getItem: (productId: number) => {
        return get().items.find(item => item.productId === productId);
      },
    }),
    {
      name: 'cart-storage',
    }
  )
);
