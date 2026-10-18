export type UserRole = "admin" | "finance" | "cashier" | "manager";

export type UserStatus = "active" | "inactive";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
  username?: string;
  phone?: string;
  status?: UserStatus;
  createdAt?: string;
  lastLogin?: string;
}

/** Data user lengkap untuk modul Manajemen User (tanpa password). */
export interface ManagedUser {
  id: string;
  name: string;
  username: string;
  email: string;
  phone?: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
  createdAt: string;
  lastLogin?: string;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  createdAt: string;
}

export interface UserQuery {
  search?: string;
  role?: UserRole | "all";
  status?: UserStatus | "all";
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}

export interface UserResult {
  data: ManagedUser[];
  total: number;
  limit: number;
  offset: number;
}

/** Payload pembuatan user (termasuk password, dikirim ke backend). */
export interface CreateUserPayload {
  name: string;
  username: string;
  email: string;
  phone?: string;
  password: string;
  role: UserRole;
  status: UserStatus;
  avatar?: string;
}

/** Payload update user (password opsional). */
export interface UpdateUserPayload {
  name?: string;
  username?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  status?: UserStatus;
  avatar?: string;
}

/** Satu produk katalog di dalam paket promo bundling. */
export interface BundleComponent {
  productId: string;
  productName: string;
  quantity: number;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  image?: string;
  sku: string;
  rating?: number;
  isBestSeller?: boolean;
  isCustomerFavorite?: boolean;
  /** Item promo bundling. Hanya diisi pada data demo bundling di kasir. */
  isPromoBundling?: boolean;
  /** Isi paket untuk tampilan, mis. "1 Coffee". */
  bundleItems?: string[];
  /** Produk katalog yang dikonsumsi paket ini. */
  bundleComponents?: BundleComponent[];
  /** Harga sebelum diskon bundle. Tidak mengubah harga produk katalog. */
  originalPrice?: number;
  /** Selisih harga normal dan harga bundle. */
  savings?: number;
  promoLabel?: string;
  badge?: "new" | "limited";
  minStock?: number;
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = "pending" | "completed" | "cancelled" | "refunded";

/** Metode pembayaran kasir. `card` tetap berarti E-Wallet (data lama). */
export const PAYMENT_METHOD_VALUES = [
  "cash",
  "debit",
  "credit",
  "card",
  "qris",
  "transfer",
] as const;

export type PaymentMethod = (typeof PAYMENT_METHOD_VALUES)[number];

/** Satu baris pembayaran dalam satu transaksi (split payment). */
export interface OrderPayment {
  method: PaymentMethod;
  /** Nominal yang dihitung ke tagihan. */
  amount: number;
  /** Uang diterima. Hanya untuk tunai, boleh lebih besar dari `amount` (kembalian). */
  cashReceived?: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
  /** Isi paket. Kosong pada produk biasa. */
  bundleComponents?: BundleComponent[];
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  /** Metode pertama. Transaksi lama hanya punya field ini. */
  paymentMethod: PaymentMethod;
  /** Seluruh pembayaran. Kosong pada transaksi lama (satu metode). */
  payments?: OrderPayment[];
  status: OrderStatus;
  cashierId: string;
  cashierName: string;
  customerName?: string;
  notes?: string;
  cashReceived?: number;
  changeAmount?: number;
  createdAt: string;
}

export interface AnalyticsData {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  averageOrderValue: number;
  revenueGrowth: number;
  ordersGrowth: number;
  // Metrik harian (dihitung realtime dari transaksi nyata hari ini)
  todaySales: number;
  todayOrderCount: number;
  todayItemsSold: number;
  todayAverageSale: number;
  salesByDay: { date: string; revenue: number; orders: number }[];
  salesByCategory: { category: string; revenue: number; count: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
}

export type ProductStatus = "all" | "active" | "inactive";

/** Parameter query untuk list produk (backend filter + limit + offset). */
export interface ProductQuery {
  search?: string;
  category?: string;
  status?: ProductStatus;
  minPrice?: number;
  maxPrice?: number;
  minStock?: number;
  limit?: number;
  offset?: number;
}

/** Envelope respons paginasi generik. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  limit: number;
  offset: number;
}

// ── Sales / Daftar Penjualan ──
export type SalesPeriod =
  | "today"
  | "yesterday"
  | "last7days"
  | "thisWeek"
  | "thisMonth"
  | "lastMonth"
  | "thisYear"
  | "custom";

export type SalesSortBy = "date" | "total";
export type SortDirection = "asc" | "desc";

/** Parameter query Daftar Penjualan (backend filter + limit + offset). */
export interface SalesQuery {
  startDate?: string; // YYYY-MM-DD (timezone Indonesia)
  endDate?: string; // YYYY-MM-DD (timezone Indonesia)
  search?: string;
  status?: string;
  sortBy?: SalesSortBy;
  sortDir?: SortDirection;
  limit?: number;
  offset?: number;
}

/** Ringkasan penjualan, dihitung dari seluruh transaksi sesuai filter aktif. */
export interface SalesSummary {
  totalSales: number;
  transactionCount: number;
  totalItemsSold: number;
  averageTransaction: number;
}

/** Envelope respons Daftar Penjualan (paginasi + ringkasan). */
export interface SalesResult {
  data: Order[];
  total: number;
  limit: number;
  offset: number;
  summary: SalesSummary;
}

// ── Manajemen Stok ──
export type StockMovementType = "in" | "out";

export type StockOutReason =
  | "Penjualan"
  | "Produk Rusak"
  | "Kadaluarsa"
  | "Sampel"
  | "Retur"
  | "Lainnya";

export type StockStatus = "safe" | "low" | "out";

/** Satu baris audit pergerakan stok. Bersifat append-only (tidak dapat diedit). */
export interface StockMovement {
  id: string;
  transactionNumber: string;
  type: StockMovementType;
  productId: string;
  productName: string;
  category: string;
  supplier?: string;
  unit?: string;
  quantityIn: number;
  quantityOut: number;
  stockBefore: number;
  stockAfter: number;
  purchasePrice?: number;
  totalPrice?: number;
  reason?: StockOutReason;
  note?: string;
  officerId: string;
  officerName: string;
  createdAt: string;
}

/** Payload pembuatan pergerakan stok (dari form). */
export interface StockMovementInput {
  type: StockMovementType;
  productId: string;
  supplier?: string;
  unit?: string;
  quantity: number;
  purchasePrice?: number;
  reason?: StockOutReason;
  note?: string;
  officerId: string;
  officerName: string;
}

export interface StockQuery {
  startDate?: string;
  endDate?: string;
  search?: string;
  productId?: string;
  supplier?: string;
  type?: StockMovementType | "all";
  limit?: number;
  offset?: number;
}

export interface StockResult {
  data: StockMovement[];
  total: number;
  limit: number;
  offset: number;
}

/** Ringkasan kartu Dashboard Stok. */
export interface StockSummary {
  totalProducts: number;
  totalStock: number;
  totalStockInToday: number;
  totalStockOutToday: number;
  lowStockCount: number;
  outOfStockCount: number;
}

/** Info stok per produk untuk Dashboard Produk. */
export interface ProductStockInfo {
  productId: string;
  name: string;
  category: string;
  currentStock: number;
  totalIn: number;
  totalOut: number;
  minStock: number;
  status: StockStatus;
}

export interface StockOverview {
  summary: StockSummary;
  products: ProductStockInfo[];
}

export interface SocketEvent {
  type: "order_created" | "order_updated" | "product_updated" | "stock_alert";
  payload: unknown;
  timestamp: string;
}
