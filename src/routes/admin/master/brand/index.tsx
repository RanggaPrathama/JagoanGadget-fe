import { createFileRoute } from "@tanstack/react-router";
import { BrandListView } from "@/features/admin/setup/brand";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/master/brand/")({
  beforeLoad: requireAdminPageAccess,
  component: BrandListView,
});
