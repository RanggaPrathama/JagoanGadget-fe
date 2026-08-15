import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import {
  deleteMenu,
  createMenu,
  updateMenu,
  generateMenuCode,
} from "./menu.service";
import type { MenuPayload } from "../types";
import { invalidateMenuQueries } from "./menu.queries";
import { invalidateMe } from "@/features/auth/service/me.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;

type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

type UseDeleteMenuOptions = { mutationConfig?: MutationConfig<typeof deleteMenu> };

// Hook: delete a menu by ID. Invalidates menu list queries and the current-user access-control cache on success.
export const useDeleteMenu = ({ mutationConfig }: UseDeleteMenuOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deleteMenu,
    onSuccess: (...args: SuccessParams<typeof deleteMenu>) => {
      toast.success("Menu berhasil dihapus.");
      void invalidateMenuQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menghapus menu.")),
  });
};

// Hook: request auto-generated menu code from the server (name + parentId → code slug + route). No cache invalidation needed.
type UseGenerateMenuCodeOptions = {
  mutationConfig?: MutationConfig<typeof generateMenuCode>;
};

export const useGenerateMenuCode = ({
  mutationConfig,
}: UseGenerateMenuCodeOptions = {}) => {
  return useMutation({
    ...mutationConfig,
    mutationFn: generateMenuCode,
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal membuat kode menu secara otomatis.")),
  });
};

// Hook: create a new menu. Invalidates menu list queries and the current-user access-control cache on success.
type UseCreateMenuOptions = { mutationConfig?: MutationConfig<typeof createMenu> };

export const useCreateMenu = ({ mutationConfig }: UseCreateMenuOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createMenu,
    onSuccess: (...args: SuccessParams<typeof createMenu>) => {
      toast.success("Menu berhasil ditambahkan.");
      void invalidateMenuQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menambahkan menu.")),
  });
};

// Hook: update an existing menu by ID. Invalidates menu list + detail queries and the current-user access-control cache on success.
type UseUpdateMenuOptions = {
  menuId: string;
  mutationConfig?: MutationConfig<UpdateMenuFn>;
};

type UpdateMenuFn = (payload: MenuPayload) => Promise<Awaited<ReturnType<typeof updateMenu>>>;

export const useUpdateMenu = ({ menuId, mutationConfig }: UseUpdateMenuOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: (payload: MenuPayload) => updateMenu(menuId, payload),
    onSuccess: (...args: SuccessParams<UpdateMenuFn>) => {
      toast.success("Menu berhasil diperbarui.");
      void invalidateMenuQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal memperbarui menu.")),
  });
};
