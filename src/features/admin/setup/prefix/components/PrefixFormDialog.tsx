import type { PrefixDialogMode } from "../types";
import { usePrefixForm } from "../hooks/usePrefixForm";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FieldInput, FieldSwitch, FieldShell, getFieldError } from "@/components/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
type PrefixFormDialogProps = {
  mode: PrefixDialogMode;
  prefixId: string | null;
  onClose: () => void;
  onSaved?: () => void;
};

export function PrefixFormDialog({
  mode,
  prefixId,
  onClose,
  onSaved,
}: PrefixFormDialogProps) {
  const readonly = mode === "readonly";
  const open = mode === "create" || mode === "edit";
  const title = readonly
    ? "Detail Prefix"
    : mode === "create"
      ? "Tambah Prefix"
      : "Edit Prefix";

  const { form, isEditMode, isSubmitting, isLoadingDetail, formValidators } =
    usePrefixForm({
      prefixId: open ? (prefixId ?? undefined) : undefined,
      open,
    });
  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingDetail ? (
          <div className="py-8 text-center text-sm text-muted-foreground">
            Memuat data...
          </div>
        ) : (
          <form
            id="prefix-form"
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.Field
              name="name"
              validators={{
                onBlur: formValidators.name,
                onSubmit: formValidators.name,
              }}
            >
              {(field) => (
                <FieldInput
                  label="Nama Prefix"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getFieldError(field.state.meta)}
                  placeholder="Input Prefix Name"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>

            <form.Field
              name="value"
              validators={{
                onBlur: ({ value }) =>
                  value.trim() ? undefined : "Value prefix wajib diisi.",
                onSubmit: ({ value }) =>
                  value.trim() ? undefined : "Value prefix wajib diisi.",
              }}
            >
              {(field) => (
                <FieldInput
                  label="Value Prefix"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getFieldError(field.state.meta)}
                  placeholder="Input Prefix Value"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>

            <form.Field
              name="type"
              validators={{ onBlur: formValidators.type, onSubmit: formValidators.type }}
            >
              {(field) => (
                <FieldShell
                  label="Type"
                  required
                  error={getFieldError(field.state.meta)}
                >
                  <Select
                    value={field.state.value}
                    onValueChange={(value) =>
                      field.handleChange(
                        value as
                          | "sequence"
                          | "day"
                          | "month"
                          | "year"
                          | "text",
                      )
                    }
                    disabled={readonly || isSubmitting}
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-invalid={!!getFieldError(field.state.meta)}
                    >
                      <SelectValue placeholder="Pilih Tipe Prefix" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sequence">Sequence</SelectItem>
                      <SelectItem value="day">Day</SelectItem>
                      <SelectItem value="month">Month</SelectItem>
                      <SelectItem value="year">Year</SelectItem>
                      <SelectItem value="text">Text</SelectItem>
                    </SelectContent>
                  </Select>
                </FieldShell>
              )}
            </form.Field>

            {/* Status — whether the prefix is active. */}
            <form.Field
              name="isActive"
              validators={{
                onBlur: ({ value }) =>
                  value ? undefined : "Status prefix wajib dipilih.",
                onSubmit: ({ value }) =>
                  value ? undefined : "Status prefix wajib dipilih.",
              }}
            >
              {(field) => (
                <FieldSwitch
                  label="Status"
                  checked={field.state.value ?? false}
                  onCheckedChange={(value) => field.handleChange(value)}
                  error={getFieldError(field.state.meta)}
                  disabled={readonly}
                  switchLabel={field.state.value ? "Aktif" : "Non-Aktif"}
                />
              )}
            </form.Field>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="prefix-form"
            disabled={isSubmitting}
            onClick={() => {
              void form.handleSubmit().then(() => onSaved?.());
            }}
          >
            {isSubmitting ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
