import { createFileRoute } from "@tanstack/react-router";
import { AccountView } from "@/features/settings";

export const Route = createFileRoute("/admin/settings/account")({
  component: AccountView,
});
