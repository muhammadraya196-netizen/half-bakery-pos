# Desain Database HALF POS

Dokumen ini disusun dari kode yang ada di workspace, bukan dari asumsi fitur di luar project.

## 1. Kondisi saat ini

Aplikasi adalah Point of Sale bakery **HALF POS**.

| Aspek | Bukti di project |
| --- | --- |
| Framework | Next.js 14 App Router, TypeScript |
| UI dan state | Tailwind, Zustand, TanStack Query |
| Validasi | Zod di `src/lib/validations` dan route API |
| Database | PostgreSQL 14+ |
| ORM | Tidak ada. Akses lewat `pg` di `src/lib/postgres.ts` |
| Koneksi | `DATABASE_URL` |
| Penyimpanan aktif | PostgreSQL. Fungsi di `src/lib/db.ts` membaca dan menulis tabel pada `docs/database-schema.sql` |
| Data awal | `src/lib/mock-data.ts`, `src/lib/bakery-data.ts`, `src/lib/stock-data.ts`, `src/lib/promo/promo.ts` |

`README.md` menyebut API route sebagai mock in-memory DB. Tidak ada folder migration, file `.prisma`, atau skema SQL sebelum dokumen ini.

Primary key yang sudah dipakai aplikasi adalah string, misalnya `user-1`, `1`, `bundle-coffee-break`, `ord-001`, dan `stk-...`. Skema target memakai `TEXT` agar identitas itu tidak diganti.

## 2. Keputusan implementasi

DDL ada di `docs/database-schema.sql` untuk PostgreSQL 14+. Terapkan dengan `npm run db:setup`. Perintah itu membuat database bila belum ada, menjalankan DDL, lalu menyalin katalog, user, promo, paket, dan transaksi contoh yang sudah ada di kode. Password disimpan sebagai hash scrypt.

Kolom `password_hash` menolak password plaintext. Login memverifikasi hash.

## 3. Entity yang tidak dijadikan tabel

| Data di kode | Alasan tidak menjadi tabel |
| --- | --- |
| `AnalyticsData` dan `mockAnalytics` | Dihitung dari pesanan dan produk. Angka statis di mock dapat berbeda dari transaksi nyata |
| Status produk `active` / `inactive` | Diturunkan dari `stock > 0` di `product-service.ts` |
| Status stok `safe` / `low` / `out` | Diturunkan dari `stock` dan `min_stock` |
| `CartItem`, `PaymentDraft` | State keranjang di browser, belum menjadi transaksi |
| Token login | Dibuat di klien sebagai Base64 `userId:timestamp`, tidak disimpan di server |
| `OUTLETS`, `TESTIMONIALS`, `ABOUT_FEATURES`, `BRAND` | Konten landing. Tidak ada pesanan, stok, atau user yang menunjuk ke outlet |
| `confirmPassword` | Hanya field form |
| `quantityIn` dan `quantityOut` bersamaan | Diganti `movement_type` + `quantity` |
| Stok pada paket bundling | Nilai `99` di data demo tidak dipakai. Ketersediaan dihitung dari komponen oleh `availableBundleSets` |

Outlet tidak dihubungkan ke `orders` karena tidak ada field outlet pada transaksi. Bila kasir nanti multi-cabang, tambahkan `outlets` dan `orders.outlet_id` lewat migrasi terpisah.

## 4. Daftar tabel

| Tabel | Fungsi | Data yang disimpan | Alasan ada | Hubungan |
| --- | --- | --- | --- | --- |
| `users` | Akun kasir, admin, dan finance | Identitas, role, status, hash password | Login, RBAC, dan petugas transaksi | Induk aktivitas, pesanan, dan pergerakan stok |
| `user_activities` | Jejak perubahan akun | Aksi dan waktu per user | Layar detail user membaca riwayat ini | Banyak aktivitas untuk satu user |
| `categories` | Master kategori katalog | Nama kategori etalase | Nama kategori sekarang diulang pada setiap produk | Satu kategori, banyak produk dan promo |
| `suppliers` | Master pemasok stok masuk | Nama supplier | Daftar tetap di `SUPPLIERS`, wajib saat stok masuk | Satu supplier, banyak pergerakan masuk |
| `units` | Satuan stok masuk | Kode satuan | Daftar tetap di `STOCK_UNITS` | Satu satuan, banyak pergerakan |
| `products` | Katalog yang bisa dijual dan distok | Harga, saldo, SKU, kategori | Inti kasir, produk, dan stok | Banyak relasi ke penjualan, stok, dan promo |
| `promo_bundles` | Paket promo kasir | Harga paket dan label promo | Komentar di `mock-data.ts`: paket bukan bagian `mockProducts` | Punya komponen, label, dan baris penjualan |
| `promo_bundle_components` | Resep paket | Produk katalog dan jumlah per paket | Stok yang berkurang adalah komponen, bukan paket | N:N produk dan paket, dengan jumlah |
| `promo_bundle_labels` | Teks isi paket di kasir | Label seperti `1 Coffee` | Label tampilan tidak sama dengan nama produk komponen | Banyak label untuk satu paket |
| `promos` | Promo landing dan kasir | Jenis diskon, masa berlaku, target | `PROMOS` dan `PROMO_CONFIGS` menggambarkan promo yang sama | Target kategori atau daftar produk |
| `promo_products` | Produk yang masuk promo tertentu | Pasangan promo dan produk | `productIds` pada promo persentase dan buy-get | N:N promo dan produk |
| `orders` | Header transaksi | Nominal, status, kasir, kembalian | Daftar penjualan dan dashboard | Punya baris barang, pembayaran, dan mutasi stok |
| `order_items` | Baris transaksi | Produk atau paket, harga saat jual, qty | Keranjang disimpan sebagai rincian, bukan array di dalam header | Milik satu pesanan |
| `order_item_components` | Snapshot resep pada baris paket | Komponen dan qty per satu paket | Resep bisa berubah setelah transaksi lama | Milik satu baris paket |
| `order_payments` | Pembayaran, termasuk split | Metode, nominal, uang tunai diterima | `OrderPayment` dan validasi di `api/orders` | Banyak pembayaran untuk satu pesanan |
| `stock_movements` | Audit stok append-only | Masuk/keluar, saldo sebelum dan sesudah | Modul stok dan pengurangan saat penjualan | Menunjuk produk, petugas, supplier, dan pesanan |

