// Hook: paginated role list using shared queries/mutations.
import type { UnwrappedPaginated } from "@/lib/api-response";
import { useDeleteRole } from "../service/role.mutations";
import {
  roleListQueryKey,
  useGetRoleListQuery,
} from "../service/role.queries";
import type { RoleItem } from "../types";

// Re-export so useRoleForm (untouched) keeps working.
export { roleListQueryKey };

// Aggregate counts shown in the role list stat cards.
export type RoleStats = {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
};

// Loads the paginated role list and exposes stats, delete + refetch helpers.
export function useRoleList(search?: string, page = 1, limit = 25) {
  const query = useGetRoleListQuery({ search, page, limit });
  const data = query.data as UnwrappedPaginated<RoleItem> | undefined;

  const roles = data?.items ?? [];
  const pagination = data?.pagination;
  const totalRoles = pagination?.totalItems ?? roles.length;

  // Derive the four stat values from the current page of roles.
  const activeRoles = roles.filter((role) => role.isActive ?? true).length;
  const systemRoles = roles.filter((role) => role.isSystem === true).length;
  const customRoles = roles.filter((role) => role.isSystem !== true).length;

  const deleteMutation = useDeleteRole();

  return {
    roles,
    totalRoles,
    pagination,
    stats: { totalRoles, activeRoles, systemRoles, customRoles } satisfies RoleStats,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    isDeleting: deleteMutation.isPending,
    refetchRoles: async () => {
      await query.refetch();
    },
    deleteRole: async (roleId: string) => {
      await deleteMutation.mutateAsync(roleId);
    },
  };
}
