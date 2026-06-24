"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { Loader2, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { loginSchema, type LoginFormData } from "@/lib/validations/auth";
import { useSessionStore } from "@/stores/session-store";
import { api } from "@/lib/api";
import type { User } from "@/types";

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated } = useSessionStore();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "admin@halfpos.com",
      password: "admin123",
    },
  });

  useEffect(() => {
    if (isAuthenticated) {
      router.replace("/dashboard");
    }
  }, [isAuthenticated, router]);

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await api.post<{ user: User; token: string }>(
        "/api/auth/login",
        data
      );
      login(response.user, response.token);
      router.push("/dashboard");
    } catch (err) {
      setError("root", {
        message: err instanceof Error ? err.message : "Login gagal",
      });
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="hidden lg:flex lg:w-1/2 relative">
        <Image
          src="https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1200&q=80"
          alt="HALF Bakery"
          fill
          className="object-cover"
          priority
          sizes="50vw"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-bakery-dark/80 to-primary/60" />
        <div className="relative z-10 flex flex-col justify-center p-12 text-white">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm font-display font-bold text-2xl mb-6">
            H
          </div>
          <h1 className="font-display text-4xl font-bold mb-4">
            HALF Cake & Bakery
          </h1>
          <p className="text-white/80 text-lg leading-relaxed max-w-md">
            Portal staff untuk mengelola pesanan, produk, dan operasional bakery.
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-cream/30 p-4 md:p-8">
        <div className="w-full max-w-md">
          <Link
            href="/"
            className="inline-flex items-center text-sm text-muted-foreground hover:text-primary mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Kembali ke Website
          </Link>

          <Card className="shadow-bakery-lg border-0 rounded-2xl">
            <CardHeader className="text-center space-y-4 pb-2">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground font-display font-bold text-2xl shadow-bakery lg:hidden">
                H
              </div>
              <div>
                <CardTitle className="font-display text-2xl text-bakery-dark">
                  Login Staff
                </CardTitle>
                <CardDescription>
                  Masuk ke dashboard HALF Bakery
                </CardDescription>
              </div>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="admin@halfpos.com"
                    className="rounded-xl mt-1.5"
                    {...register("email")}
                  />
                  {errors.email && (
                    <p className="text-sm text-destructive mt-1">{errors.email.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    className="rounded-xl mt-1.5"
                    {...register("password")}
                  />
                  {errors.password && (
                    <p className="text-sm text-destructive mt-1">{errors.password.message}</p>
                  )}
                </div>

                {errors.root && (
                  <p className="text-sm text-destructive text-center">{errors.root.message}</p>
                )}

                <Button type="submit" className="w-full rounded-xl h-11" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Memproses...
                    </>
                  ) : (
                    "Masuk"
                  )}
                </Button>
              </form>

              <div className="mt-6 rounded-xl bg-accent/50 p-4 text-sm">
                <p className="font-medium mb-2 text-bakery-dark">Demo Account:</p>
                <p className="text-muted-foreground">Admin: admin@halfpos.com / admin123</p>
                <p className="text-muted-foreground">Kasir: kasir@halfpos.com / kasir123</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
