// src/features/admin/setup/category/service/category.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import { createCategory, updateCategory, deleteCategory } from "./category.service";
import type { CategoryPayload } from "../types";
import { invalidateCategoryQueries, categoryListQueryKey } from "./category.queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;
type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

export const useCreateCategory = ({ mutationConfig }: { mutationConfig?: MutationConfig<typeof createCategory> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createCategory,
    onSuccess: (...args: SuccessParams<typeof createCategory>) => {
      toast.success("Kategori berhasil ditambahkan.");
      void invalidateCategoryQueries(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menambahkan kategori.")),
  });
};

export const useUpdateCategory = ({ categoryId, mutationConfig }: { categoryId: string; mutationConfig?: MutationConfig<typeof updateCategory> }) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: (payload: CategoryPayload) => updateCategory(categoryId, payload),
    onSuccess: (...args: SuccessParams<typeof updateCategory>) => {
      toast.success("Kategori berhasil diperbarui.");
      void invalidateCategoryQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: [...categoryListQueryKey, categoryId] });
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal memperbarui kategori.")),
  });
};

export const useDeleteCategory = ({ mutationConfig }: { mutationConfig?: MutationConfig<typeof deleteCategory> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deleteCategory,
    onSuccess: (...args: SuccessParams<typeof deleteCategory>) => {
      toast.success("Kategori berhasil dihapus.");
      void invalidateCategoryQueries(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menghapus kategori.")),
  });
};
