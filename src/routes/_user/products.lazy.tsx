import { createLazyFileRoute } from "@tanstack/react-router";
import { ProductsPage } from "@/features/user/products";

export const Route = createLazyFileRoute("/_user/products")({
  component: ProductsPage,
});
