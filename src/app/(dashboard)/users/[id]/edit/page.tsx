"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { Header } from "@/components/layout/header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserForm, type UserFormValues } from "@/components/users/user-form";
import { AccessDenied } from "@/components/users/access-denied";
import { useUser, useUpdateUser } from "@/hooks/use-users";
import { usePermissions } from "@/hooks/use-permissions";
import { toast } from "@/stores/toast-store";

export default function EditUserPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");
  const { canMutateUsers } = usePermissions();
  const updateUser = useUpdateUser();

  useEffect(() => {
    const prev = document.title;
    document.title = "Edit User | HALF Bakery POS";
    return () => {
      document.title = prev;
    };
  }, []);

  const { data, isLoading } = useUser(id, canMutateUsers);

  const handleSubmit = async (form: UserFormValues) => {
    try {
      await updateUser.mutateAsync({
        id,
        payload: {
          name: form.name,
          username: form.username,
          email: form.email,
          phone: form.phone || undefined,
          role: form.role,
          status: form.status,
          avatar: form.avatar || undefined,
          password: form.password || undefined,
          confirmPassword: form.confirmPassword || undefined,
        },
      });
      toast.success("User diperbarui", `${form.name} berhasil disimpan.`);
      router.push("/users");
    } catch (err) {
      toast.error("Gagal menyimpan", err instanceof Error ? err.message : "Terjadi kesalahan.");
    }
  };

  return (
    <>
      <Header title="Edit User" description="Perbarui data pengguna" />
      <div className="p-6">
        {!canMutateUsers ? (
          <AccessDenied message="Hanya Admin yang dapat mengubah user." />
        ) : (
          <Card className="max-w-3xl">
            <CardHeader>
              <CardTitle>Form Edit User</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading || !data ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : (
                <UserForm
                  mode="edit"
                  defaultUser={data.user}
                  isLoading={updateUser.isPending}
                  onSubmit={handleSubmit}
                  onCancel={() => router.push("/users")}
                />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