Analitik penjualan (`SalesSummary`) tetap dihitung dari `orders` dan `order_items`. Tidak ada tabel ringkasan.

## 5. Primary key

Setiap tabel memakai primary key `TEXT` yang diisi aplikasi, kecuali `units` yang memakai kode satuan sebagai primary key, dan tabel junction yang memakai primary key gabungan.

Alasan `TEXT`, bukan UUID atau BIGINT:

- ID yang sudah ada bukan UUID dan bukan bilangan tunggal (`bundle-coffee-break`, `user-1`, SKU produk `"1"`).
- Mengganti tipe PK memutus referensi di memori tanpa migrasi data.
- ID baru tetap boleh berisi UUID dalam bentuk teks tanpa mengubah kolom.

PK tidak nullable. Keunikan dijaga constraint `PRIMARY KEY`. Aplikasi saat ini membuat ID dari `Date.now()` dan `Math.random()`. Itu cukup untuk satu proses, tetapi bisa bertabrakan bila ada lebih dari satu instance. Skema menolak duplikat; pembentuk ID yang aman menjadi pekerjaan aplikasi saat database benar-benar dipakai.

`ON UPDATE` seluruh foreign key adalah `NO ACTION`. Primary key diperlakukan tidak berubah.

## 6. Kolom, null, dan sumber data

`NUMERIC(14,0)` adalah rupiah utuh. `TIMESTAMPTZ` disimpan sebagai waktu absolut. Filter tanggal di aplikasi mengelompokkan waktu dengan `Asia/Jakarta`.

Sumber `pengguna` berarti diisi form atau payload API. Sumber `sistem` berarti diisi server. Sumber `salinan` berarti nilai master yang disalin agar riwayat tidak berubah.

### users

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas akun |
| `name` | VARCHAR(100) | tidak | — | pengguna | Nama tampilan. Maksimum mengikuti Zod |
| `username` | VARCHAR(30) | tidak | — | pengguna | Identitas login unik, 3–30 karakter `[A-Za-z0-9._-]` |
| `email` | VARCHAR(254) | tidak | — | pengguna | Identitas login unik |
| `phone` | VARCHAR(30) | ya | — | pengguna | Nomor HP. Kosong pada form disimpan `NULL`, bukan string kosong |
| `role` | TEXT | tidak | — | pengguna | `admin`, `finance`, `cashier`, `manager` |
| `status` | TEXT | tidak | `active` | pengguna | `active` atau `inactive` |
| `avatar` | TEXT | ya | — | pengguna | URL atau path gambar |
| `password_hash` | TEXT | tidak | — | pengguna, disimpan sistem sebagai hash | Rahasia autentikasi. Tidak pernah dikirim ke klien |
| `created_at` | TIMESTAMPTZ | tidak | `now()` | sistem | Waktu akun dibuat |
| `last_login` | TIMESTAMPTZ | ya | — | sistem | Login terakhir. `NULL` bila belum pernah |

Unik case-insensitive: `lower(username)`, `lower(email)`.

### user_activities

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas jejak |
| `user_id` | TEXT | tidak | — | sistem | Akun yang berubah |
| `action` | TEXT | tidak | — | sistem | Kalimat aksi, misalnya akun dibuat atau password direset |
| `created_at` | TIMESTAMPTZ | tidak | `now()` | sistem | Waktu aksi |

### categories

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas stabil, misalnya `cake` |
| `name` | VARCHAR(50) | tidak | — | data referensi | Nama yang sekarang disimpan di `product.category` |
| `sort_order` | INTEGER | tidak | — | sistem | Urutan etalase. Unik |

Nilai awal sesuai `BAKERY_CATEGORIES`: Cake, Bread, Pastry, Cookies, Dessert, Coffee & Drink.

### suppliers

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas pemasok |
| `name` | VARCHAR(120) | tidak | — | data referensi | Nama pada form stok masuk |

Enam nama diambil dari `SUPPLIERS` di `src/lib/stock-data.ts`.

### units

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `code` | VARCHAR(20) | tidak | — | data referensi | PK sekaligus kode: pcs, box, kg, gram, pack, lusin, liter |

### products

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas katalog |
| `sku` | VARCHAR(20) | tidak | — | pengguna | Kode barang unik |
| `name` | VARCHAR(100) | tidak | — | pengguna | Nama produk |
| `description` | VARCHAR(500) | ya | — | pengguna | Deskripsi. Opsional di Zod |
| `price` | NUMERIC(14,0) | tidak | — | pengguna | Harga jual. Tidak boleh negatif |
| `stock` | INTEGER | tidak | `0` | pengguna saat buat, sistem saat mutasi | Saldo yang dicek kasir |
| `category_id` | TEXT | tidak | — | pengguna | Kategori wajib |
| `image` | TEXT | ya | — | sistem atau data katalog | URL gambar |
| `rating` | NUMERIC(2,1) | ya | — | data katalog | Rating landing 0–5. Form produk tidak mengisi field ini |
| `is_best_seller` | BOOLEAN | tidak | `false` | data katalog | Penanda etalase |
| `is_customer_favorite` | BOOLEAN | tidak | `false` | data katalog | Penanda etalase |
| `badge` | TEXT | ya | — | data katalog | `new`, `limited`, atau `NULL` |
| `min_stock` | INTEGER | tidak | `10` | pengguna atau sistem | Ambang stok rendah. Sama dengan `DEFAULT_MIN_STOCK` |
| `created_at` | TIMESTAMPTZ | tidak | `now()` | sistem | Waktu buat |
| `updated_at` | TIMESTAMPTZ | tidak | `now()` | sistem | Waktu ubah |

