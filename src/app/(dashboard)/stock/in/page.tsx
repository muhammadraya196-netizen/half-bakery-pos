"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StockInForm } from "@/components/stock/stock-in-form";

export default function StockInPage() {
  const router = useRouter();

  useEffect(() => {
    const prev = document.title;
    document.title = "Stok Masuk | HALF Bakery POS";
    return () => {
      document.title = prev;
    };
  }, []);

  return (
    <>
      <Header title="Stok Masuk" description="Catat penerimaan stok dari supplier" />
      <div className="p-6">
        <Card className="max-w-3xl">
          <CardHeader>
            <CardTitle>Form Stok Masuk</CardTitle>
          </CardHeader>
          <CardContent>
            <StockInForm
              onCancel={() => router.push("/stock")}
              onSuccess={() => router.push("/stock/history")}
            />
          </CardContent>
        </Card>
      </div>
    </>
  );
}
