import { useNavigate } from "@tanstack/react-router";
import { Plus, RefreshCw, Search } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton } from "@/components/admin";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getWarehouseColumns } from "../components/warehouse-columns";
import { useWarehouseList } from "../hooks/useWarehouseList";
import { useTableFilter } from "@/hooks/useTableFilter";

type WarehouseFilters = {
  status: "all" | "active" | "inactive";
};
const STATUS_OPTIONS: { value: WarehouseFilters["status"]; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Non-Aktif" },
];

// View: warehouse list page with search, status filter, toolbar actions (view/edit/delete/refresh/add), AG Grid table, and delete confirmation dialog.
export function WarehouseListView() {
  const navigate = useNavigate();
  const { search, filters, page, limit, handleSearch, updateFilter, setPage, setLimit } =
    useTableFilter<WarehouseFilters>({ status: "all" });

  const {
    warehouses,
    totalWarehouses,
    pagination,
    isDeleting,
    isLoading,
    isRefreshing,
    refetchWarehouses,
    deleteWarehouse,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedWarehouse,
  } = useWarehouseList(search, filters.status, page, limit);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Warehouse Setup</h1>
          <p className="text-sm text-muted-foreground">
            Kelola gudang, status aktif, dan informasi alamat masing-masing.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
        <CardContent className="px-0 pb-0 pt-0">
          <div className="flex flex-wrap items-center gap-1.5 px-6">
            <span className="mr-1 text-sm font-medium text-muted-foreground">
              Filter Status:
            </span>
            {STATUS_OPTIONS.map((opt) => (
              <Button
                key={opt.value}
                type="button"
                variant={filters.status === opt.value ? "default" : "outline"}
                size="sm"
                className="rounded-lg"
                onClick={() => updateFilter("status", opt.value)}
              >
                {opt.label}
              </Button>
            ))}
          </div>

          {/* Toolbar: search input + row actions (view/edit/delete) + refresh + create button. */}
          <div className="flex flex-col gap-2.5 border-b border-border/60 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Cari nama warehouse..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
              <RowActions
                basePermissionCode="setup.warehouse"
                iconOnly
                className="shrink-0"
                disabled={!selectedWarehouse || isDeleting}
                // Open the selected warehouse in read-only detail view.
                onView={() => {
                  if (!selectedWarehouse) return;
                  navigate({
                    to: "/admin/master/warehouse/$warehouseId/edit",
                    params: { warehouseId: selectedWarehouse.id },
                    search: { mode: "readonly" as const },
                  });
                }}
                // Open the selected warehouse in the edit form.
                onEdit={() => {
                  if (!selectedWarehouse) return;
                  navigate({
                    to: "/admin/master/warehouse/$warehouseId/edit",
                    params: { warehouseId: selectedWarehouse.id },
                    search: { mode: "edit" as const },
                  });
                }}
                // Stage the selected warehouse for deletion via the confirm dialog.
                onDelete={() => {
                  if (!selectedWarehouse) return;
                  setConfirmDeleteId(selectedWarehouse.id);
                }}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-border/70"
                onClick={() => {
                  // Re-fetch the warehouse list from the server.
                  void refetchWarehouses();
                }}
                disabled={isRefreshing}
                aria-label="Refresh data"
                title="Refresh data"
              >
                <RefreshCw
                  className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`}
                />
              </Button>
              <ActionButton
                permission="setup.warehouse.create"
                size="sm"
                className="rounded-lg"
                onClick={() => navigate({ to: "/admin/master/warehouse/create" })}
                icon={<Plus className="h-4 w-4" />}
              >
                Tambah Warehouse
              </ActionButton>
            </div>
          </div>

          {/* AG Grid */}
          <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
            <DataTable
              columns={getWarehouseColumns()}
              rows={warehouses}
              loading={isLoading || isRefreshing}
              emptyMessage="Belum ada data warehouse."
              totalRows={totalWarehouses}
              currentPage={pagination?.page}
              totalPagesOverride={pagination?.totalPages}
              hasNextPage={pagination?.hasNextPage}
              pageSize={pagination?.limit}
              hasPreviousPage={pagination?.hasPreviousPage}
              onPageSizeChange={(size) => {
                setLimit(size);
                setPage(1);
              }}
              onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
              onNextPage={() => {
                if (pagination?.hasNextPage) setPage((p) => p + 1);
              }}
              selectedRowId={selectedId}
              getRowId={(row) => row.id}
              onRowClick={(row) =>
                setSelectedId((prev) => (prev === row.id ? null : row.id))
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* Delete confirmation dialog — calls deleteWarehouse mutation and clears the selected ID on confirm/close. */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Warehouse"
        desc="Apakah Anda yakin ingin menghapus warehouse ini? Tindakan ini tidak dapat dibatalkan."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) {
            deleteWarehouse(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