Tidak ada kolom `is_promo_bundling`. Paket tinggal di `promo_bundles`.

### promo_bundles

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas paket |
| `sku` | VARCHAR(20) | tidak | — | data promo | SKU paket, unik di tabel ini |
| `name` | VARCHAR(100) | tidak | — | data promo | Nama paket |
| `description` | TEXT | tidak | — | data promo | Deskripsi |
| `price` | NUMERIC(14,0) | tidak | — | data promo | Harga jual paket |
| `original_price` | NUMERIC(14,0) | tidak | — | data promo | Harga sebelum potongan paket. Wajib `>= price` |
| `savings` | NUMERIC(14,0) | tidak | dihitung | sistem | `original_price - price`. Kolom generated, tidak diinput |
| `promo_label` | VARCHAR(40) | tidak | — | data promo | Label kartu, misalnya `BEST SELLER` |
| `image` | TEXT | ya | — | sistem | Gambar kartu |
| `created_at` | TIMESTAMPTZ | tidak | `now()` | sistem | Waktu buat |
| `updated_at` | TIMESTAMPTZ | tidak | `now()` | sistem | Waktu ubah |

### promo_bundle_components

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `bundle_id` | TEXT | tidak | — | sistem | Bagian PK dan FK paket |
| `product_id` | TEXT | tidak | — | data promo | Bagian PK dan FK produk katalog |
| `quantity` | INTEGER | tidak | — | data promo | Jumlah komponen untuk satu paket. Wajib `> 0` |
| `sort_order` | INTEGER | tidak | — | sistem | Urutan resep. Unik per paket |

### promo_bundle_labels

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `bundle_id` | TEXT | tidak | — | sistem | Bagian PK dan FK paket |
| `sort_order` | INTEGER | tidak | — | sistem | Bagian PK, urutan tampilan |
| `label` | VARCHAR(80) | tidak | — | data promo | Teks isi paket |

### promos

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Sama dengan `landingId`, misalnya `promo-1` |
| `slug` | VARCHAR(80) | tidak | — | data promo | Slug URL `/pos?promo=` |
| `name` | TEXT | tidak | — | data promo | Nama lengkap |
| `short_name` | TEXT | tidak | — | data promo | Nama singkat notifikasi |
| `description` | TEXT | tidak | — | data promo | Teks operasional kasir |
| `landing_description` | TEXT | ya | — | data promo | Teks kartu landing bila berbeda. `NULL` bila sama |
| `badge` | TEXT | tidak | — | data promo | Label kartu |
| `kind` | TEXT | tidak | — | data promo | `percentage` atau `buy-get` |
| `discount_percent` | INTEGER | ya | — | data promo | Wajib 1–100 bila `percentage`, selain itu `NULL` |
| `buy_quantity` | INTEGER | ya | — | data promo | Wajib `> 0` bila `buy-get`, selain itu `NULL` |
| `free_quantity` | INTEGER | ya | — | data promo | Wajib `> 0` bila `buy-get`, selain itu `NULL` |
| `target_type` | TEXT | tidak | — | data promo | `products` atau `category` |
| `category_id` | TEXT | ya | — | data promo | Wajib bila target kategori, selain itu `NULL` |
| `quantity_per_product` | INTEGER | tidak | — | data promo | Qty yang dimasukkan ke keranjang. Wajib `> 0` |
| `expires_at` | TIMESTAMPTZ | tidak | — | data promo | Batas berlaku |
| `image` | TEXT | ya | — | data landing | Gambar kartu |
| `gradient` | TEXT | ya | — | data landing | Kelas tampilan kartu |

### promo_products

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `promo_id` | TEXT | tidak | — | sistem | Bagian PK dan FK promo |
| `product_id` | TEXT | tidak | — | data promo | Bagian PK dan FK produk |

Hanya diisi bila `promos.target_type = 'products'`.

### orders

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas transaksi |
| `order_number` | VARCHAR(40) | tidak | — | sistem | Nomor invoice unik `INV-YYYYMMDD-###` |
| `subtotal` | NUMERIC(14,0) | tidak | — | sistem, dari keranjang | Jumlah baris sebelum pajak dan diskon |
| `tax` | NUMERIC(14,0) | tidak | — | sistem | Nominal pajak transaksi ini |
| `discount` | NUMERIC(14,0) | tidak | — | pengguna atau promo | Potongan tingkat transaksi |
| `total` | NUMERIC(14,0) | tidak | — | sistem | `GREATEST(subtotal + tax - discount, 0)` |
| `payment_method` | TEXT | tidak | — | pengguna | Metode baris pertama. `card` = E-Wallet lama |
| `status` | TEXT | tidak | — | sistem | `pending`, `completed`, `cancelled`, `refunded` |
| `cashier_id` | TEXT | tidak | — | sistem, dari sesi | User yang melayani |
| `cashier_name` | VARCHAR(100) | tidak | — | salinan | Nama kasir saat transaksi |
| `customer_name` | TEXT | ya | — | pengguna | Nama pelanggan bila diisi |
| `notes` | TEXT | ya | — | pengguna | Catatan |
| `cash_received` | NUMERIC(14,0) | ya | — | pengguna | Total uang tunai diterima. `NULL` bila tidak ada tunai |
| `change_amount` | NUMERIC(14,0) | tidak | `0` | sistem | Kembalian |
| `created_at` | TIMESTAMPTZ | tidak | `now()` | sistem | Waktu transaksi |

