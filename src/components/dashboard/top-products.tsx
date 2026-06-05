"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import type { AnalyticsData } from "@/types";

interface TopProductsProps {
  products: AnalyticsData["topProducts"];
}

export function TopProducts({ products }: TopProductsProps) {
  const maxRevenue = Math.max(...products.map((p) => p.revenue));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Produk Terlaris</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {products.map((product, index) => (
            <div key={product.name} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                    {index + 1}
                  </span>
                  <span className="font-medium">{product.name}</span>
                </div>
                <span className="text-muted-foreground">{product.sold} terjual</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-2 flex-1 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${(product.revenue / maxRevenue) * 100}%` }}
                  />
                </div>
                <span className="text-xs font-medium w-24 text-right">
                  {formatCurrency(product.revenue)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
