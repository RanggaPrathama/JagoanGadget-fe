import * as React from "react";

import { cn } from "@/utils/cn";

import type { FieldBaseProps } from "./types";

type FieldShellProps = React.PropsWithChildren<
  FieldBaseProps & {
    htmlFor?: string;
  }
>;

function FieldShell({
  children,
  className,
  disabled = false,
  error,
  hint,
  htmlFor,
  label,
  required = false,
}: FieldShellProps) {
  const describedBy = [
    hint ? `${htmlFor ?? "field"}-hint` : null,
    error ? `${htmlFor ?? "field"}-error` : null,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div
      className={cn("flex flex-col gap-2", className)}
      data-disabled={disabled ? "true" : undefined}
      data-invalid={error ? "true" : undefined}
    >
      {label ? (
        <label
          htmlFor={htmlFor}
          className="text-sm font-medium leading-none text-foreground data-[disabled=true]:opacity-70"
          data-disabled={disabled ? "true" : undefined}
        >
          {label}
          {required ? <span className="ml-1 text-destructive">*</span> : null}
        </label>
      ) : null}

      <div aria-describedby={describedBy || undefined}>{children}</div>

      {hint && !error ? (
        <p
          id={`${htmlFor ?? "field"}-hint`}
          className="text-sm text-muted-foreground"
        >
          {hint}
        </p>
      ) : null}

      {error ? (
        <p
          id={`${htmlFor ?? "field"}-error`}
          className="text-sm text-destructive"
        >
          {error}
        </p>
      ) : null}
    </div>
  );
}

export { FieldShell };
