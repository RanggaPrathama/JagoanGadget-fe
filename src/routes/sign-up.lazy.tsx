import { createLazyFileRoute } from "@tanstack/react-router";
import { SignUpPage } from "@/features/auth/signUpPage";

export const Route = createLazyFileRoute("/sign-up")({
  component: SignUpPage,
});
