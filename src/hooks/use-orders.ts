import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { Order } from "@/types";

export function useOrders(status?: string) {
  const query = status && status !== "all" ? `?status=${status}` : "";
  return useQuery({
    queryKey: ["orders", status],
    queryFn: () => api.get<Order[]>(`/api/orders${query}`),
  });
}

export function useCreateOrder() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: Omit<Order, "id" | "orderNumber" | "createdAt" | "status">) =>
      api.post<Order>("/api/orders", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["orders"] });
      queryClient.invalidateQueries({ queryKey: ["analytics"] });
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}
