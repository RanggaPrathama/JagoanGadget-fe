import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

import { getErrorMessage } from "@/utils/error";
import type { UnwrappedPaginated } from "@/lib/api-response";
import { deleteRole, getRoles, type RoleItem } from "../service/role.service";
import { invalidateMe } from "@/features/auth/service/me.service";

export const roleListQueryKey = ["roles"] as const;

export type RoleStats = {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
};

export function useRoleList(search?: string, page = 1, limit = 25) {
  const queryClient = useQueryClient();
  const roleQuery = useQuery({
    queryKey: [...roleListQueryKey, search ?? "", page, limit],
    queryFn: () => getRoles({ search, page, limit }),
  });

  const data = roleQuery.data as UnwrappedPaginated<RoleItem> | undefined;
  const roles = data?.items ?? [];
  const pagination = data?.pagination;
  const totalRoles = pagination?.totalItems ?? roles.length;
  const activeRoles = roles.filter((role) => role.isActive ?? true).length;
  const systemRoles = roles.filter((role) => role.isSystem === true).length;
  const customRoles = roles.filter((role) => role.isSystem !== true).length;

  const deleteMutation = useMutation({
    mutationFn: deleteRole,
    onSuccess: async () => {
      toast.success("Role berhasil dihapus.");
      await queryClient.invalidateQueries({ queryKey: roleListQueryKey });
      await invalidateMe(queryClient);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal menghapus role."));
    },
  });

  return {
    roles,
    totalRoles,
    pagination,
    stats: {
      totalRoles,
      activeRoles,
      systemRoles,
      customRoles,
    } satisfies RoleStats,
    isLoading: roleQuery.isLoading,
    isRefreshing: roleQuery.isFetching,
    isDeleting: deleteMutation.isPending,
    refetchRoles: async () => {
      await roleQuery.refetch();
    },
    deleteRole: async (roleId: string) => {
      await deleteMutation.mutateAsync(roleId);
    },
  };
}