Kasir baru di `api/orders` selalu menulis `status = completed`. Status lain ada pada tipe dan data contoh, jadi tetap diizinkan.

### order_items

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas baris |
| `order_id` | TEXT | tidak | — | sistem | Header pemilik |
| `product_id` | TEXT | ya | — | sistem | Produk katalog. `NULL` bila baris paket |
| `bundle_id` | TEXT | ya | — | sistem | Paket. `NULL` bila baris produk |
| `product_name` | VARCHAR(100) | tidak | — | salinan | Nama saat jual, untuk produk maupun paket |
| `quantity` | INTEGER | tidak | — | pengguna | Qty baris. Wajib `> 0` |
| `unit_price` | NUMERIC(14,0) | tidak | — | salinan | Harga satuan saat jual |
| `subtotal` | NUMERIC(14,0) | tidak | — | sistem | `quantity * unit_price` |
| `sort_order` | INTEGER | tidak | — | sistem | Urutan baris. Unik per pesanan |

Tepat satu dari `product_id` atau `bundle_id` terisi.

### order_item_components

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `order_item_id` | TEXT | tidak | — | sistem | Bagian PK dan FK baris paket |
| `product_id` | TEXT | tidak | — | sistem | Bagian PK dan FK produk yang dikonsumsi |
| `product_name` | VARCHAR(100) | tidak | — | salinan | Nama komponen saat jual |
| `quantity` | INTEGER | tidak | — | salinan resep | Qty untuk satu paket, bukan qty total konsumsi |

### order_payments

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas baris bayar |
| `order_id` | TEXT | tidak | — | sistem | Header pemilik |
| `sort_order` | INTEGER | tidak | — | sistem | Urutan. Metode pertama harus sama dengan `orders.payment_method` |
| `method` | TEXT | tidak | — | pengguna | Metode baris ini |
| `amount` | NUMERIC(14,0) | tidak | — | pengguna atau sistem | Nominal yang dihitung ke tagihan. Wajib `> 0` |
| `cash_received` | NUMERIC(14,0) | ya | — | pengguna | Wajib dan `>= amount` bila tunai. Wajib `NULL` bila bukan tunai |

Transaksi lama boleh tidak punya baris di tabel ini. Header tetap menyimpan `payment_method`.

### stock_movements

| Field | Tipe | Null | Default | Sumber | Fungsi |
| --- | --- | --- | --- | --- | --- |
| `id` | TEXT | tidak | — | sistem | Identitas audit |
| `transaction_number` | VARCHAR(40) | tidak | — | sistem | `STI-...` untuk masuk, `STO-...` untuk keluar |
| `movement_type` | TEXT | tidak | — | pengguna atau sistem | `in` atau `out`. Menggantikan pasangan `quantityIn` / `quantityOut` |
| `product_id` | TEXT | tidak | — | pengguna | Produk katalog yang berubah |
| `product_name` | VARCHAR(100) | tidak | — | salinan | Nama saat mutasi |
| `category_name` | VARCHAR(50) | tidak | — | salinan | Kategori saat mutasi |
| `supplier_id` | TEXT | ya | — | pengguna | Wajib untuk stok masuk, `NULL` untuk stok keluar |
| `supplier_name` | VARCHAR(120) | ya | — | salinan | Berpasangan dengan `supplier_id` |
| `unit_code` | VARCHAR(20) | ya | — | pengguna | Satuan stok masuk. Opsional di API |
| `quantity` | INTEGER | tidak | — | pengguna | Jumlah bergerak. Wajib `> 0` |
| `stock_before` | INTEGER | tidak | — | sistem | Saldo sebelum mutasi |
| `stock_after` | INTEGER | tidak | — | sistem | Saldo sesudah mutasi |
| `purchase_price` | NUMERIC(14,0) | ya | — | pengguna | Harga beli per unit. Tidak boleh negatif |
| `total_price` | NUMERIC(14,0) | ya | dihitung | sistem | `purchase_price * quantity`, atau `NULL` |
| `reason` | TEXT | ya | — | pengguna | Wajib untuk stok keluar. Opsional untuk stok masuk |
| `note` | TEXT | ya | — | pengguna atau sistem | Catatan. Penjualan saat ini menulis nomor invoice di sini |
| `officer_id` | TEXT | tidak | — | sistem, dari sesi | Petugas |
| `officer_name` | VARCHAR(100) | tidak | — | salinan | Nama petugas saat mutasi |
| `order_id` | TEXT | ya | — | sistem | Pesanan penyebab mutasi, bila ada |
| `created_at` | TIMESTAMPTZ | tidak | `now()` | sistem | Waktu catat |

Pemetaan dari objek aplikasi saat ini:

- `type` menjadi `movement_type`.
- `quantityIn` menjadi `quantity` bila tipe `in`, dan `0` tidak disimpan.
- `quantityOut` menjadi `quantity` bila tipe `out`.
- `supplier` menjadi `supplier_id` plus salinan `supplier_name`.
- `unit` menjadi `unit_code`.

## 7. Foreign key

`ON UPDATE` semua relasi: `NO ACTION`.

