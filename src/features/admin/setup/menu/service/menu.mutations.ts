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
