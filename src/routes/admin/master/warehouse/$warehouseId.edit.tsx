/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router";
import { WarehouseFormView } from "@/features/admin/warehouse";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/master/warehouse/$warehouseId/edit")({
  beforeLoad: requireAdminPageAccess,
  component: WarehouseEditPage,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode === "readonly" ? "readonly" : "edit") as
      | "edit"
      | "readonly",
  }),
});

function WarehouseEditPage() {
  const { warehouseId } = Route.useParams();
  const { mode } = Route.useSearch();

  return <WarehouseFormView warehouseId={warehouseId} mode={mode} />;
}
