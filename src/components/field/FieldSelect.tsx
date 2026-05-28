import * as React from "react"

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox"
import { cn } from "@/lib/utils"

import { FieldShell } from "./FieldShell"
import type { FieldBaseProps, FieldOption } from "./types"

export type FieldSelectProps = FieldBaseProps & {
  placeholder?: string
  value?: string | number | null
  onValueChange: (value: string) => void
  options: FieldOption[]
  loading?: boolean
  searchable?: boolean
  emptyText?: string
  name?: string
}

function toStringValue(value?: string | number | null) {
  return value === null || value === undefined ? "" : String(value)
}

function FieldSelect({
  className,
  disabled = false,
  emptyText = "No options found.",
  error,
  hint,
  label,
  loading = false,
  name,
  onValueChange,
  options,
  placeholder = "Select an option",
  required = false,
  searchable = false,
  value,
}: FieldSelectProps) {
  const generatedId = React.useId()
  const fieldId = name || generatedId
  const selectedValue = toStringValue(value)
  const selectedOption = options.find((option) => String(option.value) === selectedValue)
  const isDisabled = disabled || loading

  if (searchable) {
    return (
      <FieldShell
        className={className}
        disabled={isDisabled}
        error={error}
        hint={hint}
        htmlFor={fieldId}
        label={label}
        required={required}
      >
        <Combobox
          defaultValue={selectedValue}
          disabled={isDisabled}
          inputValue={selectedOption?.label ?? ""}
          onValueChange={(nextValue) => onValueChange(String(nextValue))}
          value={selectedValue}
        >
          <ComboboxInput
            aria-invalid={!!error}
            disabled={isDisabled}
            id={fieldId}
            name={name}
            placeholder={loading ? "Loading options..." : placeholder}
            showClear={false}
            showTrigger
          />
          <ComboboxContent>
            <ComboboxList>
              {loading ? (
                <div className="px-3 py-2 text-sm text-muted-foreground">Loading options...</div>
              ) : null}
              {!loading ? (
                <>
                  {options.map((option) => (
                    <ComboboxItem
                      key={String(option.value)}
                      disabled={option.disabled}
                      value={String(option.value)}
                    >
                      {option.label}
                    </ComboboxItem>
                  ))}
                  <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                </>
              ) : null}
            </ComboboxList>
          </ComboboxContent>
        </Combobox>
      </FieldShell>
    )
  }

  return (
    <FieldShell
      className={className}
      disabled={isDisabled}
      error={error}
      hint={hint}
      htmlFor={fieldId}
      label={label}
      required={required}
    >
      <select
        aria-invalid={!!error}
        className={cn(
          "flex h-9 w-full rounded-4xl border border-input bg-input/30 px-3 py-2 text-sm text-foreground shadow-xs outline-none transition-[color,box-shadow]",
          "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40"
        )}
        disabled={isDisabled}
        id={fieldId}
        name={name}
        onChange={(event) => onValueChange(event.target.value)}
        value={selectedValue}
      >
        <option value="" disabled>
          {loading ? "Loading options..." : placeholder}
        </option>
        {options.map((option) => (
          <option
            key={String(option.value)}
            disabled={option.disabled}
            value={String(option.value)}
          >
            {option.label}
          </option>
        ))}
      </select>
    </FieldShell>
  )
}

export { FieldSelect }
