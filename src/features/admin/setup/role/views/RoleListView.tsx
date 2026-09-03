import { useNavigate } from "@tanstack/react-router";
import { Plus, RefreshCw, Search } from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton, AdminListHeader } from "@/components/admin";
import { AnimatedContainer, StaggerItem } from "@/components/motion";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/card/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { useTableFilter } from "@/hooks/useTableFilter";
import { cn } from "@/lib/utils";
import { getRoleColumns } from "../components/role-columns";
import { useRoleList } from "../hooks/useRoleList";
import { FieldInput } from "@/components/field/FieldInput";

type RoleFilters = {
  status: "all" | "active" | "inactive";
};
const STATUS_OPTIONS: { value: RoleFilters["status"]; label: string }[] = [
  { value: "all", label: "Semua" },
  { value: "active", label: "Aktif" },
  { value: "inactive", label: "Non-Aktif" },
];

export function RoleListView() {
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
  } = useTableFilter<RoleFilters>({ status: "all" });
  const {
    ROLE_STATS,
    roles,
    totalRoles,
    pagination,
    stats,
    isDeleting,
    isLoading,
    isRefreshing,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedRole,
    refetchRoles,
    deleteRole,
  } = useRoleList(debouncedSearch, page, filters.status, limit);

  return (
    <div className="flex flex-col gap-5">
      <AdminListHeader
        title="Role Management"
        description="Create roles and manage access permissions for each role."
      />

      {/* Stat cards — quick overview of role counts by category */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {ROLE_STATS.map((stat, index) => (
          <StaggerItem step={0.1} key={stat.key} index={index}>
            <StatCard
              icon={stat.icon}
              title={stat.title}
              value={stats[stat.key]}
            />
          </StaggerItem>
        ))}
      </div>

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
            {/* Toolbar — search input, row actions, refresh, and create button */}
            <div className="flex flex-col gap-2.5 border-b border-border/60 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex flex-1 flex-wrap items-center gap-2">
                {/* Search input field with debounced search and row actions  */}
                <FieldInput
                  className="w-full max-w-xs"
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  startIcon={<Search />}
                  placeholder="Cari nama atau kode role ..."
                />
                <RowActions
                  basePermissionCode="setup.role"
                  iconOnly
                  className="shrink-0"
                  disabled={!selectedRole || isDeleting}
                  onView={() => {
                    if (!selectedRole) return;
                    navigate({
                      to: "/admin/setup/role/$roleId/edit",
                      params: { roleId: selectedRole.id },
                      search: { mode: "readonly" as const },
                    });
                  }}
                  onEdit={() => {
                    if (!selectedRole) return;
                    navigate({
                      to: "/admin/setup/role/$roleId/edit",
                      params: { roleId: selectedRole.id },
                      search: { mode: "edit" as const },
                    });
                  }}
                  onDelete={() => {
                    if (!selectedRole) return;
                    setConfirmDeleteId(selectedRole.id);
                  }}
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-border/70"
                onClick={() => {
                  void refetchRoles();
                }}
                disabled={isRefreshing}
                aria-label="Refresh data"
                title="Refresh data"
              >
                <RefreshCw
                  className={cn("size-4", isRefreshing && "animate-spin")}
                />
              </Button>

              <ActionButton
                permission="setup.role.create"
                size="sm"
                className="w-full rounded-lg sm:w-auto"
                onClick={() => navigate({ to: "/admin/setup/role/create" })}
                icon={<Plus data-icon="inline-start" />}
              >
                Create Role
              </ActionButton>
            </div>

            <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
              <DataTable
                columns={getRoleColumns()}
                rows={roles}
                loading={isLoading || isRefreshing}
                emptyMessage="Belum ada data role."
                totalRows={totalRoles}
                currentPage={pagination?.page}
                totalPagesOverride={pagination?.totalPages}
                hasNextPage={pagination?.hasNextPage}
                hasPreviousPage={pagination?.hasPreviousPage}
                pageSize={limit}
                onPageSizeChange={(size) => {
                  setLimit(size);
                  setPage(1);
                }}
                onPrevPage={() =>
                  setPage((currentPage) => Math.max(1, currentPage - 1))
                }
                onNextPage={() => {
                  if (pagination?.hasNextPage) {
                    setPage((currentPage) => currentPage + 1);
                  }
                }}
                selectedRowId={selectedId}
                getRowId={(role) => role.id}
                onRowClick={(role) =>
                  setSelectedId((currentId) =>
                    currentId === role.id ? null : role.id,
                  )
                }
              />
            </div>
          </CardContent>
        </Card>
      </AnimatedContainer>

      {/* Delete confirmation dialog — asks user to confirm before permanently removing a role */}
      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Role"
        desc="Apakah Anda yakin ingin menghapus role ini? Tindakan ini tidak dapat dibatalkan."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) {
            deleteRole(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
