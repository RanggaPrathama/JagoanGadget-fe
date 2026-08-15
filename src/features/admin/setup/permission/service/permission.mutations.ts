import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import {
  deletePermission,
  createPermission,
  updatePermission,
} from "./permission.service";
import type { PermissionPayload } from "../types";
import { invalidatePermissionQueries } from "./permission.queries";
import { invalidateMe } from "@/features/auth/service/me.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;
type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

// Delete a permission, then refresh caches + access control.
type UseDeletePermissionOptions = {
  mutationConfig?: MutationConfig<typeof deletePermission>;
};
export const useDeletePermission = ({
  mutationConfig,
}: UseDeletePermissionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deletePermission,
    onSuccess: (...args: SuccessParams<typeof deletePermission>) => {
      toast.success("Permission berhasil dihapus.");
      void invalidatePermissionQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus permission.")),
  });
};

// Create a permission, then refresh caches + access control.
type UseCreatePermissionOptions = {
  mutationConfig?: MutationConfig<typeof createPermission>;
};
export const useCreatePermission = ({
  mutationConfig,
}: UseCreatePermissionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createPermission,
    onSuccess: (...args: SuccessParams<typeof createPermission>) => {
      toast.success("Permission berhasil ditambahkan.");
      void invalidatePermissionQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menambahkan permission.")),
  });
};

// Update a permission by id, then refresh caches + access control.
type UpdatePermissionFn = (payload: PermissionPayload) => Promise<Awaited<ReturnType<typeof updatePermission>>>;

type UseUpdatePermissionOptions = {
  permissionId: string;
  mutationConfig?: MutationConfig<UpdatePermissionFn>;
};
export const useUpdatePermission = ({
  permissionId,
  mutationConfig,
}: UseUpdatePermissionOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  const typedRest = restConfig as Omit<
    MutationConfig<UpdatePermissionFn>,
    "onSuccess"
  >;
  return useMutation({
    ...typedRest,
    mutationFn: (payload: PermissionPayload) =>
      updatePermission(permissionId, payload),
    onSuccess: (...args: SuccessParams<UpdatePermissionFn>) => {
      toast.success("Permission berhasil diperbarui.");
      void invalidatePermissionQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui permission.")),
  });
};
