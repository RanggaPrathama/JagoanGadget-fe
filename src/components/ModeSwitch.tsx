import { Laptop, Moon, Sun } from "lucide-react";
import { useTheme } from "@/context/ThemeProvider";
import type { ThemeMode } from "@/lib/theme";
import { Button } from "./ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/utils/cn";

type ModeSwitchProps = {
  className?: string;
};

export function ModeSwitch({ className }: ModeSwitchProps) {
  const { theme, setTheme } = useTheme();

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      className={cn("relative overflow-hidden w-9 h-9 p-0", className)}
      onClick={() => {
        const nextTheme: ThemeMode =
          theme === "light" ? "dark" : theme === "dark" ? "system" : "light";
        setTheme(nextTheme);
      }}
      aria-label="Toggle theme mode"
      title="Toggle theme mode"
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={theme}
          initial={{ opacity: 0, scale: 0.5, rotate: -90 }}
          animate={{ opacity: 1, scale: 1, rotate: 0 }}
          exit={{ opacity: 0, scale: 0.5, rotate: 90 }}
          transition={{ duration: 0.25, ease: "backOut" }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {theme === "light" ? (
            <Sun className="h-4 w-4" />
          ) : theme === "dark" ? (
            <Moon className="h-4 w-4" />
          ) : (
            <Laptop className="h-4 w-4" />
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
