import { createLazyFileRoute } from "@tanstack/react-router";
import { ProductDetailPage } from "@/features/user/products/ProductDetailPage";

export const Route = createLazyFileRoute("/_user/products/$slug")({
  component: ProductDetailPage,
});
