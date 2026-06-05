import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import type { AnalyticsData } from "@/types";

export function useAnalytics() {
  return useQuery({
    queryKey: ["analytics"],
    queryFn: () => api.get<AnalyticsData>("/api/analytics"),
    refetchInterval: 30000,
  });
}
