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
  CreditCard,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
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
import { PAYMENT_METHODS, summarizePayments } from "@/lib/payment";
import { cn } from "@/lib/utils";

const paymentIcons: Record<PaymentMethod, React.ReactNode> = {
  cash: <Banknote className="h-4 w-4" />,
  debit: <CreditCard className="h-4 w-4" />,
  credit: <CreditCard className="h-4 w-4" />,
  card: <Wallet className="h-4 w-4" />,
  qris: <QrCode className="h-4 w-4" />,
  transfer: <Building className="h-4 w-4" />,
};

const QUICK_AMOUNTS = [50000, 100000, 200000, 300000, 500000];

export function CartPanel() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    items,
    discount,
    customerName,
    notes,
    payments,
    removeItem,
    updateQuantity,
    setDiscount,
    setCustomerName,
    setNotes,
    addPayment,
    updatePayment,
    removePayment,
    setCashReceived,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
    canCheckout,
  } = useCartStore();

  const user = useSessionStore((s) => s.user);
  const createOrder = useCreateOrder();

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();
  const payment = summarizePayments(payments, total);
  const changeAmount = payment.changeAmount;
  const isSplit = payments.length > 1;
  const single = payments[0];
  const isSingleCash = !isSplit && single?.method === "cash";
  const isInsufficient = isSingleCash && payment.remaining > 0 && (single?.cashReceived ?? 0) > 0;

  const handleCheckout = async () => {
    if (!canCheckout() || !user || !payment.canCheckout) return;

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
          ...(item.product.bundleComponents?.length
            ? { bundleComponents: item.product.bundleComponents }
            : {}),
        })),
        subtotal,
        tax,
        discount,
        total,
        paymentMethod: payment.paymentMethod,
        payments: payment.resolved,
        cashierId: user.id,
        cashierName: user.name,
        customerName: customerName || undefined,
        notes: notes || undefined,
        ...(payment.cashReceived !== undefined && {
          cashReceived: payment.cashReceived,
        }),
        changeAmount: payment.changeAmount,
      });

      clearCart();
      const changeText =
        order.changeAmount
          ? ` Kembalian ${formatCurrency(order.changeAmount)}.`
          : "";
      setSuccessMessage(`Pesanan ${order.orderNumber} berhasil!${changeText}`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : "Gagal memproses pesanan. Silakan coba lagi.";
      alert(message);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="flex h-full min-h-0 flex-col overflow-hidden rounded-xl border-border/50 shadow-bakery">
      <CardHeader className="shrink-0 pb-3">
        <CardTitle className="flex items-center justify-between font-display">
          <span>Keranjang</span>
          <span className="text-sm font-normal text-muted-foreground">
            {getItemCount()} item
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex min-h-0 flex-1 flex-col overflow-hidden p-0">
        {successMessage && (
          <div className="mx-4 mb-3 shrink-0 rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700 dark:bg-emerald-900/20 dark:text-emerald-400">
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
          <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4">
            <div className="flex flex-col gap-3 pb-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex shrink-0 items-start gap-3 rounded-xl border border-border/50 bg-white p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.product.name}
                    </p>
                    {item.product.isPromoBundling && item.product.bundleItems && (
                      <p className="truncate text-xs text-muted-foreground">
                        {item.product.bundleItems.join(" · ")}
                      </p>
                    )}
                    <p className="text-sm font-semibold text-primary">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
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
                    <span className="w-8 shrink-0 text-center text-sm font-medium tabular-nums">
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
          </div>
        )}
      </CardContent>

      <CardFooter className="flex max-h-[52%] min-h-0 shrink-0 flex-col gap-3 overflow-y-auto border-t bg-cream/20 p-4">
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

          <div className="space-y-2">
            <Label className="text-xs">Pembayaran</Label>
            <div className="max-h-64 space-y-2 overflow-y-auto pr-0.5">
              {payments.map((line, index) => {
                const showAmount = isSplit || line.method !== "cash";
                const amountValue =
                  !isSplit && line.method !== "cash" && line.amount === 0
                    ? total
                    : line.amount;
                const cashChange = Math.max(0, line.cashReceived - line.amount);

                return (
                  <div
                    key={line.id}
                    className="space-y-2 rounded-xl border border-primary/20 bg-white p-3 shadow-sm"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <Label className="text-xs">
                        Metode Pembayaran{isSplit ? ` ${index + 1}` : ""}
                      </Label>
                      {isSplit && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7 shrink-0 rounded-lg text-destructive"
                          onClick={() => removePayment(line.id)}
                          aria-label="Hapus pembayaran"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>
                    <Select
                      value={line.method}
                      onValueChange={(value) =>
                        updatePayment(line.id, { method: value as PaymentMethod })
                      }
                    >
                      <SelectTrigger className="h-9 w-full text-sm rounded-xl">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {PAYMENT_METHODS.map((method) => (
                          <SelectItem key={method.value} value={method.value}>
                            <span className="flex items-center gap-2">
                              {paymentIcons[method.value]}
                              {method.label}
                            </span>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    {showAmount && (
                      <div>
                        <Label className="text-xs">Jumlah</Label>
                        <CurrencyInput
                          value={amountValue}
                          onChange={(value) =>
                            updatePayment(line.id, { amount: value })
                          }
                          placeholder="Masukkan nominal"
                        />
                      </div>
                    )}

                    {line.method === "cash" && isSplit && (
                      <div className="space-y-2">
                        <Label className="text-xs">Uang Diterima</Label>
                        <CurrencyInput
                          value={line.cashReceived}
                          onChange={(value) =>
                            updatePayment(line.id, { cashReceived: value })
                          }
                          placeholder="Uang diterima"
                        />
                        <div className="flex justify-between text-sm text-emerald-700">
                          <span>Kembalian</span>
                          <span className="font-semibold tabular-nums">
                            {formatCurrency(cashChange)}
                          </span>
                        </div>
                      </div>
                    )}

                    {line.method === "cash" && !isSplit && (
                      <div className="space-y-2">
                        <Label htmlFor="cash-received" className="text-xs font-semibold">
                          Uang Dibayar (Rp)
                        </Label>
                        <CurrencyInput
                          id="cash-received"
                          value={line.cashReceived}
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
                                {formatCurrency(payment.remaining)}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <Button
              type="button"
              variant="outline"
              className="h-8 w-full rounded-xl text-xs"
              onClick={addPayment}
            >
              + Tambah Pembayaran
            </Button>
          </div>

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

          <div className="flex justify-between pt-1">
            <span className="text-muted-foreground">Total Dibayar</span>
            <span className="font-semibold tabular-nums">
              {formatCurrency(payment.totalPaid)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sisa</span>
            <span
              className={cn(
                "font-semibold tabular-nums",
                payment.remaining > 0 && "text-destructive"
              )}
            >
              {formatCurrency(payment.remaining)}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <span
              className={cn(
                "font-semibold",
                payment.isPaid ? "text-emerald-700" : "text-muted-foreground"
              )}
            >
              {payment.isPaid ? "✓ Lunas" : "Belum Lunas"}
            </span>
          </div>
          {changeAmount > 0 && (
            <div className="flex justify-between text-emerald-700">
              <span className="font-medium">Kembalian</span>
              <span className="font-bold tabular-nums">
                {formatCurrency(changeAmount)}
              </span>
            </div>
          )}
          {payment.overpayMessage && (
            <p className="text-sm font-medium text-destructive">
              {payment.overpayMessage}
            </p>
          )}
          {payment.invalidMessage && (
            <p className="text-sm font-medium text-destructive">
              {payment.invalidMessage}
            </p>
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
