/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router";
import { requireAdminPageAccess } from "@/lib/auth";
import { NumberFormatFormView } from "@/features/admin/setup/number_format/views/NumberFormatFormView";

export const Route = createFileRoute(
  "/admin/setup/number-format/$numberFormatId/edit",
)({
  beforeLoad: requireAdminPageAccess,
  component: NumberFormatEditPage,
  validateSearch: (search: Record<string, unknown>) => ({
    mode: (search.mode === "readonly" ? "readonly" : "edit") as
      | "edit"
      | "readonly",
  }),
});

function NumberFormatEditPage() {
  const { numberFormatId } = Route.useParams();
  const { mode } = Route.useSearch();

  return <NumberFormatFormView numberFormatId={numberFormatId} mode={mode} />;
}
