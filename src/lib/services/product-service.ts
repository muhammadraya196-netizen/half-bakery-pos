import type {
  Product,
  ProductQuery,
  PaginatedResponse,
} from "@/types";

const DEFAULT_LIMIT = 10;

/** Status produk diturunkan dari stok: stok > 0 = active, stok = 0 = inactive. */
function matchStatus(product: Product, status?: string): boolean {
  if (!status || status === "all") return true;
  const isActive = product.stock > 0;
  return status === "active" ? isActive : !isActive;
}

/**
 * Menerapkan seluruh filter (dapat digabungkan) pada daftar produk.
 * Filter: search, category, status, minPrice, maxPrice, minStock.
 */
export function filterProducts(
  products: Product[],
  query: ProductQuery
): Product[] {
  const { search, category, status, minPrice, maxPrice, minStock } = query;

  return products.filter((product) => {
    // Kategori
    if (category && category !== "all" && product.category !== category) {
      return false;
    }

    // Status aktif/nonaktif (berdasarkan stok)
    if (!matchStatus(product, status)) {
      return false;
    }

    // Rentang harga
    if (typeof minPrice === "number" && product.price < minPrice) return false;
    if (typeof maxPrice === "number" && product.price > maxPrice) return false;

    // Stok minimum
    if (typeof minStock === "number" && product.stock < minStock) return false;

    // Pencarian (nama / SKU / kategori)
    if (search) {
      const q = search.toLowerCase().trim();
      const haystack = `${product.name} ${product.sku} ${product.category}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/**
 * Filter + paginasi (limit & offset) di sisi backend.
 *
 * Rumus offset: offset = (currentPage - 1) × limit
 * Data dipotong dengan products.slice(offset, offset + limit) SETELAH difilter,
 * sehingga `total` mencerminkan jumlah seluruh hasil filter (bukan satu halaman).
 */
export function queryProducts(
  products: Product[],
  query: ProductQuery
): PaginatedResponse<Product> {
  const filtered = filterProducts(products, query);

  const limit =
    typeof query.limit === "number" && query.limit > 0
      ? query.limit
      : DEFAULT_LIMIT;
  const offset =
    typeof query.offset === "number" && query.offset >= 0 ? query.offset : 0;

  const data = filtered.slice(offset, offset + limit);

  return {
    data,
    total: filtered.length,
    limit,
    offset,
  };
}
