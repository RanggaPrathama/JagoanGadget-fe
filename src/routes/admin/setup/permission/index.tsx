import { createFileRoute } from "@tanstack/react-router";
import { PermissionListView } from "@/features/admin/setup/permission";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/permission/")({
  beforeLoad: requireAdminPageAccess,
  component: PermissionListView,
});