| Tabel asal | Field | Tabel tujuan | Field tujuan | ON DELETE | Alasan |
| --- | --- | --- | --- | --- | --- |
| `user_activities` | `user_id` | `users` | `id` | CASCADE | Jejak akun hanya bermakna untuk akun itu dan ikut terhapus bersama user |
| `products` | `category_id` | `categories` | `id` | RESTRICT | Produk tidak boleh kehilangan kategori |
| `promo_bundle_components` | `bundle_id` | `promo_bundles` | `id` | CASCADE | Resep tidak berguna tanpa paket |
| `promo_bundle_components` | `product_id` | `products` | `id` | RESTRICT | Produk yang masih menjadi isi paket tidak dihapus |
| `promo_bundle_labels` | `bundle_id` | `promo_bundles` | `id` | CASCADE | Label milik paket |
| `promos` | `category_id` | `categories` | `id` | RESTRICT | Promo kategori tidak boleh menunjuk kategori yang hilang |
| `promo_products` | `promo_id` | `promos` | `id` | CASCADE | Target ikut promo |
| `promo_products` | `product_id` | `products` | `id` | RESTRICT | Produk yang masih ditarget promo tidak dihapus |
| `orders` | `cashier_id` | `users` | `id` | RESTRICT | Riwayat penjualan tetap menunjuk kasir yang nyata |
| `order_items` | `order_id` | `orders` | `id` | CASCADE | Baris adalah bagian pesanan |
| `order_items` | `product_id` | `products` | `id` | RESTRICT | Baris historis tidak boleh yatim |
| `order_items` | `bundle_id` | `promo_bundles` | `id` | RESTRICT | Sama, untuk paket |
| `order_item_components` | `order_item_id` | `order_items` | `id` | CASCADE | Snapshot resep milik baris |
| `order_item_components` | `product_id` | `products` | `id` | RESTRICT | Komponen historis tetap valid |
| `order_payments` | `order_id` | `orders` | `id` | CASCADE | Pembayaran milik pesanan |
| `stock_movements` | `product_id` | `products` | `id` | RESTRICT | Audit stok tidak boleh yatim |
| `stock_movements` | `supplier_id` | `suppliers` | `id` | RESTRICT | Pemasok yang sudah dipakai tetap ada |
| `stock_movements` | `unit_code` | `units` | `code` | RESTRICT | Satuan yang sudah dipakai tetap ada |
| `stock_movements` | `officer_id` | `users` | `id` | RESTRICT | Petugas audit tetap ada |
| `stock_movements` | `order_id` | `orders` | `id` | RESTRICT | Mutasi penjualan tidak terlepas dari pesanan |

`CASCADE` dipakai untuk anak yang tidak punya arti di luar induknya: jejak akun, resep dan label paket, target produk promo, baris pesanan, komponen baris, dan pembayaran. Penghapusan user yang sudah menjadi kasir atau petugas stok ditolak. Penghapusan produk, kategori, supplier, atau pesanan yang sudah direferensi juga ditolak.

API mengembalikan pesan bila penghapusan ditolak constraint. Perubahan stok lewat form produk tetap menulis kolom `products.stock` tanpa jurnal, sama seperti perilaku sebelumnya.

## 8. Relationship

### 1:N

| Relasi | Kardinalitas | Wajib? | Lokasi FK | Contoh alur |
| --- | --- | --- | --- | --- |
| users → user_activities | 1:N | User wajib. Aktivitas boleh nol sebelum aksi pertama, tetapi pembuatan user di aplikasi langsung menulis satu aktivitas | `user_activities.user_id` | Admin membuat kasir. Satu baris aktivitas `Akun dibuat` |
| users → orders | 1:N | Kasir wajib pada pesanan. User boleh belum punya pesanan | `orders.cashier_id` | Kasir menyelesaikan bayar. Header menyimpan id dan salinan nama |
| users → stock_movements | 1:N | Petugas wajib. User boleh belum punya mutasi | `stock_movements.officer_id` | Finance mencatat barang rusak |
| categories → products | 1:N | Kategori wajib pada produk. Kategori boleh belum punya produk | `products.category_id` | Produk baru memilih Cake |
| categories → promos | 1:N | Hanya promo `target_type = category` | `promos.category_id` | Weekend promo menunjuk Pastry |
| suppliers → stock_movements | 1:N | Wajib pada stok masuk | `stock_movements.supplier_id` | Stok masuk tepung dari Supplier Tepung Makmur |
| units → stock_movements | 1:N | Satuan opsional | `stock_movements.unit_code` | Baris masuk memakai `kg` |
| products → stock_movements | 1:N | Produk wajib. Produk boleh belum punya mutasi karena saldo awal tidak selalu punya jurnal | `stock_movements.product_id` | Stok croissant berkurang saat terjual |
| products → order_items | 1:N | Opsional di sisi baris, karena baris bisa berupa paket | `order_items.product_id` | Tiga croissant menjadi satu baris |
| promo_bundles → order_items | 1:N | Opsional di sisi baris | `order_items.bundle_id` | Coffee Break terjual sebagai satu baris paket |
| orders → order_payments | 1:N | Pembayaran boleh nol hanya untuk transaksi lama | `order_payments.order_id` | Tunai dan QRIS pada satu invoice |
| orders → stock_movements | 1:N | `order_id` opsional | `stock_movements.order_id` | Satu invoice membuat beberapa mutasi keluar |
| order_items → order_item_components | 1:N | Komponen hanya untuk baris paket | `order_item_components.order_item_id` | Cake Date menyimpan dua komponen |

`orders → order_items` adalah 1:N dan secara bisnis wajib punya minimal satu baris. API menolak keranjang kosong. Database mengizinkan header tanpa baris hanya karena pemeriksaan jumlah anak butuh trigger. Jangan mengandalkan kelonggaran itu.

