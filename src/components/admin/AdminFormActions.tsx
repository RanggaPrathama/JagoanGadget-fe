import { ActionButton } from "../button/ActionButton";
import { Link } from "@tanstack/react-router";
import { Save } from "lucide-react";

import { Button } from "@/components/ui/button";

type AdminFormActionsProps = {
  formId: string;
  readonly: boolean;
  isEditMode: boolean;
  isSubmitting: boolean;
  backTo: string;
  hint?: string;
  entityLabels?: {
    create?: string;
    update?: string;
  };
  disabled?: boolean;
  /**
   * Base permission code of the feature, e.g. "setup.role".
   * The save action is gated as `${basePermissionCode}.create` when creating,
   * `${basePermissionCode}.update` when editing (see permissionTemplates in
   * the menu service).
   */
  basePermissionCode: string;
};

export function AdminFormActions({
  formId,
  readonly,
  isEditMode,
  isSubmitting,
  backTo,
  hint,
  entityLabels,
  disabled,
  basePermissionCode,
}: AdminFormActionsProps) {
  const labels = { create: "Simpan", update: "Update", ...entityLabels };

  return (
    <div className="admin-form-actions sticky bottom-4 z-20 flex flex-col-reverse gap-4 rounded-[1.75rem] px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-5">
      {!readonly && (
        <>
          <div className="flex items-center justify-center sm:justify-start">
            <span className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5 text-[11px] font-medium text-muted-foreground">
              <span>Shortcut simpan</span>
              <kbd className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                Ctrl
              </kbd>
              <span>+</span>
              <kbd className="rounded-md border border-border/60 bg-background px-1.5 py-0.5 text-[11px] font-semibold text-foreground">
                S
              </kbd>
            </span>
          </div>

          {hint ? (
            <div className="text-sm text-muted-foreground">{hint}</div>
          ) : null}
        </>
      )}

      <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
        <Button variant="outline" asChild className="rounded-full">
          <Link to={backTo}>{readonly ? "Kembali" : "Batal"}</Link>
        </Button>
        {!readonly && (
          <ActionButton
            permission={`${basePermissionCode}.${isEditMode ? "update" : "create"}`}
            type="submit"
            form={formId}
            disabled={isSubmitting || disabled}
            className="rounded-full"
            icon={<Save className="size-4" />}
          >
            {isSubmitting
              ? "Menyimpan..."
              : isEditMode
                ? labels.update
                : labels.create}
          </ActionButton>
        )}
      </div>
    </div>
  );
}
