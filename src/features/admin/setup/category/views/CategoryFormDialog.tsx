import { FieldInput } from "@/components/field/FieldInput";
import { FieldSelect } from "@/components/field/FieldSelect";
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

function getErrorMessage(error: string | { message?: string } | undefined) {
  if (!error) return undefined;
  return typeof error === "string" ? error : error.message;
}

// Modal dialog rendering the category create/edit form. Visible only when mode is create/edit.
export function CategoryFormDialog({ mode, categoryId, parentOptions, onClose, onSaved }: CategoryFormDialogProps) {
  const open = mode === "create" || mode === "edit";
  const {
    form,
    isEditMode,
    isSubmitting,
    isLoadingDetail,
    markSlugEdited,
  } = useCategoryForm({ categoryId: open ? categoryId ?? undefined : undefined });

  const title = isEditMode ? "Edit Kategori" : "Tambah Kategori";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingDetail ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Memuat data...</div>
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
            <form.Field name="name" validators={{ onChange: ({ value }) => (value.trim() ? undefined : "Nama kategori wajib diisi.") }}>
              {(field) => (
                <FieldInput
                  label="Nama Kategori"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getErrorMessage(field.state.meta.errors[0])}
                  placeholder="Smartphone"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>

            <form.Field name="slug" validators={{ onChange: ({ value }) => (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim()) ? undefined : "Slug tidak valid.") }}>
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
                  error={getErrorMessage(field.state.meta.errors[0])}
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
                  disabled={isSubmitting}
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
