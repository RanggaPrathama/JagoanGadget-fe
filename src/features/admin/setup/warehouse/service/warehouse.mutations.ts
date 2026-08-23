import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import { deleteWarehouse, createWarehouse, updateWarehouse } from "./warehouse.service";
import type { WarehousePayload } from "../types";
import { invalidateWarehouseQueries } from "./warehouse.queries";
import { invalidateMe } from "@/features/auth/service/me.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;

type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

// Hook: delete a warehouse by ID. Invalidates warehouse list queries and the current-user access-control cache on success.
export const useDeleteWarehouse = ({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof deleteWarehouse> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deleteWarehouse,
    onSuccess: (...args: SuccessParams<typeof deleteWarehouse>) => {
      toast.success("Warehouse berhasil dihapus.");
      void invalidateWarehouseQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus warehouse.")),
  });
};

// Hook: create a new warehouse. Invalidates warehouse list queries and the current-user access-control cache on success.
export const useCreateWarehouse = ({
  mutationConfig,
}: { mutationConfig?: MutationConfig<typeof createWarehouse> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createWarehouse,
    onSuccess: (...args: SuccessParams<typeof createWarehouse>) => {
      toast.success("Warehouse berhasil ditambahkan.");
      void invalidateWarehouseQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menambahkan warehouse.")),
  });
};

// Hook: update an existing warehouse by ID. Invalidates warehouse list + detail queries and the current-user access-control cache on success.
export const useUpdateWarehouse = ({
  warehouseId,
  mutationConfig,
}: {
  warehouseId: string;
  mutationConfig?: MutationConfig<UpdateWarehouseFn>;
}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: (payload: WarehousePayload) =>
      updateWarehouse(warehouseId, payload),
    onSuccess: (...args: SuccessParams<UpdateWarehouseFn>) => {
      toast.success("Warehouse berhasil diperbarui.");
      void invalidateWarehouseQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui warehouse.")),
  });
};

type UpdateWarehouseFn = (
  payload: WarehousePayload,
) => Promise<Awaited<ReturnType<typeof updateWarehouse>>>;
