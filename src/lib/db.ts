import type { PoolClient } from "pg";
import { hashPassword, verifyPassword } from "@/lib/password";
import { getPool, postgresErrorCode, query, withTransaction } from "@/lib/postgres";
import type {
  CreateUserPayload,
  ManagedUser,
  Order,
  OrderItem,
  OrderPayment,
  PaymentMethod,
  Product,
  StockMovement,
  StockMovementInput,
  StockOutReason,
  UpdateUserPayload,
  UserActivity,
  UserRole,
  UserStatus,
} from "@/types";

export class StockError extends Error {}
export class UserError extends Error {}
export class DbError extends Error {}

const CATEGORY_IDS: Record<string, string> = {
  Cake: "cake",
  Bread: "bread",
  Pastry: "pastry",
  Cookies: "cookies",
  Dessert: "dessert",
  "Coffee & Drink": "coffee-drink",
};

type ProductRow = {
  id: string;
  sku: string;
  name: string;
  description: string | null;
  price: number;
  stock: number;
  category_name: string;
  image: string | null;
  rating: number | null;
  is_best_seller: boolean;
  is_customer_favorite: boolean;
  badge: "new" | "limited" | null;
  min_stock: number;
  created_at: Date;
  updated_at: Date;
};

type UserRow = {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string | null;
  role: UserRole;
  status: UserStatus;
  avatar: string | null;
  created_at: Date;
  last_login: Date | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  payment_method: PaymentMethod;
  status: Order["status"];
  cashier_id: string;
  cashier_name: string;
  customer_name: string | null;
  notes: string | null;
  cash_received: number | null;
  change_amount: number;
  created_at: Date;
};

type MovementRow = {
  id: string;
  transaction_number: string;
  movement_type: "in" | "out";
  product_id: string;
  product_name: string;
  category_name: string;
  supplier_name: string | null;
  unit_code: string | null;
  quantity: number;
  stock_before: number;
  stock_after: number;
  purchase_price: number | null;
  total_price: number | null;
  reason: StockOutReason | null;
  note: string | null;
  officer_id: string;
  officer_name: string;
  created_at: Date;
};

function iso(value: Date): string {
  return value.toISOString();
}

function rupiah(value: number): number {
  return Math.round(value);
}

function blankToNull(value: string | undefined | null): string | null {
  if (value === undefined || value === null || value.trim() === "") return null;
  return value;
}

function asJson<T>(value: T | string): T {
  return typeof value === "string" ? (JSON.parse(value) as T) : value;
}

function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    sku: row.sku,
    name: row.name,
    description: row.description ?? "",
    price: Number(row.price),
    stock: row.stock,
    category: row.category_name,
    image: row.image ?? undefined,
    rating: row.rating === null ? undefined : Number(row.rating),
    isBestSeller: row.is_best_seller,
    isCustomerFavorite: row.is_customer_favorite,
    badge: row.badge ?? undefined,
    minStock: row.min_stock,
    createdAt: iso(row.created_at),
    updatedAt: iso(row.updated_at),
  };
}

function mapUser(row: UserRow): ManagedUser {
  return {
    id: row.id,
    name: row.name,
    username: row.username,
    email: row.email,
    phone: row.phone ?? undefined,
    role: row.role,
    status: row.status,
    avatar: row.avatar ?? undefined,
    createdAt: iso(row.created_at),
    lastLogin: row.last_login ? iso(row.last_login) : undefined,
  };
}

function mapMovement(row: MovementRow): StockMovement {
  return {
    id: row.id,
    transactionNumber: row.transaction_number,
    type: row.movement_type,
    productId: row.product_id,
    productName: row.product_name,
    category: row.category_name,
    supplier: row.supplier_name ?? undefined,
    unit: row.unit_code ?? undefined,
    quantityIn: row.movement_type === "in" ? row.quantity : 0,
    quantityOut: row.movement_type === "out" ? row.quantity : 0,
    stockBefore: row.stock_before,
    stockAfter: row.stock_after,
    purchasePrice: row.purchase_price === null ? undefined : Number(row.purchase_price),
    totalPrice: row.total_price === null ? undefined : Number(row.total_price),
    reason: row.reason ?? undefined,
    note: row.note ?? undefined,
    officerId: row.officer_id,
    officerName: row.officer_name,
    createdAt: iso(row.created_at),
  };
}

const PRODUCT_SQL = `
  SELECT
    p.id, p.sku, p.name, p.description, p.price, p.stock,
    c.name AS category_name, p.image, p.rating,
    p.is_best_seller, p.is_customer_favorite, p.badge, p.min_stock,
    p.created_at, p.updated_at
  FROM products p
  JOIN categories c ON c.id = p.category_id
`;

