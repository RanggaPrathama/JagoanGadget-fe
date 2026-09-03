import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

import { cn } from "@/utils/cn";

type AnimatedContainerProps = {
  children: ReactNode;
  className?: string;
  delay?: number;
};

/**
 * Mount-time entrance for stable containers (form sections, cards, panels).
 * Conservative by design per animation-gate: admin lists/forms render often,
 * so motion stays near-imperceptible — a short fade with a tiny rise.
 * Respects prefers-reduced-motion → static render.
 */
export function AnimatedContainer({
  children,
  className,
  delay = 0,
}: AnimatedContainerProps) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={cn(className)}
      initial={{
        opacity: 0,
        ...(reduce ? {} : { y: 24 }), // Naikkan jarak dari 8 ke 24 biar keliatan bergerak
      }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.8,
        delay,
        ease: [0.21, 1.11, 0.35, 1.05], 
      }}
    >
      {children}
    </motion.div>
  );
}
