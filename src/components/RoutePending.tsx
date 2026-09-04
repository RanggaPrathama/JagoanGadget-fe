import { Loaders } from "./Loaders";
import { motion } from "framer-motion";

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
      <motion.p
        initial={{ opacity: 0.3 }}
        animate={{ opacity: 1 }}
        transition={{
          duration: 0.8,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="text-sm font-medium text-muted-foreground"
      >
        Loading…
      </motion.p>
    </div>
  );
}
