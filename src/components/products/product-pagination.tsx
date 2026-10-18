"use client";

import { useMemo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ProductPaginationProps {
  total: number;
  limit: number;
  offset: number;
  /** Halaman aktif (1-based) */
  currentPage: number;
  onPageChange: (page: number) => void;
  /** Kata untuk teks rentang. Default mengikuti daftar produk. */
  itemLabel?: string;
}

/** Buat deretan nomor halaman ringkas dengan elipsis (mis. 1 … 4 5 6 … 20). */
function buildPageList(current: number, totalPages: number): (number | "...")[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }
  const pages: (number | "...")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(totalPages - 1, current + 1);

  if (start > 2) pages.push("...");
  for (let p = start; p <= end; p++) pages.push(p);
  if (end < totalPages - 1) pages.push("...");
  pages.push(totalPages);

  return pages;
}

export function ProductPagination({
  total,
  limit,
  offset,
  currentPage,
  onPageChange,
  itemLabel = "produk",
}: ProductPaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / limit));

  const pages = useMemo(
    () => buildPageList(currentPage, totalPages),
    [currentPage, totalPages]
  );

  // Informasi rentang data: "Menampilkan 1–10 dari 156 produk."
  const from = total === 0 ? 0 : offset + 1;
  const to = Math.min(offset + limit, total);

  const canPrev = currentPage > 1;
  const canNext = currentPage < totalPages;

  return (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-muted-foreground">
        Menampilkan <span className="font-medium text-foreground">{from}</span>–
        <span className="font-medium text-foreground">{to}</span> dari{" "}
        <span className="font-medium text-foreground">{total}</span> {itemLabel}
      </p>

      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!canPrev}
        >
          <ChevronLeft className="h-4 w-4" />
          Previous
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {pages.map((page, i) =>
            page === "..." ? (
              <span
                key={`ellipsis-${i}`}
                className="px-2 text-sm text-muted-foreground"
              >
                …
              </span>
            ) : (
              <Button
                key={page}
                variant={page === currentPage ? "default" : "outline"}
                size="icon"
                className={cn("h-9 w-9", page === currentPage && "pointer-events-none")}
                onClick={() => onPageChange(page)}
              >
                {page}
              </Button>
            )
          )}
        </div>

        <span className="sm:hidden px-2 text-sm text-muted-foreground">
          Hal. {currentPage}/{totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!canNext}
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
