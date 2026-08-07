import { createFileRoute } from "@tanstack/react-router";
import { PermissionFormView } from "@/features/admin/setup/permission";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute(
  "/admin/setup/permission/$permissionId/edit",
)({
  beforeLoad: requireAdminPageAccess,
  component: PermissionEditPage,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode === "readonly" ? "readonly" : "edit") as
      | "edit"
      | "readonly",
  }),
});

function PermissionEditPage() {
  const { permissionId } = Route.useParams();
  const { mode } = Route.useSearch();

  return <PermissionFormView permissionId={permissionId} mode={mode} />;
}
