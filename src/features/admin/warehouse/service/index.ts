export {
  warehouseListQueryKey,
  getWarehousesListQueryKey,
  getWarehousesListQueryOptions,
  getWarehouseByIdQueryOptions,
  useGetWarehousesListQuery,
  useGetWarehouseByIdQuery,
  invalidateWarehouseQueries,
} from "./warehouse.queries";
export {
  useDeleteWarehouse,
  useCreateWarehouse,
  useUpdateWarehouse,
} from "./warehouse.mutations";

export {
  getWarehousesList,
  getWarehouseById,
  createWarehouse,
  updateWarehouse,
  deleteWarehouse,
} from "./warehouse.service";
