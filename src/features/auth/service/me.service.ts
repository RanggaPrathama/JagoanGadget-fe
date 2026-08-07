import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { api } from "@/lib/axios";
import type { MeResponse } from "@/features/auth/types/me";

export const meQueryKey = ["me"] as const;

/**
 * Mark the `/me` cache stale so active observers refetch.
 * Call after mutations that change the current user's access-control tree
 * (role/permission/menu changes, role assignment).
 */
export function invalidateMe(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: meQueryKey });
}

export async function getMe() {
  const response = await api.get<MeResponse>("/me");
  return response.data.data;
}

export function meQueryOptions() {
  return queryOptions({
    queryKey: meQueryKey,
    queryFn: getMe,
  });
}
