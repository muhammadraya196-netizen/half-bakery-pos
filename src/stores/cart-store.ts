import { create } from "zustand";
import type { CartItem, PaymentMethod, Product } from "@/types";

interface CartState {
  items: CartItem[];
  discount: number;
  customerName: string;
  notes: string;
  paymentMethod: PaymentMethod;
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setCustomerName: (name: string) => void;
  setNotes: (notes: string) => void;
  setPaymentMethod: (method: PaymentMethod) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}

const TAX_RATE = 0.1;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  customerName: "",
  notes: "",
  paymentMethod: "cash",

  addItem: (product) =>
    set((state) => {
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) return state;
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    }),

  removeItem: (productId) =>
    set((state) => ({
      items: state.items.filter((i) => i.product.id !== productId),
    })),

  updateQuantity: (productId, quantity) =>
    set((state) => {
      if (quantity <= 0) {
        return { items: state.items.filter((i) => i.product.id !== productId) };
      }
      return {
        items: state.items.map((i) =>
          i.product.id === productId
            ? { ...i, quantity: Math.min(quantity, i.product.stock) }
            : i
        ),
      };
    }),

  setDiscount: (discount) => set({ discount: Math.max(0, discount) }),
  setCustomerName: (name) => set({ customerName: name }),
  setNotes: (notes) => set({ notes }),
  setPaymentMethod: (method) => set({ paymentMethod: method }),

  clearCart: () =>
    set({
      items: [],
      discount: 0,
      customerName: "",
      notes: "",
      paymentMethod: "cash",
    }),

  getSubtotal: () =>
    get().items.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    ),

  getTax: () => get().getSubtotal() * TAX_RATE,

  getTotal: () => {
    const subtotal = get().getSubtotal();
    const tax = subtotal * TAX_RATE;
    return Math.max(0, subtotal + tax - get().discount);
  },

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
