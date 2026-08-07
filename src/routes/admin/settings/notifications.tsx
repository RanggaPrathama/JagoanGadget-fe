import { createFileRoute } from "@tanstack/react-router";
import { NotificationsView } from "@/features/settings";

export const Route = createFileRoute("/admin/settings/notifications")({
  component: NotificationsView,
});
