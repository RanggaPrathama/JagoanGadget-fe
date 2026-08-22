import {
  queryOptions,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getMenusList, getMenuById } from "./menu.service";

// Base query key for all menu list queries — used as the root key for invalidation.
export const menuListQueryKey = ["menus"] as const;

// Filter params shape accepted by menu list queries.
export type MenuListParams = {
  search?: string;
  show?: "active" | "inactive";
  page?: number;
  limit?: number;
};

// Build a stable query key that includes filter + pagination params so TanStack Query caches each combination separately.
export const getMenusListQueryKey = (params?: MenuListParams): unknown[] => [
  ...menuListQueryKey,
  params?.search ?? "",
  params?.show ?? "all",
  params?.page ?? 1,
  params?.limit ?? 25,
];

// Query options factory for the paginated menu list — callers spread these into useQuery or prefetch.
export const getMenusListQueryOptions = (params?: MenuListParams) =>
  queryOptions({
    queryKey: getMenusListQueryKey(params),
    queryFn: () => getMenusList(params),
  });

// Query options factory for a single menu detail by ID — keyed under menuListQueryKey + menuId.
export const getMenuByIdQueryOptions = (menuId: string) =>
  queryOptions({
    queryKey: [...menuListQueryKey, menuId],
    queryFn: () => getMenuById(menuId),
  });

type UseMenusQueryOptions = {
  queryConfig?: QueryConfig<typeof getMenusListQueryOptions>;
};

// Hook: fetch paginated menu list with optional filter/pagination params and extra queryConfig override.
export const useGetMenusListQuery = (
  params?: MenuListParams,
  { queryConfig }: UseMenusQueryOptions = {},
) => useQuery({ ...getMenusListQueryOptions(params), ...queryConfig });

// Hook: fetch a single menu by ID; disabled automatically when menuId is falsy (useQuery enabled: false).
export const useGetMenuByIdQuery = (
  menuId: string,
  {
    queryConfig,
  }: { queryConfig?: QueryConfig<typeof getMenuByIdQueryOptions> } = {},
) => useQuery({ ...getMenuByIdQueryOptions(menuId), ...queryConfig });

// Invalidate all queries keyed under menuListQueryKey (both list and detail entries).
export function invalidateMenuQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: menuListQueryKey });
}
