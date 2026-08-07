import { FormSkeleton } from "@/components/admin";

/**
 * Route-level loading fallback, dirender di dalam Suspense boundary per-route
 * selama lazy route chunk resolve. Beda dari data loading yang ditangani
 * halaman sendiri lewat query state.
 */
export function RoutePending() {
  return <FormSkeleton count={1} />;
}
