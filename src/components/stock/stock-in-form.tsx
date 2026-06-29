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
import { useProducts, } from "@/hooks/use-products";
import { useCreateStockMovement } from "@/hooks/use-stock";
import { useSessionStore } from "@/stores/session-store";
import { toast } from "@/stores/toast-store";
import { SUPPLIERS, STOCK_UNITS } from "@/lib/stock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface StockInFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

const EMPTY = {
  supplier: "",
  productId: "",
  quantity: "",
  unit: "pcs",
  purchasePrice: "",
  note: "",
};

export function StockInForm({ onCancel, onSuccess }: StockInFormProps) {
  const { data: products } = useProducts();
  const user = useSessionStore((s) => s.user);
  const createMovement = useCreateStockMovement();

  const [form, setForm] = useState({ ...EMPTY });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const selectedProduct = useMemo(
    () => products?.find((p) => p.id === form.productId),
    [products, form.productId]
  );

  const quantity = Number(form.quantity) || 0;
  const purchasePrice = Number(form.purchasePrice) || 0;
  const totalPrice = quantity * purchasePrice;

  const setField = (key: keyof typeof EMPTY, value: string) => {
    setForm((f) => ({ ...f, [key]: value }));
    setErrors((e) => ({ ...e, [key]: "" }));
  };

  const validate = () => {
    const next: Record<string, string> = {};
    if (!form.supplier) next.supplier = "Supplier wajib dipilih";
    if (!form.productId) next.productId = "Produk wajib dipilih";
    if (quantity <= 0) next.quantity = "Jumlah harus lebih dari 0";
    if (purchasePrice < 0) next.purchasePrice = "Harga beli tidak boleh negatif";
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
        type: "in",
        productId: form.productId,
        supplier: form.supplier,
        unit: form.unit,
        quantity,
        purchasePrice,
        note: form.note || undefined,
        officerId: user.id,
        officerName: user.name,
      });
      toast.success(
        "Stok masuk tersimpan",
        `${quantity} ${form.unit} ${selectedProduct?.name ?? ""} berhasil ditambahkan.`
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
          <Label className="text-xs">Supplier *</Label>
          <Select value={form.supplier} onValueChange={(v) => setField("supplier", v)}>
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Pilih supplier" />
            </SelectTrigger>
            <SelectContent>
              {SUPPLIERS.map((s) => (
                <SelectItem key={s} value={s}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.supplier && (
            <p className="text-xs text-destructive">{errors.supplier}</p>
          )}
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
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {errors.productId && (
            <p className="text-xs text-destructive">{errors.productId}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Kategori</Label>
          <Input
            value={selectedProduct?.category ?? ""}
            disabled
            placeholder="Otomatis dari produk"
            className="text-sm"
          />
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Jumlah Masuk *</Label>
          <Input
            type="number"
            min={1}
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
          <Label className="text-xs">Satuan</Label>
          <Select value={form.unit} onValueChange={(v) => setField("unit", v)}>
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STOCK_UNITS.map((u) => (
                <SelectItem key={u} value={u}>
                  {u}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Harga Beli (per satuan)</Label>
          <Input
            type="number"
            min={0}
            value={form.purchasePrice}
            onChange={(e) => setField("purchasePrice", e.target.value)}
            placeholder="0"
            className="text-sm"
          />
          {errors.purchasePrice && (
            <p className="text-xs text-destructive">{errors.purchasePrice}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Total Harga</Label>
          <Input value={formatCurrency(totalPrice)} disabled className="text-sm font-semibold" />
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
