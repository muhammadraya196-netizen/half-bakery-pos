import { mockProducts, mockOrders, mockUsers } from "@/lib/mock-data";
import type {
  Product,
  Order,
  StockMovement,
  StockMovementInput,
  ManagedUser,
  UserActivity,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types";

// In-memory store for demo purposes (resets on server restart)
const products = [...mockProducts];
const orders = [...mockOrders];
const stockMovements: StockMovement[] = [];

export function getProducts(): Product[] {
  return products;
}

export function getProductById(id: string): Product | undefined {
  return products.find((p) => p.id === id);
}

export function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Product {
  const product: Product = {
    ...data,
    id: String(Date.now()),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  products.push(product);
  return product;
}

export function updateProduct(id: string, data: Partial<Product>): Product | null {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  products[index] = {
    ...products[index],
    ...data,
    updatedAt: new Date().toISOString(),
  };
  return products[index];
}

export function deleteProduct(id: string): boolean {
  const index = products.findIndex((p) => p.id === id);
  if (index === -1) return false;
  products.splice(index, 1);
  return true;
}

export function getOrders(): Order[] {
  return orders.sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function createOrder(data: Omit<Order, "id" | "orderNumber" | "createdAt">): Order {
  const order: Order = {
    ...data,
    id: `ord-${Date.now()}`,
    orderNumber: `INV-${new Date().toISOString().slice(0, 10).replace(/-/g, "")}-${String(orders.length + 1).padStart(3, "0")}`,
    createdAt: new Date().toISOString(),
  };
  orders.unshift(order);

  // Update product stock + catat audit pergerakan stok keluar (Penjualan)
  for (const item of order.items) {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      const before = product.stock;
      product.stock = Math.max(0, product.stock - item.quantity);
      product.updatedAt = new Date().toISOString();
      recordMovement({
        type: "out",
        productId: product.id,
        productName: product.name,
        category: product.category,
        quantity: item.quantity,
        stockBefore: before,
        stockAfter: product.stock,
        reason: "Penjualan",
        note: `Penjualan ${order.orderNumber}`,
        officerId: order.cashierId,
        officerName: order.cashierName,
      });
    }
  }

  return order;
}

// ── Stock movements (audit append-only) ──

function nextStockNumber(type: "in" | "out"): string {
  const prefix = type === "in" ? "STI" : "STO";
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const seq = stockMovements.filter((m) => m.type === type).length + 1;
  return `${prefix}-${datePart}-${String(seq).padStart(3, "0")}`;
}

interface RecordMovementArgs {
  type: "in" | "out";
  productId: string;
  productName: string;
  category: string;
  quantity: number;
  stockBefore: number;
  stockAfter: number;
  supplier?: string;
  unit?: string;
  purchasePrice?: number;
  reason?: StockMovement["reason"];
  note?: string;
  officerId: string;
  officerName: string;
}

/** Menulis satu baris audit pergerakan stok (internal). */
function recordMovement(args: RecordMovementArgs): StockMovement {
  const movement: StockMovement = {
    id: `stk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    transactionNumber: nextStockNumber(args.type),
    type: args.type,
    productId: args.productId,
    productName: args.productName,
    category: args.category,
    supplier: args.supplier,
    unit: args.unit,
    quantityIn: args.type === "in" ? args.quantity : 0,
    quantityOut: args.type === "out" ? args.quantity : 0,
    stockBefore: args.stockBefore,
    stockAfter: args.stockAfter,
    purchasePrice: args.purchasePrice,
    totalPrice:
      args.purchasePrice !== undefined
        ? args.purchasePrice * args.quantity
        : undefined,
    reason: args.reason,
    note: args.note,
    officerId: args.officerId,
    officerName: args.officerName,
    createdAt: new Date().toISOString(),
  };
  stockMovements.unshift(movement);
  return movement;
}

export function getStockMovements(): StockMovement[] {
  return stockMovements;
}

export class StockError extends Error {}

/**
 * Membuat pergerakan stok (masuk / keluar) sekaligus memperbarui stok produk.
 * - Stok masuk: stok bertambah.
 * - Stok keluar: stok berkurang, tidak boleh melebihi stok tersedia (anti-negatif).
 */
export function createStockMovement(input: StockMovementInput): StockMovement {
  const product = products.find((p) => p.id === input.productId);
  if (!product) {
    throw new StockError("Produk tidak ditemukan");
  }
  if (!Number.isFinite(input.quantity) || input.quantity <= 0) {
    throw new StockError("Jumlah harus lebih dari 0");
  }

  const before = product.stock;

  if (input.type === "in") {
    if (input.purchasePrice !== undefined && input.purchasePrice < 0) {
      throw new StockError("Harga beli tidak boleh negatif");
    }
    if (!input.supplier) {
      throw new StockError("Supplier wajib dipilih");
    }
    product.stock = before + input.quantity;
  } else {
    if (input.quantity > before) {
      throw new StockError(
        `Stok tidak mencukupi. Stok tersedia: ${before}`
      );
    }
    product.stock = before - input.quantity;
  }

  product.updatedAt = new Date().toISOString();

  return recordMovement({
    type: input.type,
    productId: product.id,
    productName: product.name,
    category: product.category,
    quantity: input.quantity,
    stockBefore: before,
    stockAfter: product.stock,
    supplier: input.supplier,
    unit: input.unit,
    purchasePrice: input.purchasePrice,
    reason: input.reason,
    note: input.note,
    officerId: input.officerId,
    officerName: input.officerName,
  });
}

// ── Manajemen User ──

export class UserError extends Error {}

// Password disimpan terpisah dari data user (tidak pernah dikembalikan ke client).
const userPasswords = new Map<string, string>();
const userActivities: UserActivity[] = [];

const managedUsers: ManagedUser[] = mockUsers.map((u) => {
  userPasswords.set(u.id, u.password);
  return {
    id: u.id,
    name: u.name,
    username: u.username,
    email: u.email,
    phone: u.phone,
    role: u.role,
    status: u.status,
    createdAt: u.createdAt,
    lastLogin: u.lastLogin,
  };
});

mockUsers.forEach((u) =>
  userActivities.push({
    id: `act-${u.id}-seed`,
    userId: u.id,
    action: "Akun dibuat",
    createdAt: u.createdAt,
  })
);

function addActivity(userId: string, action: string) {
  userActivities.unshift({
    id: `act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    userId,
    action,
    createdAt: new Date().toISOString(),
  });
}

export function getUsers(): ManagedUser[] {
  return [...managedUsers].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}

export function getUserById(id: string): ManagedUser | undefined {
  return managedUsers.find((u) => u.id === id);
}

export function getUserActivities(userId: string): UserActivity[] {
  return userActivities.filter((a) => a.userId === userId);
}

function assertUniqueIdentity(
  username: string,
  email: string,
  exceptId?: string
) {
  const u = username.toLowerCase();
  const e = email.toLowerCase();
  if (
    managedUsers.some(
      (x) => x.id !== exceptId && x.username.toLowerCase() === u
    )
  ) {
    throw new UserError("Username sudah digunakan");
  }
  if (
    managedUsers.some((x) => x.id !== exceptId && x.email.toLowerCase() === e)
  ) {
    throw new UserError("Email sudah digunakan");
  }
}

export function createUser(payload: CreateUserPayload): ManagedUser {
  assertUniqueIdentity(payload.username, payload.email);

  const user: ManagedUser = {
    id: `user-${Date.now()}`,
    name: payload.name,
    username: payload.username,
    email: payload.email,
    phone: payload.phone,
    role: payload.role,
    status: payload.status,
    avatar: payload.avatar,
    createdAt: new Date().toISOString(),
  };
  managedUsers.push(user);
  userPasswords.set(user.id, payload.password);
  addActivity(user.id, "Akun dibuat");
  return user;
}

export function updateUser(
  id: string,
  payload: UpdateUserPayload
): ManagedUser {
  const user = managedUsers.find((u) => u.id === id);
  if (!user) throw new UserError("User tidak ditemukan");

  const nextUsername = payload.username ?? user.username;
  const nextEmail = payload.email ?? user.email;
  assertUniqueIdentity(nextUsername, nextEmail, id);

  Object.assign(user, {
    name: payload.name ?? user.name,
    username: nextUsername,
    email: nextEmail,
    phone: payload.phone ?? user.phone,
    role: payload.role ?? user.role,
    status: payload.status ?? user.status,
    avatar: payload.avatar ?? user.avatar,
  });
  addActivity(id, "Data user diperbarui");
  return user;
}

export function deleteUser(id: string): boolean {
  const index = managedUsers.findIndex((u) => u.id === id);
  if (index === -1) return false;
  managedUsers.splice(index, 1);
  userPasswords.delete(id);
  return true;
}

export function resetUserPassword(id: string, newPassword: string): ManagedUser {
  const user = managedUsers.find((u) => u.id === id);
  if (!user) throw new UserError("User tidak ditemukan");
  if (newPassword.length < 8) {
    throw new UserError("Password minimal 8 karakter");
  }
  userPasswords.set(id, newPassword);
  addActivity(id, "Password direset");
  return user;
}

export function setUserStatus(
  id: string,
  status: "active" | "inactive"
): ManagedUser {
  const user = managedUsers.find((u) => u.id === id);
  if (!user) throw new UserError("User tidak ditemukan");
  user.status = status;
  addActivity(id, status === "active" ? "Akun diaktifkan" : "Akun dinonaktifkan");
  return user;
}
