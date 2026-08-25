import { createFileRoute } from "@tanstack/react-router";
import { WarehouseListView } from "@/features/admin/warehouse";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/master/warehouse/")({
  beforeLoad: requireAdminPageAccess,
  component: WarehouseListView,
});
