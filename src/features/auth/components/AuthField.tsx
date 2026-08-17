import type { ComponentProps } from "react";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";

interface AuthFieldProps extends ComponentProps<typeof Input> {
  label: string;
  hint?: string;
}

export function AuthField({
  label,
  hint,
  className,
  ...props
}: AuthFieldProps) {
  return (
    <label className="grid gap-2">
      <div className="flex items-center justify-between gap-3">
        <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {label}
        </span>
        {hint ? (
          <span className="text-[10px] text-muted-foreground/80">{hint}</span>
        ) : null}
      </div>

      <Input
        className={cn(
          "h-10 rounded-[1rem] border-border/70 bg-background/85 px-4 text-sm shadow-none placeholder:text-muted-foreground/70",
          className,
        )}
        {...props}
      />
    </label>
  );
}
