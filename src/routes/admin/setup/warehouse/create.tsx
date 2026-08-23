import { createFileRoute } from "@tanstack/react-router";
import { WarehouseFormView } from "@/features/admin/setup/warehouse";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/warehouse/create")({
  beforeLoad: requireAdminPageAccess,
  component: WarehouseFormView,
});
