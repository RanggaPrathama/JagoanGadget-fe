import { Plus, RefreshCw, Search } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton } from "@/components/admin";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useTableFilter } from "@/hooks/useTableFilter";
import { getCategoryColumns } from "../components/category-columns";
import { useCategoryList } from "../hooks/useCategoryList";
import { CategoryFormDialog } from "../components/CategoryFormDialog";

// View: category list page with search, toolbar actions, AG Grid table, form dialog, and delete confirmation.
export function CategoryListView() {
  const { search, page, limit, handleSearch, setPage, setLimit } =
    useTableFilter<Record<string, never>>({});

  const {
    categories,
    totalCategories,
    pagination,
    isDeleting,
    isLoading,
    isRefreshing,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedCategory,
    dialogMode,
    editingId,
    parentOptions,
    openCreate,
    openEdit,
    openReadonly,
    closeDialog,
    refetchCategories,
    deleteCategory,
  } = useCategoryList(search, page, limit);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Category Setup</h1>
          <p className="text-sm text-muted-foreground">
            Kelola hierarki kategori produk dengan parent dan slug.
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
                  placeholder="Cari nama kategori..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
              <RowActions
                basePermissionCode="setup.category"
                iconOnly
                className="shrink-0"
                disabled={!selectedCategory || isDeleting}
                onView={() => selectedCategory && openReadonly(selectedCategory.id)}
                onEdit={() => selectedCategory && openEdit(selectedCategory.id)}
                onDelete={() => selectedCategory && setConfirmDeleteId(selectedCategory.id)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-border/70"
                onClick={() => void refetchCategories()}
                disabled={isRefreshing}
                aria-label="Refresh data"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <ActionButton
                permission="setup.category.create"
                size="sm"
                className="rounded-lg"
                onClick={openCreate}
                icon={<Plus className="h-4 w-4" />}
              >
                Tambah Kategori
              </ActionButton>
            </div>
          </div>

          <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
            <DataTable
              columns={getCategoryColumns()}
              rows={categories}
              loading={isLoading || isRefreshing}
              emptyMessage="Belum ada data kategori."
              totalRows={totalCategories}
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
              selectedRowId={selectedId}
              getRowId={(row) => row.id}
              onRowClick={(row) =>
                setSelectedId((prev) => (prev === row.id ? null : row.id))
              }
            />
          </div>
        </CardContent>
      </Card>

      <CategoryFormDialog
        mode={dialogMode}
        categoryId={editingId}
        parentOptions={parentOptions}
        onClose={closeDialog}
        onSaved={closeDialog}
      />

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Kategori"
        desc="Apakah Anda yakin ingin menghapus kategori ini? Sub-kategori akan terlepas dari parent-nya."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) deleteCategory(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
