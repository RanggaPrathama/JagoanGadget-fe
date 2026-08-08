import type { ComponentProps, ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useHasPermission } from "@/hooks/useHasPermission";

export interface ActionButtonProps
  extends Pick<ComponentProps<"button">, "type" | "form" | "aria-label" | "title"> {
  permission: string;
  children: ReactNode;
  icon?: ReactNode;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
  size?: "default" | "xs" | "sm" | "lg" | "icon" | "icon-xs" | "icon-sm" | "icon-lg";
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
  deniedTooltip?: string;
}

export function ActionButton({
  permission,
  children,
  icon,
  variant = "default",
  size = "default",
  onClick,
  disabled = false,
  className,
  deniedTooltip = "Anda tidak memiliki izin",
  ...rest
}: ActionButtonProps) {
  const { has, isLoading } = useHasPermission(permission);
  const denied = !has && !isLoading;

  // Disabled = external disable OR no permission OR still resolving /me.
  const buttonDisabled = disabled || denied || isLoading;

  const button = (
    <Button
      type={rest.type ?? "button"}
      variant={variant}
      size={size}
      onClick={onClick}
      disabled={buttonDisabled}
      aria-disabled={buttonDisabled}
      className={className}
      {...rest}
    >
      {icon ? icon : null}
      {children}
    </Button>
  );

  // Tooltip only on permission-denied; hidden while loading to avoid flashing.
  // Relies on an ancestor TooltipProvider (mounted in AdminLayout) — does not
  // mount its own, so it works inside the admin tree without redundant nesting.
  if (!denied) return button;

  return (
    <Tooltip>
      <TooltipTrigger asChild>{button}</TooltipTrigger>
      <TooltipContent>{deniedTooltip}</TooltipContent>
    </Tooltip>
  );
}
