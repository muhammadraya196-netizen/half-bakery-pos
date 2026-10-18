# ERD HALF POS

Diagram ini mengikuti skema pada `docs/database-schema.sql`. Penyimpanan yang dipakai aplikasi saat ini masih in-memory di `src/lib/db.ts`.

Kardinalitas:

- `||` wajib pada sisi tersebut.
- `o` sisi tersebut boleh nol.
- `|{` satu atau lebih.
- `o{` nol atau lebih.

`products.stock` adalah saldo operasional, bukan tabel terpisah. Analitik, sesi login, outlet, dan testimoni tidak punya tabel karena tidak menjadi data transaksi.

```mermaid
erDiagram
  categories ||--o{ products : mengelompokkan
  categories ||--o{ promos : "menjadi target"
  suppliers ||--o{ stock_movements : memasok
  units ||--o{ stock_movements : "satuan barang"
  users ||--o{ user_activities : mencatat
  users ||--o{ orders : melayani
  users ||--o{ stock_movements : mengerjakan
  products ||--o{ stock_movements : berubah
  products ||--o{ order_items : "dijual langsung"
  products ||--o{ order_item_components : "dikonsumsi paket"
  products ||--o{ promo_bundle_components : "menyusun paket"
  products ||--o{ promo_products : "ikut promo"
  promo_bundles ||--|{ promo_bundle_components : berisi
  promo_bundles ||--|{ promo_bundle_labels : menampilkan
  promo_bundles ||--o{ order_items : "dijual sebagai paket"
  promos ||--o{ promo_products : menargetkan
  orders ||--|{ order_items : merinci
  orders ||--o{ order_payments : dibayar
  orders ||--o{ stock_movements : "mengurangi stok"
  order_items ||--o{ order_item_components : "mengurai paket"

  users {
    TEXT id PK
    VARCHAR name
    VARCHAR username UK
    VARCHAR email UK
    TEXT role
    TEXT status
    TEXT password_hash
    TIMESTAMPTZ created_at
    TIMESTAMPTZ last_login
  }

  user_activities {
    TEXT id PK
    TEXT user_id FK
    TEXT action
    TIMESTAMPTZ created_at
  }

  categories {
    TEXT id PK
    VARCHAR name UK
    INTEGER sort_order UK
  }

  suppliers {
    TEXT id PK
    VARCHAR name UK
  }

  units {
    VARCHAR code PK
  }

  products {
    TEXT id PK
    VARCHAR sku UK
    VARCHAR name
    NUMERIC price
    INTEGER stock
    TEXT category_id FK
    INTEGER min_stock
    NUMERIC rating
    TEXT badge
  }

  promo_bundles {
    TEXT id PK
    VARCHAR sku UK
    VARCHAR name
    NUMERIC price
    NUMERIC original_price
    NUMERIC savings
    VARCHAR promo_label
  }

  promo_bundle_components {
    TEXT bundle_id PK_FK
    TEXT product_id PK_FK
    INTEGER quantity
    INTEGER sort_order
  }

  promo_bundle_labels {
    TEXT bundle_id PK_FK
    INTEGER sort_order PK
    VARCHAR label
  }

  promos {
    TEXT id PK
    VARCHAR slug UK
    TEXT name
    TEXT kind
    INTEGER discount_percent
    INTEGER buy_quantity
    INTEGER free_quantity
    TEXT target_type
    TEXT category_id FK
    TIMESTAMPTZ expires_at
  }

  promo_products {
    TEXT promo_id PK_FK
    TEXT product_id PK_FK
  }

  orders {
    TEXT id PK
    VARCHAR order_number UK
    NUMERIC subtotal
    NUMERIC tax
    NUMERIC discount
    NUMERIC total
    TEXT payment_method
    TEXT status
    TEXT cashier_id FK
    VARCHAR cashier_name
    NUMERIC cash_received
    NUMERIC change_amount
    TIMESTAMPTZ created_at
  }

  order_items {
    TEXT id PK
    TEXT order_id FK
    TEXT product_id FK
    TEXT bundle_id FK
    VARCHAR product_name
    INTEGER quantity
    NUMERIC unit_price
    NUMERIC subtotal
    INTEGER sort_order
  }

  order_item_components {
    TEXT order_item_id PK_FK
    TEXT product_id PK_FK
    VARCHAR product_name
    INTEGER quantity
  }

  order_payments {
    TEXT id PK
    TEXT order_id FK
    INTEGER sort_order
    TEXT method
    NUMERIC amount
    NUMERIC cash_received
  }

  stock_movements {
    TEXT id PK
    VARCHAR transaction_number UK
    TEXT movement_type
    TEXT product_id FK
    VARCHAR product_name
    VARCHAR category_name
    TEXT supplier_id FK
    VARCHAR unit_code FK
    INTEGER quantity
    INTEGER stock_before
    INTEGER stock_after
    NUMERIC purchase_price
    TEXT reason
    TEXT officer_id FK
    TEXT order_id FK
    TIMESTAMPTZ created_at
  }
```

## Optionality yang tidak terlihat penuh di diagram

- `order_items.product_id` dan `order_items.bundle_id` saling eksklusif. Satu baris menunjuk tepat satu produk katalog atau tepat satu paket.
- `order_item_components` hanya ada pada baris paket. Produk biasa tidak punya komponen.
- `order_payments` boleh kosong pada transaksi lama yang hanya menyimpan `orders.payment_method`.
- `stock_movements.supplier_id` wajib untuk stok masuk dan kosong untuk stok keluar.
- `stock_movements.order_id` terisi bila pergerakan berasal dari penjualan.
- `promos.category_id` terisi hanya bila `target_type = 'category'`. Target produk memakai `promo_products`.
- Minimum satu komponen dan satu label paket, serta minimum satu baris `order_items`, dijaga di aplikasi. Diagram memakai `|{` untuk hubungan itu. PostgreSQL tidak memaksa jumlah minimum anak tanpa trigger tambahan.
