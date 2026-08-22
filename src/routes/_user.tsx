import { createFileRoute } from "@tanstack/react-router";
import { UserLayout } from "@/components/layouts/user/UserLayout";
import { RoutePending } from "@/components/RoutePending";

export const Route = createFileRoute("/_user")({
  component: UserLayout,
  pendingComponent: RoutePending,
});