`promo_bundles → promo_bundle_components` dan `promo_bundles → promo_bundle_labels` sama: bisnis mewajibkan minimal satu, penghapusan paket menghapus anaknya.

### N:N

| Relasi | Tabel junction | Unik | Optionality | Contoh |
| --- | --- | --- | --- | --- |
| promo_bundles dan products | `promo_bundle_components` | PK `(bundle_id, product_id)` | Satu paket memakai satu atau lebih produk. Satu produk boleh masuk banyak paket | Cafe Latte masuk Coffee Break dan Cake Date |
| promos dan products | `promo_products` | PK `(promo_id, product_id)` | Hanya promo target produk. Satu produk boleh masuk banyak promo | Birthday cake menunjuk produk `1` |

Tidak ada relasi 1:1 antar tabel. Password tidak dipisah ke tabel lain; kolom `password_hash` cukup, dan query API wajib tidak memilih kolom itu.

### Unik tambahan untuk kardinalitas

- Satu username dan satu email, tanpa membedakan huruf besar.
- Satu SKU produk dan satu SKU paket, pada tabel masing-masing.
- Satu nomor invoice dan satu nomor mutasi stok.
- Satu urutan baris per pesanan, satu urutan bayar per pesanan, satu urutan komponen per paket.
- Satu produk hanya sekali di dalam satu paket dan satu promo.

## 9. Constraint

Selain primary key, foreign key, dan `NOT NULL` di atas:

| Constraint | Aturan |
| --- | --- |
| `users_role_check` | Role hanya empat nilai yang ada di `UserRole` |
| `users_status_check` | `active` atau `inactive` |
| `users_username_check` | Pola username Zod |
| `users_email_check` | Bentuk email dasar |
| `users_phone_check` | Kosong atau angka, `+`, spasi, tanda hubung |
| `users_password_hash_check` | Panjang hash minimal 8 |
| `products_price_check`, `products_stock_check` | Harga dan stok tidak negatif |
| `products_rating_check` | Rating kosong atau 0 sampai 5 |
| `products_badge_check` | `new`, `limited`, atau `NULL` |
| `products_min_stock_check` | Ambang tidak negatif |
| `promo_bundles_original_price_check` | Harga coret tidak lebih kecil dari harga paket |
| `promos_kind_fields_check` | Field diskon sesuai jenis promo |
| `promos_target_fields_check` | Kategori terisi hanya untuk target kategori |
| `orders_total_formula_check` | Total = `GREATEST(subtotal + tax - discount, 0)` |
| `orders_number_check` | Pola nomor invoice |
| `order_items_target_check` | Tepat satu target, produk atau paket |
| `order_items_subtotal_formula_check` | Subtotal baris = qty × harga |
| `order_payments_cash_check` | Tunai punya uang diterima yang cukup. Non-tunai tidak punya `cash_received` |
| `order_payments_amount_check` | Nominal baris `> 0` |
| `stock_movements_balance_check` | Masuk menambah, keluar mengurangi, hasil tidak negatif |
| `stock_movements_supplier_required_check` | Stok masuk wajib punya supplier |
| `stock_movements_reason_required_check` | Stok keluar wajib punya alasan |
| `stock_movements_number_check` | Awalan `STI-` atau `STO-` sesuai tipe |
| Trigger `stock_movements_append_only_trg` | `UPDATE` dan `DELETE` audit stok ditolak |

Indeks untuk query yang sudah ada:

- Login dan keunikan akun: `lower(email)`, `lower(username)`.
- Daftar user: `(role, status)`.
- Aktivitas user: `(user_id, created_at DESC)`.
- Katalog: `category_id`, `lower(name)`, dan unique `sku`.
- Daftar penjualan: `created_at DESC`, `status`, `cashier_id`, unique `order_number`.
- Riwayat stok: `(product_id, created_at DESC)`, `created_at`, `movement_type`, `supplier_id`, `officer_id`, `order_id`.

## 10. Normalisasi

### Yang sudah benar pada model target

- 1NF: array `items`, `payments`, `bundleComponents`, `bundleItems`, dan `productIds` menjadi baris anak. Tidak ada daftar tak terstruktur dalam satu kolom.
- 2NF: tabel junction memakai seluruh PK gabungan. Qty komponen bergantung pada pasangan paket dan produk, bukan pada salah satunya saja.
- 3NF: kategori, supplier, dan satuan tidak diulang sebagai satu-satunya sumber nama. Master punya tabel sendiri.
- Transaksi dipisah dari master. Harga jual historis ada di `order_items.unit_price`, bukan dengan mengubah `products.price` masa lalu.
- N:N memakai tabel penghubung.

### Denormalisasi yang dipertahankan

| Salinan | Alasan |
| --- | --- |
| `orders.cashier_name` | Nama user bisa diubah. Struk lama harus tetap |
| `order_items.product_name`, `unit_price` | Harga dan nama katalog berubah |
| `order_item_components.product_name` | Resep dan nama komponen berubah |
| `stock_movements.product_name`, `category_name`, `officer_name`, `supplier_name` | Audit append-only |
| `orders.payment_method` | API dan transaksi lama mewajibkan metode pertama di header |
| `orders.cash_received`, `change_amount` | Ringkasan tunai di header, sementara rinciannya di `order_payments` |
| `products.stock` | Saldo operasional. `SUM(masuk) - SUM(keluar)` tidak sama dengan stok bila saldo awal tidak punya jurnal |

`savings` dan `total_price` tidak disimpan sebagai input. Keduanya generated column.

### Masalah pada penyimpanan sekarang

