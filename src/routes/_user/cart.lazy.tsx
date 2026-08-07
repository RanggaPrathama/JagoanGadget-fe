import { createLazyFileRoute } from "@tanstack/react-router";
import { CartPage } from "@/features/user/cart";

export const Route = createLazyFileRoute("/_user/cart")({
  component: CartPage,
});
