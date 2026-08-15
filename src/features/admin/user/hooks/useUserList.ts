import { useGetUserListQuery } from "../service/user.queries";
import { useDeleteUser } from "../service/user.mutations";
import type { UserEntity } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

// Loads the paginated user list and exposes stats, delete + refetch helpers.
export function useUserList(search?: string, page = 1, limit = 25) {
  const query = useGetUserListQuery({ search, page, limit });
  const data = query.data as UnwrappedPaginated<UserEntity> | undefined;

  const users = data?.items ?? [];
  const pagination = data?.pagination;
  const totalUsers = pagination?.totalItems ?? users.length;

  // Derive dashboard stats from the current page of users.
  const activeUsers = users.filter((u) => u.isActive).length;
  const superadmins = users.filter((u) => u.isSuperadmin).length;

  const deleteMutation = useDeleteUser();

  return {
    users,
    totalUsers,
    pagination,
    stats: { totalUsers, activeUsers, superadmins },
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    isDeleting: deleteMutation.isPending,
    refetchUsers: async () => {
      await query.refetch();
    },
    deleteUser: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}
