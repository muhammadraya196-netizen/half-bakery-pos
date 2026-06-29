import { useSessionStore } from "@/stores/session-store";
import { canViewUsers, canMutateUsers, canManageUserAccess } from "@/lib/rbac";

/** Hook RBAC: hak akses modul Manajemen User berdasarkan role sesi. */
export function usePermissions() {
  const role = useSessionStore((s) => s.user?.role);
  const userId = useSessionStore((s) => s.user?.id);

  return {
    role,
    userId,
    canViewUsers: canViewUsers(role),
    canMutateUsers: canMutateUsers(role),
    canManageUserAccess: canManageUserAccess(role),
  };
}
