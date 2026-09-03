import {
  queryOptions,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getAttributesList } from "./attribute.service";

// Base query key for the global attribute catalog — used to invalidate after a create.
export const attributeListQueryKey = ["attributes"] as const;

export type AttributeListParams = {
  search?: string;
  page?: number;
  limit?: number;
  no_pagination?: boolean;
};

// Build a stable query key that includes search + pagination params.
export const getAttributesListQueryKey = (
  params?: AttributeListParams,
): unknown[] => [
  ...attributeListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.limit ?? 25,
  params?.no_pagination ?? false,
];

// Query options factory for the attribute catalog list.
export const getAttributesListQueryOptions = (params?: AttributeListParams) =>
  queryOptions({
    queryKey: getAttributesListQueryKey(params),
    queryFn: () => getAttributesList(params),
  });

type UseAttributesQueryOptions = {
  queryConfig?: QueryConfig<typeof getAttributesListQueryOptions>;
};

// Hook: fetch the attribute catalog with optional search/pagination.
export const useGetAttributesListQuery = (
  params?: AttributeListParams,
  { queryConfig }: UseAttributesQueryOptions = {},
) => useQuery({ ...getAttributesListQueryOptions(params), ...queryConfig });

// Invalidate all queries keyed under attributeListQueryKey.
export function invalidateAttributeQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: attributeListQueryKey });
}
