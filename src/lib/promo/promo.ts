import type { Product } from "@/types";

/**
 * Sumber kebenaran seluruh promo yang dapat "diklaim" dari landing page.
 *
 * Setiap promo dipetakan ke produk nyata di katalog POS. Menambah promo baru
 * cukup dengan menambahkan satu entri pada `PROMO_CONFIGS` — tidak perlu
 * menyentuh komponen UI, store, maupun halaman POS.
 */

export type PromoKind = "percentage" | "buy-get";

export interface PromoConfig {
  /** Slug yang dipakai pada URL, mis. `/pos?promo=birthday-cake`. */
  slug: string;
  /** Menghubungkan promo ini dengan card di landing (PROMOS[].id di bakery-data). */
  landingId: string;
  /** Nama lengkap promo untuk notifikasi & banner. */
  name: string;
  /** Nama singkat untuk toast, mis. "Birthday Cake". */
  shortName: string;
  description: string;
  badge: string;
  kind: PromoKind;
  /** Diskon persen untuk `kind: "percentage"`. */
  discountPercent?: number;
  /** Jumlah beli untuk `kind: "buy-get"` (mis. beli 2). */
  buyQuantity?: number;
  /** Jumlah gratis untuk `kind: "buy-get"` (mis. gratis 1). */
  freeQuantity?: number;
  /** Produk spesifik yang dimasukkan ke keranjang. */
  productIds?: string[];
  /** Alternatif: seluruh produk pada kategori tertentu. */
  category?: string;
  /** Qty per produk yang otomatis dimasukkan ke keranjang. */
  quantityPerProduct: number;
  /** Tanggal kedaluwarsa promo (ISO). */
  expiredDate: string;
}

export const PROMO_CONFIGS: PromoConfig[] = [
  {
    slug: "birthday-cake",
    landingId: "promo-1",
    name: "Diskon 20% Birthday Cake",
    shortName: "Birthday Cake",
    description:
      "Rayakan momen spesial dengan birthday cake premium. Diskon 20% untuk cake pilihan.",
    badge: "Limited",
    kind: "percentage",
    discountPercent: 20,
    productIds: ["1"], // Chocolate Signature Cake (cake premium)
    quantityPerProduct: 1,
    expiredDate: "2030-12-31T23:59:59.000Z",
  },
  {
    slug: "buy2get1-bread",
    landingId: "promo-2",
    name: "Buy 2 Get 1 Bread",
    shortName: "Buy 2 Get 1 Bread",
    description:
      "Beli 2 roti artisan favoritmu, gratis 1 roti pilihan. Berlaku di semua outlet.",
    badge: "Best Deal",
    kind: "buy-get",
    buyQuantity: 2,
    freeQuantity: 1,
    productIds: ["15"], // Soft Milk Bread
    quantityPerProduct: 3, // 2 dibeli + 1 gratis
    expiredDate: "2030-12-31T23:59:59.000Z",
  },
  {
    slug: "weekend-promo",
    landingId: "promo-3",
    name: "Weekend Promo",
    shortName: "Weekend",
    description:
      "Diskon 15% untuk semua pastry & dessert setiap Sabtu dan Minggu.",
    badge: "Weekend",
    kind: "percentage",
    discountPercent: 15,
    category: "Pastry", // seluruh pastry
    quantityPerProduct: 1,
    expiredDate: "2030-12-31T23:59:59.000Z",
  },
];

/** Item promo yang sudah diselesaikan ke produk nyata + qty. */
export interface ResolvedPromoItem {
  product: Product;
  quantity: number;
}

/** Hasil akhir promo yang siap dimasukkan ke keranjang. */
export interface PromoCart {
  items: ResolvedPromoItem[];
  /** Nominal diskon (Rupiah, sudah dibulatkan ke rupiah terdekat). */
  discount: number;
  /** Nama produk untuk ditampilkan pada banner/toast. */
  productNames: string[];
}

export function getPromoBySlug(slug: string): PromoConfig | undefined {
  return PROMO_CONFIGS.find((p) => p.slug === slug);
}

export function getPromoByLandingId(landingId: string): PromoConfig | undefined {
  return PROMO_CONFIGS.find((p) => p.landingId === landingId);
}

export function isPromoExpired(
  promo: PromoConfig,
  now: Date = new Date()
): boolean {
  return new Date(promo.expiredDate).getTime() < now.getTime();
}

/**
 * Menyelesaikan konfigurasi promo menjadi daftar produk nyata dari katalog.
 * Produk yang stoknya habis otomatis dilewati.
 */
export function resolvePromoItems(
  promo: PromoConfig,
  products: Product[]
): ResolvedPromoItem[] {
  let pool: Product[] = [];

  if (promo.productIds && promo.productIds.length > 0) {
    pool = promo.productIds
      .map((id) => products.find((p) => p.id === id))
      .filter((p): p is Product => Boolean(p));
  } else if (promo.category) {
    pool = products.filter((p) => p.category === promo.category);
  }

  return pool
    .filter((product) => product.stock > 0)
    .map((product) => ({
      product,
      quantity: Math.min(promo.quantityPerProduct, product.stock),
    }));
}

/**
 * Menghitung nominal diskon berdasarkan jenis promo.
 * - `percentage`: diskon = subtotal item promo × persen.
 * - `buy-get`: setiap kelipatan (beli + gratis), unit gratis dihitung sebagai diskon.
 *
 * Semua hasil dibulatkan ke rupiah terdekat (tanpa pecahan sen).
 */
export function calculateDiscount(
  promo: PromoConfig,
  items: ResolvedPromoItem[]
): number {
  if (promo.kind === "percentage") {
    const percent = promo.discountPercent ?? 0;
    const subtotal = items.reduce(
      (sum, { product, quantity }) => sum + product.price * quantity,
      0
    );
    return Math.round((subtotal * percent) / 100);
  }

  if (promo.kind === "buy-get") {
    const buy = promo.buyQuantity ?? 0;
    const free = promo.freeQuantity ?? 0;
    const groupSize = buy + free;
    if (groupSize <= 0) return 0;

    return items.reduce((sum, { product, quantity }) => {
      const freeUnits = Math.floor(quantity / groupSize) * free;
      return sum + freeUnits * product.price;
    }, 0);
  }

  return 0;
}

/** Membangun keranjang promo lengkap (item + diskon + nama produk). */
export function buildPromoCart(
  promo: PromoConfig,
  products: Product[]
): PromoCart {
  const items = resolvePromoItems(promo, products);
  const discount = calculateDiscount(promo, items);
  const productNames = items.map(({ product }) => product.name);
  return { items, discount, productNames };
}
