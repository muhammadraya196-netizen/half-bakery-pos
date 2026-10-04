import { create } from "zustand";

/**
 * Menyimpan promo yang sedang aktif diterapkan pada sesi POS saat ini.
 * State ini dipakai untuk menampilkan banner promo dan menandai transaksi.
 */
export interface ActivePromo {
  /** Slug promo yang dipilih, mis. "birthday-cake". */
  selectedPromo: string;
  /** Nama lengkap promo untuk ditampilkan. */
  promoName: string;
  /** Nominal diskon (Rupiah) yang diterapkan ke keranjang. */
  promoDiscount: number;
  /** Nama produk yang masuk keranjang lewat promo. */
  promoProducts: string[];
  /** Tanggal kedaluwarsa promo (ISO). */
  promoExpired: string;
}

interface PromoState {
  selectedPromo: string | null;
  promoName: string | null;
  promoDiscount: number;
  promoProducts: string[];
  promoExpired: string | null;
  setPromo: (promo: ActivePromo) => void;
  clearPromo: () => void;
}

const initialState = {
  selectedPromo: null,
  promoName: null,
  promoDiscount: 0,
  promoProducts: [] as string[],
  promoExpired: null,
};

export const usePromoStore = create<PromoState>((set) => ({
  ...initialState,
  setPromo: (promo) =>
    set({
      selectedPromo: promo.selectedPromo,
      promoName: promo.promoName,
      promoDiscount: promo.promoDiscount,
      promoProducts: promo.promoProducts,
      promoExpired: promo.promoExpired,
    }),
  clearPromo: () => set({ ...initialState }),
}));
