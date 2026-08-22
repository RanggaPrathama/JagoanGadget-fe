import { FieldInput, FieldSelect, getFieldError } from "@/components/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useCategoryForm } from "../hooks/useCategoryForm";
import type { CategoryDialogMode } from "../types";
type CategoryFormDialogProps = {
  mode: CategoryDialogMode;
  categoryId: string | null;
  parentOptions: { label: string; value: string }[];
  onClose: () => void;
  onSaved?: () => void;
};

// Modal dialog rendering the category create/edit form. Visible only when mode is create/edit.
export function CategoryFormDialog({
  mode,
  categoryId,
  parentOptions,
  onClose,
  onSaved,
}: CategoryFormDialogProps) {
  const readonly = mode === "readonly";
  const open = mode === "create" || mode === "edit" || mode === "readonly";
  const { form, isEditMode, isSubmitting, isLoadingDetail, markSlugEdited } =
    useCategoryForm({
      categoryId: open ? (categoryId ?? undefined) : undefined,
      open,
    });

  const title = readonly
    ? "Detail Kategori"
    : mode === "create"
      ? "Tambah Kategori"
      : "Edit Kategori";

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
            id="category-form"
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
                onBlur: ({ value }) =>
                  value.trim() ? undefined : "Nama kategori wajib diisi.",
                onSubmit: ({ value }) =>
                  value.trim() ? undefined : "Nama kategori wajib diisi.",
              }}
            >
              {(field) => (
                <FieldInput
                  label="Nama Kategori"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getFieldError(field.state.meta)}
                  placeholder="Input Category Name"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>

            <form.Field
              name="slug"
              validators={{
                onBlur: ({ value }) =>
                  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())
                    ? undefined
                    : "Slug tidak valid.",
                onSubmit: ({ value }) =>
                  /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim())
                    ? undefined
                    : "Slug tidak valid.",
              }}
            >
              {(field) => (
                <FieldInput
                  label="Slug"
                  hint="Dihasilkan otomatis dari nama. Bisa diubah manual."
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                    markSlugEdited();
                  }}
                  error={getFieldError(field.state.meta)}
                  placeholder="smartphone"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>

            <form.Field name="parentId">
              {(field) => (
                <FieldSelect
                  label="Parent Kategori"
                  value={field.state.value ?? ""}
                  onValueChange={(value) => field.handleChange(value)}
                  options={parentOptions}
                  placeholder="Pilih parent (opsional)"
                  disabled={isSubmitting || readonly}
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
            form="category-form"
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
