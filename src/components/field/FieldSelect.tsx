import * as React from "react";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxTrigger,
} from "@/components/ui/combobox";
import { cn } from "@/utils/cn";
import { HugeiconsIcon } from "@hugeicons/react";
import { Cancel01Icon } from "@hugeicons/core-free-icons";

import { FieldShell } from "./FieldShell";
import type { FieldBaseProps, FieldOption } from "./types";

export type FieldSelectProps = FieldBaseProps & {
  placeholder?: string;
  value?: string | number | null;
  onValueChange: (value: string) => void;
  options: FieldOption[];
  loading?: boolean;
  searchable?: boolean;
  emptyText?: string;
  name?: string;
};

function toStringValue(value?: string | number | null) {
  return value === null || value === undefined ? "" : String(value);
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
  const generatedId = React.useId();
  const fieldId = name || generatedId;
  const selectedValue = toStringValue(value);
  const selectedOption = options.find(
    (option) => String(option.value) === selectedValue,
  );
  const isDisabled = disabled || loading;

  // --- searchable combobox state ---
  const [comboInput, setComboInput] = React.useState("");

  // Base UI Combobox links `value` <-> `inputValue`. For non-searchable usage
  // there is no visible input, so derive inputValue from the selected option's
  // label to keep the Combobox's internal state in sync with the chosen value.
  // For searchable usage inputValue is the user's live query (comboInput).
  const resolvedInputValue = searchable
    ? comboInput
    : (selectedOption?.label ?? "");

  const filteredOptions =
    searchable && comboInput
      ? options.filter((opt) =>
          opt.label.toLowerCase().includes(comboInput.toLowerCase()),
        )
      : options;

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
        value={selectedValue}
        inputValue={resolvedInputValue}
        onInputValueChange={(val: string) => setComboInput(val)}
        disabled={isDisabled}
        onValueChange={(nextValue) => {
          if (nextValue === null || nextValue === undefined) {
            onValueChange("");
          } else {
            onValueChange(String(nextValue));
          }

          if (searchable) {
            setComboInput("");
          }
        }}
      >
        <div className="relative w-full">
          <ComboboxTrigger
            showChevron={!selectedValue}
            className={cn(
              "flex h-9 w-full items-center gap-2 rounded-4xl border border-input bg-input/30 pr-9 pl-3 py-2 text-sm shadow-xs outline-none transition-[color,box-shadow]",
              "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50",
              "disabled:cursor-not-allowed disabled:opacity-50",
              "aria-invalid:border-destructive aria-invalid:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40",
              !selectedValue && "text-muted-foreground",
            )}
            aria-invalid={!!error}
            disabled={isDisabled}
          >
            {selectedOption?.label ?? placeholder}
          </ComboboxTrigger>

          {/* Clear icon overlay when value selected */}
          {!!selectedValue && (
            <button
              type="button"
              tabIndex={-1}
              disabled={isDisabled}
              onClick={(e) => {
                e.stopPropagation();
                onValueChange("");
                if (searchable) setComboInput("");
              }}
              className="absolute right-2 top-0 bottom-0 flex items-center rounded-full p-1 text-muted-foreground hover:text-foreground disabled:pointer-events-none disabled:opacity-50"
            >
              <HugeiconsIcon
                icon={Cancel01Icon}
                strokeWidth={2}
                className="size-4"
              />
            </button>
          )}
        </div>
        <ComboboxContent>
          {searchable && (
            <ComboboxInput
              showTrigger={false}
              showClear={false}
              placeholder={loading ? "Loading options..." : "Search..."}
              disabled={isDisabled}
            />
          )}
          <ComboboxList>
            {loading ? (
              <div className="px-3 py-2 text-sm text-muted-foreground">
                Loading options...
              </div>
            ) : (
              <>
                {filteredOptions.map((option) => (
                  <ComboboxItem
                    key={String(option.value)}
                    disabled={option.disabled}
                    value={String(option.value)}
                  >
                    {option.label}
                  </ComboboxItem>
                ))}
                {filteredOptions.length === 0 && (
                  <ComboboxEmpty>{emptyText}</ComboboxEmpty>
                )}
              </>
            )}
          </ComboboxList>
        </ComboboxContent>
      </Combobox>
    </FieldShell>
  );
}

export { FieldSelect };
