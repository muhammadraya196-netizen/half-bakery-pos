import { readFileSync, existsSync } from "fs";
import { resolve } from "path";
import { Client } from "pg";
import { PROMOS } from "../src/lib/bakery-data";
import { mockOrders, mockProducts, mockUsers, PROMO_BUNDLING_PRODUCTS } from "../src/lib/mock-data";
import { hashPassword } from "../src/lib/password";
import { PROMO_CONFIGS } from "../src/lib/promo/promo";

const CATEGORY_IDS: Record<string, string> = {
  Cake: "cake",
  Bread: "bread",
  Pastry: "pastry",
  Cookies: "cookies",
  Dessert: "dessert",
  "Coffee & Drink": "coffee-drink",
};

function loadEnvFile(filename: string) {
  const path = resolve(process.cwd(), filename);
  if (!existsSync(path)) return;
  for (const line of readFileSync(path, "utf8").split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    const value = trimmed.slice(eq + 1).trim().replace(/^["']|["']$/g, "");
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

function splitSql(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let i = 0;
  let dollarTag: string | null = null;

  while (i < sql.length) {
    if (dollarTag) {
      if (sql.startsWith(dollarTag, i)) {
        current += dollarTag;
        i += dollarTag.length;
        dollarTag = null;
        continue;
      }
      current += sql[i];
      i += 1;
      continue;
    }

    if (sql.startsWith("--", i)) {
      const end = sql.indexOf("\n", i);
      i = end === -1 ? sql.length : end + 1;
      continue;
    }

    if (sql[i] === "$") {
      const match = /^\$[A-Za-z0-9_]*\$/.exec(sql.slice(i));
      if (match) {
        dollarTag = match[0];
        current += dollarTag;
        i += dollarTag.length;
        continue;
      }
    }

    if (sql[i] === "'") {
      current += sql[i];
      i += 1;
      while (i < sql.length) {
        current += sql[i];
        if (sql[i] === "'" && sql[i + 1] === "'") {
          current += sql[i + 1];
          i += 2;
          continue;
        }
        if (sql[i] === "'") {
          i += 1;
          break;
        }
        i += 1;
      }
      continue;
    }

    if (sql[i] === ";") {
      const statement = current.trim();
      if (statement) statements.push(statement);
      current = "";
      i += 1;
      continue;
    }

    current += sql[i];
    i += 1;
  }

  const tail = current.trim();
  if (tail) statements.push(tail);
  return statements;
}

function databaseName(databaseUrl: string): string {
  const name = new URL(databaseUrl).pathname.replace(/^\//, "");
  if (!/^[A-Za-z0-9_]+$/.test(name)) {
    throw new Error("Nama database pada DATABASE_URL hanya boleh huruf, angka, dan garis bawah");
  }
  return name;
}

function adminUrl(databaseUrl: string): string {
  const url = new URL(databaseUrl);
  url.pathname = "/postgres";
  return url.toString();
}

async function ensureDatabase(databaseUrl: string) {
  const name = databaseName(databaseUrl);
  const admin = new Client({ connectionString: adminUrl(databaseUrl) });
  await admin.connect();
  try {
    const existing = await admin.query("SELECT 1 FROM pg_database WHERE datname = $1", [name]);
    if (existing.rowCount === 0) {
      await admin.query(`CREATE DATABASE ${name}`);
      console.log(`Database ${name} dibuat.`);
    }
  } finally {
    await admin.end();
  }
}

async function applySchema(client: Client) {
  const exists = await client.query("SELECT to_regclass('public.users') AS name");
  if (exists.rows[0]?.name) {
    console.log("Skema sudah ada, DDL dilewati.");
    return;
  }

  const sql = readFileSync(resolve(process.cwd(), "docs/database-schema.sql"), "utf8");
  for (const statement of splitSql(sql)) {
    await client.query(statement);
  }
  console.log("Skema PostgreSQL diterapkan.");
}

async function applyPerformance(client: Client) {
  const sql = readFileSync(resolve(process.cwd(), "docs/database-queries.sql"), "utf8");
  const marker = "\n-- BEGIN CRUD QUERIES\n";
  const ddl = sql.split(marker)[0];
  if (ddl === sql) {
    throw new Error("docs/database-queries.sql tidak memuat pemisah CRUD");
  }
  for (const statement of splitSql(ddl)) {
    await client.query(statement);
  }
  console.log("Indeks dan penghitung nomor dokumen diterapkan.");
}

async function seed(client: Client) {
  const count = await client.query<{ n: number }>("SELECT COUNT(*)::int AS n FROM users");
  if (count.rows[0].n > 0) {
    console.log("Data awal sudah ada, penyalinan dilewati.");
    return;
  }

  await client.query("BEGIN");
  try {
    for (const user of mockUsers) {
      await client.query(
        `INSERT INTO users (
           id, name, username, email, phone, role, status, password_hash, created_at, last_login
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          user.id,
          user.name,
          user.username,
          user.email,
          user.phone,
          user.role,
          user.status,
          hashPassword(user.password),
          user.createdAt,
          user.lastLogin,
        ]
      );
      await client.query(
        `INSERT INTO user_activities (id, user_id, action, created_at)
         VALUES ($1, $2, 'Akun dibuat', $3)`,
        [`act-${user.id}-seed`, user.id, user.createdAt]
      );
    }

    for (const product of mockProducts) {
      const categoryId = CATEGORY_IDS[product.category];
      if (!categoryId) throw new Error(`Kategori tidak dikenal: ${product.category}`);
      await client.query(
        `INSERT INTO products (
           id, sku, name, description, price, stock, category_id, image, rating,
           is_best_seller, is_customer_favorite, badge, min_stock, created_at, updated_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8, $9,
           $10, $11, $12, $13, $14, $15
         )`,
        [
          product.id,
          product.sku,
          product.name,
          product.description || null,
          product.price,
          product.stock,
          categoryId,
          product.image ?? null,
          product.rating ?? null,
          Boolean(product.isBestSeller),
          Boolean(product.isCustomerFavorite),
          product.badge ?? null,
          product.minStock ?? 10,
          product.createdAt,
          product.updatedAt,
        ]
      );
    }

    for (const bundle of PROMO_BUNDLING_PRODUCTS) {
      if (bundle.originalPrice === undefined) {
        throw new Error(`Paket ${bundle.id} tidak punya harga awal`);
      }
      await client.query(
        `INSERT INTO promo_bundles (
           id, sku, name, description, price, original_price, promo_label, image, created_at, updated_at
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [
          bundle.id,
          bundle.sku,
          bundle.name,
          bundle.description,
          bundle.price,
          bundle.originalPrice,
          bundle.promoLabel ?? bundle.name,
          bundle.image ?? null,
          bundle.createdAt,
          bundle.updatedAt,
        ]
      );
      const components = bundle.bundleComponents ?? [];
      for (let index = 0; index < components.length; index += 1) {
        const part = components[index];
        await client.query(
          `INSERT INTO promo_bundle_components (bundle_id, product_id, quantity, sort_order)
           VALUES ($1, $2, $3, $4)`,
          [bundle.id, part.productId, part.quantity, index]
        );
      }
      const labels = bundle.bundleItems ?? [];
      for (let index = 0; index < labels.length; index += 1) {
        await client.query(
          `INSERT INTO promo_bundle_labels (bundle_id, sort_order, label)
           VALUES ($1, $2, $3)`,
          [bundle.id, index, labels[index]]
        );
      }
    }

    for (const promo of PROMO_CONFIGS) {
      const landing = PROMOS.find((item) => item.id === promo.landingId);
      const targetProducts = promo.productIds ?? [];
      const targetType = targetProducts.length > 0 ? "products" : "category";
      const categoryId =
        targetType === "category" ? CATEGORY_IDS[promo.category ?? ""] : null;
      if (targetType === "category" && !categoryId) {
        throw new Error(`Promo ${promo.slug} tidak punya kategori yang dikenal`);
      }
      await client.query(
        `INSERT INTO promos (
           id, slug, name, short_name, description, landing_description, badge, kind,
           discount_percent, buy_quantity, free_quantity, target_type, category_id,
           quantity_per_product, expires_at, image, gradient
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11, $12, $13,
           $14, $15, $16, $17
         )`,
        [
          promo.landingId,
          promo.slug,
          promo.name,
          promo.shortName,
          promo.description,
          landing && landing.description !== promo.description ? landing.description : null,
          promo.badge,
          promo.kind,
          promo.kind === "percentage" ? promo.discountPercent ?? null : null,
          promo.kind === "buy-get" ? promo.buyQuantity ?? null : null,
          promo.kind === "buy-get" ? promo.freeQuantity ?? null : null,
          targetType,
          categoryId,
          promo.quantityPerProduct,
          promo.expiredDate,
          landing?.image ?? null,
          landing?.gradient ?? null,
        ]
      );
      for (const productId of targetProducts) {
        await client.query(
          "INSERT INTO promo_products (promo_id, product_id) VALUES ($1, $2)",
          [promo.landingId, productId]
        );
      }
    }

    for (const order of mockOrders) {
      await client.query(
        `INSERT INTO orders (
           id, order_number, subtotal, tax, discount, total, payment_method, status,
           cashier_id, cashier_name, customer_name, notes, cash_received, change_amount, created_at
         ) VALUES (
           $1, $2, $3, $4, $5, $6, $7, $8,
           $9, $10, $11, $12, $13, $14, $15
         )`,
        [
          order.id,
          order.orderNumber,
          order.subtotal,
          order.tax,
          order.discount,
          order.total,
          order.paymentMethod,
          order.status,
          order.cashierId,
          order.cashierName,
          order.customerName ?? null,
          order.notes ?? null,
          order.cashReceived ?? null,
          order.changeAmount ?? 0,
          order.createdAt,
        ]
      );
      for (let index = 0; index < order.items.length; index += 1) {
        const item = order.items[index];
        await client.query(
          `INSERT INTO order_items (
             id, order_id, product_id, product_name, quantity, unit_price, subtotal, sort_order
           ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
          [
            `${order.id}-${index + 1}`,
            order.id,
            item.productId,
            item.productName,
            item.quantity,
            item.price,
            item.subtotal,
            index,
          ]
        );
      }
    }

    await client.query("COMMIT");
    console.log("Data awal disalin ke PostgreSQL. Password disimpan sebagai hash.");
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  }
}

async function main() {
  loadEnvFile(".env.local");
  loadEnvFile(".env");
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    throw new Error("DATABASE_URL belum diatur. Isi .env.local lalu jalankan lagi.");
  }

  try {
    await ensureDatabase(databaseUrl);
  } catch (error) {
    const code = typeof error === "object" && error && "code" in error ? String((error as { code: string }).code) : "";
    if (code !== "3D000") {
      // Database admin `postgres` mungkin tidak ada. Lanjut bila database target sudah bisa dibuka.
      console.log("Pembuatan database dilewati, mencoba koneksi langsung.");
    } else {
      throw error;
    }
  }

  const client = new Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    await applySchema(client);
    await applyPerformance(client);
    await seed(client);
  } finally {
    await client.end();
  }
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exit(1);
});
