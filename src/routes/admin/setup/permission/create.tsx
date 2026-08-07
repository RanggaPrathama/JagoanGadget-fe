import { createFileRoute } from "@tanstack/react-router";
import { PermissionFormView } from "@/features/admin/setup/permission";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/permission/create")({
  beforeLoad: requireAdminPageAccess,
  component: PermissionFormView,
});
