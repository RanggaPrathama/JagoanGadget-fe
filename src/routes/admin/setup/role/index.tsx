import { createFileRoute } from "@tanstack/react-router";

import { RoleListView } from "@/features/admin/setup/role";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/role/")({
  beforeLoad: requireAdminPageAccess,
  component: RoleListView,
});
