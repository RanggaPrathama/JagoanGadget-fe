import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { createProduct, updateProduct, deleteProduct } from "./product.service";
import type { ProductPayload } from "../types";
import { invalidateProductQueries, productListQueryKey } from "./product.queries";

// Hook: create a new product. Invalidates product list queries on success.
export const useCreateProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      toast.success("Produk berhasil ditambahkan.");
      void invalidateProductQueries(queryClient);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menambahkan produk.")),
  });
};

// Hook: update an existing product by ID. Invalidates product list + detail queries on success.
export const useUpdateProduct = ({ productId }: { productId: string }) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: ProductPayload) => updateProduct(productId, payload),
    onSuccess: () => {
      toast.success("Produk berhasil diperbarui.");
      void invalidateProductQueries(queryClient);
      void queryClient.invalidateQueries({
        queryKey: [...productListQueryKey, productId],
      });
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui produk.")),
  });
};

// Hook: delete a product by ID. Invalidates product list queries on success.
export const useDeleteProduct = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      toast.success("Produk berhasil dihapus.");
      void invalidateProductQueries(queryClient);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus produk.")),
  });
};
