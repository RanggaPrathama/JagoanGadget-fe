import * as React from "react"

import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"

import { FieldShell } from "./FieldShell"
import type { FieldBaseProps } from "./types"

type FieldTextareaProps = Omit<React.ComponentProps<typeof Textarea>, "disabled"> &
  FieldBaseProps & {
    textareaClassName?: string
  }

function FieldTextarea({
  className,
  disabled = false,
  error,
  hint,
  id,
  label,
  required = false,
  textareaClassName,
  ...props
}: FieldTextareaProps) {
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
      <Textarea
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cn(textareaClassName)}
        disabled={disabled}
        id={id}
        {...props}
      />
    </FieldShell>
  )
}

export { FieldTextarea }
export type { FieldTextareaProps }
