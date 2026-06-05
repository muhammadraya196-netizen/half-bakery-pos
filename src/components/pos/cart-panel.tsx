"use client";

import { useState } from "react";
import { Minus, Plus, Trash2, CreditCard, Banknote, QrCode, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";
import { useCartStore } from "@/stores/cart-store";
import { useSessionStore } from "@/stores/session-store";
import { useCreateOrder } from "@/hooks/use-orders";
import type { PaymentMethod } from "@/types";

const paymentMethods: { value: PaymentMethod; label: string; icon: React.ReactNode }[] = [
  { value: "cash", label: "Tunai", icon: <Banknote className="h-4 w-4" /> },
  { value: "card", label: "Kartu", icon: <CreditCard className="h-4 w-4" /> },
  { value: "qris", label: "QRIS", icon: <QrCode className="h-4 w-4" /> },
  { value: "transfer", label: "Transfer", icon: <Building className="h-4 w-4" /> },
];

export function CartPanel() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const {
    items,
    discount,
    customerName,
    notes,
    paymentMethod,
    removeItem,
    updateQuantity,
    setDiscount,
    setCustomerName,
    setNotes,
    setPaymentMethod,
    clearCart,
    getSubtotal,
    getTax,
    getTotal,
    getItemCount,
  } = useCartStore();

  const user = useSessionStore((s) => s.user);
  const createOrder = useCreateOrder();

  const subtotal = getSubtotal();
  const tax = getTax();
  const total = getTotal();

  const handleCheckout = async () => {
    if (items.length === 0 || !user) return;

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
      });

      clearCart();
      setSuccessMessage(`Pesanan ${order.orderNumber} berhasil!`);
      setTimeout(() => setSuccessMessage(""), 5000);
    } catch {
      alert("Gagal memproses pesanan. Silakan coba lagi.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Card className="flex h-full flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between">
          <span>Keranjang</span>
          <span className="text-sm font-normal text-muted-foreground">
            {getItemCount()} item
          </span>
        </CardTitle>
      </CardHeader>

      <CardContent className="flex-1 overflow-hidden p-0">
        {successMessage && (
          <div className="mx-4 mb-3 rounded-lg bg-green-50 p-3 text-sm text-green-700 dark:bg-green-900/20 dark:text-green-400">
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
          <ScrollArea className="h-[calc(100vh-420px)] px-4">
            <div className="space-y-3">
              {items.map((item) => (
                <div
                  key={item.product.id}
                  className="flex items-start gap-3 rounded-lg border p-3"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{item.product.name}</p>
                    <p className="text-sm text-primary font-semibold">
                      {formatCurrency(item.product.price)}
                    </p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-7 w-7"
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
                      className="h-7 w-7"
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
                      className="h-7 w-7 text-destructive"
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

      <CardFooter className="flex flex-col gap-3 border-t p-4">
        <div className="w-full space-y-2">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label htmlFor="customer" className="text-xs">Nama Pelanggan</Label>
              <Input
                id="customer"
                placeholder="Opsional"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                className="h-8 text-sm"
              />
            </div>
            <div>
              <Label htmlFor="discount" className="text-xs">Diskon (Rp)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                value={discount || ""}
                onChange={(e) => setDiscount(Number(e.target.value) || 0)}
                className="h-8 text-sm"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs">Metode Pembayaran</Label>
            <Select
              value={paymentMethod}
              onValueChange={(v) => setPaymentMethod(v as PaymentMethod)}
            >
              <SelectTrigger className="h-8 text-sm">
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

          <Input
            placeholder="Catatan (opsional)"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="h-8 text-sm"
          />
        </div>

        <Separator />

        <div className="w-full space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pajak (10%)</span>
            <span>{formatCurrency(tax)}</span>
          </div>
          {discount > 0 && (
            <div className="flex justify-between text-green-600">
              <span>Diskon</span>
              <span>-{formatCurrency(discount)}</span>
            </div>
          )}
          <div className="flex justify-between text-lg font-bold pt-1">
            <span>Total</span>
            <span className="text-primary">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={clearCart}
            disabled={items.length === 0}
          >
            Reset
          </Button>
          <Button
            className="flex-1"
            onClick={handleCheckout}
            disabled={items.length === 0 || isProcessing}
          >
            {isProcessing ? "Memproses..." : "Bayar"}
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
