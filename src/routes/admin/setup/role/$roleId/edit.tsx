import { createFileRoute } from "@tanstack/react-router";

import { RoleFormView } from "@/features/admin/setup/role";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/role/$roleId/edit")({
  beforeLoad: requireAdminPageAccess,
  component: RoleEditPage,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode === "readonly" ? "readonly" : "edit") as
      | "edit"
      | "readonly",
  }),
});

function RoleEditPage() {
  const { roleId } = Route.useParams();
  const { mode } = Route.useSearch();

  return <RoleFormView roleId={roleId} mode={mode} />;
}
