import type { Order } from "@/types";

// Semua perhitungan "hari ini" mengikuti timezone Indonesia (WIB / UTC+7).
const INDONESIA_TZ = "Asia/Jakarta";

/**
 * Mengembalikan kunci tanggal "YYYY-MM-DD" dari sebuah Date
 * pada timezone Indonesia. Format en-CA menghasilkan YYYY-MM-DD.
 */
export function toIndonesiaDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: INDONESIA_TZ }).format(
    date
  );
}

export interface DailySalesStats {
  /** Total omzet transaksi sukses pada tanggal hari ini */
  todaySales: number;
  /** Jumlah transaksi (order) sukses pada tanggal hari ini */
  todayOrderCount: number;
  /** Total item (quantity) yang berhasil dijual pada tanggal hari ini */
  todayItemsSold: number;
  /** Rata-rata penjualan per transaksi hari ini */
  todayAverageSale: number;
}

/**
 * Menghitung metrik penjualan HARI INI dari transaksi nyata.
 *
 * Rumus:
 * - Total Penjualan Hari Ini   = SUM(total) transaksi pada tanggal hari ini
 * - Jumlah Transaksi Hari Ini  = COUNT(transaksi pada tanggal hari ini)
 * - Produk Terjual Hari Ini    = SUM(quantity item) transaksi pada tanggal hari ini
 * - Rata-rata Penjualan        = Total Penjualan Hari Ini / Jumlah Transaksi Hari Ini
 *
 * Catatan:
 * - "Hari ini" ditentukan pada timezone Indonesia (Asia/Jakarta).
 * - Hanya transaksi berstatus "completed" yang dihitung sebagai penjualan berhasil.
 * - Pembagian dijaga agar tidak menghasilkan NaN / Infinity saat 0 transaksi.
 */
export function computeDailySalesStats(
  orders: Order[],
  now: Date = new Date()
): DailySalesStats {
  const todayKey = toIndonesiaDateKey(now);

  const todayOrders = orders.filter(
    (order) =>
      order.status === "completed" &&
      toIndonesiaDateKey(new Date(order.createdAt)) === todayKey
  );

  const todaySales = todayOrders.reduce((sum, order) => sum + order.total, 0);

  const todayOrderCount = todayOrders.length;

  const todayItemsSold = todayOrders.reduce(
    (sum, order) =>
      sum + order.items.reduce((qty, item) => qty + item.quantity, 0),
    0
  );

  // Guard pembagian dengan nol → kembalikan 0 (bukan NaN / Infinity).
  const todayAverageSale =
    todayOrderCount > 0 ? todaySales / todayOrderCount : 0;

  return { todaySales, todayOrderCount, todayItemsSold, todayAverageSale };
}
