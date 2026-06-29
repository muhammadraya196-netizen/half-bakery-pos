"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, UserPlus } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { UserFilter, type UserPeriod } from "@/components/users/user-filter";
import { UserTable } from "@/components/users/user-table";
import { AccessDenied } from "@/components/users/access-denied";
import { ProductPagination } from "@/components/products/product-pagination";
import {
  useUsers,
  useDeleteUser,
  useResetUserPassword,
  useToggleUserStatus,
} from "@/hooks/use-users";
import { usePermissions } from "@/hooks/use-permissions";
import { useDebounce } from "@/hooks/use-debounce";
import { getPeriodRange } from "@/lib/services/sales-service";
import { toast } from "@/stores/toast-store";
import { cn } from "@/lib/utils";
import type { ManagedUser, UserQuery, UserRole, UserStatus } from "@/types";

const DEFAULT_LIMIT = 10;

export default function UsersPage() {
  const router = useRouter();
  const { canViewUsers, canMutateUsers, userId } = usePermissions();

  useEffect(() => {
    const prev = document.title;
    document.title = "Daftar User | HALF Bakery POS";
    return () => {
      document.title = prev;
    };
  }, []);

  const [searchInput, setSearchInput] = useState("");
  const [role, setRole] = useState<UserRole | "all">("all");
  const [status, setStatus] = useState<UserStatus | "all">("all");
  const [period, setPeriod] = useState<UserPeriod>("all");
  const [customRange, setCustomRange] = useState(() => getPeriodRange("thisMonth"));
  const [limit, setLimit] = useState(DEFAULT_LIMIT);
  const [page, setPage] = useState(1);

  const debouncedSearch = useDebounce(searchInput, 400);

  const range = useMemo(() => {
    if (period === "all") return { startDate: undefined, endDate: undefined };
    if (period === "custom") return customRange;
    return getPeriodRange(period);
  }, [period, customRange]);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, role, status, period, customRange, limit]);

  const offset = (page - 1) * limit;

  const query: UserQuery = useMemo(
    () => ({
      search: debouncedSearch || undefined,
      role,
      status,
      startDate: range.startDate,
      endDate: range.endDate,
      limit,
      offset,
    }),
    [debouncedSearch, role, status, range, limit, offset]
  );

  const { data, isLoading, isError, error, isFetching, isPlaceholderData, refetch } =
    useUsers(query, canViewUsers);

  const deleteUser = useDeleteUser();
  const resetPassword = useResetUserPassword();
  const toggleStatus = useToggleUserStatus();

  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [resetTarget, setResetTarget] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState("");

  const users = data?.data ?? [];
  const total = data?.total ?? 0;
  const isEmpty = !isLoading && total === 0;

  if (!canViewUsers) {
    return (
      <>
        <Header title="Manajemen User" description="Kelola akun pengguna sistem" />
        <div className="p-6">
          <AccessDenied message="Menu Manajemen User hanya untuk Admin & Finance." />
        </div>
      </>
    );
  }

  const handleToggle = async (user: ManagedUser) => {
    try {
      await toggleStatus.mutateAsync(user.id);
      toast.success("Status diperbarui", `${user.name} berhasil diperbarui.`);
    } catch (err) {
      toast.error("Gagal", err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteUser.mutateAsync(deleteTarget.id);
      toast.success("User dihapus", `${deleteTarget.name} telah dihapus.`);
      setDeleteTarget(null);
    } catch (err) {
      toast.error("Gagal menghapus", err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  const handleReset = async () => {
    if (!resetTarget) return;
    if (newPassword.length < 8) {
      toast.error("Password terlalu pendek", "Minimal 8 karakter.");
      return;
    }
    try {
      await resetPassword.mutateAsync({ id: resetTarget.id, password: newPassword });
      toast.success("Password direset", `Password ${resetTarget.name} diperbarui.`);
      setResetTarget(null);
      setNewPassword("");
    } catch (err) {
      toast.error("Gagal", err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  return (
    <>
      <Header title="Manajemen User" description="Kelola akun pengguna sistem" />
      <div className="space-y-6 p-6">
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
              <CardTitle>Daftar User</CardTitle>
              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Cari nama / username / email..."
                    value={searchInput}
                    onChange={(e) => setSearchInput(e.target.value)}
                    className="w-full lg:w-72 pl-9"
                  />
                </div>
                {canMutateUsers && (
                  <Button asChild>
                    <Link href="/users/new">
                      <UserPlus className="h-4 w-4 mr-1.5" />
                      Tambah User
                    </Link>
                  </Button>
                )}
              </div>
            </div>

            <UserFilter
              role={role}
              status={status}
              period={period}
              limit={limit}
              customRange={customRange}
              onRoleChange={setRole}
              onStatusChange={setStatus}
              onPeriodChange={setPeriod}
              onLimitChange={setLimit}
              onCustomRangeChange={setCustomRange}
            />
          </CardHeader>

          <CardContent className="space-y-4">
            {isError ? (
              <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
                <p className="font-medium">Gagal memuat data user</p>
                <p className="text-sm text-muted-foreground">
                  {error instanceof Error ? error.message : "Terjadi kesalahan."}
                </p>
                <Button variant="outline" onClick={() => refetch()}>
                  Coba Lagi
                </Button>
              </div>
            ) : (
              <>
                <div
                  className={cn(
                    "transition-opacity duration-200",
                    isPlaceholderData && isFetching && "opacity-60"
                  )}
                >
                  <UserTable
                    users={users}
                    isLoading={isLoading}
                    isEmpty={isEmpty}
                    canMutate={canMutateUsers}
                    currentUserId={userId}
                    onDetail={(u) => router.push(`/users/${u.id}`)}
                    onEdit={(u) => router.push(`/users/${u.id}/edit`)}
                    onResetPassword={(u) => {
                      setResetTarget(u);
                      setNewPassword("");
                    }}
                    onToggleStatus={handleToggle}
                    onDelete={(u) => setDeleteTarget(u)}
                  />
                </div>

                {!isLoading && total > 0 && (
                  <ProductPagination
                    total={total}
                    limit={limit}
                    offset={offset}
                    currentPage={page}
                    onPageChange={setPage}
                  />
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Konfirmasi hapus */}
      <Dialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Hapus User</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">
            Yakin ingin menghapus <span className="font-medium text-foreground">{deleteTarget?.name}</span>?
            Tindakan ini tidak dapat dibatalkan.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteTarget(null)}>
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleteUser.isPending}
            >
              {deleteUser.isPending ? "Menghapus..." : "Hapus"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Reset password */}
      <Dialog
        open={!!resetTarget}
        onOpenChange={() => {
          setResetTarget(null);
          setNewPassword("");
        }}
      >
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Reset Password</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="new-password" className="text-sm">
              Password baru untuk {resetTarget?.name}
            </Label>
            <Input
              id="new-password"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Minimal 8 karakter"
            />
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setResetTarget(null);
                setNewPassword("");
              }}
            >
              Batal
            </Button>
            <Button onClick={handleReset} disabled={resetPassword.isPending}>
              {resetPassword.isPending ? "Menyimpan..." : "Reset"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
