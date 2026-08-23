import {
  FieldInput,
  FieldTextarea,
  FieldSwitch,
  getFieldError,
} from "@/components/field";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AdminFormActions, AdminFormHeader, FormSkeleton } from "@/components/admin";
import { formValidators, useWarehouseForm } from "../hooks/useWarehouseForm";

type WarehouseFormViewProps = {
  warehouseId?: string;
  mode?: "edit" | "readonly";
};

export function WarehouseFormView({
  warehouseId,
  mode = "edit",
}: WarehouseFormViewProps) {
  const readonly = mode === "readonly";
  const { form, isEditMode, isSubmitting, isLoadingDetail } = useWarehouseForm({
    warehouseId,
  });

  const title = readonly
    ? "Detail Warehouse"
    : isEditMode
      ? "Edit Warehouse"
      : "Create Warehouse";
  const description = readonly
    ? "Melihat detail warehouse dalam mode baca saja. Tidak ada perubahan yang dapat dilakukan."
    : isEditMode
      ? "Perbarui informasi gudang dengan tampilan yang lebih tenang dan konsisten."
      : "Tambahkan gudang baru dengan layout yang bersih, adaptif, dan selaras dengan tema.";

  if (isEditMode && isLoadingDetail) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-4 pb-10 lg:space-y-5 lg:pb-14">
      <form
        id="warehouse-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        {/* Header section: back button, badge, title, description, and edit/readonly indicators. */}
        <AdminFormHeader
          backTo="/admin/setup/warehouse"
          badge="Warehouse Setup"
          title={title}
          description={description}
          readonly={readonly}
          isEditMode={isEditMode}
        />

        {/* Form card: "Informasi Warehouse" section with code, name, address, and status fields. */}
        <Card className="admin-form-panel overflow-hidden p-0 gap-0">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
            <CardTitle className="text-base">Informasi Warehouse</CardTitle>
            <CardDescription className="text-sm">
              Isi data warehouse dengan lengkap. Kolom yang tidak diisi akan
              dikosongkan otomatis.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 px-5 py-5 sm:px-7 sm:py-7 mb-5 md:grid-cols-2">
            {/* Warehouse code — unique identifier (max 50). */}
            <form.Field
              name="code"
              validators={{ onBlur: formValidators.code, onSubmit: formValidators.code }}
            >
              {(field) => (
                <FieldInput
                  label="Code"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getFieldError(field.state.meta)}
                  placeholder="WH1"
                  disabled={readonly}
                />
              )}
            </form.Field>

            {/* Warehouse display name (max 150). */}
            <form.Field
              name="name"
              validators={{ onBlur: formValidators.name, onSubmit: formValidators.name }}
            >
              {(field) => (
                <FieldInput
                  label="Name"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getFieldError(field.state.meta)}
                  placeholder="Main Warehouse"
                  disabled={readonly}
                />
              )}
            </form.Field>

            <div className="md:col-span-2">
              {/* Address — optional, multi-line. */}
              <form.Field
                name="address"
                validators={{
                  onBlur: formValidators.address,
                  onSubmit: formValidators.address,
                }}
              >
                {(field) => (
                  <FieldTextarea
                    label="Address"
                    rows={4}
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getFieldError(field.state.meta)}
                    placeholder="Jl. Industri 1"
                    disabled={readonly}
                  />
                )}
              </form.Field>
            </div>

            {/* Status — whether the warehouse is active/selectable. */}
            <form.Field
              name="isActive"
              validators={{
                onBlur: formValidators.isActive,
                onSubmit: formValidators.isActive,
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
          </CardContent>
        </Card>

        <AdminFormActions
          formId="warehouse-form"
          readonly={readonly}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          backTo="/admin/setup/warehouse"
          hint="Pastikan code, nama, dan status warehouse sudah sesuai sebelum disimpan."
          basePermissionCode="setup.warehouse"
        />
      </form>
    </div>
  );
}
