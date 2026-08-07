import { createFileRoute } from "@tanstack/react-router";
import { UserFormView } from "@/features/admin/user";
import { requireAdminPageAccess } from "@/lib/auth";
export const Route = createFileRoute("/admin/user/create")({
  component: () => <UserFormView />,
  beforeLoad: requireAdminPageAccess,
});
