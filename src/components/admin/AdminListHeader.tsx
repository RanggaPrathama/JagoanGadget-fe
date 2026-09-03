import { FadeIn } from "../motion";

export interface AdminListHeaderProps {
  title: string;
  description: string;
}

export function AdminListHeader({ title, description }: AdminListHeaderProps) {
  return (
    <FadeIn className="space-y-2" y={-20} delay={0.2}>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
    </FadeIn>
  );
}
