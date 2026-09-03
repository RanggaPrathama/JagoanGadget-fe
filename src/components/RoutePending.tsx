import { Loaders } from "./Loaders";

/**
 * Route-level transport loader, shown only while the lazy route chunk resolves.
 * Neutral on purpose — it must not imply page content (a form, list, etc.),
 * since the layout chrome isn't mounted yet. Data loading inside a page is
 * handled separately by `FormSkeleton` (and per-view query state).
 */
export function RoutePending() {
  return (
    <div className="flex min-h-[100dvh] w-full flex-col items-center justify-center gap-3">
      <Loaders />
      <p className="text-sm font-medium text-muted-foreground">Loading…</p>
    </div>
  );
}
