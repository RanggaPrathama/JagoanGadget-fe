import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getBrandsList, getBrandById } from "./brand.service";

// Base query key for all brand list queries — used as the root key for invalidation.
export const brandListQueryKey = ["brands"] as const;

// Filter params shape accepted by brand list queries.
export type BrandListParams = {
  search?: string;
  page?: number;
  limit?: number;
};

// Build a stable query key that includes filter + pagination params.
export const getBrandsListQueryKey = (params?: BrandListParams): unknown[] => [
  ...brandListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.limit ?? 25,
];

// Query options factory for the paginated brand list.
export const getBrandsListQueryOptions = (params?: BrandListParams) =>
  queryOptions({
    queryKey: getBrandsListQueryKey(params),
    queryFn: () => getBrandsList(params),
  });

// Query options factory for a single brand detail by ID.
export const getBrandByIdQueryOptions = (brandId: string) =>
  queryOptions({
    queryKey: [...brandListQueryKey, brandId],
    queryFn: () => getBrandById(brandId),
  });

type UseBrandsQueryOptions = { queryConfig?: QueryConfig<typeof getBrandsListQueryOptions> };

// Hook: fetch paginated brand list with optional search + pagination.
export const useGetBrandsListQuery = (
  params?: BrandListParams,
  { queryConfig }: UseBrandsQueryOptions = {},
) => useQuery({ ...getBrandsListQueryOptions(params), ...queryConfig });

// Hook: fetch a single brand by ID; disabled automatically when brandId is falsy.
export const useGetBrandByIdQuery = (
  brandId: string,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getBrandByIdQueryOptions> } = {},
) => useQuery({ ...getBrandByIdQueryOptions(brandId), ...queryConfig });

// Invalidate all queries keyed under brandListQueryKey.
export function invalidateBrandQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: brandListQueryKey });
}
