"use client";

import { useState } from "react";
import {
  Minus,
  Plus,
  Trash2,
  Banknote,
  QrCode,
  Building,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyInput } from "@/components/pos/currency-input";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useSessionStore } from "@/stores/session-store";
import { useCreateOrder } from "@/hooks/use-orders";
import type { PaymentMethod } from "@/types";
import { cn } from "@/lib/utils";

const paymentMethods: {
  value: PaymentMethod;
  label: string;
  icon: React.ReactNode;
}[] = [
  { value: "cash", label: "Tunai", icon: <Banknote className="h-4 w-4" /> },
  { value: "qris", label: "QRIS", icon: <QrCode className="h-4 w-4" /> },
  { value: "transfer", label: "Transfer Bank", icon: <Building className="h-4 w-4" /> },
  { value: "card", label: "E-Wallet", icon: <Wallet className="h-4 w-4" /> },
];

const QUICK_AMOUNTS = [50000, 100000, 200000, 300000, 500000];

export function CartPanel() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    items,
    discount,
    customerName,
    notes,
    paymentMethod,
    cashReceived,
    removeItem,
    updateQuantity,
    setDiscount,
    setCustomerName,
    setNotes,
    setPaymentMethod,
    setCashReceived,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    getChangeAmount,
    getShortfall,
    getItemCount,
    canCheckout,
  } = useCartStore();

  const user = useSessionStore((s) => s.user);
  const createOrder = useCreateOrder();

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const changeAmount = getChangeAmount();
  const shortfall = getShortfall();
  const isCash = paymentMethod === "cash";
  const isInsufficient = isCash && cashReceived > 0 && cashReceived < total;

  const handleCheckout = async () => {
    if (!canCheckout() || !user) return;

    setIsProcessing(true);
    setSuccessMessage("");

    try {
      const order = await createOrder.mutateAsync({
        items: items.map((item) => ({
          productId: item.product.id,
          productName: item.product.name,
          quantity: item.quantity,
          price: item.product.price,
          subtotal: item.product.price * item.quantity,
        })),
        subtotal,
        tax,
        discount,
        total,
        paymentMethod,
        cashierId: user.id,
        cashierName: user.name,
        customerName: customerName || undefined,
        notes: notes || undefined,
        ...(isCash && {
          cashReceived,
          changeAmount: cashReceived - total,
        }),
      });

      clearCart();
      const changeText =
        isCash && order.changeAmount
          ? ` Kembalian ${formatCurrency(order.changeAmount)}.`
          : "";
      setSuccessMessage(`Pesanan ${order.orderNumber} berhasil!${changeText}`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch {
      alert("Gagal memproses pesanan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="flex h-full flex-col rounded-xl border-border/50 shadow-bakery">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between font-display">
          <span>Keranjang</span>
          <span className="text-sm font-normal text-muted-foreground">
            {getItemCount()} item
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {successMessage && (
          <div className="mx-4 mb-3 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
            {successMessage}
          </div>
        )}

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-muted-foreground px-4">
            <p className="font-medium">Keranjang kosong</p>
            <p className="text-sm text-center mt-1">
              Pilih produk dari katalog untuk memulai transaksi
            </p>
          </div>
        ) : (
          <ScrollArea className="h-[calc(100vh-520px)] min-h-[120px] px-4">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start gap-3 rounded-xl border border-border/50 p-3 bg-white"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">
                      {item.product.name}
                    </p>
                    <p className="text-sm text-primary font-semibold">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity - 1)
                      }
                    >
                      <Minus className="h-3 w-3" />
                    </Button>
                    <span className="w-8 text-center text-sm font-medium">
                      {item.quantity}
                    </span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7 rounded-lg"
                      onClick={() =>
                        updateQuantity(item.product.id, item.quantity + 1)
                      }
                      disabled={item.quantity >= item.product.stock}
                    >
                      <Plus className="h-3 w-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 text-destructive rounded-lg"
                      onClick={() => removeItem(item.product.id)}
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>

      <CardFooter className="flex flex-col gap-3 border-t p-4 bg-cream/20">
        <div className="w-full space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="customer" className="text-xs">
                Nama Pelanggan
              </Label>
              <Input
                id="customer"
                placeholder="Opsional"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-8 text-sm rounded-xl"
              />
            </div>
            <div>
              <Label htmlFor="discount" className="text-xs">
                Diskon (Rp)
              </Label>
              <Input
                id="discount"
                type="number"
                min={0}
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="h-8 text-sm rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Metode Pembayaran</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="h-9 text-sm rounded-xl">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {paymentMethods.map((method) => (
                  <SelectItem key={method.value} value={method.value}>
                    <span className="flex items-center gap-2">
                      {method.icon}
                      {method.label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {isCash && (
            <div className="space-y-2 rounded-xl border border-primary/20 bg-white p-3 shadow-sm">
              <Label htmlFor="cash-received" className="text-xs font-semibold">
                Uang Dibayar (Rp)
              </Label>
              <CurrencyInput
                id="cash-received"
                value={cashReceived}
                onChange={setCashReceived}
                placeholder="Masukkan nominal pembayaran"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {QUICK_AMOUNTS.map((amount) => (
                  <Button
                    key={amount}
                    type="button"
                    variant="outline"
                    size="sm"
                    className="h-7 rounded-lg px-2.5 text-xs font-medium"
                    onClick={() => setCashReceived(amount)}
                  >
                    {formatCurrency(amount)}
                  </Button>
                ))}
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  className="h-7 rounded-lg px-2.5 text-xs font-semibold"
                  onClick={() => setCashReceived(total)}
                >
                  Uang Pas
                </Button>
              </div>

              {isInsufficient && (
                <div className="rounded-lg bg-destructive/10 px-3 py-2 text-sm">
                  <p className="font-medium text-destructive">
                    Nominal pembayaran kurang
                  </p>
                  <div className="mt-1 flex justify-between text-destructive/90">
                    <span>Kekurangan</span>
                    <span className="font-semibold tabular-nums">
                      {formatCurrency(shortfall)}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          <Input
            placeholder="Catatan (opsional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-8 text-sm rounded-xl"
          />
        </div>

        <Separator />

        <div className="w-full space-y-1.5 rounded-xl bg-white p-3 text-sm shadow-sm border border-border/40">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
            Ringkasan Pembayaran
          </p>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="tabular-nums">{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pajak (10%)</span>
            <span className="tabular-nums">{formatCurrency(tax)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Diskon</span>
            <span
              className={cn(
                "tabular-nums",
                discount > 0 && "text-emerald-600"
              )}
            >
              {discount > 0 ? `-${formatCurrency(discount)}` : formatCurrency(0)}
            </span>
          </div>
          <Separator className="my-1" />
          <div className="flex justify-between text-base font-bold">
            <span>Total</span>
            <span className="text-primary tabular-nums">
              {formatCurrency(total)}
            </span>
          </div>

          {isCash && (
            <>
              <div className="flex justify-between pt-1">
                <span className="text-muted-foreground">Dibayar</span>
                <span className="font-semibold tabular-nums">
                  {cashReceived > 0
                    ? formatCurrency(cashReceived)
                    : formatCurrency(0)}
                </span>
              </div>
              {cashReceived >= total && cashReceived > 0 ? (
                <div className="flex justify-between text-emerald-700">
                  <span className="font-medium">Kembalian</span>
                  <span className="font-bold tabular-nums">
                    {formatCurrency(changeAmount)}
                  </span>
                </div>
              ) : shortfall > 0 ? (
                <div className="flex justify-between text-destructive">
                  <span className="font-medium">Kekurangan</span>
                  <span className="font-bold tabular-nums">
                    {formatCurrency(shortfall)}
                  </span>
                </div>
              ) : null}
            </>
          )}
        </div>

        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            className="flex-1 rounded-xl"
            onClick={clearCart}
            disabled={items.length === 0}
          >
            Reset
          </Button>
          <Button
            className="flex-1 rounded-xl font-semibold shadow-bakery"
            onClick={handleCheckout}
            disabled={!canCheckout() || isProcessing}
          >
            {isProcessing ? "Memproses..." : "Bayar"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
