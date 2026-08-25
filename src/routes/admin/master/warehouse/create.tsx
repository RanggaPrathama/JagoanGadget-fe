import { createFileRoute } from "@tanstack/react-router";
import { WarehouseFormView } from "@/features/admin/warehouse";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/master/warehouse/create")({
  beforeLoad: requireAdminPageAccess,
  component: WarehouseFormView,
});
