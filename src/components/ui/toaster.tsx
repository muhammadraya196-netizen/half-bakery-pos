"use client";

import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";
import { useToastStore, type ToastVariant } from "@/stores/toast-store";
import { cn } from "@/lib/utils";

const variantConfig: Record<
  ToastVariant,
  { icon: typeof Info; className: string; iconClass: string }
> = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50",
    iconClass: "text-emerald-600",
  },
  error: {
    icon: AlertCircle,
    className: "border-red-200 bg-red-50",
    iconClass: "text-red-600",
  },
  info: {
    icon: Info,
    className: "border-primary/20 bg-cream",
    iconClass: "text-primary",
  },
};

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="pointer-events-none fixed bottom-4 right-4 z-[100] flex w-full max-w-sm flex-col gap-2">
      <AnimatePresence initial={false}>
        {toasts.map((t) => {
          const config = variantConfig[t.variant];
          const Icon = config.icon;
          return (
            <motion.div
              key={t.id}
              layout
              initial={{ opacity: 0, x: 40, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 40, scale: 0.95 }}
              transition={{ type: "spring", damping: 24, stiffness: 280 }}
              className={cn(
                "pointer-events-auto flex items-start gap-3 rounded-xl border p-4 shadow-bakery",
                config.className
              )}
            >
              <Icon className={cn("mt-0.5 h-5 w-5 shrink-0", config.iconClass)} />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-bakery-dark">
                  {t.title}
                </p>
                {t.description && (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {t.description}
                  </p>
                )}
              </div>
              <button
                onClick={() => removeToast(t.id)}
                className="text-muted-foreground transition-colors hover:text-bakery-dark"
                aria-label="Tutup notifikasi"
              >
                <X className="h-4 w-4" />
              </button>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
