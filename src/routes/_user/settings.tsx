import { createFileRoute } from "@tanstack/react-router";
import { SettingsLayout } from "@/components/layouts/settings/SettingsLayout";

export const Route = createFileRoute("/_user/settings")({
  component: () => <SettingsLayout basePath="/settings" />,
});
