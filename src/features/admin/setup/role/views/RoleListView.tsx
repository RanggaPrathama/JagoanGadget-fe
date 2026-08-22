import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  RefreshCw,
  Search,
  Shield,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton } from "@/components/admin";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/card/StatCard";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { getRoleColumns } from "../components/role-columns";
import { useRoleList } from "../hooks/useRoleList";

export function RoleListView() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(25);
  const debouncedSearch = useDebounce(search, 400);
  const {
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
  } = useRoleList(debouncedSearch, page, limit);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3 ">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            Role Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Create roles and manage access permissions for each role.
          </p>
        </div>
      </div>

      {/* Stat cards — quick overview of role counts by category */}
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Users} title="Total Roles" value={stats.totalRoles} />
        <StatCard
          icon={ShieldCheck}
          title="Active Roles"
          value={stats.activeRoles}
          description={`/ ${stats.totalRoles}`}
        />
        <StatCard
          icon={Shield}
          title="System Roles"
          value={stats.systemRoles}
        />
        <StatCard
          icon={Sparkles}
          title="Custom Roles"
          value={stats.customRoles}
        />
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
        <CardContent className="px-0 pb-0 pt-0">
          {/* Toolbar — search input, row actions, refresh, and create button */}
          <div className="flex flex-col gap-2.5 border-b border-border/60 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Cari role..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
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
