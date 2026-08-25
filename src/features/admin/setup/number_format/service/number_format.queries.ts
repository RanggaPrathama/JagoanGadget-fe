import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import type { NumberFormatListParams } from "../types";
import { getNumberFormatsList } from "./number_format.service";

/**
 * Base query key shared by every number-format list query.
 * Detail keys (future) should extend this array so one invalidate nukes all.
 */
export const numberFormatListQueryKey = ["number-formats"] as const;

/**
 * Build the full cache key for a list request.
 *
 * @param params - search/page/limit; each part is inlined into the key.
 * @returns key array, e.g. `["number-formats", "", 1, 25]`.
 */
export const getNumberFormatsListQueryKey = (
  params?: NumberFormatListParams,
): unknown[] => [
  ...numberFormatListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.limit ?? 25,
];

/**
 * TanStack Query options for the number-format list.
 *
 * @param params - search/page/limit forwarded to the service.
 * @returns `queryOptions` object usable with `useQuery`/`ensureQueryData`.
 */
export const getNumberFormatsListQueryOptions = (params?: NumberFormatListParams) =>
  queryOptions({
    queryKey: getNumberFormatsListQueryKey(params),
    queryFn: () => getNumberFormatsList(params),
  });

type UseNumberFormatsQueryOptions = {
  queryConfig?: QueryConfig<typeof getNumberFormatsListQueryOptions>;
};

/**
 * Hook: fetch the paginated number-format list.
 *
 * @param params - search/page/limit for the request and cache key.
 * @param config - optional per-call overrides (e.g. `enabled`).
 * @returns react-query result for the list query.
 */
export const useGetNumberFormatsListQuery = (
  params?: NumberFormatListParams,
  { queryConfig }: UseNumberFormatsQueryOptions = {},
) => useQuery({ ...getNumberFormatsListQueryOptions(params), ...queryConfig });

/**
 * Invalidate every number-format query keyed under
 * {@link numberFormatListQueryKey} (list + any future detail keys).
 *
 * @param queryClient - app QueryClient instance.
 * @returns the invalidation promise.
 */
export function invalidateNumberFormatQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: numberFormatListQueryKey });
}
