import { useId } from "react";

import { Switch } from "@/components/ui/switch";
import { cn } from "@/utils/cn";

import { FieldShell } from "./FieldShell";
import type { FieldBaseProps } from "./types";

type FieldSwitchProps = FieldBaseProps & {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  /** Label shown next to the switch (default: "Active") */
  switchLabel?: string;
  id?: string;
};

function FieldSwitch({
  className,
  checked,
  disabled = false,
  error,
  hint,
  id: idProp,
  label,
  onCheckedChange,
  required = false,
  switchLabel = "Active",
}: FieldSwitchProps) {
  const autoId = useId();
  const id = idProp ?? autoId;

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
      <div className="flex items-center gap-3">
        <Switch
          id={id}
          size="lg"
          checked={checked}
          onCheckedChange={onCheckedChange}
          disabled={disabled}
          aria-invalid={error ? true : undefined}
        />
        <label
          htmlFor={id}
          className={cn(
            "cursor-pointer text-sm leading-none",
            disabled && "cursor-not-allowed opacity-70",
          )}
        >
          {switchLabel}
        </label>
      </div>
    </FieldShell>
  );
}

export { FieldSwitch };
export type { FieldSwitchProps };
