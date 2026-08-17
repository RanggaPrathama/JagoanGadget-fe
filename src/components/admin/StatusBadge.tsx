import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

type StatusValue = string | boolean | null | undefined;

export interface StatusBadgeProps {
  status: StatusValue;
  className?: string;
}

const STATUS_STYLE_MAP: Record<string, string> = {
  active:
    "border-emerald-500/20 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  inactive:
    "border-slate-500/20 bg-slate-500/12 text-slate-600 dark:text-slate-300",
  draft:
    "border-amber-500/20 bg-amber-500/12 text-amber-700 dark:text-amber-400",
  approved:
    "border-emerald-500/20 bg-emerald-500/12 text-emerald-600 dark:text-emerald-400",
  pending: "border-sky-500/20 bg-sky-500/12 text-sky-600 dark:text-sky-400",
  reject: "border-rose-500/20 bg-rose-500/12 text-rose-600 dark:text-rose-400",
  rejected:
    "border-rose-500/20 bg-rose-500/12 text-rose-600 dark:text-rose-400",
  revise:
    "border-violet-500/20 bg-violet-500/12 text-violet-600 dark:text-violet-400",
  revision:
    "border-violet-500/20 bg-violet-500/12 text-violet-600 dark:text-violet-400",
  archived: "border-muted-foreground/20 bg-muted text-muted-foreground",
};

function normalizeStatus(status: StatusValue) {
  if (typeof status === "boolean") return status ? "active" : "inactive";
  return String(status ?? "")
    .trim()
    .toLowerCase();
}

function formatStatus(status: StatusValue) {
  if (typeof status === "boolean") return status ? "Active" : "Inactive";
  const value = String(status ?? "").trim();
  if (!value) return "-";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const key = normalizeStatus(status);

  return (
    <Badge
      variant="outline"
      className={cn(
        "inline-flex min-w-0 rounded-full border px-2.5 py-1 text-xs font-medium capitalize leading-none",
        STATUS_STYLE_MAP[key] ?? "border-border/70 bg-muted text-foreground",
        className,
      )}
    >
      {formatStatus(status)}
    </Badge>
  );
}
