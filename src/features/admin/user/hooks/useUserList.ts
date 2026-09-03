import { useState } from "react";
import {
  useGetUserListQuery,
  useDeleteUser,
  useGetUserStatisticsQuery,
} from "../service";
import type { UserEntity, UserStats } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";
import { UserMinus, UserCheck, Users, type LucideIcon } from "lucide-react";

export function useUserList(search?: string, page = 1, limit = 25) {
  // getUserListQuery returns a paginated list of users, with optional search and pagination params.
  const query = useGetUserListQuery({ search, page, limit });
  const data = query.data as UnwrappedPaginated<UserEntity> | undefined;

  const users = data?.items ?? [];
  const pagination = data?.pagination;
  const totalUsers = pagination?.totalItems ?? users.length;

  // getUserStatisticsQuery returns the total number of users, active users, inactive users, and superadmins.
  const dataStats = useGetUserStatisticsQuery();
  const stats = dataStats.data as UserStats | undefined;

  const deleteMutation = useDeleteUser();

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const selectedUser = users.find((u) => u.id === selectedId) ?? null;

  const USER_STATS: {
    key: keyof UserStats;
    title: string;
    icon: LucideIcon;
  }[] = [
    { key: "totalUsers", title: "Total Users", icon: Users },
    { key: "totalActiveUsers", title: "Active Users", icon: UserCheck },
    { key: "totalInactiveUsers", title: "Inactive Users", icon: UserMinus },
    { key: "totalSuperAdmins", title: "Superadmin", icon: Users },
  ];
  return {
    USER_STATS,
    users,
    totalUsers,
    pagination,
    stats: {
      totalUsers: stats?.totalUsers ?? totalUsers,
      totalActiveUsers: stats?.totalActiveUsers ?? 0,
      totalInactiveUsers: stats?.totalInactiveUsers ?? 0,
      totalSuperAdmins: stats?.totalSuperAdmins ?? 0,
    },
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    isDeleting: deleteMutation.isPending,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedUser,
    refetchUsers: async () => {
      await query.refetch();
    },
    deleteUser: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}
