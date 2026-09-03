/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router";
import { ProductFormView } from "@/features/admin/products";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/master/product/$productId/edit")(
  {
    beforeLoad: requireAdminPageAccess,
    component: ProductEditPage,
    validateSearch: (search: Record<string, unknown>) => ({
      mode: (search.mode === "readonly" ? "readonly" : "edit") as
        | "edit"
        | "readonly",
    }),
  },
);

function ProductEditPage() {
  const { productId } = Route.useParams();
  const { mode } = Route.useSearch();

  return <ProductFormView productId={productId} mode={mode} />;
}
