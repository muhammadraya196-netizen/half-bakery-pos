"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm, type UserFormValues } from "@/components/users/user-form";
import { AccessDenied } from "@/components/users/access-denied";
import { useCreateUser } from "@/hooks/use-users";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "@/stores/toast-store";

export default function NewUserPage() {
  const router = useRouter();
  const { canMutateUsers } = usePermissions();
  const createUser = useCreateUser();

  useEffect(() => {
    const prev = document.title;
    document.title = "Tambah User | HALF Bakery POS";
    return () => {
      document.title = prev;
    };
  }, []);

  const handleSubmit = async (data: UserFormValues) => {
    try {
      await createUser.mutateAsync({
        name: data.name,
        username: data.username,
        email: data.email,
        phone: data.phone || undefined,
        password: data.password ?? "",
        confirmPassword: data.confirmPassword ?? "",
        role: data.role,
        status: data.status,
        avatar: data.avatar || undefined,
      });
      toast.success("User dibuat", `${data.name} berhasil ditambahkan.`);
      router.push("/users");
    } catch (err) {
      toast.error("Gagal menyimpan", err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  return (
    <>
      <Header title="Tambah User" description="Buat akun pengguna baru" />
      <div className="p-6">
        {!canMutateUsers ? (
          <AccessDenied message="Hanya Admin yang dapat menambah user." />
        ) : (
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Form Tambah User</CardTitle>
            </CardHeader>
            <CardContent>
              <UserForm
                mode="create"
                isLoading={createUser.isPending}
                onSubmit={handleSubmit}
                onCancel={() => router.push("/users")}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
