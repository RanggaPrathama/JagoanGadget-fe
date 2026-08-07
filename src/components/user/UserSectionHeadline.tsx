import type { ReactNode } from "react";

interface UserSectionHeadlineProps {
  eyebrow?: string;
  children: ReactNode;
  body?: string;
  align?: "center" | "left";
}

export function UserSectionHeadline({
  eyebrow,
  children,
  body,
  align = "center",
}: UserSectionHeadlineProps) {
  return (
    <div
      className={`max-w-[760px] ${
        align === "center" ? "mx-auto text-center" : "text-left"
      }`}
    >
      {eyebrow && (
        <p className="text-[12px] font-semibold uppercase tracking-[0.28em] text-[var(--user-muted)]">
          {eyebrow}
        </p>
      )}
      <h2 className="mt-3 text-[clamp(2.4rem,5vw,4.75rem)] font-semibold leading-[0.96] tracking-[-0.08em] text-[var(--user-ink)]">
        {children}
      </h2>
      {body && (
        <p className="mt-5 text-[17px] leading-[1.55] tracking-[-0.02em] text-[var(--user-muted)]">
          {body}
        </p>
      )}
    </div>
  );
}
