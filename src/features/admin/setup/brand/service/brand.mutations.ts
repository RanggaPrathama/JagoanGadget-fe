import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { createBrand, updateBrand, deleteBrand } from "./brand.service";
import type { BrandPayload } from "../types";
import { invalidateBrandQueries, brandListQueryKey } from "./brand.queries";

// Hook: create a new brand. Invalidates brand list queries on success.
export const useCreateBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createBrand,
    onSuccess: () => {
      toast.success("Brand berhasil ditambahkan.");
      void invalidateBrandQueries(queryClient);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menambahkan brand.")),
  });
};

// Hook: update an existing brand by ID. Invalidates brand list + detail queries on success.
export const useUpdateBrand = ({ brandId }: { brandId: string }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: BrandPayload) => updateBrand(brandId, payload),
    onSuccess: () => {
      toast.success("Brand berhasil diperbarui.");
      void invalidateBrandQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: [...brandListQueryKey, brandId],
      });
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui brand.")),
  });
};

// Hook: delete a brand by ID. Invalidates brand list queries on success.
export const useDeleteBrand = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteBrand,
    onSuccess: () => {
      toast.success("Brand berhasil dihapus.");
      void invalidateBrandQueries(queryClient);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus brand.")),
  });
};
