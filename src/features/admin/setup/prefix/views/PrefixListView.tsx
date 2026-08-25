import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Link, useLocation } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { usePrefixList } from "../hooks/usePrefixList";
import { RowActions, ActionButton } from "@/components/admin";
import { RefreshCw, Plus, Hash, ListOrdered } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { getPrefixColumns } from "../components/prefix-column";
import { ConfirmDialog } from "@/components/dialog/ConfirmDialog";
import { useTableFilter } from "@/hooks/useTableFilter";
import { PrefixFormDialog } from "../components/PrefixFormDialog";

type PrefixStatusFilter = {
  status: "all" | "active" | "inactive";
};

const STATUS_OPTIONS: { value: PrefixStatusFilter["status"]; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Non-Aktif" },
];

export const PrefixListView = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const {
    search,
    filters,
    page,
    limit,
    handleSearch,
    updateFilter,
    setPage,
    setLimit,
  } = useTableFilter<PrefixStatusFilter>({ status: "all" });

  const {
    prefixes,
    pagination,
    totalPrefixes,
    isDeleting,
    isRefreshing,
    refetchPrefixes,
    deletePrefix,
    isLoading,
    selectedId,
    setSelectedId,
    selectedPrefix,
    confirmDeleteId,
    setConfirmDeleteId,
    dialogMode,
    editingId,
    openCreate,
    openEdit,
    openReadonly,
    closeDialog,
  } = usePrefixList(search, filters.status, page, limit);

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Prefix Setup
          </h1>
          <p className="text-sm text-muted-foreground">Kelola daftar prefix</p>
        </div>
      </div>
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
                onClick={() => {
                  updateFilter("status", opt.value);
                }}
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
                  placeholder="Cari nama menu..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
              <RowActions
                basePermissionCode="setup.prefix"
                iconOnly
                className="shrink-0"
                disabled={!selectedPrefix || isDeleting}
                // Open the selected prefix in read-only detail view.
                onView={() => {
                  if (!selectedPrefix) return;
                  openReadonly(selectedPrefix.id);
                }}
                // Open the selected prefix in the edit form.
                onEdit={() => {
                  if (!selectedPrefix) return;
                  openEdit(selectedPrefix.id);
                }}
                // Stage the selected prefix for deletion via the confirm dialog.
                onDelete={() => {
                  if (!selectedPrefix) return;
                  setConfirmDeleteId(selectedPrefix.id);
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
                  // Re-fetch the prefix list from the server.
                  void refetchPrefixes();
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
                permission="setup.prefix.create"
                size="sm"
                className="rounded-lg"
                onClick={() => openCreate()}
                icon={<Plus className="h-4 w-4" />}
              >
                Tambah Prefix
              </ActionButton>
            </div>
          </div>

          {/* AG Grid */}
          <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
            <DataTable
              columns={getPrefixColumns()}
              rows={prefixes}
              loading={isLoading || isRefreshing}
              emptyMessage="Belum ada data prefix."
              totalRows={totalPrefixes}
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

      <PrefixFormDialog
        mode={dialogMode}
        prefixId={editingId}
        onClose={closeDialog}
        onSaved={closeDialog}
      />

      {/* Delete confirmation dialog — calls deletePrefix mutation and clears the selected ID on confirm/close. */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Prefix"
        desc="Apakah Anda yakin ingin menghapus prefix ini? Tindakan ini tidak dapat dibatalkan."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) {
            deletePrefix(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
};
