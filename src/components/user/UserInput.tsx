import type { InputHTMLAttributes } from "react";

interface UserInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function UserInput({
  label,
  className = "",
  id,
  ...props
}: UserInputProps) {
  const inputId = id ?? props.name;

  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label
          htmlFor={inputId}
          className="text-[12px] font-semibold uppercase tracking-[0.18em] text-[var(--user-muted)]"
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        className={`h-13 rounded-[var(--radius-user-input)] border border-[var(--user-soft)] bg-[var(--user-canvas)] px-4 text-[15px] text-[var(--user-ink)] outline-none transition-colors duration-200 placeholder:text-[var(--user-muted)] focus:border-[var(--user-accent)] focus:bg-white ${className}`}
        {...props}
      />
    </div>
  );
}
