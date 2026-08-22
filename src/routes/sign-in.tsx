import { createFileRoute } from "@tanstack/react-router";
import { requireGuestUser } from "@/lib/auth";
import { SignInPage } from "@/features/auth/views/signInView";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: requireGuestUser,
  component: SignInPage,
});
