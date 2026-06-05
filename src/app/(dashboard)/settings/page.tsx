"use client";

import { Header } from "@/components/layout/header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useSessionStore } from "@/stores/session-store";

export default function SettingsPage() {
  const user = useSessionStore((s) => s.user);

  return (
    <>
      <Header title="Pengaturan" description="Profil dan konfigurasi sistem" />
      <div className="space-y-6 p-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Profil Pengguna</CardTitle>
            <CardDescription>Informasi akun Anda</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Nama</p>
                <p className="font-medium">{user?.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Email</p>
                <p className="font-medium">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Role</p>
                <Badge className="mt-1 capitalize">{user?.role}</Badge>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">ID</p>
                <p className="font-mono text-sm">{user?.id}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Tech Stack</CardTitle>
            <CardDescription>Teknologi yang digunakan dalam project ini</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Next.js 14",
                "TypeScript",
                "Tailwind CSS",
                "Shadcn UI",
                "Zustand",
                "Socket.io",
                "React Hook Form",
                "Zod",
                "Tanstack Query",
                "Recharts",
              ].map((tech) => (
                <Badge key={tech} variant="secondary">
                  {tech}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Konfigurasi</CardTitle>
            <CardDescription>Pengaturan aplikasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Pajak</span>
              <span>10%</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mata Uang</span>
              <span>IDR (Rupiah)</span>
            </div>
            <Separator />
            <div className="flex justify-between">
              <span className="text-muted-foreground">Socket URL</span>
              <span className="font-mono text-xs">
                {process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3001"}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
