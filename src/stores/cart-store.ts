import { create } from "zustand";
import type { CartItem, PaymentMethod, Product } from "@/types";
import {
  createPaymentDraft,
  summarizePayments,
  type PaymentDraft,
} from "@/lib/payment";

interface CartState {
  items: CartItem[];
  discount: number;
  customerName: string;
  notes: string;
  payments: PaymentDraft[];
  addItem: (product: Product) => void;
  /** Menyelaraskan batas stok baris keranjang dengan ketersediaan terbaru. */
  syncItemStock: (productId: string, stock: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  setDiscount: (discount: number) => void;
  setCustomerName: (name: string) => void;
  setNotes: (notes: string) => void;
  addPayment: () => void;
  updatePayment: (
    id: string,
    patch: Partial<Pick<PaymentDraft, "method" | "amount" | "cashReceived">>
  ) => void;
  removePayment: (id: string) => void;
  /** Mengubah metode baris pertama. Dipakai alur satu pembayaran. */
  setPaymentMethod: (method: PaymentMethod) => void;
  /** Mengubah uang diterima pada baris tunai pertama. */
  setCashReceived: (amount: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTax: () => number;
  getTotal: () => number;
  getChangeAmount: () => number;
  getShortfall: () => number;
  getItemCount: () => number;
  canCheckout: () => boolean;
}

let paymentSeq = 1;

function nextPaymentId(): string {
  paymentSeq += 1;
  return `pay-${paymentSeq}`;
}

function sanitizeMoney(value: number): number {
  if (!Number.isFinite(value) || value < 0) return 0;
  return Math.round(value);
}

const TAX_RATE = 0.1;

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  discount: 0,
  customerName: "",
  notes: "",
  payments: [createPaymentDraft("pay-1", "cash")],

  addItem: (product) =>
    set((state) => {
      if (product.stock <= 0) return state;
      const existing = state.items.find((i) => i.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          if (existing.product.stock === product.stock) return state;
          return {
            items: state.items.map((i) =>
              i.product.id === product.id
                ? {
                    ...i,
                    product,
                    quantity: Math.min(i.quantity, product.stock),
                  }
                : i
            ),
          };
        }
        return {
          items: state.items.map((i) =>
            i.product.id === product.id
              ? { ...i, product, quantity: i.quantity + 1 }
              : i
          ),
        };
      }
      return { items: [...state.items, { product, quantity: 1 }] };
    }),

  syncItemStock: (productId, stock) =>
    set((state) => {
      const current = state.items.find((item) => item.product.id === productId);
      if (!current) return state;
      const nextStock = Math.max(0, stock);
      if (current.product.stock === nextStock && current.quantity <= nextStock) {
        return state;
      }
      if (nextStock <= 0) {
        return {
          items: state.items.filter((item) => item.product.id !== productId),
        };
      }
      return {
        items: state.items.map((item) =>
          item.product.id === productId
            ? {
                ...item,
                product: { ...item.product, stock: nextStock },
                quantity: Math.min(item.quantity, nextStock),
              }
            : item
        ),
      };
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

  addPayment: () =>
    set((state) => {
      const total = Math.round(get().getTotal());
      let payments = state.payments;
      if (payments.length === 1) {
        const only = payments[0];
        if (only.method === "cash" && only.amount === 0 && only.cashReceived > 0) {
          payments = [
            {
              ...only,
              amount: Math.min(only.cashReceived, total),
            },
          ];
        }
      }
      return {
        payments: [
          ...payments,
          createPaymentDraft(nextPaymentId(), "debit"),
        ],
      };
    }),

  updatePayment: (id, patch) =>
    set((state) => ({
      payments: state.payments.map((line) => {
        if (line.id !== id) return line;
        const next = { ...line, ...patch };
        if (patch.amount !== undefined) {
          next.amount = sanitizeMoney(patch.amount);
        }
        if (patch.cashReceived !== undefined) {
          next.cashReceived = sanitizeMoney(patch.cashReceived);
        }
        if (patch.method && patch.method !== "cash") {
          next.cashReceived = 0;
        }
        if (
          patch.amount !== undefined &&
          next.method === "cash" &&
          (line.cashReceived === 0 || line.cashReceived === line.amount)
        ) {
          next.cashReceived = next.amount;
        }
        return next;
      }),
    })),

  removePayment: (id) =>
    set((state) => {
      if (state.payments.length <= 1) return state;
      return { payments: state.payments.filter((line) => line.id !== id) };
    }),

  setPaymentMethod: (method) => {
    const first = get().payments[0];
    if (!first) return;
    get().updatePayment(first.id, { method });
  },

  setCashReceived: (amount) => {
    const first = get().payments.find((line) => line.method === "cash") ?? get().payments[0];
    if (!first) return;
    get().updatePayment(first.id, { cashReceived: amount });
  },

  clearCart: () =>
    set({
      items: [],
      discount: 0,
      customerName: "",
      notes: "",
      payments: [createPaymentDraft(nextPaymentId(), "cash")],
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

  getChangeAmount: () =>
    summarizePayments(get().payments, get().getTotal()).changeAmount,

  getShortfall: () =>
    summarizePayments(get().payments, get().getTotal()).remaining,

  canCheckout: () => {
    if (get().items.length === 0) return false;
    return summarizePayments(get().payments, get().getTotal()).canCheckout;
  },

  getItemCount: () =>
    get().items.reduce((sum, item) => sum + item.quantity, 0),
}));
