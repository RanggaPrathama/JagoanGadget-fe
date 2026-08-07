import { createFileRoute } from "@tanstack/react-router";
import { MenuFormView } from "@/features/admin/setup/menu";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/menu/$menuId/edit")({
  beforeLoad: requireAdminPageAccess,
  component: MenuEditPage,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode === "readonly" ? "readonly" : "edit") as
      | "edit"
      | "readonly",
  }),
});

function MenuEditPage() {
  const { menuId } = Route.useParams();
  const { mode } = Route.useSearch();

  return <MenuFormView menuId={menuId} mode={mode} />;
}
