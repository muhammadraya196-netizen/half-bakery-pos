import { NextResponse } from "next/server";
import {
  getUserById,
  getUserWithActivities,
  updateUser,
  deleteUser,
  resetUserPassword,
  setUserStatus,
  UserError,
} from "@/lib/db";
import { getActor } from "@/lib/api/rbac-headers";
import { canViewUsers, canMutateUsers } from "@/lib/rbac";
import { editUserSchema } from "@/lib/validations/user";

export const dynamic = "force-dynamic";

interface Params {
  params: { id: string };
}

export async function GET(request: Request, { params }: Params) {
  const actor = getActor(request);
  if (!canViewUsers(actor.role ?? undefined)) {
    return NextResponse.json({ message: "Akses ditolak" }, { status: 403 });
  }

  const detail = await getUserWithActivities(params.id);
  if (!detail) {
    return NextResponse.json(
      { message: "User tidak ditemukan" },
      { status: 404 }
    );
  }

  return NextResponse.json(detail);
}

export async function PUT(request: Request, { params }: Params) {
  const actor = getActor(request);
  if (!canMutateUsers(actor.role ?? undefined)) {
    return NextResponse.json(
      { message: "Hanya Admin yang dapat mengubah user" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const parsed = editUserSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { message: parsed.error.issues[0]?.message || "Validasi gagal" },
        { status: 400 }
      );
    }

    const { password, confirmPassword: _c, ...rest } = parsed.data;
    void _c;

    const updated = await updateUser(params.id, {
      ...rest,
      phone: rest.phone || undefined,
      avatar: rest.avatar || undefined,
    });

    if (password) {
      await resetUserPassword(params.id, password);
    }

    return NextResponse.json(updated);
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

/** PATCH untuk aksi parsial: reset-password & toggle-status. */
export async function PATCH(request: Request, { params }: Params) {
  const actor = getActor(request);
  if (!canMutateUsers(actor.role ?? undefined)) {
    return NextResponse.json(
      { message: "Hanya Admin yang dapat melakukan aksi ini" },
      { status: 403 }
    );
  }

  try {
    const body = await request.json();
    const action = body?.action as string;

    if (action === "reset-password") {
      const password = String(body?.password ?? "");
      const user = await resetUserPassword(params.id, password);
      return NextResponse.json(user);
    }

    if (action === "toggle-status") {
      // Tidak boleh menonaktifkan akun sendiri
      const target = await getUserById(params.id);
      if (!target) {
        return NextResponse.json(
          { message: "User tidak ditemukan" },
          { status: 404 }
        );
      }
      if (target.id === actor.id && target.status === "active") {
        return NextResponse.json(
          { message: "Tidak dapat menonaktifkan akun sendiri" },
          { status: 400 }
        );
      }
      const next = target.status === "active" ? "inactive" : "active";
      const user = await setUserStatus(params.id, next);
      return NextResponse.json(user);
    }

    return NextResponse.json({ message: "Aksi tidak dikenal" }, { status: 400 });
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

export async function DELETE(request: Request, { params }: Params) {
  const actor = getActor(request);
  if (!canMutateUsers(actor.role ?? undefined)) {
    return NextResponse.json(
      { message: "Hanya Admin yang dapat menghapus user" },
      { status: 403 }
    );
  }

  // Tidak boleh menghapus akun sendiri yang sedang login
  if (actor.id === params.id) {
    return NextResponse.json(
      { message: "Tidak dapat menghapus akun sendiri" },
      { status: 400 }
    );
  }

  try {
    const ok = await deleteUser(params.id);
    if (!ok) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }
    return NextResponse.json({ success: true });
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
