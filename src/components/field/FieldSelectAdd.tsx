import * as React from "react";
import { useQuery, useMutation, useQueryClient, type QueryKey } from "@tanstack/react-query";
import { Loader2, Plus } from "lucide-react";
import { toast } from "sonner";

import { useDebounce } from "@/hooks/useDebounce";
import { getErrorMessage } from "@/utils/error";
import { cn } from "@/utils/cn";
import { FieldSelect, type FieldSelectProps } from "./FieldSelect";
import type { FieldOption } from "./types";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type FieldSelectAddProps<T> = Omit<
  FieldSelectProps,
  "loading" | "options" | "disableClientFilter"
> & {
  /** Base query key used to list + search options. Invalidated after a successful create. */
  queryKey: QueryKey;
  /** Fetch options from the server. Called without args on mount, `{ search }` on every debounced search change. */
  queryFn: (params?: { search: string }) => Promise<T[]>;
  /** Transform each raw item into a FieldOption for the dropdown. */
  mapOption: (item: T) => FieldOption;
  /**
   * Persist a brand-new option. When provided and the current search matches
   * no existing option, an "add" entry is rendered in the dropdown footer.
   */
  createFn?: (input: string) => Promise<T>;
  /** Text prefix for the add button. Default: "Tambah". Eg. `+ Tambah "32GB"`. */
  createLabel?: string;
  /** Debounce delay in ms before firing the search query. Default: 300. */
  debounceMs?: number;
  /** Invoked with the freshly-created item. Parent should select it + rely on the list invalidation to show it. */
  onCreated?: (item: T) => void;
  /** Called when the create mutation fails, so the parent can decide how to surface the error. Default: sonner toast. */
  onCreateError?: (error: Error) => void;
  /** Error message shown when the query fails. */
  queryErrorMessage?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

function FieldSelectAdd<T>({
  createFn,
  createLabel = "Tambah",
  debounceMs = 300,
  error,
  mapOption,
  onCreateError,
  onCreated,
  queryErrorMessage = "Failed to load options.",
  queryFn,
  queryKey,
  ...props
}: FieldSelectAddProps<T>) {
  const queryClient = useQueryClient();

  // --- Search state ---
  const [rawSearch, setRawSearch] = React.useState("");
  const debouncedSearch = useDebounce(rawSearch, debounceMs);

  // --- Options query (server-side search, filters client-side off) ---
  const { data, isError, isLoading, isFetching } = useQuery({
    queryKey: [...queryKey, "add", "search", debouncedSearch],
    queryFn: () => queryFn({ search: debouncedSearch }),
  });

  const options = (data ?? []).map(mapOption);
  const loading = isLoading || (isFetching && !data);

  // --- Create mutation ---
  const createMutation = useMutation({
    mutationFn: (input: string) => {
      if (!createFn) {
        throw new Error("createFn is not configured.");
      }
      return createFn(input);
    },
    onSuccess: (createdItem) => {
      toast.success("Data berhasil ditambahkan.");
      void queryClient.invalidateQueries({ queryKey });
      onCreated?.(createdItem);
    },
    onError: (err: Error) => {
      const message = getErrorMessage(err, "Gagal menambahkan data.");
      if (onCreateError) {
        onCreateError(err);
        return;
      }
      toast.error(message, { id: message });
    },
  });

  // --- Resolve error: query error overrides inline field error ---
  const resolvedError = error ?? (isError ? queryErrorMessage : undefined);

  const canCreate = Boolean(createFn);
  const showAdd =
    canCreate &&
    rawSearch.trim().length > 0 &&
    options.length === 0 &&
    !loading;

  const handleCreate = () => {
    const input = rawSearch.trim();
    if (!input || !createFn) return;
    void createMutation.mutateAsync(input);
  };

  return (
    <FieldSelect
      {...props}
      disableClientFilter
      error={resolvedError}
      loading={loading}
      onSearchChange={setRawSearch}
      options={options}
      searchable
      footer={
        showAdd ? (
          <button
            type="button"
            disabled={createMutation.isPending}
            onClick={handleCreate}
            className={cn(
              "flex w-full items-center gap-2 border-t border-border/60 px-3 py-2.5 text-left text-sm font-medium text-foreground transition-colors",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:cursor-not-allowed disabled:opacity-60",
            )}
          >
            {createMutation.isPending ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Plus className="size-4" />
            )}
            <span className="min-w-0 flex-1 truncate">
              {createLabel}{" "}
              <span className="text-muted-foreground">"{rawSearch.trim()}"</span>
            </span>
          </button>
        ) : undefined
      }
    />
  );
}

export { FieldSelectAdd };
