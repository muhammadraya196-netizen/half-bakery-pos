"use client";

import { useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useProducts } from "@/hooks/use-products";
import { useCartStore } from "@/stores/cart-store";
import { usePromoStore } from "@/stores/promo-store";
import { toast } from "@/stores/toast-store";
import {
  buildPromoCart,
  getPromoBySlug,
  isPromoExpired,
} from "@/lib/promo/promo";
import { formatCurrency } from "@/lib/utils";

/**
 * Membaca query `?promo=slug` pada halaman POS lalu menjalankan `applyPromo`:
 * mencari promo, mengambil produk, menghitung diskon, memasukkan produk ke
 * keranjang, menampilkan toast, dan menandai promo aktif pada store.
 *
 * Komponen ini hanya melakukan side-effect (tidak merender UI) dan dibungkus
 * <Suspense> di halaman POS karena memakai `useSearchParams`.
 */
export function PromoAutoApply() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const promoSlug = searchParams.get("promo");

  const { data: products } = useProducts();

  const clearCart = useCartStore((s) => s.clearCart);
  const addItem = useCartStore((s) => s.addItem);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const setDiscount = useCartStore((s) => s.setDiscount);
  const setPromo = usePromoStore((s) => s.setPromo);

  // Menjaga agar satu slug promo hanya diterapkan sekali.
  const appliedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!promoSlug) return;
    if (appliedRef.current === promoSlug) return;
    if (!products || products.length === 0) return;

    const finish = () => {
      appliedRef.current = promoSlug;
      // Bersihkan query agar refresh tidak menerapkan ulang promo.
      router.replace("/pos");
    };

    const promo = getPromoBySlug(promoSlug);
    if (!promo) {
      toast.error("Promo tidak ditemukan", "Kode promo tidak valid.");
      finish();
      return;
    }

    if (isPromoExpired(promo)) {
      toast.error("Promo sudah berakhir", `${promo.name} tidak berlaku lagi.`);
      finish();
      return;
    }

    const { items, discount, productNames } = buildPromoCart(promo, products);
    if (items.length === 0) {
      toast.error(
        "Produk promo tidak tersedia",
        "Stok produk promo sedang kosong."
      );
      finish();
      return;
    }

    // Terapkan promo ke keranjang (mulai dari keranjang bersih).
    clearCart();
    items.forEach(({ product, quantity }) => {
      addItem(product);
      updateQuantity(product.id, quantity);
    });
    setDiscount(discount);
    setPromo({
      selectedPromo: promo.slug,
      promoName: promo.name,
      promoDiscount: discount,
      promoProducts: productNames,
      promoExpired: promo.expiredDate,
    });

    const savingText =
      discount > 0 ? ` Hemat ${formatCurrency(discount)}.` : "";
    toast.success(
      `🎉 Promo ${promo.shortName} berhasil diterapkan`,
      `${items.length} produk ditambahkan ke keranjang.${savingText}`
    );

    finish();
  }, [
    promoSlug,
    products,
    clearCart,
    addItem,
    updateQuantity,
    setDiscount,
    setPromo,
    router,
  ]);

  return null;
}
