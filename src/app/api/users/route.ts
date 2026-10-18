import { NextResponse } from "next/server";
import { getUsers, createUser, UserError } from "@/lib/db";
import { queryUsers } from "@/lib/services/user-service";
import { getActor } from "@/lib/api/rbac-headers";
import { canViewUsers, canMutateUsers } from "@/lib/rbac";
import { createUserSchema } from "@/lib/validations/user";
import type { UserQuery, UserRole, UserStatus } from "@/types";

export const dynamic = "force-dynamic";

function toNumber(value: string | null): number | undefined {
  if (value === null || value.trim() === "") return undefined;
  const n = Number(value);
  return Number.isFinite(n) ? n : undefined;
}

export async function GET(request: Request) {
  const actor = getActor(request);
  if (!canViewUsers(actor.role ?? undefined)) {
    return NextResponse.json(
      { message: "Anda tidak memiliki akses ke Manajemen User" },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const query: UserQuery = {
    search: searchParams.get("search") ?? undefined,
    role: (searchParams.get("role") as UserRole | "all") ?? undefined,
    status: (searchParams.get("status") as UserStatus | "all") ?? undefined,
    startDate: searchParams.get("startDate") ?? undefined,
    endDate: searchParams.get("endDate") ?? undefined,
    limit: toNumber(searchParams.get("limit")),
    offset: toNumber(searchParams.get("offset")),
  };

  return NextResponse.json(queryUsers(await getUsers(), query));
}

export async function POST(request: Request) {
  const actor = getActor(request);
  if (!canMutateUsers(actor.role ?? undefined)) {
    return NextResponse.json(
      { message: "Hanya Admin yang dapat menambah user" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = createUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Validasi gagal" },
        { status: 400 }
      );
    }

    const { confirmPassword: _omit, ...data } = parsed.data;
    void _omit;
    const user = await createUser({
      ...data,
      phone: data.phone || undefined,
      avatar: data.avatar || undefined,
    });
    return NextResponse.json(user, { status: 201 });
  } catch (err) {
    if (err instanceof UserError) {
      return NextResponse.json({ message: err.message }, { status: 400 });
    }
    return NextResponse.json(
      { message: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
