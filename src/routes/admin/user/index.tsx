import { createFileRoute } from "@tanstack/react-router";
import { UserListView } from "@/features/admin/user";
import { requireAdminPageAccess } from "@/lib/auth";
export const Route = createFileRoute("/admin/user/")({
  component: UserListView,
  beforeLoad: requireAdminPageAccess,
});
