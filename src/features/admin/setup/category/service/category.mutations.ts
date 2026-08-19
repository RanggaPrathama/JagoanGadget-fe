import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { createCategory, updateCategory, deleteCategory } from "./category.service";
import type { CategoryPayload } from "../types";
import { invalidateCategoryQueries, categoryListQueryKey } from "./category.queries";

// Hook: create a new category. Invalidates category list queries on success.
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createCategory,
    onSuccess: () => {
      toast.success("Kategori berhasil ditambahkan.");
      void invalidateCategoryQueries(queryClient);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menambahkan kategori.")),
  });
};

// Hook: update an existing category by ID. Invalidates category list + detail queries on success.
export const useUpdateCategory = ({ categoryId }: { categoryId: string }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CategoryPayload) => updateCategory(categoryId, payload),
    onSuccess: () => {
      toast.success("Kategori berhasil diperbarui.");
      void invalidateCategoryQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: [...categoryListQueryKey, categoryId],
      });
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui kategori.")),
  });
};

// Hook: delete a category by ID. Invalidates category list queries on success.
export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteCategory,
    onSuccess: () => {
      toast.success("Kategori berhasil dihapus.");
      void invalidateCategoryQueries(queryClient);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus kategori.")),
  });
};
