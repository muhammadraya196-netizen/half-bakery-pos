"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { PromoAutoApply } from "@/components/pos/promo-auto-apply";
import { PromoBanner } from "@/components/pos/promo-banner";
import { ProductPagination } from "@/components/products/product-pagination";
import { useProducts, useProductsPaginated } from "@/hooks/use-products";
import { CATEGORIES, PROMO_BUNDLING_PRODUCTS } from "@/lib/mock-data";
import { availableBundleSets } from "@/lib/promo/bundling";
import { useCartStore } from "@/stores/cart-store";
import { cn } from "@/lib/utils";
import type { Product } from "@/types";

const PAGE_SIZE = 10;

const PROMO_BUNDLING_FILTER = "promo-bundling";

function matchesBundleSearch(product: Product, search: string): boolean {
  const query = search.trim().toLowerCase();
  if (!query) return true;
  const haystack = [
    product.name,
    product.description,
    product.sku,
    product.promoLabel,
    ...(product.bundleItems ?? []),
  ]
    .join(" ")
    .toLowerCase();
  return haystack.includes(query);
}

export default function POSPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(1);
  const isPromoBundling = category === PROMO_BUNDLING_FILTER;
  const offset = (page - 1) * PAGE_SIZE;

  const query = useMemo(
    () => ({
      category:
        !isPromoBundling && category !== "all" ? category : undefined,
      search: !isPromoBundling && search ? search : undefined,
      limit: PAGE_SIZE,
      offset: isPromoBundling ? 0 : offset,
    }),
    [isPromoBundling, category, search, offset]
  );

  const { data, isLoading, isFetching, isPlaceholderData } =
    useProductsPaginated(query);
  const { data: catalog, isLoading: catalogLoading } = useProducts();
  const cartItems = useCartStore((state) => state.items);
  const syncItemStock = useCartStore((state) => state.syncItemStock);

  const bundleMatches = PROMO_BUNDLING_PRODUCTS.filter((product) =>
    matchesBundleSearch(product, search)
  ).map((bundle) => ({
    ...bundle,
    stock: availableBundleSets(bundle, catalog ?? [], cartItems),
  }));

  useEffect(() => {
    if (catalogLoading || !catalog) return;
    for (const bundle of PROMO_BUNDLING_PRODUCTS) {
      const line = cartItems.find((item) => item.product.id === bundle.id);
      if (!line) continue;
      const stock = availableBundleSets(bundle, catalog, cartItems);
      if (line.product.stock !== stock || line.quantity > stock) {
        syncItemStock(bundle.id, stock);
      }
    }
  }, [catalog, catalogLoading, cartItems, syncItemStock]);
  const visibleProducts = isPromoBundling
    ? bundleMatches.slice(offset, offset + PAGE_SIZE)
    : (data?.data ?? []);
  const total = isPromoBundling ? bundleMatches.length : (data?.total ?? 0);

  const selectCategory = (next: string) => {
    setCategory(next);
    setPage(1);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  return (
    <>
      <Header title="Kasir (POS)" description="Proses transaksi penjualan" />
      <Suspense fallback={null}>
        <PromoAutoApply />
      </Suspense>
      <div className="flex h-[calc(100vh-4rem)] min-h-0 flex-col overflow-hidden lg:flex-row">
        <div className="flex-1 overflow-auto p-4 space-y-4 min-h-0">
          <PromoBanner />
          <form onSubmit={handleSearch} className="flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Cari produk, SKU, atau kategori..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button type="submit" variant="secondary">
              Cari
            </Button>
          </form>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => selectCategory("all")}
            >
              Semua
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => selectCategory(cat)}
                className={cn(category === cat && "bg-primary")}
              >
                {cat}
              </Button>
            ))}
            <Button
              variant={isPromoBundling ? "default" : "outline"}
              size="sm"
              onClick={() => selectCategory(PROMO_BUNDLING_FILTER)}
              className={cn(isPromoBundling && "bg-primary")}
            >
              Promo Bundling
            </Button>
          </div>

          <div
            className={cn(
              "space-y-4 transition-opacity duration-200",
              !isPromoBundling && isPlaceholderData && isFetching && "opacity-60"
            )}
          >
            <ProductGrid
              products={visibleProducts}
              isLoading={isPromoBundling ? catalogLoading : isLoading}
              emptyTitle={
                isPromoBundling
                  ? "Tidak ada promo bundling tersedia."
                  : undefined
              }
              emptyDescription={isPromoBundling ? "" : undefined}
            />
            {total > PAGE_SIZE && (
              <ProductPagination
                total={total}
                limit={PAGE_SIZE}
                offset={offset}
                currentPage={page}
                onPageChange={setPage}
              />
            )}
          </div>
        </div>

        <div className="flex h-[min(58vh,100%)] min-h-0 w-full shrink-0 flex-col overflow-hidden border-t bg-muted/30 p-4 lg:h-full lg:w-[26rem] lg:border-l lg:border-t-0 xl:w-96">
          <CartPanel />
        </div>
      </div>
    </>
  );
}
