import { createFileRoute } from "@tanstack/react-router";
import { ProductFormView } from "@/features/admin/products";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/master/product/create")({
  beforeLoad: requireAdminPageAccess,
  component: ProductFormView,
});
