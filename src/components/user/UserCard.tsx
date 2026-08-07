import type { ReactNode, HTMLAttributes } from "react";

interface UserCardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

export function UserCard({
  children,
  className = "",
  ...props
}: UserCardProps) {
  return (
    <div
      className={`rounded-[var(--radius-user-card)] bg-[var(--user-surface)] p-7 ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
