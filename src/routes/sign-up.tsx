import { createFileRoute } from "@tanstack/react-router";
import { requireGuestUser } from "@/lib/auth";
import { SignUpPage } from "@/features/auth/views/signUpView";

export const Route = createFileRoute("/sign-up")({
  beforeLoad: requireGuestUser,
  component: SignUpPage,
});
