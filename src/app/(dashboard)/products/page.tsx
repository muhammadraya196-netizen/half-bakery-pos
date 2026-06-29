"use client";

import { useEffect, useMemo, useState } from "react";
import { Plus, Search, AlertCircle, PackageX, RotateCw } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProductTable } from "@/components/products/product-table";
import { ProductForm } from "@/components/products/product-form";
import { ProductFilters } from "@/components/products/product-filters";
import { ProductPagination } from "@/components/products/product-pagination";
import {
  useProductsPaginated,
  useCreateProduct,
  useUpdateProduct,
  useDeleteProduct,
} from "@/hooks/use-products";
import { useDebounce } from "@/hooks/use-debounce";
import { cn } from "@/lib/utils";
import type { Product, ProductStatus, ProductQuery } from "@/types";
import type { ProductFormData } from "@/lib/validations/product";

const DEFAULT_LIMIT = 10;

export default function ProductsPage() {
  // ── Filter & pagination state ──
  const [searchInput, setSearchInput] = useState("");
  const [category, setCategory] = useState("all");
  const [status, setStatus] = useState<ProductStatus>("all");
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [page, setPage] = useState(1);

  // Debounce search (400ms) agar request tidak dikirim tiap ketukan.
  const debouncedSearch = useDebounce(searchInput, 400);

  // Reset ke halaman 1 ketika filter / search / limit berubah.
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, category, status, limit]);

  // offset = (currentPage - 1) × limit
  const offset = (page - 1) * limit;

  const query: ProductQuery = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      category,
      status,
      limit,
      offset,
    }),
    [debouncedSearch, category, status, limit, offset]
  );

  const {
    data,
    isLoading,
    isError,
    error,
    isFetching,
    isPlaceholderData,
    refetch,
  } = useProductsPaginated(query);

  const products = data?.data ?? [];
  const total = data?.total ?? 0;

  // ── Dialog / CRUD state ──
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();

  const handleCreate = () => {
    setEditingProduct(null);
    setDialogOpen(true);
  };

  const handleEdit = (product: Product) => {
    setEditingProduct(product);
    setDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm("Yakin ingin menghapus produk ini?")) {
      await deleteProduct.mutateAsync(id);
    }
  };

  const handleSubmit = async (formData: ProductFormData) => {
    if (editingProduct) {
      await updateProduct.mutateAsync({ id: editingProduct.id, data: formData });
    } else {
      await createProduct.mutateAsync(formData);
    }
    setDialogOpen(false);
    setEditingProduct(null);
  };

  const showEmpty = !isLoading && !isError && products.length === 0;

  return (
    <>
      <Header title="Produk" description="Kelola katalog produk Anda" />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <CardTitle>Daftar Produk</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari produk..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-64 pl-9"
                  />
                </div>
                <Button onClick={handleCreate}>
                  <Plus className="h-4 w-4 mr-2" />
                  Tambah Produk
                </Button>
              </div>
            </div>

            <ProductFilters
              category={category}
              status={status}
              limit={limit}
              onCategoryChange={setCategory}
              onStatusChange={setStatus}
              onLimitChange={setLimit}
            />
          </CardHeader>

          <CardContent className="space-y-4">
            {isError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <AlertCircle className="h-10 w-10 text-destructive" />
                <div>
                  <p className="font-medium">Gagal memuat data produk</p>
                  <p className="text-sm text-muted-foreground">
                    {error instanceof Error
                      ? error.message
                      : "Terjadi kesalahan tak terduga."}
                  </p>
                </div>
                <Button variant="outline" onClick={() => refetch()}>
                  <RotateCw className="h-4 w-4 mr-2" />
                  Coba Lagi
                </Button>
              </div>
            ) : showEmpty ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <PackageX className="h-10 w-10 text-muted-foreground" />
                <div>
                  <p className="font-medium">Produk tidak ditemukan</p>
                  <p className="text-sm text-muted-foreground">
                    Coba ubah kata kunci pencarian atau filter yang dipilih.
                  </p>
                </div>
              </div>
            ) : (
              <>
                {/* Pertahankan data lama saat fetch halaman baru (tidak berkedip) */}
                <div
                  className={cn(
                    "transition-opacity duration-200",
                    isPlaceholderData && isFetching && "opacity-60"
                  )}
                >
                  <ProductTable
                    products={products}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    isLoading={isLoading}
                  />
                </div>

                {!isLoading && total > 0 && (
                  <ProductPagination
                    total={total}
                    limit={limit}
                    offset={offset}
                    currentPage={page}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? "Edit Produk" : "Tambah Produk Baru"}
            </DialogTitle>
          </DialogHeader>
          <ProductForm
            product={editingProduct || undefined}
            onSubmit={handleSubmit}
            onCancel={() => setDialogOpen(false)}
            isLoading={createProduct.isPending || updateProduct.isPending}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
