"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { RoleBadge, UserStatusBadge } from "@/components/users/user-badges";
import { formatDate } from "@/lib/utils";
import type { ManagedUser, UserActivity } from "@/types";

interface UserDetailProps {
  user: ManagedUser;
  activities?: UserActivity[];
}

function initials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-muted-foreground text-xs">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  );
}

export function UserDetail({ user, activities }: UserDetailProps) {
  return (
    <div className="space-y-5">
      <div className="flex items-center gap-4">
        <Avatar className="h-16 w-16">
          {user.avatar && <AvatarImage src={user.avatar} alt={user.name} />}
          <AvatarFallback className="bg-primary text-primary-foreground text-lg">
            {initials(user.name)}
          </AvatarFallback>
        </Avatar>
        <div>
          <p className="font-display text-lg font-bold text-bakery-dark">
            {user.name}
          </p>
          <p className="text-sm text-muted-foreground">@{user.username}</p>
          <div className="mt-1.5 flex gap-2">
            <RoleBadge role={user.role} />
            <UserStatusBadge status={user.status} />
          </div>
        </div>
      </div>

      <Separator />

      <div className="grid grid-cols-2 gap-3 text-sm">
        <Field label="Email" value={user.email} />
        <Field label="Nomor HP" value={user.phone || "-"} />
        <Field label="Tanggal Dibuat" value={formatDate(user.createdAt)} />
        <Field
          label="Terakhir Login"
          value={user.lastLogin ? formatDate(user.lastLogin) : "-"}
        />
      </div>

      {activities && activities.length > 0 && (
        <>
          <Separator />
          <div className="space-y-2">
            <p className="font-medium text-sm">Riwayat Aktivitas</p>
            <ul className="space-y-1.5">
              {activities.map((a) => (
                <li
                  key={a.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span>{a.action}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(a.createdAt)}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}
