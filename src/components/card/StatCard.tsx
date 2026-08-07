import { Card, CardContent } from "@/components/ui/card";
import type { LucideIcon } from "lucide-react";

export function StatCard({
  description,
  icon: Icon,
  title,
  value,
}: {
  description?: string;
  icon: LucideIcon;
  title: string;
  value: number;
}) {
  return (
    <Card className="border-border/60 bg-card/95 shadow-sm">
      <CardContent className="flex items-center gap-4 p-5">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-primary/15 bg-primary/10 text-primary">
          <Icon className="size-4" />
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-muted-foreground">
            {title}
          </p>
          <div className="mt-1 flex items-end gap-2">
            <span className="text-2xl font-semibold leading-none text-foreground">
              {value}
            </span>
            {description ? (
              <span className="pb-0.5 text-xs text-muted-foreground">
                {description}
              </span>
            ) : null}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
