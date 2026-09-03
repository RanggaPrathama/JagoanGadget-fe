import { useState } from "react";
import type { UnwrappedPaginated } from "@/lib/api-response";
import { useDeleteRole, useGetRoleListQuery } from "../service";
import type { RoleItem, RoleStats } from "../types";
import { Shield, ShieldCheck, Users, type LucideIcon } from "lucide-react";
import { useGetRoleStatisticsQuery } from "../service/role.queries";

// Loads the paginated role list and exposes stats, delete + refetch helpers.
export function useRoleList(
  search?: string,
  page = 1,
  show?: "active" | "inactive" | "all",
  limit = 25,
) {
  const query = useGetRoleListQuery({ search, page, show, limit });
  const data = query.data as UnwrappedPaginated<RoleItem> | undefined;

  const roles = data?.items ?? [];
  const pagination = data?.pagination;
  const totalRoles = pagination?.totalItems ?? roles.length;

  const dataStats = useGetRoleStatisticsQuery();
  const stats = dataStats.data as RoleStats | undefined;

  const deleteMutation = useDeleteRole();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const selectedRole = roles.find((role) => role.id === selectedId) ?? null;

  // type Role stats
  const ROLE_STATS: {
    key: keyof RoleStats;
    title: string;
    icon: LucideIcon;
  }[] = [
    { key: "totalRole", title: "Total Roles", icon: Users },
    { key: "totalActiveRole", title: "Active Roles", icon: ShieldCheck },
    { key: "totalInactiveRole", title: "Inactive Roles", icon: Shield },
  ];

  return {
    ROLE_STATS,
    roles,
    totalRoles,
    pagination,
    stats: {
      totalRole: stats?.totalRole ?? totalRoles,
      totalActiveRole: stats?.totalActiveRole ?? 0,
      totalInactiveRole: stats?.totalInactiveRole ?? 0,
    },
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
