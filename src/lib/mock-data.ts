import type { Product, Order, AnalyticsData } from "@/types";
import { BAKERY_CATEGORIES } from "@/lib/bakery-data";
import { getProductImage } from "@/lib/product-images";

export const CATEGORIES = [...BAKERY_CATEGORIES];

const TS = "2026-01-15T08:00:00Z";
const TU = "2026-06-01T10:00:00Z";

const _mockProducts: Product[] = [
  // ── Best Sellers (featured first) ──
  {
    id: "1",
    name: "Chocolate Signature Cake",
    description:
      "Moist chocolate cake dengan premium dark chocolate ganache dan chocolate flakes.",
    price: 185000,
    stock: 18,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1578985545069-469a028d384b?w=600&q=80",
    sku: "CAK-001",
    rating: 5.0,
    isBestSeller: true,
    isCustomerFavorite: true,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "2",
    name: "Belgian Chocolate Croissant",
    description:
      "Croissant renyah dengan isian Belgian chocolate premium.",
    price: 38000,
    stock: 45,
    category: "Bread",
    image:
      "https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=600&q=80",
    sku: "BRD-001",
    rating: 5.0,
    isBestSeller: true,
    isCustomerFavorite: true,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "3",
    name: "Choco Lava Bun",
    description:
      "Soft bread dengan lelehan coklat premium di dalamnya.",
    price: 28000,
    stock: 50,
    category: "Bread",
    image:
      "https://images.unsplash.com/photo-1608198399987-35bbd9b47c85?w=600&q=80",
    sku: "BRD-002",
    rating: 5.0,
    isBestSeller: true,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "4",
    name: "Chocolate Danish",
    description: "Pastry butter dengan topping dark chocolate.",
    price: 32000,
    stock: 40,
    category: "Pastry",
    image:
      "https://images.unsplash.com/photo-1623334044303-2410814c1b0e?w=600&q=80",
    sku: "PST-001",
    rating: 5.0,
    isBestSeller: true,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "5",
    name: "Chocolate Brownies Premium",
    description: "Brownies lembut menggunakan Belgian chocolate.",
    price: 45000,
    stock: 35,
    category: "Dessert",
    image:
      "https://images.unsplash.com/photo-1607924753015-9f5ea8ad2f84?w=600&q=80",
    sku: "DES-001",
    rating: 5.0,
    isBestSeller: true,
    createdAt: TS,
    updatedAt: TU,
  },

  // ── Cake ──
  {
    id: "6",
    name: "Red Velvet Cake",
    description:
      "Classic red velvet dengan cream cheese frosting lembut dan elegan.",
    price: 195000,
    stock: 16,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1586788680434-30d324b2d5ea?w=600&q=80",
    sku: "CAK-002",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "7",
    name: "Black Forest Cake",
    description:
      "Chocolate sponge dengan whipped cream, ceri, dan chocolate shavings.",
    price: 205000,
    stock: 14,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1565958011703-44f9829ba187?w=600&q=80",
    sku: "CAK-003",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "8",
    name: "Tiramisu Cake",
    description:
      "Layer mascarpone cream, espresso-soaked sponge, dan cocoa dust.",
    price: 210000,
    stock: 12,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80",
    sku: "CAK-004",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "9",
    name: "Cheesecake New York",
    description:
      "Baked cheesecake klasik dengan tekstur creamy dan base graham cracker.",
    price: 195000,
    stock: 15,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1533134242443-5544d1d1a47e?w=600&q=80",
    sku: "CAK-005",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "10",
    name: "Strawberry Shortcake",
    description:
      "Vanilla sponge, fresh cream, dan stroberi segar pilihan.",
    price: 190000,
    stock: 17,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=600&q=80",
    sku: "CAK-006",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "11",
    name: "Opera Cake",
    description:
      "French classic dengan layer almond sponge, coffee buttercream, dan ganache.",
    price: 220000,
    stock: 8,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=600&q=80",
    sku: "CAK-007",
    rating: 4.9,
    badge: "limited",
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "12",
    name: "Matcha Cake",
    description:
      "Japanese matcha sponge dengan white chocolate cream dan matcha glaze.",
    price: 200000,
    stock: 14,
    category: "Cake",
    image:
      "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=600&q=80",
    sku: "CAK-008",
    rating: 4.8,
    badge: "new",
    createdAt: TS,
    updatedAt: TU,
  },

  // ── Bread ──
  {
    id: "13",
    name: "Butter Croissant",
    description:
      "Croissant klasik dengan lapisan butter premium, renyah di luar lembut di dalam.",
    price: 26000,
    stock: 60,
    category: "Bread",
    image:
      "https://images.unsplash.com/photo-1623689046286-64868acbad5d?w=600&q=80",
    sku: "BRD-003",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "14",
    name: "Garlic Cheese Bread",
    description:
      "Roti bawang putih dengan keju mozzarella meleleh, fresh from oven.",
    price: 30000,
    stock: 40,
    category: "Bread",
    image:
      "https://images.unsplash.com/photo-1619535623043-f5fa8d64f8c0?w=600&q=80",
    sku: "BRD-004",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "15",
    name: "Soft Milk Bread",
    description:
      "Roti susu super lembut, perfect untuk sarapan keluarga.",
    price: 22000,
    stock: 55,
    category: "Bread",
    image:
      "https://images.unsplash.com/photo-1549931319-a545dcf3bc73?w=600&q=80",
    sku: "BRD-005",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "16",
    name: "Chocolate Bun",
    description:
      "Soft bun dengan filling coklat creamy yang melimpah.",
    price: 24000,
    stock: 48,
    category: "Bread",
    image:
      "https://images.unsplash.com/photo-1509365465985-25d11c17e812?w=600&q=80",
    sku: "BRD-006",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "17",
    name: "Sausage Bread",
    description:
      "Roti dengan sosis premium dan saus special, favorit anak-anak.",
    price: 28000,
    stock: 42,
    category: "Bread",
    image:
      "https://images.unsplash.com/photo-1612185170801-6729a0853a8e?w=600&q=80",
    sku: "BRD-007",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "18",
    name: "Japanese Milk Bread",
    description:
      "Shokupan style bread dengan tekstur super fluffy dan aroma susu.",
    price: 34000,
    stock: 35,
    category: "Bread",
    image:
      "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=600&q=80",
    sku: "BRD-008",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "19",
    name: "Sweet Corn Bread",
    description:
      "Roti manis dengan topping jagung manis dan butter glaze.",
    price: 25000,
    stock: 38,
    category: "Bread",
    image:
      "https://images.unsplash.com/photo-1586444248902-2f64eddc13df?w=600&q=80",
    sku: "BRD-009",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },

  // ── Pastry ──
  {
    id: "20",
    name: "Almond Danish",
    description:
      "Butter pastry dengan almond cream dan sliced almond renyah.",
    price: 35000,
    stock: 36,
    category: "Pastry",
    image:
      "https://images.unsplash.com/photo-1608198399987-35bbd9b47c85?w=600&q=80",
    sku: "PST-002",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "21",
    name: "Apple Pie",
    description:
      "Pie renyah dengan isian apel manis, kayu manis, dan karamel.",
    price: 40000,
    stock: 22,
    category: "Pastry",
    image:
      "https://images.unsplash.com/photo-1535920527002-b35e967229eb?w=600&q=80",
    sku: "PST-003",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "22",
    name: "Cinnamon Roll",
    description:
      "Roll kayu manis dengan glaze cream cheese, hangat dan harum.",
    price: 36000,
    stock: 32,
    category: "Pastry",
    image:
      "https://images.unsplash.com/photo-1607952200629-8e1f57227925?w=600&q=80",
    sku: "PST-004",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "23",
    name: "Palmier",
    description:
      "Pastry puff pastry caramelized, renyah dan manis pas.",
    price: 25000,
    stock: 44,
    category: "Pastry",
    image:
      "https://images.unsplash.com/photo-1558961363-fa8ccf8a03b9?w=600&q=80",
    sku: "PST-005",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "24",
    name: "Pain au Chocolat",
    description:
      "French pastry dengan dark chocolate baton di dalamnya.",
    price: 39000,
    stock: 30,
    category: "Pastry",
    image:
      "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=600&q=80",
    sku: "PST-006",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },

  // ── Cookies ──
  {
    id: "25",
    name: "Chocolate Chip Cookies",
    description:
      "Cookies klasik dengan chocolate chip Belgia, crispy di luar chewy di dalam.",
    price: 42000,
    stock: 50,
    category: "Cookies",
    image:
      "https://images.unsplash.com/photo-1499636136210-6f4ee915583e?w=600&q=80",
    sku: "COK-001",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "26",
    name: "Butter Cookies",
    description:
      "Cookies butter premium dengan tekstur melt-in-mouth.",
    price: 38000,
    stock: 55,
    category: "Cookies",
    image:
      "https://images.unsplash.com/photo-1558961363-fa8ccf8a03b9?w=600&q=80",
    sku: "COK-002",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "27",
    name: "Red Velvet Cookies",
    description:
      "Soft cookies red velvet dengan white chocolate chips.",
    price: 45000,
    stock: 40,
    category: "Cookies",
    image:
      "https://images.unsplash.com/photo-1610563166150-b67df1f640aa?w=600&q=80",
    sku: "COK-003",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "28",
    name: "Double Chocolate Cookies",
    description:
      "Rich chocolate cookies dengan dark & white chocolate chunks.",
    price: 48000,
    stock: 38,
    category: "Cookies",
    image:
      "https://images.unsplash.com/photo-1590080875515-8a3d0d9b252c?w=600&q=80",
    sku: "COK-004",
    rating: 5.0,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "29",
    name: "Matcha Cookies",
    description:
      "Cookies matcha Jepang premium dengan white chocolate.",
    price: 45000,
    stock: 35,
    category: "Cookies",
    image:
      "https://images.unsplash.com/photo-1558961363-fa8ccf8a03b9?w=600&q=80",
    sku: "COK-005",
    rating: 4.8,
    badge: "new",
    createdAt: TS,
    updatedAt: TU,
  },

  // ── Dessert ──
  {
    id: "30",
    name: "Chocolate Lava Cake",
    description:
      "Warm chocolate cake dengan molten center, disajikan dengan vanilla ice cream.",
    price: 55000,
    stock: 20,
    category: "Dessert",
    image:
      "https://images.unsplash.com/photo-1624353365286-3f8d62daad51?w=600&q=80",
    sku: "DES-002",
    rating: 5.0,
    badge: "limited",
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "31",
    name: "Panna Cotta",
    description:
      "Silky vanilla panna cotta dengan berry compote segar.",
    price: 42000,
    stock: 28,
    category: "Dessert",
    image:
      "https://images.unsplash.com/photo-1488477181946-6428a0291777?w=600&q=80",
    sku: "DES-003",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "32",
    name: "Tiramisu Cup",
    description:
      "Individual tiramisu cup dengan mascarpone cream dan espresso layer.",
    price: 48000,
    stock: 25,
    category: "Dessert",
    image:
      "https://images.unsplash.com/photo-1571877227200-a0d98ea607e9?w=600&q=80",
    sku: "DES-004",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "33",
    name: "Chocolate Mousse",
    description:
      "Light and airy dark chocolate mousse dengan whipped cream topping.",
    price: 46000,
    stock: 24,
    category: "Dessert",
    image:
      "https://images.unsplash.com/photo-1541783245831-57aa66f41b44?w=600&q=80",
    sku: "DES-005",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },

  // ── Coffee & Drink ──
  {
    id: "34",
    name: "Signature Chocolate",
    description:
      "Rich hot chocolate dengan Belgian cocoa dan fresh milk, signature HALF.",
    price: 38000,
    stock: 100,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&q=80",
    sku: "DRK-001",
    rating: 5.0,
    isCustomerFavorite: true,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "35",
    name: "Americano",
    description:
      "Double shot espresso dengan hot water, bold dan aromatic.",
    price: 28000,
    stock: 100,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?w=600&q=80",
    sku: "DRK-002",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "36",
    name: "Cafe Latte",
    description:
      "Espresso dengan steamed milk silky, smooth dan balanced.",
    price: 35000,
    stock: 100,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1461023058943-07fcbe16d930?w=600&q=80",
    sku: "DRK-003",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "37",
    name: "Cappuccino",
    description:
      "Classic cappuccino dengan thick milk foam dan cocoa dust.",
    price: 35000,
    stock: 100,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=600&q=80",
    sku: "DRK-004",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "38",
    name: "Caramel Latte",
    description:
      "Espresso latte dengan homemade caramel syrup yang manis pas.",
    price: 39000,
    stock: 100,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1485808191679-5f86510681a2?w=600&q=80",
    sku: "DRK-005",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "39",
    name: "Mocha Latte",
    description:
      "Espresso, chocolate, dan steamed milk dalam satu cup sempurna.",
    price: 40000,
    stock: 100,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1577962917304-cd874dcb3940?w=600&q=80",
    sku: "DRK-006",
    rating: 4.9,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "40",
    name: "Iced Chocolate",
    description:
      "Refreshing iced chocolate dengan fresh milk dan chocolate drizzle.",
    price: 36000,
    stock: 100,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1542990253-0d0f5be5f0ed?w=600&q=80",
    sku: "DRK-007",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "41",
    name: "Matcha Latte",
    description:
      "Premium Japanese matcha dengan steamed milk, earthy dan creamy.",
    price: 40000,
    stock: 100,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1515823064-df6fc404281a?w=600&q=80",
    sku: "DRK-008",
    rating: 4.8,
    badge: "new",
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "42",
    name: "Hazelnut Latte",
    description:
      "Espresso latte dengan hazelnut syrup, nutty dan aromatic.",
    price: 41000,
    stock: 100,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=600&q=80",
    sku: "DRK-009",
    rating: 4.8,
    badge: "new",
    createdAt: TS,
    updatedAt: TU,
  },
  {
    id: "43",
    name: "Mineral Water",
    description: "Air mineral kemasan botol 600ml, dingin dan segar.",
    price: 10000,
    stock: 200,
    category: "Coffee & Drink",
    image:
      "https://images.unsplash.com/photo-1548839140-29a7492991bd?w=600&q=80",
    sku: "DRK-010",
    rating: 4.8,
    createdAt: TS,
    updatedAt: TU,
  },
];

