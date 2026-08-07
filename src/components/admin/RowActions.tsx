import { Eye, PencilLine, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useHasPermission } from "@/hooks/useHasPermission";
import { cn } from "@/lib/utils";

export interface RowActionsProps {
  /**
   * Base permission code of the feature, e.g. "setup.role".
   * Actions are gated as `${baseCode}.view` / `.create` / `.update` / `.delete`
   * (see permissionTemplates in the menu service).
   */
  basePermissionCode: string;
  onView?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  disabled?: boolean;
  className?: string;
  iconOnly?: boolean;
}

export function RowActions({
  basePermissionCode,
  onView,
  onEdit,
  onDelete,
  disabled = false,
  className,
  iconOnly = false,
}: RowActionsProps) {
  const canView = useHasPermission(`${basePermissionCode}.view`);
  const canUpdate = useHasPermission(`${basePermissionCode}.update`);
  const canDelete = useHasPermission(`${basePermissionCode}.delete`);

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {onView && canView.has ? (
        <Button
          type="button"
          variant="outline"
          size={iconOnly ? "icon-sm" : "sm"}
          className={cn(
            "border-border/70",
            iconOnly
              ? "rounded-lg bg-primary text-primary-foreground   hover:bg-primary/10"
              : "h-9 rounded-full px-3 text-xs gap-2",
          )}
          onClick={onView}
          disabled={disabled}
          aria-label="Lihat"
          title="Lihat"
        >
          <Eye className="h-4 w-4" />
          {!iconOnly ? <span>Lihat</span> : null}
        </Button>
      ) : null}
      {onEdit && canUpdate.has ? (
        <Button
          type="button"
          variant="outline"
          size={iconOnly ? "icon-sm" : "sm"}
          className={cn(
            "border-border/70",
            iconOnly ? "rounded-lg " : "h-9 rounded-full px-3 text-xs gap-2",
          )}
          onClick={onEdit}
          disabled={disabled}
          aria-label="Edit"
          title="Edit"
        >
          <PencilLine className="h-4 w-4" />
          {!iconOnly ? <span>Edit</span> : null}
        </Button>
      ) : null}
      {onDelete && canDelete.has ? (
        <Button
          type="button"
          variant="destructive"
          size={iconOnly ? "icon-sm" : "sm"}
          className={cn(
            iconOnly ? "rounded-lg" : "h-9 rounded-full px-3 text-xs gap-2",
          )}
          onClick={onDelete}
          disabled={disabled}
          aria-label="Hapus"
          title="Hapus"
        >
          <Trash2 className="h-4 w-4" />
          {!iconOnly ? <span>Hapus</span> : null}
        </Button>
      ) : null}
    </div>
  );
}
