# Half POS - Point of Sale System

Sistem Point of Sale modern dibangun dengan Next.js 14 dan stack teknologi terkini.

## Tech Stack

- **Next.js 14** (App Router)
- **TypeScript**
- **Tailwind CSS**
- **Shadcn UI** (komponen UI)
- **Zustand** (state management untuk cart & session)
- **Socket.io Client** (realtime updates)
- **React Hook Form + Zod** (validasi form)
- **Tanstack Query** (server state & caching)
- **Recharts** (grafik analitik dashboard)

## Fitur

- **Dashboard** - Statistik penjualan, grafik pendapatan, produk terlaris
- **Kasir (POS)** - Interface transaksi dengan keranjang belanja
- **Manajemen Produk** - CRUD produk dengan validasi form
- **Pesanan** - Riwayat transaksi dengan filter status
- **Autentikasi** - Login dengan session persistence (Zustand)
- **Realtime** - Socket.io client siap untuk update live (offline mode jika server tidak tersedia)

## Memulai

```bash
# Install dependencies
npm install

# Jalankan development server
npm run dev
```

Buka [http://localhost:3000](http://localhost:3000)

## Demo Account

| Role  | Email              | Password  |
|-------|--------------------|-----------|
| Admin | admin@halfpos.com  | admin123  |
| Kasir | kasir@halfpos.com  | kasir123  |

## Struktur Project

```
src/
├── app/
│   ├── (dashboard)/     # Halaman terproteksi
│   │   ├── dashboard/   # Dashboard analitik
│   │   ├── pos/         # Interface kasir
│   │   ├── products/    # Manajemen produk
│   │   ├── orders/      # Riwayat pesanan
│   │   └── settings/    # Pengaturan
│   ├── api/             # API Routes (mock in-memory DB)
│   └── login/           # Halaman login
├── components/
│   ├── ui/              # Shadcn UI components
│   ├── dashboard/       # Komponen dashboard
│   ├── pos/             # Komponen POS
│   ├── products/        # Komponen produk
│   ├── layout/          # Layout & navigasi
│   └── providers/       # React providers
├── hooks/               # Custom hooks (Tanstack Query)
├── stores/              # Zustand stores
├── lib/                 # Utilities, validations, API
└── types/               # TypeScript types
```

## Socket.io (Opsional)

Untuk realtime updates, setup Socket.io server terpisah dan set environment variable:

```env
NEXT_PUBLIC_SOCKET_URL=http://localhost:3001
```

Aplikasi tetap berfungsi penuh tanpa Socket server (menampilkan "Offline mode").

## Scripts

```bash
npm run dev      # Development server
npm run build    # Production build
npm run start    # Production server
npm run lint     # ESLint
```
