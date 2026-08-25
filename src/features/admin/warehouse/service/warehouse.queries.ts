import {
  queryOptions,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getWarehousesList, getWarehouseById } from "./warehouse.service";

// Base query key for all warehouse list queries — used as the root key for invalidation.
export const warehouseListQueryKey = ["warehouses"] as const;

// Filter params shape accepted by warehouse list queries.
export type WarehouseListParams = {
  search?: string;
  show?: "active" | "inactive";
  page?: number;
  limit?: number;
  no_pagination?: boolean;
};

// Build a stable query key that includes filter + pagination params so TanStack Query caches each combination separately.
export const getWarehousesListQueryKey = (
  params?: WarehouseListParams,
): unknown[] => [
  ...warehouseListQueryKey,
  params?.search ?? "",
  params?.show ?? "all",
  params?.page ?? 1,
  params?.limit ?? 25,
  params?.no_pagination ?? false,
];

// Query options factory for the paginated warehouse list — callers spread these into useQuery or prefetch.
export const getWarehousesListQueryOptions = (params?: WarehouseListParams) =>
  queryOptions({
    queryKey: getWarehousesListQueryKey(params),
    queryFn: () => getWarehousesList(params),
  });

// Query options factory for a single warehouse detail by ID — keyed under warehouseListQueryKey + id.
export const getWarehouseByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...warehouseListQueryKey, id],
    queryFn: () => getWarehouseById(id),
  });

type UseWarehousesQueryOptions = {
  queryConfig?: QueryConfig<typeof getWarehousesListQueryOptions>;
};

// Hook: fetch paginated warehouse list with optional filter/pagination params and extra queryConfig override.
export const useGetWarehousesListQuery = (
  params?: WarehouseListParams,
  { queryConfig }: UseWarehousesQueryOptions = {},
) => useQuery({ ...getWarehousesListQueryOptions(params), ...queryConfig });

// Hook: fetch a single warehouse by ID; disabled automatically when id is falsy (useQuery enabled: false).
export const useGetWarehouseByIdQuery = (
  id: string,
  {
    queryConfig,
  }: { queryConfig?: QueryConfig<typeof getWarehouseByIdQueryOptions> } = {},
) => useQuery({ ...getWarehouseByIdQueryOptions(id), ...queryConfig });

// Invalidate all queries keyed under warehouseListQueryKey (both list and detail entries).
export function invalidateWarehouseQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: warehouseListQueryKey });
}
