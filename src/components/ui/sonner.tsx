import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import { HugeiconsIcon } from "@hugeicons/react";
import {
  CheckmarkCircle02Icon,
  InformationCircleIcon,
  Alert02Icon,
  MultiplicationSignCircleIcon,
  Loading03Icon,
} from "@hugeicons/core-free-icons";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      expand
      visibleToasts={4}
      offset={20}
      icons={{
        success: (
          <HugeiconsIcon
            icon={CheckmarkCircle02Icon}
            strokeWidth={2.1}
            className="size-4.5"
          />
        ),
        info: (
          <HugeiconsIcon
            icon={InformationCircleIcon}
            strokeWidth={2.1}
            className="size-4.5"
          />
        ),
        warning: (
          <HugeiconsIcon
            icon={Alert02Icon}
            strokeWidth={2.1}
            className="size-4.5"
          />
        ),
        error: (
          <HugeiconsIcon
            icon={MultiplicationSignCircleIcon}
            strokeWidth={2.1}
            className="size-4.5"
          />
        ),
        loading: (
          <HugeiconsIcon
            icon={Loading03Icon}
            strokeWidth={2.1}
            className="size-4.5 animate-spin"
          />
        ),
      }}
      style={
        {
          "--normal-bg": "color-mix(in oklab, var(--card) 94%, white)",
          "--normal-text": "var(--foreground)",
          "--normal-border": "color-mix(in oklab, var(--border) 82%, white)",
          "--border-radius": "1.25rem",
        } as React.CSSProperties
      }
      toastOptions={{
        duration: 4200,
        classNames: {
          toast: "cn-toast",
          content: "cn-toast-content",
          title: "cn-toast-title",
          description: "cn-toast-description",
          icon: "cn-toast-icon",
          success: "cn-toast-success",
          info: "cn-toast-info",
          warning: "cn-toast-warning",
          error: "cn-toast-error",
          loading: "cn-toast-loading",
          actionButton: "cn-toast-action",
          cancelButton: "cn-toast-cancel",
          closeButton: "cn-toast-close",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
