"use client";

import { Eye, Pencil, KeyRound, Power, Trash2, Users } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { RoleBadge, UserStatusBadge } from "@/components/users/user-badges";
import { formatDate } from "@/lib/utils";
import type { ManagedUser } from "@/types";

interface UserTableProps {
  users: ManagedUser[];
  isLoading?: boolean;
  isEmpty?: boolean;
  canMutate: boolean;
  currentUserId?: string;
  onDetail: (user: ManagedUser) => void;
  onEdit: (user: ManagedUser) => void;
  onResetPassword: (user: ManagedUser) => void;
  onToggleStatus: (user: ManagedUser) => void;
  onDelete: (user: ManagedUser) => void;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserTable({
  users,
  isLoading,
  isEmpty,
  canMutate,
  currentUserId,
  onDetail,
  onEdit,
  onResetPassword,
  onToggleStatus,
  onDelete,
}: UserTableProps) {
  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-14 animate-pulse rounded bg-muted" />
        ))}
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <Users className="h-10 w-10 text-muted-foreground" />
        <p className="font-medium">Tidak ada user yang cocok dengan filter.</p>
        <p className="text-sm text-muted-foreground">
          Coba ubah role, status, periode, atau kata kunci.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Foto</TableHead>
            <TableHead>Nama</TableHead>
            <TableHead>Username</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>No. HP</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Dibuat</TableHead>
            <TableHead>Login Terakhir</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {users.map((u) => {
            const isSelf = u.id === currentUserId;
            return (
              <TableRow key={u.id}>
                <TableCell>
                  <Avatar className="h-9 w-9">
                    {u.avatar && <AvatarImage src={u.avatar} alt={u.name} />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xs">
                      {initials(u.name)}
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{u.name}</TableCell>
                <TableCell className="font-mono text-xs">{u.username}</TableCell>
                <TableCell className="text-sm">{u.email}</TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {u.phone || "-"}
                </TableCell>
                <TableCell>
                  <RoleBadge role={u.role} />
                </TableCell>
                <TableCell>
                  <UserStatusBadge status={u.status} />
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {formatDate(u.createdAt)}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                  {u.lastLogin ? formatDate(u.lastLogin) : "-"}
                </TableCell>
                <TableCell>
                  <div className="flex justify-end gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      title="Detail"
                      onClick={() => onDetail(u)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {canMutate && (
                      <>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit"
                          onClick={() => onEdit(u)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Reset Password"
                          onClick={() => onResetPassword(u)}
                        >
                          <KeyRound className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={isSelf ? "Tidak bisa nonaktifkan akun sendiri" : "Aktif/Nonaktif"}
                          disabled={isSelf && u.status === "active"}
                          onClick={() => onToggleStatus(u)}
                        >
                          <Power className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title={isSelf ? "Tidak bisa hapus akun sendiri" : "Hapus"}
                          className="text-destructive"
                          disabled={isSelf}
                          onClick={() => onDelete(u)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
