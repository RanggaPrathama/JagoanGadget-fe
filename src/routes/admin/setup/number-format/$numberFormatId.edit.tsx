/* eslint-disable react-refresh/only-export-components */
import { createFileRoute } from "@tanstack/react-router";
import { requireAdminPageAccess } from "@/lib/auth";
import { Card, CardContent } from "@/components/ui/card";

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

// Placeholder page: real segments-builder form comes later.
function NumberFormatEditPage() {
  const { numberFormatId } = Route.useParams();
  const { mode } = Route.useSearch();

  return (
    <div className="space-y-5">
      <div className="space-y-1">
        <h1 className="text-2xl font-semibold tracking-tight">
          {mode === "readonly"
            ? "Detail Number Format"
            : "Edit Number Format"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Form segments builder menyusul. ID:{" "}
          <code className="rounded bg-muted px-1 py-0.5 text-xs">
            {numberFormatId}
          </code>
        </p>
      </div>
      <Card>
        <CardContent className="py-10 text-center text-sm text-muted-foreground">
          Belum tersedia — segments builder sedang dalam pengembangan.
        </CardContent>
      </Card>
    </div>
  );
}
