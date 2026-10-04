"use client";

import { useMemo, useState } from "react";
import { Loader2 } from "lucide-react";
import { SectionHeading } from "@/components/bakery/section-heading";
import { ProductCard } from "@/components/bakery/product-card";
import { MotionWrapper } from "@/components/bakery/motion";
import { ProductPagination } from "@/components/products/product-pagination";
import { BAKERY_CATEGORIES } from "@/lib/bakery-data";
import { useProductsPaginated } from "@/hooks/use-products";
import { cn } from "@/lib/utils";

const PAGE_SIZE = 8;

export function MenuSection() {
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [page, setPage] = useState(1);
  const offset = (page - 1) * PAGE_SIZE;

  const query = useMemo(
    () => ({
      category: activeCategory !== "All" ? activeCategory : "all",
      limit: PAGE_SIZE,
      offset,
    }),
    [activeCategory, offset]
  );

  const { data, isLoading, isFetching, isPlaceholderData } =
    useProductsPaginated(query);
  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  const categories = ["All", ...BAKERY_CATEGORIES];

  const selectCategory = (category: string) => {
    setActiveCategory(category);
    setPage(1);
  };

  return (
    <section id="menu" className="py-20 md:py-28 bg-cream/50">
      <div className="container mx-auto px-4 md:px-6">
        <MotionWrapper>
          <SectionHeading
            subtitle="Our Menu"
            title="Koleksi Favorit Kami"
            description="Pilih dari cake premium, roti artisan, pastry, cookies, dessert, dan coffee & drink — dibuat fresh setiap hari."
          />
        </MotionWrapper>

        <MotionWrapper delay={0.1}>
          <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-10 md:mb-14">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => selectCategory(cat)}
                className={cn(
                  "px-4 md:px-6 py-2 md:py-2.5 rounded-full text-sm font-medium transition-all duration-300",
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground shadow-bakery scale-105"
                    : "bg-white text-bakery-dark/70 hover:bg-accent hover:text-primary border border-border"
                )}
              >
                {cat}
              </button>
            ))}
          </div>
        </MotionWrapper>

        {isLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Tidak ada produk dalam kategori ini.
          </p>
        ) : (
          <div
            className={cn(
              "transition-opacity duration-200",
              isPlaceholderData && isFetching && "opacity-60"
            )}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {products.map((product, i) => (
                <ProductCard key={product.id} product={product} index={i} />
              ))}
            </div>
            {total > PAGE_SIZE && (
              <div className="mt-10 md:mt-14">
                <ProductPagination
                  total={total}
                  limit={PAGE_SIZE}
                  offset={offset}
                  currentPage={page}
                  onPageChange={setPage}
                />
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
