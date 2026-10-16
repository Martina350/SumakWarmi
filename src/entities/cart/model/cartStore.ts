import { createStore } from '../../../shared/lib/createStore.ts';
import { businessStore } from '../../../shared/domain/businessStore.ts';

export interface CartItem {
  productId: string;
  variantId: string;
  productName: string;
  variantName: string;
  sku: string;
  price: number;
  quantity: number;
  imageUrl?: string;
}

interface CartState {
  items: CartItem[];
  isDrawerOpen: boolean;
  lastAddedItem: CartItem | null;
}

const cartStore = createStore<CartState>(
  { items: [], isDrawerOpen: false, lastAddedItem: null },
  'sumakwarmi_cart_v1'
);

export const useCartStore = cartStore.useStore;

export const cartActions = {
  refreshCatalog: () => {
    const products = businessStore.getState().products;
    cartStore.setState((prev) => ({ ...prev, items: prev.items.map((it) => {
      const p = products.find((p) => p.id === it.productId); const v = p?.variants.find((v) => v.id === it.variantId);
      if (!p || !v || v.price === null || !['ACTIVE', 'OUT_OF_STOCK'].includes(p.status)) throw new Error('Retira del carrito los productos que ya no están disponibles.');
      return { ...it, price: v.price, productName: p.name, variantName: v.name, imageUrl: p.featuredImage };
    }) }));
  },
  addItem: (item: CartItem) => {
    cartStore.setState((prev) => {
      const existing = prev.items.find((i) => i.variantId === item.variantId);
      let updatedItems: CartItem[];
      if (existing) {
        updatedItems = prev.items.map((i) =>
          i.variantId === item.variantId
            ? { ...i, quantity: i.quantity + item.quantity }
            : i
        );
      } else {
        updatedItems = [...prev.items, item];
      }
      return {
        ...prev,
        items: updatedItems,
        isDrawerOpen: true,
        lastAddedItem: item,
      };
    });
  },
  updateQuantity: (variantId: string, quantity: number) => {
    cartStore.setState((prev) => ({
      ...prev,
      items:
        quantity <= 0
          ? prev.items.filter((i) => i.variantId !== variantId)
          : prev.items.map((i) => (i.variantId === variantId ? { ...i, quantity } : i)),
    }));
  },
  removeItem: (variantId: string) => {
    cartStore.setState((prev) => ({
      ...prev,
      items: prev.items.filter((i) => i.variantId !== variantId),
    }));
  },
  clearCart: () => {
    cartStore.setState((prev) => ({ ...prev, items: [] }));
  },
  openDrawer: () => {
    cartStore.setState((prev) => ({ ...prev, isDrawerOpen: true }));
  },
  closeDrawer: () => {
    cartStore.setState((prev) => ({ ...prev, isDrawerOpen: false }));
  },
};
