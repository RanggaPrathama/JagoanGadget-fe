import { useNavigate } from "@tanstack/react-router";
import { Plus, RefreshCw, Search } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton, AdminListHeader } from "@/components/admin";
import { AnimatedContainer } from "@/components/motion";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { getProductColumns } from "../components/product-columns";
import { useProductList } from "../hooks/useProductList";
import { useTableFilter } from "@/hooks/useTableFilter";

type ProductFilters = {
  status: "all" | "active" | "inactive";
};
const STATUS_OPTIONS: { value: ProductFilters["status"]; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Non-Aktif" },
];

// View: product list page with search, status filter, toolbar actions (view/edit/delete/refresh/add), AG Grid table, and delete confirmation dialog.
export function ProductListView() {
  const navigate = useNavigate();
  const {
    search,
    filters,
    page,
    limit,
    handleSearch,
    updateFilter,
    setPage,
    setLimit,
  } = useTableFilter<ProductFilters>({ status: "all" });

  const {
    products,
    totalProducts,
    pagination,
    isDeleting,
    isLoading,
    isRefreshing,
    refetchProducts,
    deleteProduct,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedProduct,
  } = useProductList(search, filters.status, page, limit);

  return (
    <div className="space-y-5">
      <AdminListHeader
        title="Product Setup"
        description="Kelola produk beserta varian (SKU), harga, dan attribute masing-masing."
      />

      <AnimatedContainer delay={0.3}>
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
                    placeholder="Cari nama produk..."
                    className="h-9 rounded-xl pl-9 pr-3 text-sm"
                  />
                </div>
                <RowActions
                  basePermissionCode="product"
                  iconOnly
                  className="shrink-0"
                  disabled={!selectedProduct || isDeleting}
                  // Open the selected product in read-only detail view.
                  onView={() => {
                    if (!selectedProduct) return;
                    navigate({
                      to: "/admin/master/product/$productId/edit",
                      params: { productId: selectedProduct.id },
                      search: { mode: "readonly" as const },
                    });
                  }}
                  // Open the selected product in the edit form.
                  onEdit={() => {
                    if (!selectedProduct) return;
                    navigate({
                      to: "/admin/master/product/$productId/edit",
                      params: { productId: selectedProduct.id },
                      search: { mode: "edit" as const },
                    });
                  }}
                  // Stage the selected product for deletion via the confirm dialog.
                  onDelete={() => {
                    if (!selectedProduct) return;
                    setConfirmDeleteId(selectedProduct.id);
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
                    void refetchProducts();
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
                  permission="product.create"
                  size="sm"
                  className="rounded-lg"
                  onClick={() =>
                    navigate({ to: "/admin/master/product/create" })
                  }
                  icon={<Plus className="h-4 w-4" />}
                >
                  Tambah Produk
                </ActionButton>
              </div>
            </div>

            {/* AG Grid */}
            <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
              <DataTable
                columns={getProductColumns()}
                rows={products}
                loading={isLoading || isRefreshing}
                emptyMessage="Belum ada data produk."
                totalRows={totalProducts}
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
      </AnimatedContainer>

      {/* Delete confirmation dialog — calls deleteProduct mutation and clears the selected ID on confirm/close. */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Produk"
        desc="Apakah Anda yakin ingin menghapus produk ini? Semua varian SKU, gambar, dan attribute-nya akan ikut terhapus. Tindakan ini tidak dapat dibatalkan."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) {
            deleteProduct(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
