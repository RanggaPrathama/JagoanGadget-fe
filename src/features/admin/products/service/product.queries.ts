import {
  queryOptions,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getProductsList, getProductById } from "./product.service";

// Base query key for all product list queries — used as the root key for invalidation.
export const productListQueryKey = ["products"] as const;

// Filter params shape accepted by product list queries.
export type ProductListParams = {
  search?: string;
  show?: "active" | "inactive";
  page?: number;
  limit?: number;
  no_pagination?: boolean;
};

// Build a stable query key that includes filter + pagination params so TanStack Query caches each combination separately.
export const getProductsListQueryKey = (
  params?: ProductListParams,
): unknown[] => [
  ...productListQueryKey,
  params?.search ?? "",
  params?.show ?? "all",
  params?.page ?? 1,
  params?.limit ?? 25,
  params?.no_pagination ?? false,
];

// Query options factory for the paginated product list — callers spread these into useQuery or prefetch.
export const getProductsListQueryOptions = (params?: ProductListParams) =>
  queryOptions({
    queryKey: getProductsListQueryKey(params),
    queryFn: () => getProductsList(params),
  });

// Query options factory for a single product detail by ID — keyed under productListQueryKey + id.
export const getProductByIdQueryOptions = (id: string) =>
  queryOptions({
    queryKey: [...productListQueryKey, id],
    queryFn: () => getProductById(id),
  });

type UseProductsQueryOptions = {
  queryConfig?: QueryConfig<typeof getProductsListQueryOptions>;
};

// Hook: fetch the paginated product list with optional filter/pagination params and extra queryConfig override.
export const useGetProductsListQuery = (
  params?: ProductListParams,
  { queryConfig }: UseProductsQueryOptions = {},
) => useQuery({ ...getProductsListQueryOptions(params), ...queryConfig });

// Hook: fetch a single product by ID; disabled automatically when id is falsy (useQuery enabled: false).
export const useGetProductByIdQuery = (
  id: string,
  {
    queryConfig,
  }: { queryConfig?: QueryConfig<typeof getProductByIdQueryOptions> } = {},
) => useQuery({ ...getProductByIdQueryOptions(id), ...queryConfig });

// Invalidate all queries keyed under productListQueryKey (both list and detail entries).
export function invalidateProductQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: productListQueryKey });
}
