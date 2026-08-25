import type { UnwrappedPaginated } from "@/lib/api-response";
import { useGetNumberFormatsListQuery } from "../service/number_format.queries";
import { formatSegmentsPreview } from "../utils/segments";
import type { NumberFormatItem, NumberFormatTableRow } from "../types";

/**
 * Fetch and derive the number-format table state.
 *
 * @param search - debounced search term from `useTableFilter`.
 * @param page - 1-based page number.
 * @param limit - page size (default 25).
 * @returns derived rows (with `segmentsPreview`/`isActiveLabel`), totals,
 * pagination meta, loading flags, and a refetch callback.
 * @remarks Read-only: intentionally exposes no selection/delete/dialog
 * state, unlike `useCategoryList`.
 */
export function useNumberFormatList(search?: string, page = 1, limit = 25) {
  const numberFormatQuery = useGetNumberFormatsListQuery({ search, page, limit });
  const data = numberFormatQuery.data as UnwrappedPaginated<NumberFormatItem> | undefined;
  const pagination = data?.pagination;

  const numberFormats: NumberFormatTableRow[] = (data?.items ?? []).map((item) => ({
    ...item,
    segmentsPreview: formatSegmentsPreview(item.segments ?? []),
    isActiveLabel: item.isActive ? "Aktif" : "Nonaktif",
  }));

  return {
    /** Derived table rows. */
    numberFormats,
    /** Total items across all pages (server-side). */
    totalNumberFormats: pagination?.totalItems ?? 0,
    pagination,
    isLoading: numberFormatQuery.isLoading,
    isRefreshing: numberFormatQuery.isFetching,
    refetchNumberFormats: async () => {
      await numberFormatQuery.refetch();
    },
  };
}
