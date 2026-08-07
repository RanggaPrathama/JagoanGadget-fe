import * as React from "react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import type { PaginationMeta } from "@/lib/api-response";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ColumnDef<T> = {
  header: string;
  accessorKey: keyof T & string;
  cell?: (row: T) => React.ReactNode;
};

type QueryResult<T> = {
  items: T[];
  pagination: PaginationMeta;
};

export type ButtonSelectProps<T> = {
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  queryFn: (params: {
    search: string;
    page: number;
    limit: number;
  }) => Promise<QueryResult<T>>;
  queryKey: string[];
  value: string[];
  onChange: (ids: string[], items: T[]) => void;

  triggerText?: string;
  title?: string;
  saveText?: string;
  cancelText?: string;
  emptyMessage?: string;
  placeholder?: string;
  limit?: number;
  debounceMs?: number;
  disabled?: boolean;
  className?: string;
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ButtonSelect<T>(props: ButtonSelectProps<T>) {
  const {
    columns,
    getRowId,
    queryFn,
    queryKey,
    value: selectedIds,
    onChange: onSelectionChange,
    triggerText = "Pilih Item",
    title = "Pilih Item",
    saveText = "Simpan",
    cancelText = "Batal",
    emptyMessage = "Tidak ada data",
    placeholder = "Cari...",
    limit = 10,
    debounceMs = 400,
    disabled = false,
    className,
  } = props;

  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const debouncedSearch = useDebounce(search, debounceMs);

  // Temporary selection
  const [tempSelected, setTempSelected] = React.useState<string[]>([]);

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
  } = useInfiniteQuery({
    queryKey: [...queryKey, "picker", debouncedSearch],
    queryFn: ({ pageParam = 1 }) =>
      queryFn({ search: debouncedSearch, page: pageParam, limit }),
    getNextPageParam: (lastPage) =>
      lastPage.pagination.hasNextPage
        ? lastPage.pagination.page + 1
        : undefined,
    enabled: open,
  });

  const allItems = React.useMemo(
    () => data?.pages.flatMap((p) => p.items) ?? [],
    [data],
  );

  const totalItems = data?.pages.at(-1)?.pagination.totalItems ?? 0;
  const canLoadMore = hasNextPage === true;

  // ---- Infinite scroll via IntersectionObserver ----

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const sentinelRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open || !sentinelRef.current || !scrollRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && canLoadMore && !isFetchingNextPage) {
          void fetchNextPage();
        }
      },
      { root: scrollRef.current, rootMargin: "100px", threshold: 0 },
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [open, canLoadMore, isFetchingNextPage, fetchNextPage]);

  // ---- Selection logic ----

  const tempSet = React.useMemo(() => new Set(tempSelected), [tempSelected]);

  const visibleIds = React.useMemo(
    () => allItems.map((item) => getRowId(item)),
    [allItems, getRowId],
  );

  const allVisibleSelected =
    visibleIds.length > 0 && visibleIds.every((id) => tempSet.has(id));

  const someVisibleSelected =
    visibleIds.length > 0 && visibleIds.some((id) => tempSet.has(id));

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const next = new Set(tempSelected);
      visibleIds.forEach((id) => next.add(id));
      setTempSelected(Array.from(next));
    } else {
      const visibleSet = new Set(visibleIds);
      setTempSelected(tempSelected.filter((id) => !visibleSet.has(id)));
    }
  };

  const handleRowToggle = (rowId: string, checked: boolean) => {
    if (checked) {
      setTempSelected([...tempSelected, rowId]);
    } else {
      setTempSelected(tempSelected.filter((id) => id !== rowId));
    }
  };

  // ---- Dialog handlers ----

  const handleOpen = () => {
    setTempSelected([...selectedIds]);
    setSearch("");
    setOpen(true);
  };

  const handleSave = () => {
    const selectedItems = allItems.filter((item) =>
      tempSet.has(getRowId(item)),
    );
    onSelectionChange(tempSelected, selectedItems);
    setOpen(false);
  };

  const handleCancel = () => {
    setTempSelected([...selectedIds]);
    setOpen(false);
  };

  const handleSearchChange = (value: string) => {
    setSearch(value);
  };

  const renderCheckboxState = (): boolean | "indeterminate" => {
    if (allVisibleSelected) return true;
    if (someVisibleSelected) return "indeterminate";
    return false;
  };

  return (
    <>
      <Button
        type="button"
        onClick={handleOpen}
        disabled={disabled}
        className={cn("rounded-xl", className)}
      >
        {triggerText}
        {selectedIds.length > 0 && (
          <span className="ml-1.5 rounded-full bg-primary-foreground/20 px-1.5 py-0.5 text-xs font-medium">
            {selectedIds.length}
          </span>
        )}
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>{title}</DialogTitle>
          </DialogHeader>

          {/* Search */}
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder={placeholder}
              className="h-9 rounded-xl pl-9"
            />
          </div>

          {/* Table with infinite scroll */}
          <div
            ref={scrollRef}
            className="max-h-[50vh] overflow-y-auto rounded-xl border"
          >
            <Table>
              <TableHeader className="sticky top-0 z-10 bg-background">
                <TableRow>
                  <TableHead className="w-10">
                    <Checkbox
                      checked={renderCheckboxState()}
                      onCheckedChange={(checked) =>
                        handleSelectAll(checked === true)
                      }
                      aria-label="Select all"
                    />
                  </TableHead>
                  {columns.map((col) => (
                    <TableHead key={String(col.accessorKey)}>
                      {col.header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`}>
                        <TableCell>
                          <Skeleton className="h-4 w-4" />
                        </TableCell>
                        {columns.map((col) => (
                          <TableCell key={String(col.accessorKey)}>
                            <Skeleton className="h-4 w-full" />
                          </TableCell>
                        ))}
                      </TableRow>
                    ))
                  : allItems.length === 0
                    ? (
                        <TableRow>
                          <TableCell
                            colSpan={columns.length + 1}
                            className="h-40 text-center"
                          >
                            <p className="text-sm text-muted-foreground">
                              {emptyMessage}
                            </p>
                          </TableCell>
                        </TableRow>
                      )
                    : (
                        <>
                          {allItems.map((row) => {
                            const rowId = getRowId(row);
                            const isSelected = tempSet.has(rowId);

                            return (
                              <TableRow
                                key={rowId}
                                data-state={isSelected ? "selected" : undefined}
                                className={cn(
                                  "cursor-pointer",
                                  isSelected && "bg-primary/5",
                                )}
                                onClick={() =>
                                  handleRowToggle(rowId, !isSelected)}
                              >
                                <TableCell>
                                  <Checkbox
                                    checked={isSelected}
                                    onCheckedChange={(checked) =>
                                      handleRowToggle(rowId, checked === true)}
                                    onClick={(e) => e.stopPropagation()}
                                    aria-label={`Select row ${rowId}`}
                                  />
                                </TableCell>
                                {columns.map((col) => (
                                  <TableCell key={String(col.accessorKey)}>
                                    {col.cell
                                      ? col.cell(row)
                                      : String(row[col.accessorKey] ?? "")}
                                  </TableCell>
                                ))}
                              </TableRow>
                            );
                          })}

                          {isFetchingNextPage && (
                            <TableRow>
                              <TableCell colSpan={columns.length + 1}>
                                <div className="flex items-center justify-center py-3">
                                  <Skeleton className="h-4 w-32" />
                                </div>
                              </TableCell>
                            </TableRow>
                          )}

                          {canLoadMore && <div ref={sentinelRef} className="h-1" />}
                        </>
                      )}
              </TableBody>
            </Table>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">
              {totalItems > 0 && (
                <>{allItems.length} / {totalItems} item</>
              )}
            </span>
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleCancel}>
                {cancelText}
              </Button>
              <Button onClick={handleSave}>{saveText}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
