import { createFileRoute } from "@tanstack/react-router";
import { requireAuthenticatedUser } from "@/lib/auth";
import { SettingsLayout } from "@/components/layouts/settings/SettingsLayout";

export const Route = createFileRoute("/_user/settings")({
  beforeLoad: requireAuthenticatedUser,
  component: () => <SettingsLayout basePath="/settings" />,
});
