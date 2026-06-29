"use client";

import { ShieldAlert } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function AccessDenied({
  message = "Anda tidak memiliki akses ke menu ini.",
}: {
  message?: string;
}) {
  return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center gap-3 py-16 text-center">
        <ShieldAlert className="h-12 w-12 text-destructive" />
        <p className="font-semibold text-lg">Akses Ditolak</p>
        <p className="text-sm text-muted-foreground max-w-sm">{message}</p>
      </CardContent>
    </Card>
  );
}
