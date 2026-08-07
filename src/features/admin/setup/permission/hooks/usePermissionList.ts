import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  deletePermission,
  getPermissions,
} from "../service/permission.service";
import type { PermissionItem } from "../service/permission.service";
import type { UnwrappedPaginated } from "@/lib/api-response";
import { invalidateMe } from "@/features/auth/service/me.service";

export const permissionListQueryKey = ["permissions"] as const;

export function usePermissionList(search?: string, page = 1, limit = 10) {
  const queryClient = useQueryClient();
  const permissionQuery = useQuery({
    queryKey: [...permissionListQueryKey, search ?? "", page, limit],
    queryFn: () => getPermissions({ search, page, limit }),
  });

  const data = permissionQuery.data as UnwrappedPaginated<PermissionItem> | undefined;
  const permissions = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPermissions = pagination?.totalItems ?? 0;

  const deleteMutation = useMutation({
    mutationFn: deletePermission,
    onSuccess: async () => {
      toast.success("Permission berhasil dihapus.");
      await queryClient.invalidateQueries({
        queryKey: permissionListQueryKey,
      });
      await invalidateMe(queryClient);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal menghapus permission."));
    },
  });

  return {
    permissions,
    totalPermissions,
    pagination,
    isLoading: permissionQuery.isLoading,
    isRefreshing: permissionQuery.isFetching,
    isDeleting: deleteMutation.isPending,
    refetchPermissions: async () => {
      await permissionQuery.refetch();
    },
    deletePermission: async (permissionId: string) => {
      await deleteMutation.mutateAsync(permissionId);
    },
  };
}