export async function getProducts(): Promise<Product[]> {
  const rows = await query<ProductRow>(
    `${PRODUCT_SQL}
     ORDER BY p.created_at ASC,
       CASE WHEN p.id ~ '^[0-9]+$' THEN lpad(p.id, 12, '0') ELSE p.id END`
  );
  return rows.map(mapProduct);
}

export async function getProductById(id: string): Promise<Product | undefined> {
  const rows = await query<ProductRow>(`${PRODUCT_SQL} WHERE p.id = $1`, [id]);
  return rows[0] ? mapProduct(rows[0]) : undefined;
}

async function categoryId(name: string, client?: PoolClient): Promise<string> {
  const known = CATEGORY_IDS[name];
  const sql = "SELECT id FROM categories WHERE name = $1 OR id = $2";
  const params = [name, known ?? name];
  const result = client
    ? await client.query<{ id: string }>(sql, params)
    : await getPool().query<{ id: string }>(sql, params);
  const id = result.rows[0]?.id;
  if (!id) throw new DbError("Kategori tidak ditemukan");
  return id;
}

function uniqueMessage(error: unknown): string | null {
  if (postgresErrorCode(error) !== "23505") return null;
  const constraint =
    typeof error === "object" && error !== null && "constraint" in error
      ? String((error as { constraint?: string }).constraint)
      : "";
  if (constraint.includes("email")) return "Email sudah digunakan";
  if (constraint.includes("username")) return "Username sudah digunakan";
  if (constraint.includes("sku")) return "SKU sudah digunakan";
  return "Data sudah digunakan";
}

export async function createProduct(
  data: Omit<Product, "id" | "createdAt" | "updatedAt">
): Promise<Product> {
  const id = String(Date.now());
  try {
    const known = CATEGORY_IDS[data.category];
    const rows = await query<{ created_at: Date; updated_at: Date; min_stock: number }>(
      `INSERT INTO products (
         id, sku, name, description, price, stock, category_id
       )
       SELECT $1, $2, $3, $4, $5, $6, picked.id
       FROM (
         SELECT id FROM categories WHERE name = $7 OR id = $8 LIMIT 1
       ) AS picked
       RETURNING created_at, updated_at, min_stock`,
      [
        id,
        data.sku,
        data.name,
        blankToNull(data.description),
        rupiah(data.price),
        data.stock,
        data.category,
        known ?? data.category,
      ]
    );
    const saved = rows[0];
    if (!saved) throw new DbError("Kategori tidak ditemukan");
    return {
      ...data,
      id,
      minStock: saved.min_stock,
      createdAt: iso(saved.created_at),
      updatedAt: iso(saved.updated_at),
    };
  } catch (error) {
    const message = uniqueMessage(error);
    if (message) throw new DbError(message);
    throw error;
  }
}

export async function updateProduct(
  id: string,
  data: Partial<Product>
): Promise<Product | null> {
  const sets: string[] = [];
  const values: unknown[] = [];
  const set = (column: string, value: unknown) => {
    values.push(value);
    sets.push(`${column} = $${values.length}`);
  };

  if (data.name !== undefined) set("name", data.name);
  if (data.description !== undefined) set("description", blankToNull(data.description));
  if (data.price !== undefined) set("price", rupiah(data.price));
  if (data.stock !== undefined) set("stock", data.stock);
  if (data.sku !== undefined) set("sku", data.sku);
  if (data.image !== undefined) set("image", blankToNull(data.image));
  if (data.rating !== undefined) set("rating", data.rating);
  if (data.isBestSeller !== undefined) set("is_best_seller", data.isBestSeller);
  if (data.isCustomerFavorite !== undefined) {
    set("is_customer_favorite", data.isCustomerFavorite);
  }
  if (data.badge !== undefined) set("badge", data.badge);
  if (data.minStock !== undefined) set("min_stock", data.minStock);
  if (data.category !== undefined) set("category_id", await categoryId(data.category));

  sets.push("updated_at = now()");
  values.push(id);

  try {
    const rows = await query<ProductRow>(
      `WITH updated AS (
         UPDATE products
         SET ${sets.join(", ")}
         WHERE id = $${values.length}
         RETURNING id, sku, name, description, price, stock, category_id, image, rating,
                   is_best_seller, is_customer_favorite, badge, min_stock, created_at, updated_at
       )
       SELECT
         u.id, u.sku, u.name, u.description, u.price, u.stock,
         c.name AS category_name, u.image, u.rating,
         u.is_best_seller, u.is_customer_favorite, u.badge, u.min_stock,
         u.created_at, u.updated_at
       FROM updated u
       JOIN categories c ON c.id = u.category_id`,
      values
    );
    return rows[0] ? mapProduct(rows[0]) : null;
  } catch (error) {
    const message = uniqueMessage(error);
    if (message) throw new DbError(message);
    throw error;
  }
}

