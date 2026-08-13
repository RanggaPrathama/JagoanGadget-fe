import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { menuListQueryKey, getMenusList, getMenuById } from "./menu.service";

export type MenuListParams = {
  search?: string;
  show?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
};

export const getMenusListQueryKey = (params?: MenuListParams): unknown[] => [
  ...menuListQueryKey,
  params?.search ?? "",
  params?.show ?? "all",
  params?.page ?? 1,
  params?.limit ?? 25,
];

export const getMenusListQueryOptions = (params?: MenuListParams) =>
  queryOptions({
    queryKey: getMenusListQueryKey(params),
    queryFn: () => getMenusList(params),
  });

export const getMenuByIdQueryOptions = (menuId: string) =>
  queryOptions({
    queryKey: [...menuListQueryKey, menuId],
    queryFn: () => getMenuById(menuId),
  });

type UseMenusQueryOptions = { queryConfig?: QueryConfig<typeof getMenusListQueryOptions> };

export const useGetMenusListQuery = (
  params?: MenuListParams,
  { queryConfig }: UseMenusQueryOptions = {},
) => useQuery({ ...getMenusListQueryOptions(params), ...queryConfig });

export const useGetMenuByIdQuery = (
  menuId: string,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getMenuByIdQueryOptions> } = {},
) => useQuery({ ...getMenuByIdQueryOptions(menuId), ...queryConfig });

export function invalidateMenuQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: menuListQueryKey });
}
