import { useState } from "react";
import { useGetPermissionsListQuery, useDeletePermission, permissionListQueryKey } from "../service";
import type { PermissionItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

// Re-export the query key so existing consumers (e.g. usePermissionForm) keep working.
export { permissionListQueryKey };

// Loads the paginated permission list and exposes delete + refetch helpers.
export function usePermissionList(search?: string, page = 1, limit = 25) {
  // Fetch the permission list via the shared query hook.
  const query = useGetPermissionsListQuery({ search, page, limit });
  const data = query.data as UnwrappedPaginated<PermissionItem> | undefined;

  // Derive the rows/pagination the view needs from the query result.
  const permissions = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPermissions = pagination?.totalItems ?? 0;

  // Delete mutation (toast + cache invalidation handled inside the hook).
  const deleteMutation = useDeletePermission();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const selectedPermission = permissions.find((p) => p.id === selectedId) ?? null;

  return {
    permissions,
    totalPermissions,
    pagination,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    isDeleting: deleteMutation.isPending,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedPermission,
    refetchPermissions: async () => {
      await query.refetch();
    },
    deletePermission: async (permissionId: string) => {
      await deleteMutation.mutateAsync(permissionId);
    },
  };
}
