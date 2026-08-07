import { createFileRoute } from "@tanstack/react-router";
import { LandingPage } from "@/features/user/landing";

export const Route = createFileRoute("/_user/")({
  component: LandingPage,
});