export async function deleteProduct(id: string): Promise<boolean> {
  try {
    const result = await getPool().query("DELETE FROM products WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    if (postgresErrorCode(error) === "23503") {
      throw new DbError(
        "Produk tidak dapat dihapus karena masih dipakai transaksi, stok, atau promo"
      );
    }
    throw error;
  }
}

type StoredComponent = {
  product_id: string;
  product_name: string;
  quantity: number;
};

type StoredOrderItem = {
  product_id: string | null;
  bundle_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number;
  subtotal: number;
  components: StoredComponent[];
};

type StoredPayment = {
  method: PaymentMethod;
  amount: number;
  cash_received: number | null;
};

type OrderListRow = OrderRow & {
  items: StoredOrderItem[] | string;
  payments: StoredPayment[] | string;
};

function mapStoredOrder(row: OrderListRow): Order {
  const items = asJson(row.items).map((item) => {
    const components = asJson(item.components ?? []);
    const bundleComponents = components.map((component) => ({
      productId: component.product_id,
      productName: component.product_name,
      quantity: component.quantity,
    }));
    const mapped: OrderItem = {
      productId: item.bundle_id ?? item.product_id ?? "",
      productName: item.product_name,
      quantity: item.quantity,
      price: Number(item.unit_price),
      subtotal: Number(item.subtotal),
      ...(bundleComponents.length ? { bundleComponents } : {}),
    };
    return mapped;
  });
  const payments = asJson(row.payments).map((payment) => ({
    method: payment.method,
    amount: Number(payment.amount),
    ...(payment.method === "cash" && payment.cash_received !== null
      ? { cashReceived: Number(payment.cash_received) }
      : {}),
  }));

  return {
    id: row.id,
    orderNumber: row.order_number,
    items,
    subtotal: Number(row.subtotal),
    tax: Number(row.tax),
    discount: Number(row.discount),
    total: Number(row.total),
    paymentMethod: row.payment_method,
    ...(payments.length ? { payments } : {}),
    status: row.status,
    cashierId: row.cashier_id,
    cashierName: row.cashier_name,
    customerName: row.customer_name ?? undefined,
    notes: row.notes ?? undefined,
    cashReceived: row.cash_received === null ? undefined : Number(row.cash_received),
    changeAmount: Number(row.change_amount),
    createdAt: iso(row.created_at),
  };
}

export async function getOrders(): Promise<Order[]> {
  const rows = await query<OrderListRow>(
    `SELECT
       o.id, o.order_number, o.subtotal, o.tax, o.discount, o.total,
       o.payment_method, o.status, o.cashier_id, o.cashier_name, o.customer_name,
       o.notes, o.cash_received, o.change_amount, o.created_at,
       COALESCE((
         SELECT jsonb_agg(
           jsonb_build_object(
             'product_id', i.product_id,
             'bundle_id', i.bundle_id,
             'product_name', i.product_name,
             'quantity', i.quantity,
             'unit_price', i.unit_price,
             'subtotal', i.subtotal,
             'components', COALESCE((
               SELECT jsonb_agg(
                 jsonb_build_object(
                   'product_id', c.product_id,
                   'product_name', c.product_name,
                   'quantity', c.quantity
                 )
               )
               FROM order_item_components c
               WHERE c.order_item_id = i.id
             ), '[]'::jsonb)
           )
           ORDER BY i.sort_order
         )
         FROM order_items i
         WHERE i.order_id = o.id
       ), '[]'::jsonb) AS items,
       COALESCE((
         SELECT jsonb_agg(
           jsonb_build_object(
             'method', p.method,
             'amount', p.amount,
             'cash_received', p.cash_received
           )
           ORDER BY p.sort_order
         )
         FROM order_payments p
         WHERE p.order_id = o.id
       ), '[]'::jsonb) AS payments
     FROM orders o
     ORDER BY o.created_at DESC`
  );
  return rows.map(mapStoredOrder);
}