| Masalah | Bentuk saat ini | Perbaikan pada skema |
| --- | --- | --- |
| Kategori, supplier, dan satuan berupa string berulang | Tidak ada master | Tabel master dan FK |
| Paket disamakan dengan produk | `PROMO_BUNDLING_PRODUCTS` bertipe `Product`, stok palsu `99` | Tabel paket terpisah, tanpa saldo |
| Promo terbelah dua | `PROMOS` di `bakery-data.ts` dan `PROMO_CONFIGS` di `promo.ts` | Satu tabel `promos` |
| Deskripsi promo tidak sama | Kartu landing dan teks kasir untuk promo yang sama berbeda | `description` dan `landing_description` |
| Baris transaksi, bayar, dan komponen tersarang | Array di dalam objek `Order` | Tabel anak |
| `quantityIn` dan `quantityOut` saling meniadakan | Salah satu selalu 0 | Satu `quantity` plus tipe |
| `totalPrice` dapat menyimpang dari harga × qty | Dihitung di aplikasi lalu disimpan | Generated column |
| Password terpisah di `Map`, tetapi tetap plaintext | `userPasswords` dan `mockUsers.password` | Kolom `password_hash` |
| Analitik statis | `mockAnalytics` | Tidak disimpan |

Ketergantungan transitif yang dicegah: nama kategori tidak lagi menjadi sumber kebenaran di setiap produk. Salinan nama pada audit bukan sumber kebenaran master.

## 11. Business rules

Aturan integritas ada di database. Aturan proses tetap di aplikasi karena membutuhkan beberapa langkah atau data di luar satu baris.

| Aturan | Kondisi valid | Ditolak | Implementasi |
| --- | --- | --- | --- |
| Identitas akun unik | Username dan email unik tanpa memandang kapital | Duplikat | Unique index. Aplikasi sudah melempar `UserError` |
| Role dan status | Nilai enum yang ada di tipe | Nilai lain | `CHECK`. Zod form user belum memasukkan `manager`; tipe dan RBAC memasukkannya |
| Password | Minimal 8 karakter sebelum di-hash | Lebih pendek | Zod dan `resetUserPassword`. Database hanya melihat hash |
| Role melihat user | Admin, manager, dan finance boleh melihat. Mutasi hanya admin dan manager | Kasir mengelola user | `src/lib/rbac.ts`, bukan constraint |
| Harga dan stok tidak negatif | `price >= 0`, `stock >= 0` | Nilai negatif | Zod dan `CHECK` |
| Stok tidak boleh minus saat keluar | Qty keluar `<=` saldo | Qty melebihi saldo | `createOrder` dan `createStockMovement`. `CHECK` saldo sesudah mutasi |
| Supplier stok masuk | Stok masuk punya supplier dari daftar | Stok masuk tanpa supplier | API dan `CHECK` |
| Alasan stok keluar | Salah satu dari enam alasan | Alasan lain, atau keluar tanpa alasan | Zod dan `CHECK` |
| Harga beli | Kosong atau `>= 0` | Negatif | Zod dan `CHECK` |
| Audit stok tidak diedit | Insert saja | Update atau delete | Trigger. Tidak ada route edit |
| Paket bukan katalog | Paket tidak menambah `products` dan tidak punya saldo sendiri | Menjual paket seolah stoknya 99 | Struktur tabel. Aplikasi saat ini masih menyimpan stok 99 pada objek demo |
| Konsumsi paket | Stok berkurang pada komponen × qty paket | Mengurangi stok id paket | `stockDemand` di `db.ts` |
| Satu baris jual | Produk atau paket, tidak keduanya | Keduanya terisi atau keduanya kosong | `CHECK` |
| Subtotal baris | Sama dengan qty × harga saat jual | Subtotal tidak cocok | `CHECK` |
| Total pesanan | `subtotal + pajak - diskon`, minimal 0 | Total tidak cocok | `CHECK`. Keranjang memakai rumus yang sama |
| Pajak 10% | `tax = subtotal * 0.1` pada kasir baru | — | Aplikasi (`TAX_RATE`). API menerima nominal pajak apa pun yang `>= 0`, jadi database menyimpan nominal, bukan memaksa tarif |
| Diskon | `>= 0`. Bila lebih besar dari subtotal + pajak, total menjadi 0 | Diskon negatif | Aplikasi dan `CHECK` |
| Pembayaran lunas | Jumlah baris sama dengan total, kecuali kembalian tunai | Kurang, lebih, atau kembalian tidak cocok | `api/orders` dan `summarizePayments` |
| Split payment | Tiap nominal `> 0`. Tunai: uang diterima `>=` nominal baris | Nominal 0 pada split, atau uang tunai kurang | Zod dan `CHECK` baris |
| Metode pertama | `payments[0].method = paymentMethod` | Tidak sama | Zod di `api/orders` |
| `card` | Tetap berarti E-Wallet | Mengartikan `card` sebagai kartu debit/kredit | Nilai enum dipertahankan. Debit dan kredit punya nilai sendiri |
| Status kasir baru | Checkout menulis `completed` | — | `api/orders`. Status lain tetap sah untuk data yang sudah ada |
| Promo kedaluwarsa | `expires_at` di masa depan | Promo lewat tanggal | `isPromoExpired`. Bukan constraint, karena bergantung pada waktu baca |
| Promo persentase | Persen 1–100, tanpa field buy-get | Kombinasi field campur | `CHECK` |
| Promo buy-get | `buy_quantity` dan `free_quantity` positif, tanpa persen | Kombinasi field campur | `CHECK` |
| Target promo | Kategori atau daftar produk, tidak keduanya | Keduanya | `CHECK` plus aturan aplikasi: promo `products` punya minimal satu `promo_products` dan nol kategori |
| Stok promo | Produk stok 0 dilewati saat promo dimasukkan ke keranjang | — | `resolvePromoItems` |
| Username form vs login | Login memakai email, bukan username | — | `api/auth/login` |
| Akun nonaktif | Seharusnya tidak bisa login | Saat ini login tidak membaca `status` | Belum ditegakkan. Lihat pekerjaan tersisa |

