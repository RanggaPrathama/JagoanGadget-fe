import { useState } from "react";
import { useDeleteWarehouse } from "../service/warehouse.mutations";
import { useGetWarehousesListQuery } from "../service/warehouse.queries";
import type { WarehouseItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

export type WarehouseTableRow = WarehouseItem & {
  /** Display label for the address column — "—" when the address is null/empty. */
  addressLabel: string;
};

// Hook: fetch, shape, and manage the warehouse list table data. Maps raw API rows to WarehouseTableRow with a normalized address label.
export function useWarehouseList(
  search?: string,
  show?: "active" | "inactive" | "all",
  page = 1,
  limit = 25,
) {
  const showParam = show === "all" ? undefined : show;

  const warehouseQuery = useGetWarehousesListQuery(
    { search, show: showParam, page, limit },
    { queryConfig: { enabled: true } },
  );

  // Selection + delete confirmation state.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteMutation = useDeleteWarehouse();

  const data = warehouseQuery.data as UnwrappedPaginated<WarehouseItem> | undefined;
  const rawWarehouses = data?.items ?? [];
  const pagination = data?.pagination;
  const totalWarehouses = pagination?.totalItems ?? 0;

  // Map API rows to table rows: normalize the address to a display label and keep all original fields.
  const warehouses: WarehouseTableRow[] = rawWarehouses.map((warehouse) => ({
    ...warehouse,
    addressLabel: warehouse.address?.trim() ? warehouse.address : "—",
    isActive: warehouse.isActive ?? true,
  }));

  const selectedWarehouse = warehouses.find((w) => w.id === selectedId) ?? null;

  return {
    warehouses,
    totalWarehouses,
    pagination,
    isLoading: warehouseQuery.isLoading,
    isRefreshing: warehouseQuery.isFetching,
    isDeleting: deleteMutation.isPending,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedWarehouse,
    refetchWarehouses: async () => {
      await warehouseQuery.refetch();
    },
    deleteWarehouse: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}
