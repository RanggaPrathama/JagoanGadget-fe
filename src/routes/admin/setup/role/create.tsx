import { createFileRoute } from "@tanstack/react-router";

import { RoleFormView } from "@/features/admin/setup/role";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/role/create")({
  beforeLoad: requireAdminPageAccess,
  component: RoleFormView,
});
