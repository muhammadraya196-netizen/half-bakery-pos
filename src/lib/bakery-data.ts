import {
  CATEGORY_FALLBACK_IMAGES,
} from "@/lib/product-images";

export const BAKERY_CATEGORIES = [
  "Cake",
  "Bread",
  "Pastry",
  "Cookies",
  "Dessert",
  "Coffee & Drink",
] as const;

export type BakeryCategory = (typeof BAKERY_CATEGORIES)[number];

export const BRAND = {
  name: "HALF CAKE & BAKERY",
  shortName: "HALF",
  tagline: "Premium Artisan Bakery & Cake Shop",
  hours: "08.00 - 21.00 WITA",
  instagram: "https://instagram.com/halfbakery",
  facebook: "https://facebook.com/halfbakery",
} as const;

export const NAV_LINKS = [
  { label: "Home", href: "#home" },
  { label: "Menu", href: "#menu" },
  { label: "Promo", href: "#promo" },
  { label: "Tentang Kami", href: "#about" },
  { label: "Outlet", href: "#outlet" },
  { label: "Kontak", href: "#kontak" },
] as const;

export const PROMOS = [
  {
    id: "promo-1",
    slug: "birthday-cake",
    title: "Diskon 20% Birthday Cake",
    description:
      "Rayakan momen spesial dengan birthday cake premium. Berlaku setiap hari Selasa & Kamis.",
    badge: "Limited",
    image: "/images/promo-birthday-cake.jpg",
    gradient: "from-primary/90 to-bakery-dark/90",
  },
  {
    id: "promo-2",
    slug: "buy2get1-bread",
    title: "Buy 2 Get 1 Bread",
    description:
      "Beli 2 roti artisan favoritmu, gratis 1 roti pilihan. Berlaku di semua outlet.",
    badge: "Best Deal",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=800&q=80",
    gradient: "from-secondary/90 to-primary/80",
  },
  {
    id: "promo-3",
    slug: "weekend-promo",
    title: "Weekend Promo",
    description:
      "Diskon 15% untuk semua pastry & dessert setiap Sabtu dan Minggu.",
    badge: "Weekend",
    image:
      "https://images.unsplash.com/photo-1486427944299-d1955d23e34d?w=800&q=80",
    gradient: "from-bakery-dark/90 to-primary/70",
  },
] as const;

export const ABOUT_FEATURES = [
  {
    icon: "fresh" as const,
    title: "Fresh Daily",
    description: "Dipanggang fresh setiap hari dengan resep artisan terbaik.",
  },
  {
    icon: "ingredients" as const,
    title: "Premium Ingredients",
    description: "Bahan berkualitas premium, tanpa kompromi pada rasa.",
  },
  {
    icon: "handmade" as const,
    title: "Handmade",
    description: "Setiap produk dibuat dengan tangan oleh baker berpengalaman.",
  },
  {
    icon: "halal" as const,
    title: "Halal",
    description: "Semua produk halal dan aman untuk seluruh keluarga.",
  },
  {
    icon: "hygienic" as const,
    title: "Hygienic Kitchen",
    description: "Dapur bersertifikat dengan standar kebersihan tertinggi.",
  },
] as const;

export const OUTLETS = [
  {
    id: "outlet-1",
    name: "HALF Bakery Perintis",
    address:
      "Jl. Perintis Kemerdekaan KM. 10, Tamalanrea, Kota Makassar, Sulawesi Selatan",
    hours: "08.00 - 21.00 WITA",
    phone: "",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Jl.+Perintis+Kemerdekaan+KM.+10,+Tamalanrea,+Makassar",
    image:
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=600&q=80",
  },
  {
    id: "outlet-2",
    name: "HALF Bakery Panakkukang",
    address:
      "Jl. Boulevard Panakkukang No. 23, Kota Makassar, Sulawesi Selatan",
    hours: "08.00 - 21.00 WITA",
    phone: "",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Jl.+Boulevard+Panakkukang+No.+23,+Makassar",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
  },
  {
    id: "outlet-3",
    name: "HALF Bakery Pettarani",
    address: "Jl. A. P. Pettarani No. 89, Kota Makassar, Sulawesi Selatan",
    hours: "08.00 - 21.00 WITA",
    phone: "",
    mapsUrl:
      "https://www.google.com/maps/search/?api=1&query=Jl.+A.+P.+Pettarani+No.+89,+Makassar",
    image:
      "https://images.unsplash.com/photo-1559925393-8be0ec4767c8?w=600&q=80",
  },
] as const;

export const TESTIMONIALS = [
  {
    id: "t1",
    name: "Andi Pratama",
    role: "Mahasiswa UNHAS",
    rating: 5,
    text: "Roti sourdough-nya juara! Teksturnya pas, aroma butter-nya khas. Jadi langganan setiap pagi sebelum kuliah.",
    avatar: "AP",
  },
  {
    id: "t2",
    name: "Nur Aisyah",
    role: "Ibu Rumah Tangga",
    rating: 5,
    text: "Birthday cake anak saya dari HALF selalu jadi pusat perhatian. Dekorasinya cantik dan rasanya enak banget!",
    avatar: "NA",
  },
  {
    id: "t3",
    name: "Fajar Ramadhan",
    role: "Office Worker",
    rating: 5,
    text: "Croissant dan kopi susunya perfect combo untuk break siang. Tempatnya nyaman dan pelayanannya ramah.",
    avatar: "FR",
  },
  {
    id: "t4",
    name: "Putri Maharani",
    role: "Content Creator",
    rating: 5,
    text: "Estetik banget outlet-nya! Pastry-nya Instagram-worthy dan rasanya nggak mengecewakan. Highly recommended!",
    avatar: "PM",
  },
  {
    id: "t5",
    name: "Budi Santoso",
    role: "Pecinta Dessert",
    rating: 4,
    text: "Tiramisu dan cheesecake mereka premium banget. Harganya worth it untuk kualitas yang didapat.",
    avatar: "BS",
  },
  {
    id: "t6",
    name: "Siti Rahmawati",
    role: "Pembeli Birthday Cake",
    rating: 5,
    text: "Pesan custom cake untuk ulang tahun suami, hasilnya persis seperti yang diminta. Keluarga puas semua!",
    avatar: "SR",
  },
] as const;

export const CATEGORY_IMAGES = CATEGORY_FALLBACK_IMAGES;
