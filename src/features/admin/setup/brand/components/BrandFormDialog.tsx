import { FieldInput, FieldUpload, getFieldError } from "@/components/field";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@tanstack/react-store";
import { useBrandForm } from "../hooks/useBrandForm";
import type { BrandDialogMode } from "../types";

type BrandFormDialogProps = {
  mode: BrandDialogMode;
  brandId: string | null;
  onClose: () => void;
  onSaved?: () => void;
};

// Modal dialog rendering the brand create/edit form. Visible only when mode is create/edit.
export function BrandFormDialog({ mode, brandId, onClose, onSaved }: BrandFormDialogProps) {
  const open = mode === "create" || mode === "edit";
  const {
    form,
    isEditMode,
    isSubmitting,
    isLoadingDetail,
  } = useBrandForm({ brandId: open ? brandId ?? undefined : undefined, open });

  const title = isEditMode ? "Edit Brand" : "Tambah Brand";

  const logoValue = useStore(form.store, (state) => state.values.logoUrl);
  void logoValue;

  function handleOpenChange(next: boolean) {
    if (!next) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingDetail ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Memuat data...</div>
        ) : (
          <form
            id="brand-form"
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
                  value.trim() ? undefined : "Nama brand wajib diisi.",
                onSubmit: ({ value }) =>
                  value.trim() ? undefined : "Nama brand wajib diisi.",
              }}
            >
              {(field) => (
                <FieldInput
                  label="Nama Brand"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getFieldError(field.state.meta)}
                  placeholder="Lenovo"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>

            <form.Field name="logoUrl">
              {(field) => (
                <FieldUpload
                  label="Logo Brand"
                  kind="image"
                  value={field.state.value}
                  previewUrl={field.state.value ?? null}
                  onChange={(tempKey) => field.handleChange(tempKey)}
                  disabled={isSubmitting}
                  hint="Unggah logo brand (format gambar)."
                />
              )}
            </form.Field>

            {/* onSubmit fires the mutation; signal success up so the parent can close the dialog. */}
            <form.Subscribe selector={(state) => state.values}>
              {() => null}
            </form.Subscribe>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="brand-form"
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
