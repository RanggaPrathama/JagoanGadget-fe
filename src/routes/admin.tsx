import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/layouts/admin/AdminLayout";
import { NotFoundError } from "@/features/errors/NotFoundError";
import { requireAdminAccess } from "@/lib/auth";
import { RoutePending } from "@/components/RoutePending";

export const Route = createFileRoute("/admin")({
  beforeLoad: requireAdminAccess,
  component: AdminLayout,
  pendingComponent: RoutePending,
  notFoundComponent: () => <NotFoundError />,
});
