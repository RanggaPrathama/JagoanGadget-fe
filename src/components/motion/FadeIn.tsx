import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type FadeInProps = {
  children: ReactNode;
  className?: string;
  /** Vertical offset in px. 0 = pure fade. Default 12. */
  y?: number;
  /** Initial state applies on mount OR scroll-into-view. Default true. */
  inView?: boolean;
  delay?: number;
  once?: boolean;
};

export const EASE_OUT = [0.23, 1, 0.32, 1] as const;

/**
 * Fade + gentle rise entrance. GPU-only (transform + opacity).
 * Respects prefers-reduced-motion → renders static, no transform drift.
 */
export function FadeIn({
  children,
  className,
  y = 12,
  inView = true,
  delay = 0,
  once = true,
}: FadeInProps) {
  const reduce = useReducedMotion();

  const motionProps = {
    initial: {
      opacity: 0,
      ...(reduce ? {} : { y }),
    },
    ...(inView
      ? {
          whileInView: { opacity: 1, y: 0 },
          viewport: { once },
        }
      : {
          animate: { opacity: 1, y: 0 },
        }),
    transition: {
      duration: 0.35,
      delay,
      ease: EASE_OUT,
    },
  };

  return (
    <motion.div className={cn(className)} {...motionProps}>
      {children}
    </motion.div>
  );
}
