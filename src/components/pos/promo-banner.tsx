"use client";

import { Tag, X } from "lucide-react";
import { usePromoStore } from "@/stores/promo-store";
import { useCartStore } from "@/stores/cart-store";
import { formatCurrency } from "@/lib/utils";

/**
 * Banner ringkas yang menandakan sebuah promo sedang aktif pada keranjang POS.
 * Menutup banner akan menghapus promo sekaligus mereset diskon promo.
 */
export function PromoBanner() {
  const { selectedPromo, promoName, promoDiscount, promoProducts, clearPromo } =
    usePromoStore();
  const setDiscount = useCartStore((s) => s.setDiscount);

  if (!selectedPromo) return null;

  const handleClear = () => {
    clearPromo();
    setDiscount(0);
  };

  return (
    <div className="flex items-start gap-3 rounded-xl border border-primary/30 bg-primary/5 p-3">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Tag className="h-4 w-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold text-bakery-dark">
          Promo aktif: {promoName}
        </p>
        {promoProducts.length > 0 && (
          <p className="truncate text-xs text-muted-foreground">
            {promoProducts.join(", ")}
          </p>
        )}
        {promoDiscount > 0 && (
          <p className="text-xs font-medium text-emerald-600">
            Hemat {formatCurrency(promoDiscount)}
          </p>
        )}
      </div>
      <button
        type="button"
        onClick={handleClear}
        aria-label="Hapus promo"
        className="text-muted-foreground transition-colors hover:text-destructive"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
