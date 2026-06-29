"use client";

import { useRef } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Save, RotateCcw, X, ImagePlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createUserSchema, editUserSchema } from "@/lib/validations/user";
import type { ManagedUser } from "@/types";

export interface UserFormValues {
  name: string;
  username: string;
  email: string;
  phone?: string;
  password?: string;
  confirmPassword?: string;
  role: "admin" | "finance" | "cashier";
  status: "active" | "inactive";
  avatar?: string;
}

interface UserFormProps {
  mode: "create" | "edit";
  defaultUser?: ManagedUser;
  isLoading?: boolean;
  onSubmit: (data: UserFormValues) => Promise<void> | void;
  onCancel: () => void;
}

export function UserForm({
  mode,
  defaultUser,
  isLoading,
  onSubmit,
  onCancel,
}: UserFormProps) {
  const fileRef = useRef<HTMLInputElement>(null);

  const resolver = (
    mode === "create" ? zodResolver(createUserSchema) : zodResolver(editUserSchema)
  ) as Resolver<UserFormValues>;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver,
    defaultValues: {
      name: defaultUser?.name ?? "",
      username: defaultUser?.username ?? "",
      email: defaultUser?.email ?? "",
      phone: defaultUser?.phone ?? "",
      password: "",
      confirmPassword: "",
      role: (defaultUser?.role as UserFormValues["role"]) ?? "cashier",
      status: defaultUser?.status ?? "active",
      avatar: defaultUser?.avatar ?? "",
    },
  });

  const role = watch("role");
  const status = watch("status");
  const avatar = watch("avatar");
  const name = watch("name");

  const handleAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setValue("avatar", reader.result as string);
    reader.readAsDataURL(file);
  };

  const initials = (name || "U")
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Foto profil */}
      <div className="flex items-center gap-4">
        <Avatar className="h-20 w-20">
          {avatar && <AvatarImage src={avatar} alt="Preview" />}
          <AvatarFallback className="bg-primary text-primary-foreground text-xl">
            {initials}
          </AvatarFallback>
        </Avatar>
        <div className="space-y-1.5">
          <Label className="text-xs">Foto Profil (Opsional)</Label>
          <div className="flex gap-2">
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatar}
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileRef.current?.click()}
            >
              <ImagePlus className="h-4 w-4 mr-1.5" />
              Upload
            </Button>
            {avatar && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setValue("avatar", "")}
              >
                Hapus
              </Button>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-bakery-dark">Informasi User</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="name">Nama Lengkap *</Label>
            <Input id="name" {...register("name")} placeholder="Nama lengkap" />
            {errors.name && (
              <p className="text-xs text-destructive">{errors.name.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="username">Username *</Label>
            <Input id="username" {...register("username")} placeholder="username" />
            {errors.username && (
              <p className="text-xs text-destructive">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="email">Email *</Label>
            <Input id="email" type="email" {...register("email")} placeholder="email@contoh.com" />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="phone">Nomor HP</Label>
            <Input id="phone" {...register("phone")} placeholder="08xxxxxxxxxx" />
            {errors.phone && (
              <p className="text-xs text-destructive">{errors.phone.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="password">
              Password {mode === "create" ? "*" : "(kosongkan jika tidak diubah)"}
            </Label>
            <Input
              id="password"
              type="password"
              {...register("password")}
              placeholder="Minimal 8 karakter"
            />
            {errors.password && (
              <p className="text-xs text-destructive">{errors.password.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="confirmPassword">Konfirmasi Password {mode === "create" ? "*" : ""}</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...register("confirmPassword")}
              placeholder="Ulangi password"
            />
            {errors.confirmPassword && (
              <p className="text-xs text-destructive">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>
        </div>
      </div>

      <div>
        <p className="mb-3 text-sm font-semibold text-bakery-dark">Role & Status</p>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label>Role *</Label>
            <Select
              value={role || ""}
              onValueChange={(v) => setValue("role", v as UserFormValues["role"], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="finance">Finance</SelectItem>
                <SelectItem value="cashier">Cashier</SelectItem>
              </SelectContent>
            </Select>
            {errors.role && (
              <p className="text-xs text-destructive">{errors.role.message}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <Label>Status *</Label>
            <Select
              value={status || ""}
              onValueChange={(v) => setValue("status", v as UserFormValues["status"], { shouldValidate: true })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Pilih status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Aktif</SelectItem>
                <SelectItem value="inactive">Nonaktif</SelectItem>
              </SelectContent>
            </Select>
            {errors.status && (
              <p className="text-xs text-destructive">{errors.status.message}</p>
            )}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 pt-2">
        <Button type="submit" disabled={isLoading}>
          <Save className="h-4 w-4 mr-1.5" />
          {isLoading ? "Menyimpan..." : "Simpan"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            reset({
              name: "",
              username: "",
              email: "",
              phone: "",
              password: "",
              confirmPassword: "",
              role: "cashier",
              status: "active",
              avatar: "",
            })
          }
        >
          <RotateCcw className="h-4 w-4 mr-1.5" />
          Reset
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X className="h-4 w-4 mr-1.5" />
          Batal
        </Button>
      </div>
    </form>
  );
}
