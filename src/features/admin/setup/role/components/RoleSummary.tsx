import { CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

// Props for RoleSummary: whether the role is active, selected permission IDs, and selected module names.
type RoleSummaryProps = {
  isActive: boolean;
  selectedPermissionIds: string[];
  selectedModules: string[];
};

export const RoleSummary = ({
  isActive,
  selectedPermissionIds,
  selectedModules,
}: RoleSummaryProps) => {
  // Take only the first 3 modules for the preview list; show overflow count if there are more.
  const modulePreview = selectedModules.slice(0, 3);

  return (
    <Card className="admin-form-panel-soft p-0  h-full">
      <CardHeader className="pb-3 py-5 px-5 sm:px-7 sm:pt-6 sm:pb-4">
        <CardTitle className="text-base">Role Summary</CardTitle>
        <CardDescription>
          Ringkasan status dan permission terpilih.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        {/* Status badge row — shows active/inactive state */}
        <div className="flex items-center justify-between rounded-2xl border border-border/70 bg-background/70 px-3 py-2">
          <span className="text-sm text-muted-foreground">Status</span>
          <Badge variant={isActive ? "default" : "secondary"}>
            {isActive ? "Active" : "Inactive"}
          </Badge>
        </div>

        {/* Permission count + progress bar */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Total Selected</span>
            <span className="font-semibold text-primary">
              {selectedPermissionIds.length} Permissions
            </span>
          </div>
          <div className="h-1.5 overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all"
              style={{
                width: `${Math.min(100, selectedPermissionIds.length * 8)}%`,
              }}
            />
          </div>
        </div>

        <Separator />

        {/* Selected modules preview — shows up to 3 modules + overflow count */}
        <div className="flex flex-col gap-2">
          <span className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
            Selected Modules
          </span>
          {modulePreview.length > 0 ? (
            <div className="flex flex-col gap-1.5">
              {modulePreview.map((moduleName) => (
                <div
                  key={moduleName}
                  className="flex items-center gap-2 text-sm text-foreground"
                >
                  <CheckCircle2 className="size-4 text-primary" />
                  <span className="truncate">{moduleName}</span>
                </div>
              ))}
              {selectedModules.length > modulePreview.length ? (
                <span className="text-xs text-muted-foreground">
                  +{selectedModules.length - modulePreview.length} modul lain
                </span>
              ) : null}
            </div>
          ) : (
            <span className="text-sm text-muted-foreground">
              Belum ada permission dipilih.
            </span>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
