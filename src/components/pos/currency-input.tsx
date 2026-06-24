"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { formatRupiah, parseRupiahInput } from "@/lib/utils";
import { cn } from "@/lib/utils";

interface CurrencyInputProps {
  id?: string;
  value: number;
  onChange: (value: number) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export function CurrencyInput({
  id,
  value,
  onChange,
  placeholder = "Masukkan nominal pembayaran",
  className,
  disabled,
}: CurrencyInputProps) {
  const [display, setDisplay] = useState(value ? formatRupiah(value) : "");

  useEffect(() => {
    setDisplay(value ? formatRupiah(value) : "");
  }, [value]);

  const handleChange = (raw: string) => {
    const parsed = parseRupiahInput(raw);
    setDisplay(parsed ? formatRupiah(parsed) : "");
    onChange(parsed);
  };

  return (
    <Input
      id={id}
      type="text"
      inputMode="numeric"
      placeholder={placeholder}
      value={display}
      onChange={(e) => handleChange(e.target.value)}
      disabled={disabled}
      className={cn("h-9 text-sm font-medium tabular-nums", className)}
    />
  );
}
