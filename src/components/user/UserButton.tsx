import type { ButtonHTMLAttributes, ReactNode } from "react";

type UserButtonVariant = "primary" | "secondary" | "ghost" | "link";

interface UserButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: UserButtonVariant;
  children: ReactNode;
}

const variantStyles: Record<UserButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-foreground text-background hover:opacity-90",
  ghost: "border border-border bg-card text-foreground hover:bg-muted",
  link: "bg-transparent px-0 text-primary hover:opacity-80",
};

export function UserButton({
  variant = "primary",
  className = "",
  children,
  ...props
}: UserButtonProps) {
  return (
    <button
      className={`inline-flex min-h-11 items-center justify-center rounded-full px-5 py-2.5 text-[15px] font-medium tracking-[-0.02em] transition-colors duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
