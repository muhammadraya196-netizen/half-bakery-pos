"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";
import { Header } from "@/components/layout/header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UserDetail } from "@/components/users/user-detail";
import { AccessDenied } from "@/components/users/access-denied";
import { useUser } from "@/hooks/use-users";
import { usePermissions } from "@/hooks/use-permissions";

export default function UserDetailPage() {
  const router = useRouter();
  const params = useParams();
  const id = String(params?.id ?? "");
  const { canViewUsers, canMutateUsers } = usePermissions();

  useEffect(() => {
    const prev = document.title;
    document.title = "Detail User | HALF Bakery POS";
    return () => {
      document.title = prev;
    };
  }, []);

  const { data, isLoading, isError } = useUser(id, canViewUsers);

  return (
    <>
      <Header title="Detail User" description="Informasi lengkap pengguna" />
      <div className="p-6 space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={() => router.push("/users")}>
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Kembali
          </Button>
          {canMutateUsers && data?.user && (
            <Button size="sm" onClick={() => router.push(`/users/${id}/edit`)}>
              <Pencil className="h-4 w-4 mr-1.5" />
              Edit
            </Button>
          )}
        </div>

        {!canViewUsers ? (
          <AccessDenied message="Menu Manajemen User hanya untuk Admin & Finance." />
        ) : (
          <Card className="max-w-2xl">
            <CardHeader>
              <CardTitle>Profil User</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="h-12 animate-pulse rounded bg-muted" />
                  ))}
                </div>
              ) : isError || !data ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  User tidak ditemukan.
                </p>
              ) : (
                <UserDetail user={data.user} activities={data.activities} />
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </>
  );
}
