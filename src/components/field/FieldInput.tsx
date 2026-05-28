import * as React from "react"

import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

import { FieldShell } from "./FieldShell"
import type { FieldBaseProps } from "./types"

type FieldInputProps = Omit<React.ComponentProps<typeof Input>, "disabled"> &
  FieldBaseProps & {
    inputClassName?: string
  }

function FieldInput({
  className,
  disabled = false,
  error,
  hint,
  id,
  inputClassName,
  label,
  required = false,
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
      <Input
        aria-invalid={error ? true : props["aria-invalid"]}
        className={cn(inputClassName)}
        disabled={disabled}
        id={id}
        {...props}
      />
    </FieldShell>
  )
}

export { FieldInput }
export type { FieldInputProps }
