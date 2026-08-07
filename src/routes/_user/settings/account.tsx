import { createFileRoute } from "@tanstack/react-router";
import { AccountView } from "@/features/settings";

export const Route = createFileRoute("/_user/settings/account")({
  component: AccountView,
});
