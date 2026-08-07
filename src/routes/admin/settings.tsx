import { createFileRoute } from "@tanstack/react-router";
import { requireAdminPageAccess } from "@/lib/auth";
import { SettingsLayout } from "@/components/layouts/settings/SettingsLayout";

export const Route = createFileRoute("/admin/settings")({
  beforeLoad: requireAdminPageAccess,
  component: () => <SettingsLayout basePath="/admin/settings" />,
});