async function allocateDocumentNumbers(
  client: PoolClient,
  prefix: string,
  count: number
): Promise<string[]> {
  let end: number;
  try {
    const result = await client.query<{ last_value: number }>(
      "SELECT next_document_numbers($1, $2) AS last_value",
      [prefix, count]
    );
    end = result.rows[0].last_value;
  } catch (error) {
    const code = postgresErrorCode(error);
    if (code === "42883" || code === "42P01") {
      throw new DbError("Skema nomor dokumen belum ada. Jalankan npm run db:setup.");
    }
    throw error;
  }
  const start = end - count + 1;
  return Array.from(
    { length: count },
    (_, index) => `${prefix}${String(start + index).padStart(3, "0")}`
  );
}

async function allocateDocumentNumber(client: PoolClient, prefix: string): Promise<string> {
  const [number] = await allocateDocumentNumbers(client, prefix, 1);
  return number;
}

export async function createOrder(
  data: Omit<Order, "id" | "orderNumber" | "createdAt">
): Promise<Order> {
  return withTransaction(async (client) => {
    const demand = new Map<string, number>();
    const addDemand = (productId: string, quantity: number) => {
      demand.set(productId, (demand.get(productId) ?? 0) + quantity);
    };

    for (const item of data.items) {
      if (item.bundleComponents && item.bundleComponents.length > 0) {
        for (const part of item.bundleComponents) {
          addDemand(part.productId, part.quantity * item.quantity);
        }
      } else {
        addDemand(item.productId, item.quantity);
      }
    }

    const productIds = Array.from(demand.keys());
    const locked = await client.query<{
      id: string;
      name: string;
      stock: number;
      category_name: string;
    }>(
      `SELECT p.id, p.name, p.stock, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = ANY($1::text[])
       FOR UPDATE OF p`,
      [productIds]
    );
    const products = new Map(locked.rows.map((row) => [row.id, row]));

    for (const [productId, quantity] of Array.from(demand.entries())) {
      const product = products.get(productId);
      if (!product || product.stock < quantity) {
        throw new Error(`Stok tidak cukup untuk ${product?.name ?? productId}`);
      }
    }

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const orderNumber = await allocateDocumentNumber(client, `INV-${datePart}-`);
    const orderId = `ord-${Date.now()}`;
    const subtotal = rupiah(data.subtotal);
    const tax = rupiah(data.tax);
    const discount = rupiah(data.discount);
    const total = rupiah(data.total);
    const inserted = await client.query<{ created_at: Date }>(
      `INSERT INTO orders (
         id, order_number, subtotal, tax, discount, total, payment_method, status,
         cashier_id, cashier_name, customer_name, notes, cash_received, change_amount
       ) VALUES (
         $1, $2, $3, $4, $5, $6, $7, $8,
         $9, $10, $11, $12, $13, $14
       )
       RETURNING created_at`,
      [
        orderId,
        orderNumber,
        subtotal,
        tax,
        discount,
        total,
        data.paymentMethod,
        data.status,
        data.cashierId,
        data.cashierName,
        blankToNull(data.customerName),
        blankToNull(data.notes),
        data.cashReceived === undefined ? null : rupiah(data.cashReceived),
        rupiah(data.changeAmount ?? 0),
      ]
    );

    const savedItems: OrderItem[] = [];
    const itemRows: {
      id: string;
      product_id: string | null;
      bundle_id: string | null;
      product_name: string;
      quantity: number;
      unit_price: number;
      subtotal: number;
      sort_order: number;
    }[] = [];
    const componentRows: {
      order_item_id: string;
      product_id: string;
      product_name: string;
      quantity: number;
    }[] = [];

    if (data.items.length > 0) {
      const bundles = await client.query<{ id: string }>(
        "SELECT id FROM promo_bundles WHERE id = ANY($1::text[])",
        [data.items.map((item) => item.productId)]
      );
      const bundleIds = new Set(bundles.rows.map((row) => row.id));

      data.items.forEach((item, index) => {
        const isBundle = bundleIds.has(item.productId);
        const itemId = `${orderId}-${index + 1}`;
        const unitPrice = rupiah(item.price);
        const lineSubtotal = item.quantity * unitPrice;
        itemRows.push({
          id: itemId,
          product_id: isBundle ? null : item.productId,
          bundle_id: isBundle ? item.productId : null,
          product_name: item.productName,
          quantity: item.quantity,
          unit_price: unitPrice,
          subtotal: lineSubtotal,
          sort_order: index,
        });
        if (isBundle && item.bundleComponents?.length) {
          for (const part of item.bundleComponents) {
            componentRows.push({
              order_item_id: itemId,
              product_id: part.productId,
              product_name: part.productName,
              quantity: part.quantity,
            });
          }
        }
        savedItems.push({
          ...item,
          price: unitPrice,
          subtotal: lineSubtotal,
        });
      });
    }

    if (itemRows.length > 0) {
      await client.query(
        `INSERT INTO order_items (
           id, order_id, product_id, bundle_id, product_name, quantity,
           unit_price, subtotal, sort_order
         )
         SELECT
           r.id, $1, r.product_id, r.bundle_id, r.product_name, r.quantity,
           r.unit_price, r.subtotal, r.sort_order
         FROM jsonb_to_recordset($2::jsonb) AS r(
           id text,
           product_id text,
           bundle_id text,
           product_name text,
           quantity integer,
           unit_price numeric,
           subtotal numeric,
           sort_order integer
         )`,
        [orderId, JSON.stringify(itemRows)]
      );
    }

    if (componentRows.length > 0) {
      await client.query(
        `INSERT INTO order_item_components (order_item_id, product_id, product_name, quantity)
         SELECT r.order_item_id, r.product_id, r.product_name, r.quantity
         FROM jsonb_to_recordset($1::jsonb) AS r(
           order_item_id text,
           product_id text,
           product_name text,
           quantity integer
         )`,
        [JSON.stringify(componentRows)]
      );
    }

    const savedPayments: OrderPayment[] = [];
    const paymentRows: {
      id: string;
      sort_order: number;
      method: PaymentMethod;
      amount: number;
      cash_received: number | null;
    }[] = [];
    for (let index = 0; index < (data.payments?.length ?? 0); index += 1) {
      const payment = data.payments![index];
      const amount = rupiah(payment.amount);
      const cashReceived =
        payment.method === "cash" ? rupiah(payment.cashReceived ?? amount) : null;
      paymentRows.push({
        id: `${orderId}-pay-${index + 1}`,
        sort_order: index,
        method: payment.method,
        amount,
        cash_received: cashReceived,
      });
      savedPayments.push({
        method: payment.method,
        amount,
        ...(cashReceived !== null ? { cashReceived } : {}),
      });
    }

    if (paymentRows.length > 0) {
      await client.query(
        `INSERT INTO order_payments (id, order_id, sort_order, method, amount, cash_received)
         SELECT r.id, $1, r.sort_order, r.method, r.amount, r.cash_received
         FROM jsonb_to_recordset($2::jsonb) AS r(
           id text,
           sort_order integer,
           method text,
           amount numeric,
           cash_received numeric
         )`,
        [orderId, JSON.stringify(paymentRows)]
      );
    }

    const stockRows: { id: string; stock: number }[] = [];
    const movementRows: {
      id: string;
      transaction_number: string;
      product_id: string;
      product_name: string;
      category_name: string;
      quantity: number;
      stock_before: number;
      stock_after: number;
      note: string;
      officer_id: string;
      officer_name: string;
      order_id: string;
    }[] = [];
    const demandEntries = Array.from(demand.entries());
    if (demandEntries.length > 0) {
      const numbers = await allocateDocumentNumbers(
        client,
        `STO-${datePart}-`,
        demandEntries.length
      );
      demandEntries.forEach(([productId, quantity], index) => {
        const product = products.get(productId);
        if (!product) return;
        const before = product.stock;
        const after = before - quantity;
        stockRows.push({ id: productId, stock: after });
        movementRows.push({
          id: `stk-${orderId}-${productId}`,
          transaction_number: numbers[index],
          product_id: productId,
          product_name: product.name,
          category_name: product.category_name,
          quantity,
          stock_before: before,
          stock_after: after,
          note: `Penjualan ${orderNumber}`,
          officer_id: data.cashierId,
          officer_name: data.cashierName,
          order_id: orderId,
        });
        product.stock = after;
      });
    }

    if (stockRows.length > 0) {
      await client.query(
        `UPDATE products AS p
         SET stock = v.stock, updated_at = now()
         FROM jsonb_to_recordset($1::jsonb) AS v(id text, stock integer)
         WHERE p.id = v.id`,
        [JSON.stringify(stockRows)]
      );
      await client.query(
        `INSERT INTO stock_movements (
           id, transaction_number, movement_type, product_id, product_name, category_name,
           quantity, stock_before, stock_after, reason, note, officer_id, officer_name, order_id
         )
         SELECT
           r.id, r.transaction_number, 'out', r.product_id, r.product_name, r.category_name,
           r.quantity, r.stock_before, r.stock_after, 'Penjualan', r.note,
           r.officer_id, r.officer_name, r.order_id
         FROM jsonb_to_recordset($1::jsonb) AS r(
           id text,
           transaction_number text,
           product_id text,
           product_name text,
           category_name text,
           quantity integer,
           stock_before integer,
           stock_after integer,
           note text,
           officer_id text,
           officer_name text,
           order_id text
         )`,
        [JSON.stringify(movementRows)]
      );
    }

    return {
      ...data,
      id: orderId,
      orderNumber,
      items: savedItems,
      subtotal,
      tax,
      discount,
      total,
      ...(savedPayments.length ? { payments: savedPayments } : {}),
      cashReceived: data.cashReceived === undefined ? undefined : rupiah(data.cashReceived),
      changeAmount: rupiah(data.changeAmount ?? 0),
      createdAt: iso(inserted.rows[0].created_at),
    };
  });
}

