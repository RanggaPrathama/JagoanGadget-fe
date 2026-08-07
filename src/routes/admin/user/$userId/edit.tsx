import { createFileRoute } from "@tanstack/react-router";
import { UserFormView } from "@/features/admin/user";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/user/$userId/edit")({
  beforeLoad: requireAdminPageAccess,
  component: UserEditPage,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode === "readonly" ? "readonly" : "edit") as
      | "edit"
      | "readonly",
  }),
});

function UserEditPage() {
  const { userId } = Route.useParams();
  const { mode } = Route.useSearch();

  return <UserFormView userId={userId} mode={mode} />;
}
