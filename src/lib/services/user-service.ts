import type { ManagedUser, UserQuery, UserResult } from "@/types";
import { toIndonesiaDateKey } from "@/lib/services/sales-service";

/** Filter daftar user (semua filter dapat digabungkan). */
export function filterUsers(
  users: ManagedUser[],
  query: UserQuery
): ManagedUser[] {
  const { search, role, status, startDate, endDate } = query;

  return users.filter((u) => {
    if (role && role !== "all" && u.role !== role) return false;
    if (status && status !== "all" && u.status !== status) return false;

    if (startDate || endDate) {
      const key = toIndonesiaDateKey(new Date(u.createdAt));
      if (startDate && key < startDate) return false;
      if (endDate && key > endDate) return false;
    }

    if (search) {
      const q = search.toLowerCase().trim();
      const haystack = `${u.name} ${u.username} ${u.email}`.toLowerCase();
      if (!haystack.includes(q)) return false;
    }

    return true;
  });
}

/** Filter + paginasi (limit & offset). */
export function queryUsers(
  users: ManagedUser[],
  query: UserQuery
): UserResult {
  const filtered = filterUsers(users, query);

  const limit =
    typeof query.limit === "number" && query.limit > 0 ? query.limit : 10;
  const offset =
    typeof query.offset === "number" && query.offset >= 0 ? query.offset : 0;

  const data = filtered.slice(offset, offset + limit);

  return { data, total: filtered.length, limit, offset };
}
