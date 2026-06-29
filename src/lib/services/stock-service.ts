import type {
  Product,
  StockMovement,
  StockQuery,
  StockResult,
  StockSummary,
  StockStatus,
  ProductStockInfo,
  StockOverview,
} from "@/types";
import { DEFAULT_MIN_STOCK } from "@/lib/stock-data";
import { toIndonesiaDateKey } from "@/lib/services/sales-service";

/** Tentukan status stok berdasarkan stok saat ini & batas minimum. */
export function getStockStatus(
  currentStock: number,
  minStock: number = DEFAULT_MIN_STOCK
): StockStatus {
  if (currentStock <= 0) return "out";
  if (currentStock <= minStock) return "low";
  return "safe";
}

/** Filter pergerakan stok (semua filter dapat digabungkan). */
export function filterMovements(
  movements: StockMovement[],
  query: StockQuery
): StockMovement[] {
  const { startDate, endDate, search, productId, supplier, type } = query;

  return movements.filter((m) => {
    const key = toIndonesiaDateKey(new Date(m.createdAt));

    if (startDate && key < startDate) return false;
    if (endDate && key > endDate) return false;
    if (type && type !== "all" && m.type !== type) return false;
    if (productId && productId !== "all" && m.productId !== productId)
      return false;
    if (supplier && supplier !== "all" && m.supplier !== supplier) return false;

    if (search) {
      const q = search.toLowerCase().trim();
      const haystack =
        `${m.productName} ${m.transactionNumber} ${m.supplier ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/** Filter + paginasi (limit & offset) pergerakan stok. */
export function queryMovements(
  movements: StockMovement[],
  query: StockQuery
): StockResult {
  const filtered = filterMovements(movements, query);

  const limit =
    typeof query.limit === "number" && query.limit > 0 ? query.limit : 10;
  const offset =
    typeof query.offset === "number" && query.offset >= 0 ? query.offset : 0;

  const data = filtered.slice(offset, offset + limit);

  return { data, total: filtered.length, limit, offset };
}

/** Hitung info stok per produk dari log pergerakan + stok aktual produk. */
export function computeProductStockInfo(
  products: Product[],
  movements: StockMovement[]
): ProductStockInfo[] {
  return products.map((product) => {
    const productMovements = movements.filter(
      (m) => m.productId === product.id
    );
    const totalIn = productMovements.reduce((s, m) => s + m.quantityIn, 0);
    const totalOut = productMovements.reduce((s, m) => s + m.quantityOut, 0);
    const minStock = product.minStock ?? DEFAULT_MIN_STOCK;

    return {
      productId: product.id,
      name: product.name,
      category: product.category,
      currentStock: product.stock,
      totalIn,
      totalOut,
      minStock,
      status: getStockStatus(product.stock, minStock),
    };
  });
}

/**
 * Ringkasan Dashboard Stok (realtime).
 *
 * - Total Produk             = jumlah produk
 * - Total Stok Saat Ini      = SUM(stok seluruh produk)
 * - Total Stok Masuk Hari Ini = SUM(quantityIn) movement bertanggal hari ini
 * - Total Stok Keluar Hari Ini = SUM(quantityOut) movement bertanggal hari ini
 * - Produk Hampir Habis      = COUNT(status = low)
 * - Produk Habis             = COUNT(status = out)
 */
export function computeStockSummary(
  products: Product[],
  movements: StockMovement[],
  now: Date = new Date()
): StockSummary {
  const todayKey = toIndonesiaDateKey(now);
  const todayMovements = movements.filter(
    (m) => toIndonesiaDateKey(new Date(m.createdAt)) === todayKey
  );

  const info = computeProductStockInfo(products, movements);

  return {
    totalProducts: products.length,
    totalStock: products.reduce((s, p) => s + p.stock, 0),
    totalStockInToday: todayMovements.reduce((s, m) => s + m.quantityIn, 0),
    totalStockOutToday: todayMovements.reduce((s, m) => s + m.quantityOut, 0),
    lowStockCount: info.filter((i) => i.status === "low").length,
    outOfStockCount: info.filter((i) => i.status === "out").length,
  };
}

export function buildStockOverview(
  products: Product[],
  movements: StockMovement[]
): StockOverview {
  return {
    summary: computeStockSummary(products, movements),
    products: computeProductStockInfo(products, movements),
  };
}
