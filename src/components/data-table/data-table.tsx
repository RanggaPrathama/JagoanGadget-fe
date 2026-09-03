import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AgGridReact } from "ag-grid-react";
import type { ColDef, RowClickedEvent } from "ag-grid-community";
import { ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { AnimatedContainer } from "@/components/motion";
import { cn } from "@/utils/cn";

const PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

export interface DataTableProps<TData> {
  columns: ColDef<TData>[];
  rows: TData[];
  loading?: boolean;
  className?: string;
  pageSize?: number;
  emptyMessage?: string;
  onRowClick?: (row: TData) => void;
  getRowId?: (row: TData) => string;
  selectedRowId?: string | null;
  rowSelection?: "single" | "multiple";
  onSelectedIdsChange?: (ids: string[]) => void;
  /** Total rows from server (for server-side pagination). Defaults to rows.length */
  totalRows?: number;
  /** Server-side pagination flags — override prev/next button state */
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  /** Called when prev/next is clicked */
  onPrevPage?: () => void;
  onNextPage?: () => void;
  /** Server-side page & totalPages — override internal display */
  currentPage?: number;
  totalPagesOverride?: number;
  /** Called when the page-size <select> changes (server-side limit). */
  onPageSizeChange?: (size: number) => void;
}

export function DataTable<TData>({
  columns,
  rows,
  loading = false,
  className,
  pageSize = 25,
  emptyMessage = "Tidak ada data",
  onRowClick,
  getRowId,
  selectedRowId,
  rowSelection = "single",
  onSelectedIdsChange,
  totalRows,
  hasNextPage,
  hasPreviousPage,
  onPrevPage,
  onNextPage,
  currentPage: serverPage,
  totalPagesOverride,
  onPageSizeChange,
}: DataTableProps<TData>) {
  const gridRef = useRef<AgGridReact<TData> | null>(null);

  // --- Pagination state (internal, synced from AG Grid) ---
  const [page, setPage] = useState(1);
  const [localFilteredCount, setLocalFilteredCount] = useState(rows.length);
  const [currentPageSize, setCurrentPageSize] = useState(
    PAGE_SIZE_OPTIONS.includes(pageSize as (typeof PAGE_SIZE_OPTIONS)[number])
      ? pageSize
      : PAGE_SIZE_OPTIONS[0],
  );

  // Use server totalRows when available, else client-side filter count
  const filteredRowCount = totalRows ?? localFilteredCount;

  // Reset page when rows length changes (render-time check)
  const [prevRowsLength, setPrevRowsLength] = useState(rows.length);
  if (rows.length !== prevRowsLength) {
    setPrevRowsLength(rows.length);
    setPage(1);
    if (totalRows === undefined) setLocalFilteredCount(rows.length);
  }

  const displayTotalPages =
    totalPagesOverride ??
    Math.max(1, Math.ceil(Math.max(filteredRowCount, 1) / currentPageSize));
  const displayPage = serverPage ?? Math.min(page, displayTotalPages);
  const rangeStart =
    filteredRowCount === 0 ? 0 : (displayPage - 1) * currentPageSize + 1;
  const rangeEnd =
    filteredRowCount === 0
      ? 0
      : Math.min(filteredRowCount, displayPage * currentPageSize);

  // --- Sync React state from AG Grid events ---
  const syncGridState = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    if (totalRows === undefined)
      setLocalFilteredCount(api.getDisplayedRowCount());
    setPage(api.paginationGetCurrentPage() + 1);
  }, [totalRows]);

  const handleGridReady = useCallback(() => {
    syncGridState();
  }, [syncGridState]);

  const handleFilterChanged = useCallback(() => {
    const api = gridRef.current?.api;
    if (!api) return;
    api.paginationGoToFirstPage();
    syncGridState();
  }, [syncGridState]);

  const handlePaginationChanged = useCallback(() => {
    syncGridState();
  }, [syncGridState]);

  // --- Loading overlay ---
  useEffect(() => {
    const api = gridRef.current?.api;
    if (!api) return;

    if (loading) {
      api.showLoadingOverlay();
    } else {
      api.hideOverlay();
      // hideOverlay() disables AG Grid's auto no-rows overlay.
      // Must explicitly show it when data is empty & not loading.
      if (rows.length === 0) {
        api.showNoRowsOverlay();
      }
    }
  }, [loading, rows.length]);

  // --- Force re-evaluate getRowClass when selectedRowId changes ---
  useEffect(() => {
    gridRef.current?.api?.redrawRows();
  }, [selectedRowId]);

  // --- NO column ---
  const displayColumns = useMemo(() => {
    const noCol: ColDef<TData> = {
      headerName: "No",
      width: 60,
      minWidth: 60,
      flex: 0,
      resizable: false,
      sortable: false,
      filter: false,
      suppressHeaderMenuButton: true,
      valueGetter: (params) => (params.node?.rowIndex ?? 0) + 1,
    };
    return [noCol, ...columns];
  }, [columns]);

  return (
    <AnimatedContainer className={cn("flex h-full flex-col", className)}>
      {/* AG Grid */}
      <div className="ag-theme-quartz ag-table-theme min-h-0 flex-1">
        <AgGridReact<TData>
          ref={gridRef}
          rowData={rows}
          columnDefs={displayColumns}
          defaultColDef={{
            filter: true,
            sortable: true,
            floatingFilter: true,
            resizable: true,
            flex: 1,
            minWidth: 120,
            suppressHeaderMenuButton: false,
            filterParams: {
              debounceMs: 250,
            },
          }}
          onGridReady={handleGridReady}
          rowSelection={
            rowSelection === "multiple"
              ? { mode: "multiRow", enableClickSelection: true }
              : { mode: "singleRow", enableClickSelection: false }
          }
          onRowClicked={(event: RowClickedEvent<TData>) => {
            if (event.data) {
              onRowClick?.(event.data);
            }
          }}
          onSelectionChanged={(event) => {
            if (
              rowSelection === "multiple" &&
              getRowId &&
              onSelectedIdsChange
            ) {
              const ids = event.api
                .getSelectedRows()
                .map((row) => getRowId(row));
              onSelectedIdsChange(ids);
            }
          }}
          onFilterChanged={handleFilterChanged}
          onPaginationChanged={handlePaginationChanged}
          domLayout="normal"
          suppressCellFocus
          animateRows={false}
          headerHeight={46}
          floatingFiltersHeight={42}
          rowHeight={54}
          pagination
          paginationPageSize={currentPageSize}
          paginationPageSizeSelector={false}
          suppressPaginationPanel
          getRowClass={(params) => {
            if (!selectedRowId || !params.data || !getRowId) return "";
            return getRowId(params.data) === selectedRowId
              ? "ag-row-selected"
              : "";
          }}
          overlayNoRowsTemplate={`<div class="ag-overlay-no-rows-center"><svg class="ag-empty-icon" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg><span>${emptyMessage}</span></div>`}
          overlayLoadingTemplate={`<div class="ag-overlay-loading-center"><div class="ag-loading-spinner"></div><span>Memuat data...</span></div>`}
        />
      </div>

      {/* Pagination Footer */}
      <div className="flex flex-col gap-4 border-t border-border/60 px-4 py-3 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-6">
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            <span>Tampilkan</span>
            <select
              value={currentPageSize}
              onChange={(event) => {
                const newSize = Number(event.target.value);
                setCurrentPageSize(newSize);
                gridRef.current?.api?.setGridOption(
                  "paginationPageSize",
                  newSize,
                );
                gridRef.current?.api?.paginationGoToFirstPage();
                onPageSizeChange?.(newSize);
              }}
              className="ag-table-page-size-select h-9 rounded-md border border-border/70 bg-background px-3 text-sm text-foreground outline-none transition focus:border-primary/60 focus:ring-2 focus:ring-primary/15"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
            <span>baris</span>
          </label>
          <div className="text-sm text-muted-foreground">
            {filteredRowCount === 0
              ? emptyMessage
              : `Menampilkan ${rangeStart}-${rangeEnd} dari ${filteredRowCount}`}
          </div>
        </div>
        <div className="flex items-center gap-3 sm:justify-end">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-24"
            onClick={() => {
              if (onPrevPage) onPrevPage();
              else gridRef.current?.api?.paginationGoToPreviousPage();
            }}
            disabled={
              hasPreviousPage !== undefined
                ? !hasPreviousPage
                : displayPage <= 1
            }
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <span className="min-w-16 text-center text-sm tabular-nums text-muted-foreground">
            {displayPage} / {displayTotalPages}
          </span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="min-w-24"
            onClick={() => {
              if (onNextPage) onNextPage();
              else gridRef.current?.api?.paginationGoToNextPage();
            }}
            disabled={
              hasNextPage !== undefined
                ? !hasNextPage
                : displayPage >= displayTotalPages
            }
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </AnimatedContainer>
  );
}
