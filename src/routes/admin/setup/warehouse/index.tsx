import { createFileRoute } from "@tanstack/react-router";
import { WarehouseListView } from "@/features/admin/setup/warehouse";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/warehouse/")({
  beforeLoad: requireAdminPageAccess,
  component: WarehouseListView,
});
