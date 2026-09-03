import { motion, useReducedMotion } from "framer-motion";
import type { Easing } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type StaggerProps = {
  children: ReactNode;
  className?: string;
  /** Index of this item within the parent StaggerContainer. */
  index?: number;
  /** Visual stagger step in seconds. Default 0.06. */
  step?: number;
  inView?: boolean;
};

/**
 * A single item that staggers in with its siblings. Wrap each child of a
 * region you want to cascade; place items inside a regular parent container
 * (children animate together, transform + opacity only). Pair children with
 * the same `inView` flag so the group reveals as one unit.
 *
 * Example:
 * ```tsx
 * <div>
 *   {items.map((item, i) => (
 *     <StaggerItem key={item} index={i}>
 *       {item}
 *     </StaggerItem>
 *   ))}
 * </div>
 * ```
 */
export function StaggerItem({
  children,
  className,
  index = 0,
  step = 0.06,
  inView = true,
}: StaggerProps) {
  const reduce = useReducedMotion();

  const delay = reduce ? 0 : index * step;

  const ease: Easing = [0.23, 1, 0.32, 1];

  const motionProps = {
    initial: {
      opacity: 0,
      ...(reduce ? {} : { y: 10 }),
    },
    ...(inView
      ? {
          whileInView: { opacity: 1, y: 0 },
          viewport: { once: true },
        }
      : {
          animate: { opacity: 1, y: 0 },
        }),
    transition: {
      duration: 0.3,
      delay,
      ease,
    },
  };

  return (
    <motion.div className={cn(className)} {...motionProps}>
      {children}
    </motion.div>
  );
}
