import {
  queryOptions,
  useQuery,
  type QueryClient,
} from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getPrefixesList, getPrefixById } from "./prefix.service";

// Base query key for all prefix list queries — used as the root key for invalidation.
export const prefixListQueryKey = ["prefixes"] as const;

export type PrefixListParams = {
  search?: string;
  show?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
};

// Build a stable query key that includes filter + pagination params so TanStack Query caches each combination separately.
export const getPrefixesListQueryKey = (params?: PrefixListParams): unknown[] => [
  ...prefixListQueryKey,
  params?.search ?? "",
  params?.show ?? "all",
  params?.page ?? 1,
  params?.limit ?? 25,
];

// Query options factory for the paginated prefix list — callers spread these into useQuery or prefetch.
export const getPrefixesListQueryOptions = (params?: PrefixListParams) =>
  queryOptions({
    queryKey: getPrefixesListQueryKey(params),
    queryFn: () => getPrefixesList(params),
  });


type UsePrefixesQueryOptions = {
  queryConfig?: QueryConfig<typeof getPrefixesListQueryOptions>;
};

// Custom hook for fetching the paginated prefix list — spreads the query options and any additional config.
export const useGetPrefixesListQuery = (
  params?: PrefixListParams,
  { queryConfig }: UsePrefixesQueryOptions = {},
) => useQuery({ ...getPrefixesListQueryOptions(params), ...queryConfig });


export const getPrefixByIdQueryOptions = (prefixId: string) =>
  queryOptions({
    queryKey: [...prefixListQueryKey, prefixId],
    queryFn: () => getPrefixById(prefixId),
  });

// Custom hook for fetching a single prefix by ID; disabled automatically when prefixId is falsy (useQuery enabled: false).
export const useGetPrefixByIdQuery = (
  prefixId: string,
  {
    queryConfig,
  }: { queryConfig?: QueryConfig<typeof getPrefixByIdQueryOptions> } = {},
) => useQuery({ ...getPrefixByIdQueryOptions(prefixId), ...queryConfig });


// Invalidate all queries keyed under prefixListQueryKey (both list and detail entries).
export function invalidatePrefixQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: prefixListQueryKey });
}