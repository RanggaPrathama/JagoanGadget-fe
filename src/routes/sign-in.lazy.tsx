import { createLazyFileRoute } from "@tanstack/react-router";
import { SignInPage } from "@/features/auth/signInPage";

export const Route = createLazyFileRoute("/sign-in")({
  component: SignInPage,
});
