-- HALF POS — query PostgreSQL yang dipakai aplikasi
-- Mesin: PostgreSQL 14+
--
-- Bagian sebelum "-- BEGIN CRUD QUERIES" dijalankan oleh npm run db:setup
-- pada database yang sudah ada maupun yang baru. Perintah di bawah marker
-- adalah query CRUD. Jangan jalankan file ini mentah dari psql sekaligus:
-- query CRUD memakai parameter $1.

-- Indeks yang hanya mengulang primary key atau unique key memperlambat INSERT.
DROP INDEX IF EXISTS order_items_order_id_idx;
DROP INDEX IF EXISTS order_payments_order_id_idx;
DROP INDEX IF EXISTS orders_status_idx;
DROP INDEX IF EXISTS stock_movements_type_idx;

CREATE INDEX IF NOT EXISTS users_created_at_idx ON users (created_at DESC);
CREATE INDEX IF NOT EXISTS users_role_status_idx ON users (role, status);
CREATE INDEX IF NOT EXISTS products_created_at_idx ON products (created_at);
CREATE INDEX IF NOT EXISTS orders_created_at_idx ON orders (created_at DESC);
CREATE INDEX IF NOT EXISTS orders_status_created_idx ON orders (status, created_at DESC);

CREATE TABLE IF NOT EXISTS document_sequences (
  prefix TEXT PRIMARY KEY,
  last_value INTEGER NOT NULL,
  CONSTRAINT document_sequences_last_value_check CHECK (last_value >= 0)
);

CREATE OR REPLACE FUNCTION next_document_numbers(p_prefix TEXT, p_count INTEGER)
RETURNS INTEGER
LANGUAGE plpgsql
SET search_path = public
AS $$
DECLARE
  current_value INTEGER;
  observed INTEGER := 0;
  upper_bound TEXT;
BEGIN
  IF p_count IS NULL OR p_count < 1 THEN
    RAISE EXCEPTION 'jumlah nomor harus positif';
  END IF;
  IF p_prefix IS NULL OR char_length(p_prefix) < 5 THEN
    RAISE EXCEPTION 'prefix nomor dokumen tidak valid';
  END IF;

  PERFORM pg_advisory_xact_lock(hashtext('halfpos-doc'), hashtext(p_prefix));

  SELECT last_value
  INTO current_value
  FROM document_sequences
  WHERE prefix = p_prefix
  FOR UPDATE;

  IF NOT FOUND THEN
    upper_bound := left(p_prefix, char_length(p_prefix) - 1)
      || chr(ascii(right(p_prefix, 1)) + 1);

    IF p_prefix LIKE 'INV-%' THEN
      SELECT COALESCE(MAX(substring(order_number FROM char_length(p_prefix) + 1)::INTEGER), 0)
      INTO observed
      FROM orders
      WHERE order_number >= p_prefix
        AND order_number < upper_bound
        AND substring(order_number FROM char_length(p_prefix) + 1) ~ '^[0-9]+$';
    ELSIF p_prefix LIKE 'STI-%' OR p_prefix LIKE 'STO-%' THEN
      SELECT COALESCE(MAX(substring(transaction_number FROM char_length(p_prefix) + 1)::INTEGER), 0)
      INTO observed
      FROM stock_movements
      WHERE transaction_number >= p_prefix
        AND transaction_number < upper_bound
        AND substring(transaction_number FROM char_length(p_prefix) + 1) ~ '^[0-9]+$';
    END IF;

    INSERT INTO document_sequences (prefix, last_value)
    VALUES (p_prefix, observed);
    current_value := observed;
  END IF;

  UPDATE document_sequences
  SET last_value = current_value + p_count
  WHERE prefix = p_prefix
  RETURNING last_value INTO current_value;

  RETURN current_value;
END;
$$;

-- BEGIN CRUD QUERIES

-- ---------------------------------------------------------------------------
-- Baca katalog: satu join ke categories, diurutkan lewat products_created_at_idx
-- ---------------------------------------------------------------------------

SELECT
  p.id, p.sku, p.name, p.description, p.price, p.stock,
  c.name AS category_name, p.image, p.rating,
  p.is_best_seller, p.is_customer_favorite, p.badge, p.min_stock,
  p.created_at, p.updated_at
FROM products p
JOIN categories c ON c.id = p.category_id
ORDER BY p.created_at ASC,
  CASE WHEN p.id ~ '^[0-9]+$' THEN lpad(p.id, 12, '0') ELSE p.id END;

SELECT
  p.id, p.sku, p.name, p.description, p.price, p.stock,
  c.name AS category_name, p.image, p.rating,
  p.is_best_seller, p.is_customer_favorite, p.badge, p.min_stock,
  p.created_at, p.updated_at
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.id = $1;

-- Buat produk: kategori diselesaikan dalam pernyataan yang sama.
INSERT INTO products (id, sku, name, description, price, stock, category_id)
SELECT $1, $2, $3, $4, $5, $6, picked.id
FROM (
  SELECT id
  FROM categories
  WHERE name = $7 OR id = $8
  LIMIT 1
) AS picked
RETURNING created_at, updated_at, min_stock;

