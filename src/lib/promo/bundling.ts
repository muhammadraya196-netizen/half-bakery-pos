import type { CartItem, Product } from "@/types";

/**
 * Jumlah paket yang masih bisa dijual dari stok katalog.
 * Stok yang sudah terpakai di keranjang (produk biasa atau paket lain) ikut dihitung.
 * Qty paket ini sendiri tidak dikurangi, karena cart membatasi lewat `product.stock`.
 */
export function availableBundleSets(
  bundle: Product,
  catalog: Product[],
  cart: CartItem[]
): number {
  const components = bundle.bundleComponents;
  if (!components || components.length === 0) return 0;

  let maxSets = Number.POSITIVE_INFINITY;

  for (const component of components) {
    const product = catalog.find((item) => item.id === component.productId);
    if (!product || component.quantity <= 0) return 0;

    let used = 0;
    for (const line of cart) {
      if (line.product.id === bundle.id) continue;
      if (line.product.id === component.productId) {
        used += line.quantity;
      }
      const nested = line.product.bundleComponents?.find(
        (part) => part.productId === component.productId
      );
      if (nested) used += nested.quantity * line.quantity;
    }

    const remaining = product.stock - used;
    maxSets = Math.min(maxSets, Math.floor(remaining / component.quantity));
  }

  if (!Number.isFinite(maxSets)) return 0;
  return Math.max(0, maxSets);
}
