import * as React from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { FieldShell } from "./FieldShell";
import type { FieldBaseProps } from "./types";

type FieldInputProps = Omit<React.ComponentProps<typeof Input>, "disabled"> &
  FieldBaseProps & {
    inputClassName?: string;
    startIcon?: React.ReactNode;
    endIcon?: React.ReactNode;
    /** Renders the endIcon as a clickable button (e.g. show/hide password). */
    onEndIconClick?: () => void;
    /** Accessible label for the endIcon button. */
    endIconLabel?: string;
  };

function FieldInput({
  className,
  disabled = false,
  error,
  hint,
  id,
  inputClassName,
  label,
  required = false,
  startIcon,
  endIcon,
  onEndIconClick,
  endIconLabel,
  ...props
}: FieldInputProps) {
  return (
    <FieldShell
      className={className}
      disabled={disabled}
      error={error}
      hint={hint}
      htmlFor={id}
      label={label}
      required={required}
    >
      <div className="relative">
        {startIcon ? (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">
            {startIcon}
          </span>
        ) : null}
        <Input
          aria-invalid={error ? true : props["aria-invalid"]}
          className={cn(
            startIcon && "pl-9",
            endIcon && "pr-10",
            inputClassName,
          )}
          disabled={disabled}
          id={id}
          {...props}
        />
        {endIcon ? (
          onEndIconClick ? (
            <button
              type="button"
              onClick={onEndIconClick}
              aria-label={endIconLabel ?? "Tampilkan nilai"}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            >
              {endIcon}
            </button>
          ) : (
            <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground [&>svg]:size-4">
              {endIcon}
            </span>
          )
        ) : null}
      </div>
    </FieldShell>
  );
}

export { FieldInput };
export type { FieldInputProps };
