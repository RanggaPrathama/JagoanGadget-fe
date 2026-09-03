import {
  queryOptions,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getRoles, getRoleById } from "./role.service";

// Base query key for all role queries (used for invalidation).
export const roleListQueryKey = ["roles"] as const;

export type RoleListParams = {
  search?: string;
  page?: number;
  show?: "active" | "inactive" | "all";
  limit?: number;
};

// Build the full query key including current filter/page params.
export const getRoleListQueryKey = (params?: RoleListParams): unknown[] => [
  ...roleListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.show ?? "all",
  params?.limit ?? 25,
];

// queryOptions for the role list (used by hooks and route prefetch).
export const getRoleListQueryOptions = (params?: RoleListParams) =>
  queryOptions({
    queryKey: getRoleListQueryKey(params),
    queryFn: () => getRoles(params),
  });

// queryOptions for a single role (detail/edit screens).
export const getRoleByIdQueryOptions = (roleId: string) =>
  queryOptions({
    queryKey: [...roleListQueryKey, roleId],
    queryFn: () => getRoleById(roleId),
  });

// Hook: paginated role list.
export const useGetRoleListQuery = (
  params?: RoleListParams,
  {
    queryConfig,
  }: { queryConfig?: QueryConfig<typeof getRoleListQueryOptions> } = {},
) => useQuery({ ...getRoleListQueryOptions(params), ...queryConfig });

// Hook: single role by id.
export const useGetRoleByIdQuery = (
  roleId: string,
  {
    queryConfig,
  }: { queryConfig?: QueryConfig<typeof getRoleByIdQueryOptions> } = {},
) => useQuery({ ...getRoleByIdQueryOptions(roleId), ...queryConfig });

// Invalidate every role query so list/detail observers refetch.
export function invalidateRoleQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: roleListQueryKey });
}
