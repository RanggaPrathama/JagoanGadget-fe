import { createFileRoute } from "@tanstack/react-router";
import { requireAdminPageAccess } from "@/lib/auth";
import { NumberFormatListView } from "@/features/admin/setup/number_format/views/NumberFormatListView";

export const Route = createFileRoute("/admin/setup/number-format/")({
  beforeLoad: requireAdminPageAccess,
  component: NumberFormatListView,
});
