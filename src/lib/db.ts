import { mockProducts, mockOrders } from "@/lib/mock-data";
import type { Product, Order } from "@/types";

// In-memory store for demo purposes (resets on server restart)
const products = [...mockProducts];
const orders = [...mockOrders];

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

  // Update product stock
  for (const item of order.items) {
    const product = products.find((p) => p.id === item.productId);
    if (product) {
      product.stock = Math.max(0, product.stock - item.quantity);
      product.updatedAt = new Date().toISOString();
    }
  }

  return order;
}
