import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FadeIn } from "../motion";

type AdminFormHeaderProps = {
  backTo: string;
  badge: string;
  title: string;
  description: string;
  readonly: boolean;
  isEditMode: boolean;
};

export function AdminFormHeader({
  backTo,
  badge,
  title,
  description,
  readonly,
  isEditMode,
}: AdminFormHeaderProps) {
  return (
    <FadeIn
      y={-20}
      inView={true}
      once={true}
      delay={0.2}
      className="admin-form-shell p-3 sm:p-5 lg:p-6"
    >
      <div className="relative z-10 flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          asChild
          className="size-10 shrink-0 rounded-xl border-border/70 bg-background/80 shadow-none transition-transform hover:-translate-y-0.5 hover:bg-background"
        >
          <Link to={backTo}>
            <ArrowLeft className="size-4" />
          </Link>
        </Button>

        <div className="min-w-0 space-y-0.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className="admin-form-badge rounded-full px-3 py-0.5 text-[11px] font-semibold uppercase tracking-[0.22em]">
              {badge}
            </Badge>
            <span className="rounded-full border border-border/70 bg-background/80 px-3 py-0.5 text-[11px] font-medium text-muted-foreground">
              {readonly
                ? "View mode"
                : isEditMode
                  ? "Edit mode"
                  : "Create mode"}
            </span>
          </div>

          <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
            {title}
          </h1>
          <p className="max-w-2xl text-sm text-muted-foreground">
            {description}
          </p>
        </div>
      </div>
    </FadeIn>
  );
}
