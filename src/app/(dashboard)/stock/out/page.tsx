"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockOutForm } from "@/components/stock/stock-out-form";

export default function StockOutPage() {
  const router = useRouter();

  useEffect(() => {
    const prev = document.title;
    document.title = "Stok Keluar | HALF Bakery POS";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <>
      <Header title="Stok Keluar" description="Catat pengurangan stok (rusak, retur, dll.)" />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Form Stok Keluar</CardTitle>
          </CardHeader>
          <CardContent>
            <StockOutForm
              onCancel={() => router.push("/stock")}
              onSuccess={() => router.push("/stock/history")}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
