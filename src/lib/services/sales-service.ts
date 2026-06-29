import type {
  Order,
  SalesPeriod,
  SalesQuery,
  SalesSummary,
  SalesResult,
} from "@/types";

// Seluruh perhitungan tanggal mengikuti timezone Indonesia (WIB / UTC+7).
const INDONESIA_TZ = "Asia/Jakarta";
const DEFAULT_LIMIT = 10;

/** Kunci tanggal "YYYY-MM-DD" dari sebuah Date pada timezone Indonesia. */
export function toIndonesiaDateKey(date: Date): string {
  return new Intl.DateTimeFormat("en-CA", { timeZone: INDONESIA_TZ }).format(
    date
  );
}

// Helper kalkulasi kalender memakai UTC-midnight (hanya tanggal, tanpa jam)
function keyToUtcDate(key: string): Date {
  return new Date(`${key}T00:00:00Z`);
}
function utcDateToKey(date: Date): string {
  return date.toISOString().slice(0, 10);
}
function addDays(key: string, days: number): string {
  const d = keyToUtcDate(key);
  d.setUTCDate(d.getUTCDate() + days);
  return utcDateToKey(d);
}

export interface DateRange {
  startDate: string;
  endDate: string;
}

/**
 * Menghitung rentang tanggal untuk sebuah periode preset.
 * - today: hari ini
 * - yesterday: kemarin
 * - last7days: 7 hari terakhir (termasuk hari ini)
 * - thisWeek: minggu ini (Senin s/d hari ini)
 * - thisMonth: awal bulan s/d hari ini
 * - lastMonth: bulan lalu penuh
 * - thisYear: 1 Januari s/d hari ini
 * - custom: memakai range yang diberikan user
 */
export function getPeriodRange(
  period: SalesPeriod,
  custom?: Partial<DateRange>,
  now: Date = new Date()
): DateRange {
  const todayKey = toIndonesiaDateKey(now);
  const today = keyToUtcDate(todayKey);

  switch (period) {
    case "today":
      return { startDate: todayKey, endDate: todayKey };

    case "yesterday": {
      const y = addDays(todayKey, -1);
      return { startDate: y, endDate: y };
    }

    case "last7days":
      return { startDate: addDays(todayKey, -6), endDate: todayKey };

    case "thisWeek": {
      // Senin sebagai awal minggu (0 = Senin … 6 = Minggu)
      const dayOfWeek = (today.getUTCDay() + 6) % 7;
      return { startDate: addDays(todayKey, -dayOfWeek), endDate: todayKey };
    }

    case "thisMonth": {
      const start = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 1)
      );
      return { startDate: utcDateToKey(start), endDate: todayKey };
    }

    case "lastMonth": {
      const start = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth() - 1, 1)
      );
      // Tanggal 0 bulan berjalan = hari terakhir bulan lalu
      const end = new Date(
        Date.UTC(today.getUTCFullYear(), today.getUTCMonth(), 0)
      );
      return { startDate: utcDateToKey(start), endDate: utcDateToKey(end) };
    }

    case "thisYear": {
      const start = new Date(Date.UTC(today.getUTCFullYear(), 0, 1));
      return { startDate: utcDateToKey(start), endDate: todayKey };
    }

    case "custom":
      return {
        startDate: custom?.startDate || todayKey,
        endDate: custom?.endDate || todayKey,
      };

    default:
      return { startDate: todayKey, endDate: todayKey };
  }
}

/**
 * Filter transaksi berdasarkan rentang tanggal (inklusif), status, dan search.
 * Perbandingan tanggal memakai kunci YYYY-MM-DD pada timezone Indonesia.
 */
export function filterSales(orders: Order[], query: SalesQuery): Order[] {
  const { startDate, endDate, status, search } = query;

  return orders.filter((order) => {
    const key = toIndonesiaDateKey(new Date(order.createdAt));

    if (startDate && key < startDate) return false;
    if (endDate && key > endDate) return false;

    if (status && status !== "all" && order.status !== status) return false;

    if (search) {
      const q = search.toLowerCase().trim();
      const haystack =
        `${order.orderNumber} ${order.cashierName} ${order.customerName ?? ""}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/** Sorting berdasarkan tanggal atau total penjualan. */
export function sortSales(orders: Order[], query: SalesQuery): Order[] {
  const sortBy = query.sortBy ?? "date";
  const dir = query.sortDir ?? "desc";
  const factor = dir === "asc" ? 1 : -1;

  return [...orders].sort((a, b) => {
    if (sortBy === "total") {
      return (a.total - b.total) * factor;
    }
    // default: tanggal
    return (
      (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) *
      factor
    );
  });
}

/**
 * Ringkasan penjualan dari seluruh transaksi hasil filter (bukan satu halaman).
 *
 * Rumus:
 * - Total Penjualan          = SUM(total)
 * - Jumlah Transaksi         = COUNT(transaksi)
 * - Total Produk Terjual     = SUM(quantity seluruh item)
 * - Rata-rata Nilai Transaksi = Total Penjualan / Jumlah Transaksi (0 bila kosong)
 */
export function computeSalesSummary(orders: Order[]): SalesSummary {
  const totalSales = orders.reduce((sum, o) => sum + o.total, 0);
  const transactionCount = orders.length;
  const totalItemsSold = orders.reduce(
    (sum, o) => sum + o.items.reduce((q, i) => q + i.quantity, 0),
    0
  );
  const averageTransaction =
    transactionCount > 0 ? totalSales / transactionCount : 0;

  return { totalSales, transactionCount, totalItemsSold, averageTransaction };
}

/**
 * Pipeline lengkap: filter → ringkasan (atas seluruh hasil) → sort → paginasi.
 * Ringkasan dihitung SEBELUM paginasi agar mencakup seluruh transaksi periode.
 */
export function querySales(orders: Order[], query: SalesQuery): SalesResult {
  const filtered = filterSales(orders, query);
  const summary = computeSalesSummary(filtered);
  const sorted = sortSales(filtered, query);

  const limit =
    typeof query.limit === "number" && query.limit > 0
      ? query.limit
      : DEFAULT_LIMIT;
  const offset =
    typeof query.offset === "number" && query.offset >= 0 ? query.offset : 0;

  const data = sorted.slice(offset, offset + limit);

  return { data, total: filtered.length, limit, offset, summary };
}
