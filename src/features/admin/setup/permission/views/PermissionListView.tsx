import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { Plus, RefreshCw, Search } from "lucide-react";

import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton } from "@/components/admin";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { getPermissionColumns } from "../components/permission-columns";
import { usePermissionList } from "../hooks/usePermissionList";

export function PermissionListView() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);
  const {
    permissions,
    totalPermissions,
    pagination,
    isDeleting,
    isLoading,
    isRefreshing,
    refetchPermissions,
    deletePermission,
  } = usePermissionList(debouncedSearch, page);
  const [selectedPermissionId, setSelectedPermissionId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const selectedPermission =
    permissions.find((p) => p.id === selectedPermissionId) ?? null;

  // Reset page to 1 whenever the search query changes so the table always
  // starts from the first page with the new filter applied.
  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">
            Permission Setup
          </h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar permission dan hak akses yang tersedia.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
        <CardContent className="px-0 pb-0 pt-0">
          {/* Toolbar */}
          <div className="flex flex-col gap-2.5 border-b border-border/60 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Cari permission..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
              {/* RowActions: view/edit navigate to the same detail page with the
                  appropriate mode; delete opens the confirm dialog. */}
              <RowActions
                basePermissionCode="setup.permission"
                iconOnly
                className="shrink-0"
                disabled={!selectedPermission || isDeleting}
                onView={() => {
                  if (!selectedPermission) return;
                  navigate({
                    to: "/admin/setup/permission/$permissionId/edit",
                    params: { permissionId: selectedPermission.id },
                    search: { mode: "readonly" as const },
                  });
                }}
                onEdit={() => {
                  if (!selectedPermission) return;
                  navigate({
                    to: "/admin/setup/permission/$permissionId/edit",
                    params: { permissionId: selectedPermission.id },
                    search: { mode: "edit" as const },
                  });
                }}
                onDelete={() => {
                  if (!selectedPermission) return;
                  setConfirmDeleteId(selectedPermission.id);
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
                  void refetchPermissions();
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
                permission="setup.permission.create"
                size="sm"
                className="rounded-lg"
                onClick={() =>
                  navigate({ to: "/admin/setup/permission/create" })
                }
                icon={<Plus className="h-4 w-4" />}
              >
                Tambah Permission
              </ActionButton>
            </div>
          </div>

          {/* AG Grid */}
          <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
            <DataTable
              columns={getPermissionColumns()}
              rows={permissions}
              loading={isLoading || isRefreshing}
              emptyMessage="Belum ada data permission."
              totalRows={totalPermissions}
              currentPage={pagination?.page}
              totalPagesOverride={pagination?.totalPages}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
              onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
              onNextPage={() => {
                if (pagination?.hasNextPage) setPage((p) => p + 1);
              }}
              selectedRowId={selectedPermissionId}
              getRowId={(row) => row.id}
              onRowClick={(row) =>
                setSelectedPermissionId((prev) =>
                  prev === row.id ? null : row.id,
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      {/* ConfirmDialog: confirms deletion of a permission row and calls the
          delete mutation; closes on cancel or after mutation completes. */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Permission"
        desc="Apakah Anda yakin ingin menghapus permission ini? Tindakan ini tidak dapat dibatalkan."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) {
            deletePermission(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
