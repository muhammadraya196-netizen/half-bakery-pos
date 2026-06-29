import type { UserRole } from "@/types";

/** Konteks aktor dari header request (RBAC backend, level demo). */
export interface ActorContext {
  id: string | null;
  role: UserRole | null;
}

export function getActor(request: Request): ActorContext {
  return {
    id: request.headers.get("x-user-id"),
    role: (request.headers.get("x-user-role") as UserRole) || null,
  };
}
