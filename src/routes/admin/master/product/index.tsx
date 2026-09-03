import { createFileRoute } from "@tanstack/react-router";
import { ProductListView } from "@/features/admin/products";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/master/product/")({
  beforeLoad: requireAdminPageAccess,
  component: ProductListView,
});
