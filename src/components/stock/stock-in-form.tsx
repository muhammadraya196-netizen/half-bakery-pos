"use client";

import { useState } from "react";
import { Plus, RotateCcw, Save, Trash2, X } from "lucide-react";
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
import { SUPPLIERS, STOCK_UNITS } from "@/lib/stock-data";
import { formatCurrency, formatDate } from "@/lib/utils";

interface StockInFormProps {
  onCancel?: () => void;
  onSuccess?: () => void;
}

interface StockInRow {
  id: string;
  productId: string;
  quantity: string;
  unit: string;
  purchasePrice: string;
}

interface RowErrors {
  productId?: string;
  quantity?: string;
  purchasePrice?: string;
}

const EMPTY_HEADER = {
  supplier: "",
  note: "",
};

let rowSeq = 0;

function createRow(): StockInRow {
  rowSeq += 1;
  return {
    id: `in-${rowSeq}`,
    productId: "",
    quantity: "",
    unit: "pcs",
    purchasePrice: "",
  };
}

function parseAmount(value: string): number {
  if (value.trim() === "") return 0;
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

export function StockInForm({ onCancel, onSuccess }: StockInFormProps) {
  const { data: products } = useProducts();
  const user = useSessionStore((s) => s.user);
  const createMovement = useCreateStockMovement();

  const [header, setHeader] = useState({ ...EMPTY_HEADER });
  const [rows, setRows] = useState<StockInRow[]>(() => [createRow()]);
  const [headerErrors, setHeaderErrors] = useState<Record<string, string>>({});
  const [rowErrors, setRowErrors] = useState<Record<string, RowErrors>>({});
  const [saving, setSaving] = useState(false);

  const setHeaderField = (key: keyof typeof EMPTY_HEADER, value: string) => {
    setHeader((current) => ({ ...current, [key]: value }));
    setHeaderErrors((current) => ({ ...current, [key]: "" }));
  };

  const updateRow = (id: string, patch: Partial<StockInRow>) => {
    setRows((current) =>
      current.map((row) => (row.id === id ? { ...row, ...patch } : row))
    );
    setRowErrors((current) => ({ ...current, [id]: {} }));
  };

  const addRow = () => {
    setRows((current) => [...current, createRow()]);
  };

  const removeRow = (id: string) => {
    setRows((current) =>
      current.length <= 1 ? current : current.filter((row) => row.id !== id)
    );
    setRowErrors((current) => {
      const next = { ...current };
      delete next[id];
      return next;
    });
  };

  const validate = () => {
    const nextHeader: Record<string, string> = {};
    const nextRows: Record<string, RowErrors> = {};

    if (!header.supplier) nextHeader.supplier = "Supplier wajib dipilih";

    for (const row of rows) {
      const errors: RowErrors = {};
      const quantity = parseAmount(row.quantity);
      const purchasePrice = parseAmount(row.purchasePrice);

      if (!row.productId) errors.productId = "Produk wajib dipilih";
      if (!Number.isFinite(quantity) || quantity <= 0) {
        errors.quantity = "Jumlah harus lebih dari 0";
      }
      if (!Number.isFinite(purchasePrice) || purchasePrice < 0) {
        errors.purchasePrice = "Harga beli tidak boleh negatif";
      }
      if (Object.keys(errors).length > 0) nextRows[row.id] = errors;
    }

    setHeaderErrors(nextHeader);
    setRowErrors(nextRows);
    return (
      Object.keys(nextHeader).length === 0 &&
      Object.keys(nextRows).length === 0
    );
  };

  const handleReset = () => {
    setHeader({ ...EMPTY_HEADER });
    setRows([createRow()]);
    setHeaderErrors({});
    setRowErrors({});
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (saving || !validate() || !user) return;

    setSaving(true);
    const savedIds: string[] = [];
    try {
      for (const row of rows) {
        await createMovement.mutateAsync({
          type: "in",
          productId: row.productId,
          supplier: header.supplier,
          unit: row.unit,
          quantity: Number(row.quantity),
          purchasePrice: parseAmount(row.purchasePrice),
          note: header.note || undefined,
          officerId: user.id,
          officerName: user.name,
        });
        savedIds.push(row.id);
      }
      toast.success(
        "Stok masuk tersimpan",
        `${rows.length} item berhasil ditambahkan.`
      );
      handleReset();
      onSuccess?.();
    } catch (err) {
      if (savedIds.length > 0) {
        setRows((current) => current.filter((row) => !savedIds.includes(row.id)));
      }
      toast.error(
        "Gagal menyimpan",
        err instanceof Error ? err.message : "Terjadi kesalahan."
      );
    } finally {
      setSaving(false);
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
          <Select
            value={header.supplier}
            onValueChange={(value) => setHeaderField("supplier", value)}
          >
            <SelectTrigger className="text-sm">
              <SelectValue placeholder="Pilih supplier" />
            </SelectTrigger>
            <SelectContent>
              {SUPPLIERS.map((supplier) => (
                <SelectItem key={supplier} value={supplier}>
                  {supplier}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {headerErrors.supplier && (
            <p className="text-xs text-destructive">{headerErrors.supplier}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs">Petugas Input</Label>
          <Input value={user?.name ?? ""} disabled className="text-sm" />
        </div>

        <div className="space-y-1.5 sm:col-span-2">
          <Label className="text-xs">Keterangan</Label>
          <Input
            value={header.note}
            onChange={(e) => setHeaderField("note", e.target.value)}
            placeholder="Opsional"
            className="text-sm"
          />
        </div>
      </div>

      <div className="space-y-3">
        <Label className="text-xs">Item Stok Masuk</Label>
        <div className="max-h-[min(32rem,55vh)] space-y-3 overflow-y-auto overflow-x-hidden pr-1">
          {rows.map((row, index) => {
            const selected = products?.find((product) => product.id === row.productId);
            const quantity = parseAmount(row.quantity);
            const purchasePrice = parseAmount(row.purchasePrice);
            const total =
              Number.isFinite(quantity) && Number.isFinite(purchasePrice)
                ? Math.max(0, quantity) * Math.max(0, purchasePrice)
                : 0;
            const errors = rowErrors[row.id] ?? {};

            return (
              <div
                key={row.id}
                className="space-y-3 rounded-xl border border-border/50 bg-white p-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-medium text-muted-foreground">
                    Item {index + 1}
                  </p>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 shrink-0 rounded-lg text-destructive"
                    onClick={() => removeRow(row.id)}
                    disabled={rows.length <= 1}
                    aria-label={`Hapus item ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Produk *</Label>
                    <Select
                      value={row.productId}
                      onValueChange={(value) => updateRow(row.id, { productId: value })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue placeholder="Pilih produk" />
                      </SelectTrigger>
                      <SelectContent>
                        {(products ?? []).map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name}
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
                      value={selected?.category ?? ""}
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
                      value={row.quantity}
                      onChange={(e) => updateRow(row.id, { quantity: e.target.value })}
                      placeholder="0"
                      className="text-sm"
                    />
                    {errors.quantity && (
                      <p className="text-xs text-destructive">{errors.quantity}</p>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs">Satuan</Label>
                    <Select
                      value={row.unit}
                      onValueChange={(value) => updateRow(row.id, { unit: value })}
                    >
                      <SelectTrigger className="text-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {STOCK_UNITS.map((unit) => (
                          <SelectItem key={unit} value={unit}>
                            {unit}
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
                      value={row.purchasePrice}
                      onChange={(e) =>
                        updateRow(row.id, { purchasePrice: e.target.value })
                      }
                      placeholder="0"
                      className="text-sm"
                    />
                    {errors.purchasePrice && (
                      <p className="text-xs text-destructive">{errors.purchasePrice}</p>
                    )}
                  </div>

                  <div className="space-y-1.5 sm:col-span-2">
                    <Label className="text-xs">Total Harga</Label>
                    <Input
                      value={formatCurrency(total)}
                      disabled
                      className="text-sm font-semibold"
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <Button type="button" variant="outline" className="rounded-xl" onClick={addRow}>
          <Plus className="mr-1.5 h-4 w-4" />
          Tambah Item
        </Button>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={saving}>
          <Save className="mr-1.5 h-4 w-4" />
          {saving ? "Menyimpan..." : "Simpan Semua"}
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          <RotateCcw className="mr-1.5 h-4 w-4" />
          Reset
        </Button>
        {onCancel && (
          <Button type="button" variant="ghost" onClick={onCancel}>
            <X className="mr-1.5 h-4 w-4" />
            Batal
          </Button>
        )}
      </div>
    </form>
  );
}