export async function getStockMovements(): Promise<StockMovement[]> {
  const rows = await query<MovementRow>(
    `SELECT id, transaction_number, movement_type, product_id, product_name, category_name,
            supplier_name, unit_code, quantity, stock_before, stock_after, purchase_price,
            total_price, reason, note, officer_id, officer_name, created_at
     FROM stock_movements
     ORDER BY created_at DESC`
  );
  return rows.map(mapMovement);
}

export async function createStockMovement(
  input: StockMovementInput
): Promise<StockMovement> {
  if (!Number.isInteger(input.quantity) || input.quantity <= 0) {
    throw new StockError("Jumlah harus bilangan bulat lebih dari 0");
  }

  return withTransaction(async (client) => {
    const productResult = await client.query<{
      id: string;
      name: string;
      stock: number;
      category_name: string;
    }>(
      `SELECT p.id, p.name, p.stock, c.name AS category_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       WHERE p.id = $1
       FOR UPDATE OF p`,
      [input.productId]
    );
    const product = productResult.rows[0];
    if (!product) throw new StockError("Produk tidak ditemukan");

    let supplierId: string | null = null;
    let supplierName: string | null = null;
    if (input.type === "in") {
      if (!input.supplier) throw new StockError("Supplier wajib dipilih");
      if (input.purchasePrice !== undefined && input.purchasePrice < 0) {
        throw new StockError("Harga beli tidak boleh negatif");
      }
      const supplier = await client.query<{ id: string; name: string }>(
        "SELECT id, name FROM suppliers WHERE name = $1",
        [input.supplier]
      );
      if (!supplier.rows[0]) throw new StockError("Supplier tidak ditemukan");
      supplierId = supplier.rows[0].id;
      supplierName = supplier.rows[0].name;
    } else if (input.quantity > product.stock) {
      throw new StockError(`Stok tidak mencukupi. Stok tersedia: ${product.stock}`);
    }

    if (input.type === "out" && !input.reason) {
      throw new StockError("Alasan stok keluar wajib dipilih");
    }

    let unitCode: string | null = null;
    if (input.unit) {
      const unit = await client.query<{ code: string }>(
        "SELECT code FROM units WHERE code = $1",
        [input.unit]
      );
      if (!unit.rows[0]) throw new StockError("Satuan tidak dikenal");
      unitCode = unit.rows[0].code;
    }

    const before = product.stock;
    const after = input.type === "in" ? before + input.quantity : before - input.quantity;
    await client.query(
      "UPDATE products SET stock = $2, updated_at = now() WHERE id = $1",
      [product.id, after]
    );

    const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, "");
    const prefix = input.type === "in" ? "STI" : "STO";
    const transactionNumber = await allocateDocumentNumber(
      client,
      `${prefix}-${datePart}-`
    );
    const purchasePrice =
      input.purchasePrice === undefined ? null : rupiah(input.purchasePrice);
    const movementId = `stk-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const note = blankToNull(input.note);
    const inserted = await client.query<{ created_at: Date; total_price: number | null }>(
      `INSERT INTO stock_movements (
         id, transaction_number, movement_type, product_id, product_name, category_name,
         supplier_id, supplier_name, unit_code, quantity, stock_before, stock_after,
         purchase_price, reason, note, officer_id, officer_name
       ) VALUES (
         $1, $2, $3, $4, $5, $6,
         $7, $8, $9, $10, $11, $12,
         $13, $14, $15, $16, $17
       )
       RETURNING created_at, total_price`,
      [
        movementId,
        transactionNumber,
        input.type,
        product.id,
        product.name,
        product.category_name,
        supplierId,
        supplierName,
        unitCode,
        input.quantity,
        before,
        after,
        purchasePrice,
        input.reason ?? null,
        note,
        input.officerId,
        input.officerName,
      ]
    );

    return mapMovement({
      id: movementId,
      transaction_number: transactionNumber,
      movement_type: input.type,
      product_id: product.id,
      product_name: product.name,
      category_name: product.category_name,
      supplier_name: supplierName,
      unit_code: unitCode,
      quantity: input.quantity,
      stock_before: before,
      stock_after: after,
      purchase_price: purchasePrice,
      total_price: inserted.rows[0].total_price,
      reason: input.reason ?? null,
      note,
      officer_id: input.officerId,
      officer_name: input.officerName,
      created_at: inserted.rows[0].created_at,
    });
  });
}

const USER_SQL = `
  SELECT id, name, username, email, phone, role, status, avatar, created_at, last_login
  FROM users
`;

export async function getUsers(): Promise<ManagedUser[]> {
  const rows = await query<UserRow>(`${USER_SQL} ORDER BY created_at DESC`);
  return rows.map(mapUser);
}

export async function getUserById(id: string): Promise<ManagedUser | undefined> {
  const rows = await query<UserRow>(`${USER_SQL} WHERE id = $1`, [id]);
  return rows[0] ? mapUser(rows[0]) : undefined;
}

export async function getUserWithActivities(
  id: string
): Promise<{ user: ManagedUser; activities: UserActivity[] } | null> {
  const rows = await query<
    UserRow & { activities: { id: string; action: string; created_at: string | Date }[] | string }
  >(
    `SELECT
       id, name, username, email, phone, role, status, avatar, created_at, last_login,
       COALESCE((
         SELECT jsonb_agg(
           jsonb_build_object(
             'id', a.id,
             'action', a.action,
             'created_at', a.created_at
           )
           ORDER BY a.created_at DESC
         )
         FROM user_activities a
         WHERE a.user_id = users.id
       ), '[]'::jsonb) AS activities
     FROM users
     WHERE id = $1`,
    [id]
  );
  const row = rows[0];
  if (!row) return null;
  const activities = asJson(row.activities).map((activity) => ({
    id: activity.id,
    userId: id,
    action: activity.action,
    createdAt: new Date(activity.created_at).toISOString(),
  }));
  return { user: mapUser(row), activities };
}

export async function getDashboardStats(): Promise<{
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  completedOrders: number;
  todaySales: number;
  todayOrderCount: number;
  todayItemsSold: number;
}> {
  const rows = await query<{
    total_products: number;
    total_orders: number;
    completed_orders: number;
    total_revenue: number;
    today_sales: number;
    today_order_count: number;
    today_items_sold: number;
  }>(
    `WITH bounds AS (
       SELECT
         (date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') AT TIME ZONE 'Asia/Jakarta') AS start_at,
         ((date_trunc('day', now() AT TIME ZONE 'Asia/Jakarta') + interval '1 day') AT TIME ZONE 'Asia/Jakarta') AS end_at
     )
     SELECT
       (SELECT COUNT(*)::int FROM products) AS total_products,
       (SELECT COUNT(*)::int FROM orders) AS total_orders,
       (SELECT COUNT(*)::int FROM orders WHERE status = 'completed') AS completed_orders,
       (SELECT COALESCE(SUM(total), 0) FROM orders WHERE status = 'completed') AS total_revenue,
       (
         SELECT COALESCE(SUM(o.total), 0)
         FROM orders o, bounds b
         WHERE o.status = 'completed'
           AND o.created_at >= b.start_at
           AND o.created_at < b.end_at
       ) AS today_sales,
       (
         SELECT COUNT(*)::int
         FROM orders o, bounds b
         WHERE o.status = 'completed'
           AND o.created_at >= b.start_at
           AND o.created_at < b.end_at
       ) AS today_order_count,
       (
         SELECT COALESCE(SUM(i.quantity), 0)::int
         FROM order_items i
         JOIN orders o ON o.id = i.order_id
         CROSS JOIN bounds b
         WHERE o.status = 'completed'
           AND o.created_at >= b.start_at
           AND o.created_at < b.end_at
       ) AS today_items_sold
     FROM bounds`
  );
  const row = rows[0];
  return {
    totalRevenue: Number(row.total_revenue),
    totalOrders: row.total_orders,
    totalProducts: row.total_products,
    completedOrders: row.completed_orders,
    todaySales: Number(row.today_sales),
    todayOrderCount: row.today_order_count,
    todayItemsSold: row.today_items_sold,
  };
}

export async function getUserActivities(userId: string): Promise<UserActivity[]> {
  const rows = await query<{ id: string; user_id: string; action: string; created_at: Date }>(
    `SELECT id, user_id, action, created_at
     FROM user_activities
     WHERE user_id = $1
     ORDER BY created_at DESC`,
    [userId]
  );
  return rows.map((row) => ({
    id: row.id,
    userId: row.user_id,
    action: row.action,
    createdAt: iso(row.created_at),
  }));
}

async function addActivity(client: PoolClient, userId: string, action: string) {
  await client.query(
    `INSERT INTO user_activities (id, user_id, action)
     VALUES ($1, $2, $3)`,
    [`act-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`, userId, action]
  );
}

function rethrowUserError(error: unknown): never {
  const message = uniqueMessage(error);
  if (message) throw new UserError(message);
  throw error;
}

export async function createUser(payload: CreateUserPayload): Promise<ManagedUser> {
  const id = `user-${Date.now()}`;
  try {
    return await withTransaction(async (client) => {
      const inserted = await client.query<UserRow>(
        `INSERT INTO users (
           id, name, username, email, phone, role, status, avatar, password_hash
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
         RETURNING id, name, username, email, phone, role, status, avatar, created_at, last_login`,
        [
          id,
          payload.name,
          payload.username,
          payload.email,
          blankToNull(payload.phone),
          payload.role,
          payload.status,
          blankToNull(payload.avatar),
          hashPassword(payload.password),
        ]
      );
      await addActivity(client, id, "Akun dibuat");
      return mapUser(inserted.rows[0]);
    });
  } catch (error) {
    rethrowUserError(error);
  }
}

export async function updateUser(
  id: string,
  payload: UpdateUserPayload
): Promise<ManagedUser> {
  const current = await getUserById(id);
  if (!current) throw new UserError("User tidak ditemukan");

  try {
    return await withTransaction(async (client) => {
      const updated = await client.query<UserRow>(
        `UPDATE users
         SET name = $2, username = $3, email = $4, phone = $5, role = $6, status = $7, avatar = $8
         WHERE id = $1
         RETURNING id, name, username, email, phone, role, status, avatar, created_at, last_login`,
        [
          id,
          payload.name ?? current.name,
          payload.username ?? current.username,
          payload.email ?? current.email,
          payload.phone === undefined ? (current.phone ?? null) : blankToNull(payload.phone),
          payload.role ?? current.role,
          payload.status ?? current.status,
          payload.avatar === undefined ? (current.avatar ?? null) : blankToNull(payload.avatar),
        ]
      );
      await addActivity(client, id, "Data user diperbarui");
      return mapUser(updated.rows[0]);
    });
  } catch (error) {
    rethrowUserError(error);
  }
}

export async function deleteUser(id: string): Promise<boolean> {
  try {
    const result = await getPool().query("DELETE FROM users WHERE id = $1", [id]);
    return (result.rowCount ?? 0) > 0;
  } catch (error) {
    if (postgresErrorCode(error) === "23503") {
      throw new UserError(
        "User tidak dapat dihapus karena masih memiliki transaksi atau catatan stok"
      );
    }
    throw error;
  }
}

export async function resetUserPassword(
  id: string,
  newPassword: string
): Promise<ManagedUser> {
  if (newPassword.length < 8) throw new UserError("Password minimal 8 karakter");
  return withTransaction(async (client) => {
    const updated = await client.query<UserRow>(
      `UPDATE users SET password_hash = $2 WHERE id = $1
       RETURNING id, name, username, email, phone, role, status, avatar, created_at, last_login`,
      [id, hashPassword(newPassword)]
    );
    if (!updated.rows[0]) throw new UserError("User tidak ditemukan");
    await addActivity(client, id, "Password direset");
    return mapUser(updated.rows[0]);
  });
}

export async function setUserStatus(
  id: string,
  status: UserStatus
): Promise<ManagedUser> {
  return withTransaction(async (client) => {
    const updated = await client.query<UserRow>(
      `UPDATE users SET status = $2 WHERE id = $1
       RETURNING id, name, username, email, phone, role, status, avatar, created_at, last_login`,
      [id, status]
    );
    if (!updated.rows[0]) throw new UserError("User tidak ditemukan");
    await addActivity(
      client,
      id,
      status === "active" ? "Akun diaktifkan" : "Akun dinonaktifkan"
    );
    return mapUser(updated.rows[0]);
  });
}

export async function authenticateUser(
  email: string,
  password: string
): Promise<{ id: string; name: string; email: string; role: UserRole } | null> {
  const rows = await query<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    password_hash: string;
  }>(
    `SELECT id, name, email, role, password_hash
     FROM users
     WHERE lower(email) = lower($1)`,
    [email]
  );
  const user = rows[0];
  if (!user || !verifyPassword(password, user.password_hash)) return null;
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  };
}
