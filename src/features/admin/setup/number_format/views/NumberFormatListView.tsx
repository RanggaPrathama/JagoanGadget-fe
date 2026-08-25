import { RefreshCw, Search, Hash, ListOrdered } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DataTable } from "@/components/data-table/data-table";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTableFilter } from "@/hooks/useTableFilter";
import { getNumberFormatColumns } from "../components/number-format-columns";
import { useNumberFormatList } from "../hooks/useNumberFormatList";
import { Link, useLocation } from "@tanstack/react-router";

// View: read-only number-format list page with search, refresh, and AG Grid table.
export function NumberFormatListView() {
  const location = useLocation();
  const pathname = location.pathname;
  const { search, page, limit, handleSearch, setPage, setLimit } =
    useTableFilter<Record<string, never>>({});

  const {
    numberFormats,
    totalNumberFormats,
    pagination,
    isLoading,
    isRefreshing,
    refetchNumberFormats,
  } = useNumberFormatList(search, page, limit);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Number Format Setup
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola urutan segmen penomoran dokumen.
          </p>
        </div>
      </div>
      {/* Segmented-pill nav between sibling setup pages. */}
      <Tabs value={pathname}>
        <TabsList className="h-auto gap-1 rounded-full border border-border/60 bg-muted/60 p-1 shadow-sm">
          <TabsTrigger
            value="/admin/setup/prefix"
            asChild
            className="rounded-full px-5 py-2 text-sm font-medium"
          >
            <Link to="/admin/setup/prefix">
              <Hash data-icon="inline-start" />
              Prefix
            </Link>
          </TabsTrigger>
          <TabsTrigger
            value="/admin/setup/number-format"
            asChild
            className="rounded-full px-5 py-2 text-sm font-medium"
          >
            <Link to="/admin/setup/number-format">
              <ListOrdered data-icon="inline-start" />
              Number Format
            </Link>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
        <CardContent className="px-0 pb-0 pt-0">
          <div className="flex flex-col gap-2.5 border-b border-border/60 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Cari..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-border/70"
                onClick={() => void refetchNumberFormats()}
                disabled={isRefreshing}
                aria-label="Refresh data"
                title="Refresh data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
            </div>
          </div>

          <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
            <DataTable
              columns={getNumberFormatColumns()}
              rows={numberFormats}
              loading={isLoading || isRefreshing}
              emptyMessage="Belum ada data number format."
              totalRows={totalNumberFormats}
              currentPage={pagination?.page}
              totalPagesOverride={pagination?.totalPages}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
              pageSize={limit}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
              onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
              onNextPage={() => {
                if (pagination?.hasNextPage) setPage((p) => p + 1);
              }}
              getRowId={(row) => row.id}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