-- Ubah produk: satu round trip, baris hasil sudah membawa nama kategori.
WITH updated AS (
  UPDATE products
  SET name = $2, updated_at = now()
  WHERE id = $1
  RETURNING id, sku, name, description, price, stock, category_id, image, rating,
            is_best_seller, is_customer_favorite, badge, min_stock, created_at, updated_at
)
SELECT
  u.id, u.sku, u.name, u.description, u.price, u.stock,
  c.name AS category_name, u.image, u.rating,
  u.is_best_seller, u.is_customer_favorite, u.badge, u.min_stock,
  u.created_at, u.updated_at
FROM updated u
JOIN categories c ON c.id = u.category_id;

DELETE FROM products WHERE id = $1;

-- ---------------------------------------------------------------------------
-- User. Login memakai unique index lower(email).
-- Detail user dan aktivitasnya satu round trip.
-- ---------------------------------------------------------------------------

SELECT id, name, email, role, password_hash
FROM users
WHERE lower(email) = lower($1);

SELECT id, name, username, email, phone, role, status, avatar, created_at, last_login
FROM users
ORDER BY created_at DESC;

SELECT
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
WHERE id = $1;

INSERT INTO users (
  id, name, username, email, phone, role, status, avatar, password_hash
) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
RETURNING id, name, username, email, phone, role, status, avatar, created_at, last_login;

INSERT INTO user_activities (id, user_id, action)
VALUES ($1, $2, $3);

UPDATE users
SET name = $2, username = $3, email = $4, phone = $5, role = $6, status = $7, avatar = $8
WHERE id = $1
RETURNING id, name, username, email, phone, role, status, avatar, created_at, last_login;

DELETE FROM users WHERE id = $1;

-- ---------------------------------------------------------------------------
-- Pesanan: header, baris, komponen paket, dan pembayaran dalam satu query.
-- Indeks yang dipakai: orders(created_at), unique (order_id, sort_order),
-- primary key order_item_components.
-- ---------------------------------------------------------------------------

SELECT
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
ORDER BY o.created_at DESC;

-- Checkout mengunci saldo, lalu menulis banyak baris sekaligus.
SELECT p.id, p.name, p.stock, c.name AS category_name
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.id = ANY($1::text[])
FOR UPDATE OF p;

SELECT next_document_numbers($1, $2);

INSERT INTO orders (
  id, order_number, subtotal, tax, discount, total, payment_method, status,
  cashier_id, cashier_name, customer_name, notes, cash_received, change_amount
) VALUES (
  $1, $2, $3, $4, $5, $6, $7, $8,
  $9, $10, $11, $12, $13, $14
)
RETURNING created_at;

SELECT id FROM promo_bundles WHERE id = ANY($1::text[]);

INSERT INTO order_items (
  id, order_id, product_id, bundle_id, product_name, quantity, unit_price, subtotal, sort_order
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
);

INSERT INTO order_item_components (order_item_id, product_id, product_name, quantity)
SELECT r.order_item_id, r.product_id, r.product_name, r.quantity
FROM jsonb_to_recordset($1::jsonb) AS r(
  order_item_id text,
  product_id text,
  product_name text,
  quantity integer
);

INSERT INTO order_payments (id, order_id, sort_order, method, amount, cash_received)
SELECT r.id, $1, r.sort_order, r.method, r.amount, r.cash_received
FROM jsonb_to_recordset($2::jsonb) AS r(
  id text,
  sort_order integer,
  method text,
  amount numeric,
  cash_received numeric
);

UPDATE products AS p
SET stock = v.stock, updated_at = now()
FROM jsonb_to_recordset($1::jsonb) AS v(id text, stock integer)
WHERE p.id = v.id;

INSERT INTO stock_movements (
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
);

-- ---------------------------------------------------------------------------
-- Dashboard: agregat di database, bukan menarik seluruh pesanan ke aplikasi.
-- Rentang "hari ini" mengikuti Asia/Jakarta dan bisa memakai
-- indeks (status, created_at).
-- ---------------------------------------------------------------------------

WITH bounds AS (
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
FROM bounds;

-- ---------------------------------------------------------------------------
-- Stok. Kunci satu produk, lalu tulis jurnal. Daftar memakai created_at DESC.
-- ---------------------------------------------------------------------------

SELECT p.id, p.name, p.stock, c.name AS category_name
FROM products p
JOIN categories c ON c.id = p.category_id
WHERE p.id = $1
FOR UPDATE OF p;

SELECT id, name FROM suppliers WHERE name = $1;

SELECT code FROM units WHERE code = $1;

UPDATE products SET stock = $2, updated_at = now() WHERE id = $1;

SELECT
  id, transaction_number, movement_type, product_id, product_name, category_name,
  supplier_name, unit_code, quantity, stock_before, stock_after, purchase_price,
  total_price, reason, note, officer_id, officer_name, created_at
FROM stock_movements
ORDER BY created_at DESC;
