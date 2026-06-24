"use client";

import { X, Plus, Minus, Trash2, MapPin } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/stores/cart-store";

function formatPrice(price: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(price);
}

interface CartDrawerProps {
  open: boolean;
  onClose: () => void;
}

export function CartDrawer({ open, onClose }: CartDrawerProps) {
  const { items, addItem, removeItem, updateQuantity, getSubtotal, getItemCount } =
    useCartStore();

  const subtotal = getSubtotal();
  const itemCount = getItemCount();

  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] bg-bakery-dark/40 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed top-0 right-0 bottom-0 z-[70] w-full max-w-md bg-white shadow-bakery-lg flex flex-col"
          >
            <div className="flex items-center justify-between p-5 border-b">
              <div>
                <h3 className="font-display text-xl font-bold text-bakery-dark">
                  Keranjang
                </h3>
                <p className="text-sm text-muted-foreground">
                  {itemCount} item{itemCount !== 1 ? "s" : ""}
                </p>
              </div>
              <Button variant="ghost" size="icon" onClick={onClose} className="rounded-xl">
                <X className="h-5 w-5" />
              </Button>
            </div>

            {items.length === 0 ? (
              <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
                <div className="h-20 w-20 rounded-full bg-accent flex items-center justify-center mb-4">
                  <span className="text-3xl">🛒</span>
                </div>
                <p className="font-medium text-bakery-dark mb-1">
                  Keranjang kosong
                </p>
                <p className="text-sm text-muted-foreground mb-6">
                  Tambahkan produk favoritmu dari menu kami
                </p>
                <Button onClick={onClose} className="rounded-xl" asChild>
                  <a href="#menu">Lihat Menu</a>
                </Button>
              </div>
            ) : (
              <>
                <ScrollArea className="flex-1 p-5">
                  <div className="space-y-4">
                    {items.map((item) => (
                      <div
                        key={item.product.id}
                        className="flex gap-4 p-4 rounded-2xl bg-cream/50 border border-border/50"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-xs text-secondary font-medium uppercase tracking-wider">
                            {item.product.category}
                          </p>
                          <h4 className="font-semibold text-bakery-dark truncate">
                            {item.product.name}
                          </h4>
                          <p className="text-sm font-bold text-primary mt-1">
                            {formatPrice(item.product.price)}
                          </p>
                        </div>
                        <div className="flex flex-col items-end justify-between gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => removeItem(item.product.id)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                          <div className="flex items-center gap-1.5">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-lg"
                              onClick={() =>
                                updateQuantity(
                                  item.product.id,
                                  item.quantity - 1
                                )
                              }
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="w-6 text-center text-sm font-semibold">
                              {item.quantity}
                            </span>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-7 w-7 rounded-lg"
                              onClick={() => addItem(item.product)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>

                <div className="p-5 border-t bg-cream/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span className="font-display text-xl font-bold text-bakery-dark">
                      {formatPrice(subtotal)}
                    </span>
                  </div>
                  <Button
                    className="w-full rounded-2xl h-12 text-base gap-2"
                    asChild
                  >
                    <a href="#outlet" onClick={onClose}>
                      <MapPin className="h-5 w-5" />
                      Kunjungi Outlet
                    </a>
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