export const mockProducts: Product[] = _mockProducts.map((p) => ({
  ...p,
  image: getProductImage(p.name, p.category),
}));

export const mockOrders: Order[] = [
  {
    id: "ord-001",
    orderNumber: "INV-20260605-001",
    items: [
      {
        productId: "2",
        productName: "Belgian Chocolate Croissant",
        quantity: 3,
        price: 38000,
        subtotal: 114000,
      },
      {
        productId: "3",
        productName: "Choco Lava Bun",
        quantity: 2,
        price: 28000,
        subtotal: 56000,
      },
    ],
    subtotal: 170000,
    tax: 17000,
    discount: 0,
    total: 187000,
    paymentMethod: "cash",
    cashReceived: 200000,
    changeAmount: 13000,
    status: "completed",
    cashierId: "user-1",
    cashierName: "Admin HALF Bakery",
    createdAt: "2026-06-05T08:30:00Z",
  },
  {
    id: "ord-002",
    orderNumber: "INV-20260605-002",
    items: [
      {
        productId: "1",
        productName: "Chocolate Signature Cake",
        quantity: 1,
        price: 185000,
        subtotal: 185000,
      },
    ],
    subtotal: 185000,
    tax: 18500,
    discount: 37000,
    total: 166500,
    paymentMethod: "qris",
    status: "completed",
    cashierId: "user-1",
    cashierName: "Admin HALF Bakery",
    customerName: "Nur Aisyah",
    createdAt: "2026-06-05T09:15:00Z",
  },
  {
    id: "ord-003",
    orderNumber: "INV-20260605-003",
    items: [
      {
        productId: "34",
        productName: "Signature Chocolate",
        quantity: 2,
        price: 38000,
        subtotal: 76000,
      },
      {
        productId: "25",
        productName: "Chocolate Chip Cookies",
        quantity: 1,
        price: 42000,
        subtotal: 42000,
      },
    ],
    subtotal: 118000,
    tax: 11800,
    discount: 0,
    total: 129800,
    paymentMethod: "card",
    status: "completed",
    cashierId: "user-2",
    cashierName: "Kasir Demo",
    createdAt: "2026-06-05T10:00:00Z",
  },
  {
    id: "ord-004",
    orderNumber: "INV-20260605-004",
    items: [
      {
        productId: "5",
        productName: "Chocolate Brownies Premium",
        quantity: 2,
        price: 45000,
        subtotal: 90000,
      },
    ],
    subtotal: 90000,
    tax: 9000,
    discount: 0,
    total: 99000,
    paymentMethod: "cash",
    cashReceived: 100000,
    changeAmount: 1000,
    status: "pending",
    cashierId: "user-2",
    cashierName: "Kasir Demo",
    createdAt: "2026-06-05T11:30:00Z",
  },
];

