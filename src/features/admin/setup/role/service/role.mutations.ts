import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import {
  deleteRole,
  createRole,
  updateRole,
} from "./role.service";
import type { RolePayload } from "../types";
import { invalidateRoleQueries } from "./role.queries";
import { invalidateMe } from "@/features/auth/service/me.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;
type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

// Delete a role, then refresh caches + access control.
type UseDeleteRoleOptions = {
  mutationConfig?: MutationConfig<typeof deleteRole>;
};
export const useDeleteRole = ({
  mutationConfig,
}: UseDeleteRoleOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deleteRole,
    onSuccess: (...args: SuccessParams<typeof deleteRole>) => {
      toast.success("Role berhasil dihapus.");
      void invalidateRoleQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus role.")),
  });
};

// Create a role, then refresh caches + access control.
type UseCreateRoleOptions = {
  mutationConfig?: MutationConfig<typeof createRole>;
};
export const useCreateRole = ({
  mutationConfig,
}: UseCreateRoleOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createRole,
    onSuccess: (...args: SuccessParams<typeof createRole>) => {
      toast.success("Role berhasil ditambahkan.");
      void invalidateRoleQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menambahkan role.")),
  });
};

// Update a role by id, then refresh caches + access control.
type UpdateRoleFn = (payload: RolePayload) => Promise<Awaited<ReturnType<typeof updateRole>>>;

type UseUpdateRoleOptions = {
  roleId: string;
  mutationConfig?: MutationConfig<UpdateRoleFn>;
};
export const useUpdateRole = ({
  roleId,
  mutationConfig,
}: UseUpdateRoleOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  const typedRest = restConfig as Omit<
    MutationConfig<UpdateRoleFn>,
    "onSuccess"
  >;
  return useMutation({
    ...typedRest,
    mutationFn: (payload: RolePayload) =>
      updateRole(roleId, payload),
    onSuccess: (...args: SuccessParams<UpdateRoleFn>) => {
      toast.success("Role berhasil diperbarui.");
      void invalidateRoleQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui role.")),
  });
};
