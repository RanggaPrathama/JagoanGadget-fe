import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getPermissions, getPermissionById } from "./permission.service";

// Base query key for all permission queries (used for invalidation).
export const permissionListQueryKey = ["permissions"] as const;

export type PermissionListParams = {
  search?: string;
  page?: number;
  limit?: number;
};

// Build the full query key including current filter/page params.
export const getPermissionsListQueryKey = (
  params?: PermissionListParams,
): unknown[] => [
  ...permissionListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.limit ?? 25,
];

// queryOptions for the permission list (used by hooks and route prefetch).
export const getPermissionsListQueryOptions = (params?: PermissionListParams) =>
  queryOptions({
    queryKey: getPermissionsListQueryKey(params),
    queryFn: () => getPermissions(params),
  });

// queryOptions for a single permission (detail/edit screens).
export const getPermissionByIdQueryOptions = (permissionId: string) =>
  queryOptions({
    queryKey: [...permissionListQueryKey, permissionId],
    queryFn: () => getPermissionById(permissionId),
  });

// Hook: paginated permission list.
export const useGetPermissionsListQuery = (
  params?: PermissionListParams,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getPermissionsListQueryOptions> } = {},
) => useQuery({ ...getPermissionsListQueryOptions(params), ...queryConfig });

// Hook: single permission by id.
export const useGetPermissionByIdQuery = (
  permissionId: string,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getPermissionByIdQueryOptions> } = {},
) => useQuery({ ...getPermissionByIdQueryOptions(permissionId), ...queryConfig });

// Invalidate every permission query so list/detail observers refetch.
export function invalidatePermissionQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: permissionListQueryKey });
}
