import { createFileRoute } from "@tanstack/react-router";
import { MenuListView } from "@/features/admin/setup/menu";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/menu/")({
  beforeLoad: requireAdminPageAccess,
  component: MenuListView,
});
