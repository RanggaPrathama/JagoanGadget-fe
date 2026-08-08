import { Eye, PencilLine, Trash2 } from "lucide-react";

import { ActionButton } from "./ActionButton";
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
  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {onView ? (
        <ActionButton
          permission={`${basePermissionCode}.view`}
          variant="outline"
          size={iconOnly ? "icon-sm" : "sm"}
          onClick={onView}
          disabled={disabled}
          aria-label="Lihat"
          title="Lihat"
          icon={<Eye className="h-4 w-4" />}
          className={cn(
            "border-border/70",
            iconOnly
              ? "rounded-lg bg-primary text-primary-foreground   hover:bg-primary/10"
              : "h-9 rounded-full px-3 text-xs gap-2",
          )}
        >
          {!iconOnly ? <span>Lihat</span> : null}
        </ActionButton>
      ) : null}

      {onEdit ? (
        <ActionButton
          permission={`${basePermissionCode}.update`}
          variant="outline"
          size={iconOnly ? "icon-sm" : "sm"}
          onClick={onEdit}
          disabled={disabled}
          aria-label="Edit"
          title="Edit"
          icon={<PencilLine className="h-4 w-4" />}
          className={cn(
            "border-border/70",
            iconOnly ? "rounded-lg " : "h-9 rounded-full px-3 text-xs gap-2",
          )}
        >
          {!iconOnly ? <span>Edit</span> : null}
        </ActionButton>
      ) : null}

      {onDelete ? (
        <ActionButton
          permission={`${basePermissionCode}.delete`}
          variant="destructive"
          size={iconOnly ? "icon-sm" : "sm"}
          onClick={onDelete}
          disabled={disabled}
          aria-label="Hapus"
          title="Hapus"
          icon={<Trash2 className="h-4 w-4" />}
          className={cn(
            iconOnly ? "rounded-lg" : "h-9 rounded-full px-3 text-xs gap-2",
          )}
        >
          {!iconOnly ? <span>Hapus</span> : null}
        </ActionButton>
      ) : null}
    </div>
  );
}
