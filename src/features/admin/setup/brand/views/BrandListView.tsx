import { Plus, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton } from "@/components/admin";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { getBrandColumns } from "../components/brand-columns";
import { useBrandList } from "../hooks/useBrandList";
import { BrandFormDialog } from "./BrandFormDialog";

// View: brand list page with search, toolbar actions, AG Grid table, form dialog, and delete confirmation.
export function BrandListView() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const {
    brands,
    totalBrands,
    pagination,
    isDeleting,
    isLoading,
    isRefreshing,
    selectedId,
    selectedBrand,
    dialogMode,
    editingId,
    setSelectedId,
    openCreate,
    openEdit,
    openReadonly,
    closeDialog,
    refetchBrands,
    deleteBrand,
  } = useBrandList(debouncedSearch, page);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Brand Setup</h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar brand produk beserta logo-nya.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
        <CardContent className="px-0 pb-0 pt-0">
          <div className="flex flex-col gap-2.5 border-b border-border/60 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Cari nama brand..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
              <RowActions
                basePermissionCode="setup.brand"
                iconOnly
                className="shrink-0"
                disabled={!selectedBrand || isDeleting}
                onView={() => selectedBrand && openReadonly(selectedBrand.id)}
                onEdit={() => selectedBrand && openEdit(selectedBrand.id)}
                onDelete={() => selectedBrand && setConfirmDeleteId(selectedBrand.id)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-border/70"
                onClick={() => void refetchBrands()}
                disabled={isRefreshing}
                aria-label="Refresh data"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <ActionButton
                permission="setup.brand.create"
                size="sm"
                className="rounded-lg"
                onClick={openCreate}
                icon={<Plus className="h-4 w-4" />}
              >
                Tambah Brand
              </ActionButton>
            </div>
          </div>

          <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
            <DataTable
              columns={getBrandColumns()}
              rows={brands}
              loading={isLoading || isRefreshing}
              emptyMessage="Belum ada data brand."
              totalRows={totalBrands}
              currentPage={pagination?.page}
              totalPagesOverride={pagination?.totalPages}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
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

      <BrandFormDialog
        mode={dialogMode}
        brandId={editingId}
        onClose={closeDialog}
        onSaved={closeDialog}
      />

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Brand"
        desc="Apakah Anda yakin ingin menghapus brand ini? Tindakan ini tidak dapat dibatalkan."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) deleteBrand(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
