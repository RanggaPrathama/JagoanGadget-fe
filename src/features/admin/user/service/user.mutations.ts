import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import {
  deleteUser,
  createUser,
  updateUser,
} from "./user.service";
import type { UserFormInput } from "../types";
import { invalidateUserQueries } from "./user.queries";
import { invalidateMe } from "@/features/auth/service/me.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;
type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

// Delete a user, then refresh caches + access control.
type UseDeleteUserOptions = {
  mutationConfig?: MutationConfig<typeof deleteUser>;
};
export const useDeleteUser = ({
  mutationConfig,
}: UseDeleteUserOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deleteUser,
    onSuccess: (...args: SuccessParams<typeof deleteUser>) => {
      toast.success("User berhasil dihapus.");
      void invalidateUserQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus user.")),
  });
};

// Create a user, then refresh caches + access control.
type UseCreateUserOptions = {
  mutationConfig?: MutationConfig<typeof createUser>;
};
export const useCreateUser = ({
  mutationConfig,
}: UseCreateUserOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createUser,
    onSuccess: (...args: SuccessParams<typeof createUser>) => {
      toast.success("User berhasil ditambahkan.");
      void invalidateUserQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menambahkan user.")),
  });
};

// Update a user by id, then refresh caches + access control.
type UpdateUserFn = (
  payload: UserFormInput,
) => Promise<Awaited<ReturnType<typeof updateUser>>>;

type UseUpdateUserOptions = {
  userId: string;
  mutationConfig?: MutationConfig<UpdateUserFn>;
};
export const useUpdateUser = ({
  userId,
  mutationConfig,
}: UseUpdateUserOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  const typedRest = restConfig as Omit<
    MutationConfig<UpdateUserFn>,
    "onSuccess"
  >;
  return useMutation({
    ...typedRest,
    mutationFn: (payload: UserFormInput) =>
      updateUser(userId, payload),
    onSuccess: (...args: SuccessParams<UpdateUserFn>) => {
      toast.success("User berhasil diperbarui.");
      void invalidateUserQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui user.")),
  });
};
