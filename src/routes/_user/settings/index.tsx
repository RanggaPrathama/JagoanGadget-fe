import { createFileRoute, Navigate } from "@tanstack/react-router";

export const Route = createFileRoute("/_user/settings/")({
  component: () => <Navigate to="/settings/account" replace />,
});
