import * as React from "react";
import { useQuery, type QueryKey } from "@tanstack/react-query";

import { useDebounce } from "@/hooks/useDebounce";
import { FieldSelect, type FieldSelectProps } from "./FieldSelect";
import type { FieldOption } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ServerSearchConfig = {
  /** Debounce delay in ms before firing the query. Default: 300 */
  debounceMs?: number;
  /** Placeholder shown in the search input while idle */
  searchPlaceholder?: string;
};

export type FieldSelectAsyncProps<T> = Omit<
  FieldSelectProps,
  "loading" | "options" | "disableClientFilter"
> & {
  queryKey: QueryKey;
  /**
   * Fetch options from the server.
   * - Without `serverSearch`: called with no arguments on mount.
   * - With `serverSearch`: called with `{ search }` on every debounced search change.
   */
  queryFn: (params?: { search: string }) => Promise<T[]>;
  /** Transform each raw item into a FieldOption for the select dropdown. */
  mapOption: (item: T) => FieldOption;
  /** Error message shown when the query fails. Default: "Failed to load options." */
  queryErrorMessage?: string;
  /** Debounce delay in ms before firing the query. Default: 300. Only applies when `serverSearch` is enabled. */
  debounceMs?: number;
  /** Placeholder shown in the search input when `serverSearch` is enabled. */
  searchPlaceholder?: string;
  /**
   * Enable server-side search.
   * - `true`: activates with default debounce (300 ms).
   * - `{ debounceMs }`: custom debounce delay.
   * - `false` / omitted: fetches once on mount, filters client-side (legacy behavior).
   */
  serverSearch?: boolean | ServerSearchConfig;
  /**
   * Pre-resolved option for the current value. Merged into the dropdown so
   * its label renders even if it's absent from the queried options (e.g.
   * edit mode where the chosen item isn't in the server-filtered set).
   * Use when the parent already holds the selected item (e.g. nested in the
   * detail response) — avoids an extra fetch by id.
   */
  selectedOption?: FieldOption;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function FieldSelectAsync<T>({
  debounceMs = 300,
  error,
  mapOption,
  queryErrorMessage = "Failed to load options.",
  queryFn,
  queryKey,
  searchPlaceholder,
  selectedOption,
  serverSearch = false,
  ...props
}: FieldSelectAsyncProps<T>) {
  const isServerSearch = Boolean(serverSearch);
  const config =
    typeof serverSearch === "object" ? serverSearch : undefined;
  const resolvedDebounceMs = config?.debounceMs ?? debounceMs;

  // --- Search state (only active when isServerSearch) ---
  const [rawSearch, setRawSearch] = React.useState("");
  const debouncedSearch = useDebounce(rawSearch, resolvedDebounceMs);

  // --- Query ---
  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: isServerSearch
      ? [...queryKey, "search", debouncedSearch]
      : queryKey,
    queryFn: isServerSearch
      ? () => queryFn({ search: debouncedSearch })
      : () => queryFn(),
  });

  // --- Resolve the selected option by id (edit mode with server filtering) ---
  // --- Map raw data to FieldOption[] ---
  const options = React.useMemo(() => {
    const mapped = (data ?? []).map(mapOption);

    // Merge the pre-resolved selected option so its label renders even when
    // it's absent from the queried options (e.g. server-filtered edit mode).
    if (selectedOption) {
      const alreadyListed = mapped.some(
        (opt) => String(opt.value) === String(selectedOption.value),
      );
      if (!alreadyListed) {
        mapped.unshift(selectedOption);
      }
    }

    return mapped;
  }, [data, mapOption, selectedOption]);

  // --- Error resolution ---
  const resolvedError = error ?? (isError ? queryErrorMessage : undefined);

  // --- Loading: show spinner for initial load or refetch with no cached data ---
  const loading = isLoading || (isFetching && !data);

  return (
    <FieldSelect
      {...props}
      disableClientFilter={isServerSearch}
      error={resolvedError}
      loading={loading}
      onSearchChange={isServerSearch ? setRawSearch : undefined}
      options={options}
      placeholder={
        isServerSearch && searchPlaceholder
          ? searchPlaceholder
          : props.placeholder
      }
      searchable={isServerSearch || props.searchable}
    />
  );
}

export { FieldSelectAsync };
