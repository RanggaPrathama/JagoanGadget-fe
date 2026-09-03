// Hook: paginated role list using shared queries/mutations.
import { useState } from "react";
import type { UnwrappedPaginated } from "@/lib/api-response";
import { useDeleteRole, useGetRoleListQuery } from "../service";
import type { RoleItem, RoleStats } from "../types";
import {
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
  type LucideIcon,
} from "lucide-react";

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

  // Derive the four stat values from the current page of roles.
  const activeRoles = roles.filter((role) => role.isActive ?? true).length;
  const systemRoles = roles.filter((role) => role.isSystem === true).length;
  const customRoles = roles.filter((role) => role.isSystem !== true).length;

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
    { key: "totalRoles", title: "Total Roles", icon: Users },
    { key: "activeRoles", title: "Active Roles", icon: ShieldCheck },
    { key: "systemRoles", title: "System Roles", icon: Shield },
    { key: "customRoles", title: "Custom Roles", icon: Sparkles },
  ];

  return {
    ROLE_STATS,
    roles,
    totalRoles,
    pagination,
    stats: {
      totalRoles,
      activeRoles,
      systemRoles,
      customRoles,
    } satisfies RoleStats,
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
