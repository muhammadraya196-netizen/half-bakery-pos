"use client";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { DateRangePicker } from "@/components/sales/date-range-picker";
import type { UserRole, UserStatus } from "@/types";

export type UserPeriod = "all" | "today" | "thisWeek" | "thisMonth" | "custom";

const PERIOD_OPTIONS: { value: UserPeriod; label: string }[] = [
  { value: "all", label: "Semua Tanggal" },
  { value: "today", label: "Hari Ini" },
  { value: "thisWeek", label: "Minggu Ini" },
  { value: "thisMonth", label: "Bulan Ini" },
  { value: "custom", label: "Custom Range" },
];

const LIMIT_OPTIONS = [10, 25, 50, 100] as const;

interface UserFilterProps {
  role: UserRole | "all";
  status: UserStatus | "all";
  period: UserPeriod;
  limit: number;
  customRange: { startDate: string; endDate: string };
  onRoleChange: (v: UserRole | "all") => void;
  onStatusChange: (v: UserStatus | "all") => void;
  onPeriodChange: (v: UserPeriod) => void;
  onLimitChange: (v: number) => void;
  onCustomRangeChange: (range: { startDate: string; endDate: string }) => void;
}

export function UserFilter(props: UserFilterProps) {
  const {
    role,
    status,
    period,
    limit,
    customRange,
    onRoleChange,
    onStatusChange,
    onPeriodChange,
    onLimitChange,
    onCustomRangeChange,
  } = props;

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label className="text-xs">Role</Label>
          <Select value={role} onValueChange={(v) => onRoleChange(v as UserRole | "all")}>
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Role</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
              <SelectItem value="finance">Finance</SelectItem>
              <SelectItem value="cashier">Cashier</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Status</Label>
          <Select
            value={status}
            onValueChange={(v) => onStatusChange(v as UserStatus | "all")}
          >
            <SelectTrigger className="h-9 w-36 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="active">Aktif</SelectItem>
              <SelectItem value="inactive">Nonaktif</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Tanggal Dibuat</Label>
          <Select value={period} onValueChange={(v) => onPeriodChange(v as UserPeriod)}>
            <SelectTrigger className="h-9 w-40 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PERIOD_OPTIONS.map((o) => (
                <SelectItem key={o.value} value={o.value}>
                  {o.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label className="text-xs">Per halaman</Label>
          <Select value={String(limit)} onValueChange={(v) => onLimitChange(Number(v))}>
            <SelectTrigger className="h-9 w-24 text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {LIMIT_OPTIONS.map((s) => (
                <SelectItem key={s} value={String(s)}>
                  {s}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {period === "custom" && (
        <DateRangePicker
          startDate={customRange.startDate}
          endDate={customRange.endDate}
          onChange={onCustomRangeChange}
        />
      )}
    </div>
  );
}
