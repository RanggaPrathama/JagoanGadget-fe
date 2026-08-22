// Hook: paginated role list using shared queries/mutations.
import { useState } from "react";
import type { UnwrappedPaginated } from "@/lib/api-response";
import {
  useDeleteRole,
  roleListQueryKey,
  useGetRoleListQuery,
} from "../service";
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

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const selectedRole = roles.find((role) => role.id === selectedId) ?? null;

  return {
    roles,
    totalRoles,
    pagination,
    stats: { totalRoles, activeRoles, systemRoles, customRoles } satisfies RoleStats,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    isDeleting: deleteMutation.isPending,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedRole,
    refetchRoles: async () => {
      await query.refetch();
    },
    deleteRole: async (roleId: string) => {
      await deleteMutation.mutateAsync(roleId);
    },
  };
}
