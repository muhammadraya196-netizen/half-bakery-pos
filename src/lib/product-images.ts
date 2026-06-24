import type { BakeryCategory } from "@/lib/bakery-data";

/** Verified Unsplash CDN URL builder */
export function unsplashImage(photoId: string, width = 800): string {
  return `https://images.unsplash.com/photo-${photoId}?auto=format&fit=crop&w=${width}&q=80`;
}

export const FALLBACK_PRODUCT_IMAGE = unsplashImage(
  "1509440159596-0249088772ff"
);

/**
 * Product-name → verified Unsplash image mapping.
 * All photo IDs validated via HTTP 200 + image/* content-type.
 */
export const PRODUCT_IMAGES: Record<string, string> = {
  // ── Best sellers & cakes ──
  "Chocolate Signature Cake": unsplashImage(
    "1737700087822-0dfbb754db30"
  ),
  "Red Velvet Cake": unsplashImage("1779885580435-949062b1abb3"),
  "Black Forest Cake": unsplashImage("1565958011703-44f9829ba187"),
  "Tiramisu Cake": unsplashImage("1571877227200-a0d98ea607e9"),
  "Cheesecake New York": unsplashImage("1773620496695-73c2086abf39"),
  "Strawberry Shortcake": unsplashImage("1464349095431-e9a21285b5f3"),
  "Opera Cake": unsplashImage("1563729784474-d77dbb933a9e"),
  "Matcha Cake": unsplashImage("1563805042-7684c019e1cb"),

  // ── Bread ──
  "Belgian Chocolate Croissant": unsplashImage(
    "1778399980486-5262c74e5f2c"
  ),
  "Choco Lava Bun": unsplashImage("1509365465985-25d11c17e812"),
  "Butter Croissant": unsplashImage("1555507036-ab1f4038808a"),
  "Garlic Cheese Bread": unsplashImage("1769521001298-f0415c53e013"),
  "Soft Milk Bread": unsplashImage("1549931319-a545dcf3bc73"),
  "Chocolate Bun": unsplashImage("1629856428041-6f9721807b05"),
  "Sausage Bread": unsplashImage("1743075219808-31859b947efb"),
  "Japanese Milk Bread": unsplashImage("1509440159596-0249088772ff"),
  "Sweet Corn Bread": unsplashImage("1586444248902-2f64eddc13df"),

  // ── Pastry ──
  "Chocolate Danish": unsplashImage("1764606469903-358043a5dd7b"),
  "Almond Danish": unsplashImage("1710220988376-16dbd51fd1de"),
  "Apple Pie": unsplashImage("1535920527002-b35e96722eb9"),
  "Cinnamon Roll": unsplashImage("1558909552-8fcf7c94b575"),
  "Palmier": unsplashImage("1666114265205-394e9d5848c6"),
  "Pain au Chocolat": unsplashImage("1606890737304-57a1ca8a5b62"),

  // ── Cookies ──
  "Chocolate Chip Cookies": unsplashImage(
    "1499636136210-6f4ee915583e"
  ),
  "Butter Cookies": unsplashImage("1611832567101-5bb2c63828ff"),
  "Red Velvet Cookies": unsplashImage("1714386148315-2f0e3eebcd5a"),
  "Double Chocolate Cookies": unsplashImage(
    "1636743715220-d8f8dd900b87"
  ),
  "Matcha Cookies": unsplashImage("1563805042-7684c019e1cb"),

  // ── Dessert ──
  "Chocolate Brownies Premium": unsplashImage(
    "1777647362214-ae62d7d4a707"
  ),
  "Chocolate Lava Cake": unsplashImage("1624353365286-3f8d62daad51"),
  "Panna Cotta": unsplashImage("1488477181946-6428a0291777"),
  "Tiramisu Cup": unsplashImage("1695088957420-c3b97d1f1138"),
  "Chocolate Mousse": unsplashImage("1744988870979-43fcbfdd0804"),

  // ── Coffee & drink ──
  "Signature Chocolate": unsplashImage("1542990253-0d0f5be5f0ed"),
  "Americano": unsplashImage("1514432324607-a09d9b4aefdd"),
  "Cafe Latte": unsplashImage("1495474472287-4d71bcdd2085"),
  "Cappuccino": unsplashImage("1572442388796-11668a67e53d"),
  "Caramel Latte": unsplashImage("1485808191679-5f86510681a2"),
  "Mocha Latte": unsplashImage("1736840334919-aac2d5af73e4"),
  "Iced Chocolate": unsplashImage("1774873394237-aef55aa0fc5c"),
  "Matcha Latte": unsplashImage("1544787219-7f47ccb76574"),
  "Hazelnut Latte": unsplashImage("1485808191679-5f86510681a2"),
  "Mineral Water": unsplashImage("1561041695-d2fadf9f318c"),
};

export const CATEGORY_FALLBACK_IMAGES: Record<BakeryCategory, string> = {
  Cake: unsplashImage("1737700087822-0dfbb754db30"),
  Bread: unsplashImage("1509440159596-0249088772ff"),
  Pastry: unsplashImage("1764606469903-358043a5dd7b"),
  Cookies: unsplashImage("1499636136210-6f4ee915583e"),
  Dessert: unsplashImage("1777647362214-ae62d7d4a707"),
  "Coffee & Drink": unsplashImage("1495474472287-4d71bcdd2085"),
};

export function getProductImage(
  productName: string,
  category?: string
): string {
  if (PRODUCT_IMAGES[productName]) {
    return PRODUCT_IMAGES[productName];
  }
  if (category && category in CATEGORY_FALLBACK_IMAGES) {
    return CATEGORY_FALLBACK_IMAGES[category as BakeryCategory];
  }
  return FALLBACK_PRODUCT_IMAGE;
}

export function resolveProductImage(
  image: string | undefined | null,
  productName: string,
  category?: string
): string {
  if (image && image.trim().length > 0) {
    return image;
  }
  return getProductImage(productName, category);
}
