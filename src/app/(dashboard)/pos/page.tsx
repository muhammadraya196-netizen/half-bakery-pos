"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ProductGrid } from "@/components/pos/product-grid";
import { CartPanel } from "@/components/pos/cart-panel";
import { useProducts } from "@/hooks/use-products";
import { CATEGORIES } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export default function POSPage() {
  const [category, setCategory] = useState("all");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");

  const { data: products, isLoading } = useProducts({
    category: category !== "all" ? category : undefined,
    search: search || undefined,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearch(searchInput);
  };

  return (
    <>
      <Header title="Kasir (POS)" description="Proses transaksi penjualan" />
      <div className="flex h-[calc(100vh-4rem)]">
        <div className="flex-1 overflow-auto p-4 space-y-4">
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
              onClick={() => setCategory("all")}
            >
              Semua
            </Button>
            {CATEGORIES.map((cat) => (
              <Button
                key={cat}
                variant={category === cat ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(cat)}
                className={cn(category === cat && "bg-primary")}
              >
                {cat}
              </Button>
            ))}
          </div>

          <ProductGrid products={products || []} isLoading={isLoading} />
        </div>

        <div className="w-96 border-l bg-muted/30 p-4">
          <CartPanel />
        </div>
      </div>
    </>
  );
}
