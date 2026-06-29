"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface DateRangePickerProps {
  startDate: string; // YYYY-MM-DD
  endDate: string; // YYYY-MM-DD
  onChange: (range: { startDate: string; endDate: string }) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onChange,
}: DateRangePickerProps) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="start-date" className="text-xs">
          Tanggal Awal
        </Label>
        <Input
          id="start-date"
          type="date"
          value={startDate}
          max={endDate || undefined}
          onChange={(e) => onChange({ startDate: e.target.value, endDate })}
          className="h-9 w-40 text-sm"
        />
      </div>
      <div className="space-y-1">
        <Label htmlFor="end-date" className="text-xs">
          Tanggal Akhir
        </Label>
        <Input
          id="end-date"
          type="date"
          value={endDate}
          min={startDate || undefined}
          onChange={(e) => onChange({ startDate, endDate: e.target.value })}
          className="h-9 w-40 text-sm"
        />
      </div>
    </div>
  );
}
