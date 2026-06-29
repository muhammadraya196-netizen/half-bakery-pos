import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { api } from "@/lib/api";
import { productApi } from "@/lib/api/product-api";
import type { Product, ProductQuery, PaginatedResponse } from "@/types";
import type { ProductFormData } from "@/lib/validations/product";

/** List penuh (array). Dipakai POS & menu — perilaku lama dipertahankan. */
export function useProducts(params?: { category?: string; search?: string }) {
  return useQuery({
    queryKey: ["products", "list", params ?? {}],
    queryFn: () => productApi.list(params ?? {}),
  });
}

/**
 * List produk paginasi (backend filter + limit + offset).
 * Query key mencakup seluruh parameter agar refetch saat apa pun berubah.
 * `keepPreviousData` menjaga data lama tampil saat berpindah halaman (tanpa berkedip).
 */
export function useProductsPaginated(query: ProductQuery) {
  return useQuery<PaginatedResponse<Product>>({
    queryKey: ["products", "paginated", query],
    queryFn: () => productApi.paginated(query),
    placeholderData: keepPreviousData,
  });
}

export function useCreateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductFormData) => api.post<Product>("/api/products", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}

export function useUpdateProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<ProductFormData> }) =>
      api.put<Product>(`/api/products/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

export function useDeleteProduct() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => api.delete(`/api/products/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
    },
  });
}
