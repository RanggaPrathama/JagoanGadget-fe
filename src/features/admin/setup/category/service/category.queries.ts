// src/features/admin/setup/category/service/category.queries.ts
import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getCategoriesList, getCategoryById } from "./category.service";

// Base query key for all category list queries.
export const categoryListQueryKey = ["categories"] as const;

export type CategoryListParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export const getCategoriesListQueryKey = (params?: CategoryListParams): unknown[] => [
  ...categoryListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.limit ?? 25,
];

export const getCategoriesListQueryOptions = (params?: CategoryListParams) =>
  queryOptions({
    queryKey: getCategoriesListQueryKey(params),
    queryFn: () => getCategoriesList(params),
  });

export const getCategoryByIdQueryOptions = (categoryId: string) =>
  queryOptions({
    queryKey: [...categoryListQueryKey, categoryId],
    queryFn: () => getCategoryById(categoryId),
  });

type UseCategoriesQueryOptions = { queryConfig?: QueryConfig<typeof getCategoriesListQueryOptions> };

export const useGetCategoriesListQuery = (
  params?: CategoryListParams,
  { queryConfig }: UseCategoriesQueryOptions = {},
) => useQuery({ ...getCategoriesListQueryOptions(params), ...queryConfig });

export const useGetCategoryByIdQuery = (
  categoryId: string,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getCategoryByIdQueryOptions> } = {},
) => useQuery({ ...getCategoryByIdQueryOptions(categoryId), ...queryConfig });

export function invalidateCategoryQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: categoryListQueryKey });
}
