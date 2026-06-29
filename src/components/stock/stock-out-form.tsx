"use client";

import { useMemo, useState } from "react";
import { Save, RotateCcw, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useProducts } from "@/hooks/use-products";
import { useCreateStockMovement } from "@/hooks/use-stock";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/toast-store";
import { STOCK_OUT_REASONS } from "@/lib/stock-data";
import { formatDate } from "@/lib/utils";
import type { StockOutReason } from "@/types";

interface StockOutFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const EMPTY = {
  productId: "",
  quantity: "",
  reason: "Penjualan" as StockOutReason,
  note: "",
};

export function StockOutForm({ onCancel, onSuccess }: StockOutFormProps) {
  const { data: products } = useProducts();
  const user = useSessionStore((s) => s.user);
  const createMovement = useCreateStockMovement();

  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = useMemo(
    () => products?.find((p) => p.id === form.productId),
    [products, form.productId]
  );
  const availableStock = selectedProduct?.stock ?? 0;
  const quantity = Number(form.quantity) || 0;

  const setField = (key: keyof typeof EMPTY, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.productId) next.productId = "Produk wajib dipilih";
    if (quantity <= 0) next.quantity = "Jumlah harus lebih dari 0";
    else if (quantity > availableStock)
      next.quantity = `Stok tidak mencukupi. Stok tersedia: ${availableStock}`;
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const handleReset = () => {
    setForm({ ...EMPTY });
    setErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate() || !user) return;

    try {
      await createMovement.mutateAsync({
        type: "out",
        productId: form.productId,
        quantity,
        reason: form.reason,
        note: form.note || undefined,
        officerId: user.id,
        officerName: user.name,
      });
      toast.success(
        "Stok keluar tersimpan",
        `${quantity} ${selectedProduct?.name ?? ""} dikeluarkan (${form.reason}).`
      );
      handleReset();
      onSuccess?.();
    } catch (err) {
      toast.error(
        "Gagal menyimpan",
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label className="text-xs">Nomor Transaksi</Label>
          <Input value="(otomatis saat disimpan)" disabled className="text-sm" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs">Tanggal</Label>
          <Input value={formatDate(new Date())} disabled className="text-sm" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Produk *</Label>
          <Select value={form.productId} onValueChange={(v) => setField("productId", v)}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Pilih produk" />
            </SelectTrigger>
            <SelectContent>
              {(products ?? []).map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name} (stok: {p.stock})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.productId && (
            <p className="text-xs text-destructive">{errors.productId}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Stok Tersedia</Label>
          <Input value={String(availableStock)} disabled className="text-sm" />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Jumlah Keluar *</Label>
          <Input
            type="number"
            min={1}
            max={availableStock || undefined}
            value={form.quantity}
            onChange={(e) => setField("quantity", e.target.value)}
            placeholder="0"
            className="text-sm"
          />
          {errors.quantity && (
            <p className="text-xs text-destructive">{errors.quantity}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Alasan *</Label>
          <Select
            value={form.reason}
            onValueChange={(v) => setField("reason", v as StockOutReason)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STOCK_OUT_REASONS.map((r) => (
                <SelectItem key={r} value={r}>
                  {r}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Petugas Input</Label>
          <Input value={user?.name ?? ""} disabled className="text-sm" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Keterangan</Label>
          <Input
            value={form.note}
            onChange={(e) => setField("note", e.target.value)}
            placeholder="Opsional"
            className="text-sm"
          />
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={createMovement.isPending}>
          <Save className="h-4 w-4 mr-1.5" />
          {createMovement.isPending ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reset
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            <X className="h-4 w-4 mr-1.5" />
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
