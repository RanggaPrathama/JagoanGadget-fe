import { useNavigate } from "@tanstack/react-router";
import { Plus, RefreshCw, Search } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton, AdminListHeader } from "@/components/admin";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { getMenuColumns } from "../components/menu-columns";
import { useMenuList } from "../hooks/useMenuList";
import { useTableFilter } from "@/hooks/useTableFilter";
import { AnimatedContainer } from "@/components/motion";
import { FieldInput } from "@/components/field";

type MenuFilters = {
  status: "all" | "active" | "inactive";
};
const STATUS_OPTIONS: { value: MenuFilters["status"]; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Non-Aktif" },
];

// View: menu list page with search, status filter, toolbar actions (view/edit/delete/refresh/add), AG Grid table, and delete confirmation dialog.
export function MenuListView() {
  const navigate = useNavigate();
  const {
    search,
    debouncedSearch,
    filters,
    page,
    limit,
    handleSearch,
    updateFilter,
    setPage,
    setLimit,
  } = useTableFilter<MenuFilters>({ status: "all" });

  const {
    menus,
    totalMenus,
    pagination,
    isDeleting,
    isLoading,
    isRefreshing,
    refetchMenus,
    deleteMenu,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedMenu,
  } = useMenuList(debouncedSearch, filters.status, page, limit);

  return (
    <div className="space-y-5">
      <AdminListHeader
        title="Menu Setup"
        description="Kelola struktur menu admin, status aktif, dan relasi parent menu."
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
                {/* Search input field with debounced search and row actions for the selected menu */}
                <FieldInput
                  className="w-full max-w-xs"
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  startIcon={<Search />}
                  placeholder="Cari nama menu..."
                />
                <RowActions
                  basePermissionCode="setup.menu"
                  iconOnly
                  className="shrink-0"
                  disabled={!selectedMenu || isDeleting}
                  // Open the selected menu in read-only detail view.
                  onView={() => {
                    if (!selectedMenu) return;
                    navigate({
                      to: "/admin/setup/menu/$menuId/edit",
                      params: { menuId: selectedMenu.id },
                      search: { mode: "readonly" as const },
                    });
                  }}
                  // Open the selected menu in the edit form.
                  onEdit={() => {
                    if (!selectedMenu) return;
                    navigate({
                      to: "/admin/setup/menu/$menuId/edit",
                      params: { menuId: selectedMenu.id },
                      search: { mode: "edit" as const },
                    });
                  }}
                  // Stage the selected menu for deletion via the confirm dialog.
                  onDelete={() => {
                    if (!selectedMenu) return;
                    setConfirmDeleteId(selectedMenu.id);
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
                    // Re-fetch the menu list from the server.
                    void refetchMenus();
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
                  permission="setup.menu.create"
                  size="sm"
                  className="rounded-lg"
                  onClick={() => navigate({ to: "/admin/setup/menu/create" })}
                  icon={<Plus className="h-4 w-4" />}
                >
                  Tambah Menu
                </ActionButton>
              </div>
            </div>

            {/* AG Grid */}
            <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
              <DataTable
                columns={getMenuColumns()}
                rows={menus}
                loading={isLoading || isRefreshing}
                emptyMessage="Belum ada data menu."
                totalRows={totalMenus}
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

      {/* Delete confirmation dialog — calls deleteMenu mutation and clears the selected ID on confirm/close. */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Menu"
        desc="Apakah Anda yakin ingin menghapus menu ini? Tindakan ini tidak dapat dibatalkan."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) {
            deleteMenu(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
