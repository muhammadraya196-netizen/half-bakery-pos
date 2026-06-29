import { useSessionStore } from "@/stores/session-store";
import type {
  ManagedUser,
  UserActivity,
  UserQuery,
  UserResult,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types";

/** Header RBAC dari sesi aktif (dikirim ke backend untuk pengecekan role). */
function actorHeaders(): Record<string, string> {
  const user = useSessionStore.getState().user;
  return {
    "Content-Type": "application/json",
    "x-user-id": user?.id ?? "",
    "x-user-role": user?.role ?? "",
  };
}

async function handle<T>(res: Response): Promise<T> {
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: "Request gagal" }));
    throw new Error(err.message || `HTTP ${res.status}`);
  }
  return res.json();
}

function buildUserQueryString(query: UserQuery): string {
  const params = new URLSearchParams();
  if (query.search) params.set("search", query.search);
  if (query.role && query.role !== "all") params.set("role", query.role);
  if (query.status && query.status !== "all") params.set("status", query.status);
  if (query.startDate) params.set("startDate", query.startDate);
  if (query.endDate) params.set("endDate", query.endDate);
  if (typeof query.limit === "number") params.set("limit", String(query.limit));
  if (typeof query.offset === "number") params.set("offset", String(query.offset));
  return params.toString();
}

/** User API layer (terpisah dari hook & UI). */
export const userApi = {
  list(query: UserQuery): Promise<UserResult> {
    const qs = buildUserQueryString(query);
    return fetch(`/api/users${qs ? `?${qs}` : ""}`, {
      headers: actorHeaders(),
    }).then((r) => handle<UserResult>(r));
  },

  detail(id: string): Promise<{ user: ManagedUser; activities: UserActivity[] }> {
    return fetch(`/api/users/${id}`, { headers: actorHeaders() }).then((r) =>
      handle<{ user: ManagedUser; activities: UserActivity[] }>(r)
    );
  },

  create(payload: CreateUserPayload & { confirmPassword: string }): Promise<ManagedUser> {
    return fetch("/api/users", {
      method: "POST",
      headers: actorHeaders(),
      body: JSON.stringify(payload),
    }).then((r) => handle<ManagedUser>(r));
  },

  update(
    id: string,
    payload: UpdateUserPayload & { password?: string; confirmPassword?: string }
  ): Promise<ManagedUser> {
    return fetch(`/api/users/${id}`, {
      method: "PUT",
      headers: actorHeaders(),
      body: JSON.stringify(payload),
    }).then((r) => handle<ManagedUser>(r));
  },

  remove(id: string): Promise<{ success: boolean }> {
    return fetch(`/api/users/${id}`, {
      method: "DELETE",
      headers: actorHeaders(),
    }).then((r) => handle<{ success: boolean }>(r));
  },

  resetPassword(id: string, password: string): Promise<ManagedUser> {
    return fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: actorHeaders(),
      body: JSON.stringify({ action: "reset-password", password }),
    }).then((r) => handle<ManagedUser>(r));
  },

  toggleStatus(id: string): Promise<ManagedUser> {
    return fetch(`/api/users/${id}`, {
      method: "PATCH",
      headers: actorHeaders(),
      body: JSON.stringify({ action: "toggle-status" }),
    }).then((r) => handle<ManagedUser>(r));
  },
};
