import { createFileRoute } from "@tanstack/react-router";
import { requireAdminPageAccess } from "@/lib/auth";
import { PrefixListView } from "@/features/admin/setup/prefix/views/PrefixListView";

export const Route = createFileRoute("/admin/setup/prefix/")({
  beforeLoad: requireAdminPageAccess,
  component: PrefixListView,
});
