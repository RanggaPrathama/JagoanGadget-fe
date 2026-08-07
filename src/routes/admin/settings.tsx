import { createFileRoute } from "@tanstack/react-router";
import { SettingsLayout } from "@/components/layouts/settings/SettingsLayout";

export const Route = createFileRoute("/admin/settings")({
  component: () => <SettingsLayout basePath="/admin/settings" />,
});
