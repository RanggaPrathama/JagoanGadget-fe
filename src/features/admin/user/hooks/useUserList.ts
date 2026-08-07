import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import type { UnwrappedPaginated } from "@/lib/api-response";
import { getErrorMessage } from "@/utils/error";
import { deleteUser, getUsers } from "../service/user.service";
import type { UserEntity } from "../types";

export const userListQueryKey = ["users"] as const;

export function useUserList(search?: string, page = 1, limit = 25) {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: [...userListQueryKey, search ?? "", page, limit],
    queryFn: () => getUsers({ search, page, limit }),
  });

  const data = query.data as UnwrappedPaginated<UserEntity> | undefined;
  const users = data?.items ?? [];
  const pagination = data?.pagination;
  const totalUsers = pagination?.totalItems ?? users.length;
  
  const activeUsers = users.filter((u) => u.isActive).length;
  const superadmins = users.filter((u) => u.isSuperadmin).length;

  const deleteMutation = useMutation({
    mutationFn: deleteUser,
    onSuccess: async () => {
      toast.success("User berhasil dihapus.");
      await queryClient.invalidateQueries({ queryKey: userListQueryKey });
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal menghapus user."));
    },
  });

  return {
    users,
    totalUsers,
    pagination,
    stats: {
      totalUsers,
      activeUsers,
      superadmins,
    },
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