export const mockAnalytics: AnalyticsData = {
  totalRevenue: 582300,
  totalOrders: 4,
  totalProducts: 43,
  averageOrderValue: 145575,
  revenueGrowth: 22.4,
  ordersGrowth: 15.8,
  // Nilai default; selalu ditimpa perhitungan realtime di /api/analytics.
  todaySales: 0,
  todayOrderCount: 0,
  todayItemsSold: 0,
  todayAverageSale: 0,
  salesByDay: [
    { date: "Sen", revenue: 320000, orders: 18 },
    { date: "Sel", revenue: 380000, orders: 22 },
    { date: "Rab", revenue: 350000, orders: 20 },
    { date: "Kam", revenue: 420000, orders: 26 },
    { date: "Jum", revenue: 480000, orders: 30 },
    { date: "Sab", revenue: 560000, orders: 38 },
    { date: "Min", revenue: 520000, orders: 34 },
  ],
  salesByCategory: [
    { category: "Cake", revenue: 890000, count: 32 },
    { category: "Bread", revenue: 620000, count: 68 },
    { category: "Pastry", revenue: 410000, count: 45 },
    { category: "Cookies", revenue: 280000, count: 38 },
    { category: "Dessert", revenue: 350000, count: 28 },
    { category: "Coffee & Drink", revenue: 480000, count: 95 },
  ],
  topProducts: [
    { name: "Chocolate Signature Cake", sold: 52, revenue: 9620000 },
    { name: "Belgian Chocolate Croissant", sold: 186, revenue: 7068000 },
    { name: "Signature Chocolate", sold: 142, revenue: 5396000 },
    { name: "Choco Lava Bun", sold: 168, revenue: 4704000 },
    { name: "Chocolate Brownies Premium", sold: 98, revenue: 4410000 },
  ],
};

export const mockUsers = [
  {
    id: "user-1",
    name: "Admin HALF Bakery",
    username: "admin",
    email: "admin@halfpos.com",
    phone: "081234567001",
    password: "admin123",
    role: "admin" as const,
    status: "active" as const,
    createdAt: "2026-01-10T08:00:00Z",
    lastLogin: "2026-06-29T01:00:00Z",
  },
  {
    id: "user-2",
    name: "Kasir Demo",
    username: "kasir",
    email: "kasir@halfpos.com",
    phone: "081234567002",
    password: "kasir123",
    role: "cashier" as const,
    status: "active" as const,
    createdAt: "2026-02-15T08:00:00Z",
    lastLogin: "2026-06-28T09:30:00Z",
  },
  {
    id: "user-3",
    name: "Finance Demo",
    username: "finance",
    email: "finance@halfpos.com",
    phone: "081234567003",
    password: "finance123",
    role: "finance" as const,
    status: "active" as const,
    createdAt: "2026-03-01T08:00:00Z",
    lastLogin: "2026-06-27T14:00:00Z",
  },
];
