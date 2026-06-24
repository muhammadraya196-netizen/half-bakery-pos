export type UserRole = "admin" | "cashier" | "manager";

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatar?: string;
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
  badge?: "new" | "limited";
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = "pending" | "completed" | "cancelled" | "refunded";
export type PaymentMethod = "cash" | "card" | "qris" | "transfer";

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  subtotal: number;
}

export interface Order {
  id: string;
  orderNumber: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: PaymentMethod;
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
  salesByDay: { date: string; revenue: number; orders: number }[];
  salesByCategory: { category: string; revenue: number; count: number }[];
  topProducts: { name: string; sold: number; revenue: number }[];
}

export interface SocketEvent {
  type: "order_created" | "order_updated" | "product_updated" | "stock_alert";
  payload: unknown;
  timestamp: string;
}
