import { createFileRoute } from "@tanstack/react-router";
import { UserLayout } from "@/components/layouts/user/UserLayout";

export const Route = createFileRoute("/_user")({
  component: UserLayout,
});
