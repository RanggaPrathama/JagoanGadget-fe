import type { UnwrappedPaginated } from "@/lib/api-response";
import {
  useGetNumberFormatsListQuery,
} from "../service/number_format.queries";
import { useDeleteNumberFormat } from "../service/number_format.mutations";
import type { NumberFormatItem, NumberFormatTableRow } from "../types";
import { useState } from "react";

/**
 * Fetch and derive the number-format table state.
 *
 * @param search - debounced search term from `useTableFilter`.
 * @param page - 1-based page number.
 * @param limit - page size (default 25).
 * @param show - active-status filter forwarded to the backend.
 * @returns derived rows (with `segmentsPreview`/`isActiveLabel`), totals,
 * pagination meta, loading flags, row selection + delete-confirmation state,
 * and a refetch callback.
 */
export function useNumberFormatList(
  search?: string,
  page = 1,
  limit = 25,
  show?: "active" | "inactive" | "all",
) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const deleteMutation = useDeleteNumberFormat();
  const numberFormatQuery = useGetNumberFormatsListQuery({
    search,
    page,
    limit,
    show,
  });
  const data = numberFormatQuery.data as
    | UnwrappedPaginated<NumberFormatItem>
    | undefined;
  const pagination = data?.pagination;

  const numberFormats: NumberFormatTableRow[] = (data?.items ?? []).map(
    (item) => ({
      ...item,
      segmentsPreview: item.preview,
      isActiveLabel: item.isActive ? "Aktif" : "Nonaktif",
    }),
  );

  const selectedNumberFormat =
    numberFormats.find((nf) => nf.id === selectedId) ?? null;

  return {
    /** Derived table rows. */
    numberFormats,
    // selectedNumberFormat and setSelectedNumberFormat are used to manage the currently selected number format in the list.
    selectedNumberFormat,

    selectedId,
    setSelectedId,
    // confirmDeleteId and setConfirmDeleteId are used to manage the deletion confirmation dialog.
    confirmDeleteId,
    setConfirmDeleteId,
    /** True while the delete mutation is in flight. */
    isDeleting: deleteMutation.isPending,
    /** Delete a number format by ID via the delete mutation. */
    deleteNumberFormat: async (numberFormatId: string) => {
      await deleteMutation.mutateAsync(numberFormatId);
    },
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
