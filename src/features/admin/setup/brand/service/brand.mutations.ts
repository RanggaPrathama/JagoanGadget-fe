import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import { createBrand, updateBrand, deleteBrand } from "./brand.service";
import type { BrandPayload } from "../types";
import { invalidateBrandQueries, brandListQueryKey } from "./brand.queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;
type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

// Hook: create a new brand. Invalidates brand list queries on success.
export const useCreateBrand = ({ mutationConfig }: { mutationConfig?: MutationConfig<typeof createBrand> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createBrand,
    onSuccess: (...args: SuccessParams<typeof createBrand>) => {
      toast.success("Brand berhasil ditambahkan.");
      void invalidateBrandQueries(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menambahkan brand.")),
  });
};

// Hook: update an existing brand by ID. Invalidates brand list + detail queries on success.
export const useUpdateBrand = ({ brandId, mutationConfig }: { brandId: string; mutationConfig?: MutationConfig<typeof updateBrand> }) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: (payload: BrandPayload) => updateBrand(brandId, payload),
    onSuccess: (...args: SuccessParams<typeof updateBrand>) => {
      toast.success("Brand berhasil diperbarui.");
      void invalidateBrandQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: [...brandListQueryKey, brandId] });
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal memperbarui brand.")),
  });
};

// Hook: delete a brand by ID. Invalidates brand list queries on success.
export const useDeleteBrand = ({ mutationConfig }: { mutationConfig?: MutationConfig<typeof deleteBrand> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deleteBrand,
    onSuccess: (...args: SuccessParams<typeof deleteBrand>) => {
      toast.success("Brand berhasil dihapus.");
      void invalidateBrandQueries(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menghapus brand.")),
  });
};
