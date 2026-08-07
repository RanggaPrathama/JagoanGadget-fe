import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import {
  Plus,
  RefreshCw,
  Search,
  Users,
  UserCheck,
  ShieldAlert,
} from "lucide-react";
import { DataTable } from "@/components/data-table/data-table";
import { RowActions } from "@/components/admin";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { cn } from "@/lib/utils";
import { userColumns } from "../components/user-columns";
import { useUserList } from "../hooks/useUserList";
import { StatCard } from "@/components/card/StatCard";

export function UserListView() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const debouncedSearch = useDebounce(search, 400);

  const {
    users,
    totalUsers,
    pagination,
    stats,
    isDeleting,
    isLoading,
    isRefreshing,
    refetchUsers,
    deleteUser,
  } = useUserList(debouncedSearch, page);

  const selectedUser = users.find((u) => u.id === selectedUserId) ?? null;

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      <div className="flex flex-col gap-3">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-muted-foreground">
            Manage users and assign their roles in the system.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <StatCard icon={Users} title="Total Users" value={stats.totalUsers} />
        <StatCard
          icon={UserCheck}
          title="Active Users"
          value={stats.activeUsers}
          description={`/ ${stats.totalUsers}`}
        />
        <StatCard
          icon={ShieldAlert}
          title="Superadmins"
          value={stats.superadmins}
        />
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
        <CardContent className="px-0 pb-0 pt-0">
          <div className="flex flex-col gap-2.5 border-b border-border/60 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Cari user..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
              <RowActions
                basePermissionCode="user"
                iconOnly
                className="shrink-0"
                disabled={!selectedUser || isDeleting}
                onView={() => {
                  if (!selectedUser) return;
                  navigate({
                    to: "/admin/user/$userId/edit",
                    params: { userId: selectedUser.id },
                    search: { mode: "readonly" as const },
                  });
                }}
                onEdit={() => {
                  if (!selectedUser) return;
                  navigate({
                    to: "/admin/user/$userId/edit",
                    params: { userId: selectedUser.id },
                    search: { mode: "edit" as const },
                  });
                }}
                onDelete={() => {
                  if (!selectedUser) return;
                  setConfirmDeleteId(selectedUser.id);
                }}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              size="icon-sm"
              className="rounded-lg border-border/70"
              onClick={() => {
                void refetchUsers();
              }}
              disabled={isRefreshing}
              aria-label="Refresh data"
              title="Refresh data"
            >
              <RefreshCw
                className={cn("size-4", isRefreshing && "animate-spin")}
              />
            </Button>

            <Button
              size="sm"
              className="w-full rounded-lg sm:w-auto"
              onClick={() => navigate({ to: "/admin/user/create" })}
            >
              <Plus data-icon="inline-start" />
              Create User
            </Button>
          </div>

          <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
            <DataTable
              columns={userColumns}
              rows={users}
              loading={isLoading || isRefreshing}
              emptyMessage="Belum ada data user."
              totalRows={totalUsers}
              currentPage={pagination?.page}
              totalPagesOverride={pagination?.totalPages}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
              onPrevPage={() =>
                setPage((currentPage) => Math.max(1, currentPage - 1))
              }
              onNextPage={() => {
                if (pagination?.hasNextPage) {
                  setPage((currentPage) => currentPage + 1);
                }
              }}
              selectedRowId={selectedUserId}
              getRowId={(user) => user.id}
              onRowClick={(user) =>
                setSelectedUserId((currentId) =>
                  currentId === user.id ? null : user.id,
                )
              }
            />
          </div>
        </CardContent>
      </Card>

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus User"
        desc="Apakah Anda yakin ingin menghapus user ini? Tindakan ini tidak dapat dibatalkan."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) {
            deleteUser(confirmDeleteId);
          }
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