Aturan yang tidak saling bertentangan: pajak disimpan sebagai nominal agar transaksi lama tetap benar bila tarif berubah. Tarif 10% tetap aturan kasir, bukan `CHECK` yang menolak pajak historis.

## 12. Audit keamanan dan integritas

### Konsistensi

- Saldo `products.stock` dan jurnal bisa berbeda. Penyebab di kode: stok awal tidak membuat `stock_movements`, dan `PUT /api/products/[id]` dapat mengubah `stock` tanpa jurnal.
- Form stok masuk menyimpan beberapa baris sebagai beberapa request. Bila baris kedua gagal, baris pertama sudah tercatat. Tidak ada transaksi lintas baris.
- Nomor invoice memakai `orders.length + 1`. Nomor stok memakai jumlah baris sejenis. Dua proses bersamaan dapat menghasilkan nomor sama. Unique constraint akan menolak duplikat setelah database dipakai; aplikasi perlu nomor berurutan yang aman.
- ID `Date.now()` dapat bertabrakan.
- `mockAnalytics` tidak dihitung dari `mockOrders`. Dashboard yang hidup menghitung ulang lewat API; angka statis itu bukan sumber kebenaran.
- Teks Weekend Promo di landing menyebut pastry dan dessert, tetapi `PROMO_CONFIGS` hanya mengisi `category: "Pastry"`.
- Deskripsi promo landing dan deskripsi kasir untuk slug yang sama tidak identik.
- Jam toko di landing memakai WITA. Filter penjualan memakai `Asia/Jakarta`.
- Login tidak memeriksa `status`. User `inactive` di data manajemen tetap bisa lolos bila password cocok, karena login membaca `mockUsers`, bukan `managedUsers`.
- Penghapusan user dan produk di memori tidak menjaga referensi pesanan dan jurnal.

### Duplikasi

- Email dan username dijaga di memori dengan perbandingan lowercase, tetapi tidak ada constraint bila data dimutasi di luar fungsi itu.
- SKU tidak dicegah unik di `createProduct`.
- Promo dan paket didefinisikan ulang sebagai objek produk.

### Penghapusan

- `RESTRICT` mencegah hilangnya jejak penjualan dan stok.
- `CASCADE` menghapus anak komposisi bila induk paket, promo, atau pesanan dihapus.
- Trigger menolak perubahan jurnal stok.

### Kredensial

- Password demo disimpan plaintext di `mockUsers` dan `Map` `userPasswords`.
- `POST /api/auth/login` membandingkan password mentah.
- Respons login tidak mengembalikan password, tetapi rahasia tetap ada di sumber dan memori proses.
- Token bukan hash yang ditandatangani dan tidak punya tabel sesi.
- Skema target tidak memuat password demo. Jangan menyalin nilai itu ke SQL.

### Transaksi dan race

`createOrder` mengecek stok lalu mengurangi stok dalam satu proses Node. Itu aman hanya selama satu instance. Beberapa baris stok masuk tidak atomik. Setelah pindah ke PostgreSQL, checkout dan stok masuk multi-baris harus satu transaksi dengan kunci baris produk.

## 13. Pemetaan field aplikasi ke kolom

| Aplikasi | Kolom |
| --- | --- |
| `ManagedUser` tanpa password | `users`, kecuali `password_hash` |
| `UserActivity` | `user_activities` |
| `Product.category` | `categories.name` lewat `products.category_id` |
| `Product` katalog | `products` |
| `PROMO_BUNDLING_PRODUCTS` | `promo_bundles`, `promo_bundle_components`, `promo_bundle_labels` |
| `PROMOS` + `PROMO_CONFIGS` | `promos` dan `promo_products` |
| `Order` | `orders` |
| `OrderItem` | `order_items` |
| `OrderItem.bundleComponents` | `order_item_components` |
| `OrderPayment` | `order_payments` |
| `StockMovement.type` | `stock_movements.movement_type` |
| `StockMovement.quantityIn` / `quantityOut` | `stock_movements.quantity` |
| `StockMovement.supplier` | `supplier_id` dan `supplier_name` |
| `StockMovement.unit` | `unit_code` |
| `StockMovement.totalPrice` | `total_price` generated |

String kosong dari form (`phone`, `avatar`, `customerName`, `notes`) sebaiknya menjadi `NULL` saat ditulis ke database.

## 14. Penerapan PostgreSQL

- Koneksi: `DATABASE_URL`, klien `pg`, pool di `src/lib/postgres.ts`.
- `npm run db:setup` menerapkan `docs/database-schema.sql` dan menyalin data contoh yang sudah ada.
- Password demo di-hash saat penyalinan. Nilai mentah tidak ditulis ke database.
- Promo kasir di layar POS masih dibaca dari konstanta `PROMO_BUNDLING_PRODUCTS` dan `PROMO_CONFIGS`. Salinannya tetap disimpan di tabel promo agar resep paket dapat direferensi saat transaksi.

Yang masih mengikuti aturan aplikasi, bukan semuanya di database:

- Login belum menolak akun `inactive`.
- Perubahan stok lewat form produk belum membuat jurnal.
- Filter tanggal penjualan masih memakai `Asia/Jakarta`.
