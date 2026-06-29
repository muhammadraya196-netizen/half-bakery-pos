import type { UserRole } from "@/types";

/**
 * Role-Based Access Control untuk modul Manajemen User.
 * "manager" diperlakukan setara admin (kompatibilitas data lama).
 */

const ADMIN_ROLES: UserRole[] = ["admin", "manager"];

/** Boleh membuka & melihat daftar user (Admin, Finance, Manager). */
export function canViewUsers(role?: UserRole): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role) || role === "finance";
}

/** Boleh membuat / mengubah / menghapus user (Admin saja). */
export function canMutateUsers(role?: UserRole): boolean {
  if (!role) return false;
  return ADMIN_ROLES.includes(role);
}

/** Boleh mengubah role / reset password / aktif-nonaktif (Admin saja). */
export function canManageUserAccess(role?: UserRole): boolean {
  return canMutateUsers(role);
}
