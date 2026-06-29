import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from "@tanstack/react-query";
import { userApi } from "@/lib/api/user-api";
import type {
  UserQuery,
  UserResult,
  CreateUserPayload,
  UpdateUserPayload,
} from "@/types";

export function useUsers(query: UserQuery, enabled = true) {
  return useQuery<UserResult>({
    queryKey: ["users", "list", query],
    queryFn: () => userApi.list(query),
    placeholderData: keepPreviousData,
    enabled,
  });
}

export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: ["users", "detail", id],
    queryFn: () => userApi.detail(id),
    enabled: enabled && !!id,
  });
}

export function useCreateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateUserPayload & { confirmPassword: string }) =>
      userApi.create(payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useUpdateUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      payload,
    }: {
      id: string;
      payload: UpdateUserPayload & { password?: string; confirmPassword?: string };
    }) => userApi.update(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.remove(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useResetUserPassword() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, password }: { id: string; password: string }) =>
      userApi.resetPassword(id, password),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}

export function useToggleUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => userApi.toggleStatus(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["users"] }),
  });
}
