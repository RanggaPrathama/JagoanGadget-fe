import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/features/settings";

export const Route = createFileRoute("/_user/settings/notifications")({
  component: NotificationsView,
});
