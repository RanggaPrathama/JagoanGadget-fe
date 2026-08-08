import { FieldInput } from "@/components/field/FieldInput";
import { FieldSelect } from "@/components/field/FieldSelect";
import { FieldTextarea } from "@/components/field/FieldTextarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AdminFormActions,
  AdminFormHeader,
  FormSkeleton,
} from "@/components/admin";
import { formValidators, usePermissionForm } from "../hooks/usePermissionForm";

type PermissionFormViewProps = {
  permissionId?: string;
  mode?: "edit" | "readonly";
};

export function PermissionFormView({
  permissionId,
  mode = "edit",
}: PermissionFormViewProps) {
  const readonly = mode === "readonly";
  const {
    form,
    isEditMode,
    isSubmitting,
    isLoadingDetail,
    menuOptions,
    menuOptionsLoading,
  } = usePermissionForm({ permissionId });

  const title = readonly
    ? "Detail Permission"
    : isEditMode
      ? "Edit Permission"
      : "Create Permission";
  const description = readonly
    ? "Melihat detail permission dalam mode baca saja. Tidak ada perubahan yang dapat dilakukan."
    : isEditMode
      ? "Perbarui informasi permission yang sudah ada."
      : "Tambahkan permission baru dengan kode unik (dot notation).";

  const getErrorMessage = (
    error: string | { message?: string } | undefined,
  ) => {
    if (!error) return undefined;
    return typeof error === "string" ? error : error.message;
  };

  if (isEditMode && isLoadingDetail) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-4 pb-10 lg:space-y-5 lg:pb-14">
      <form
        id="permission-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <AdminFormHeader
          backTo="/admin/setup/permission"
          badge="Permission Setup"
          title={title}
          description={description}
          readonly={readonly}
          isEditMode={isEditMode}
        />

        <Card className="admin-form-panel overflow-hidden p-0 gap-0">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
            <CardTitle className="text-base">Informasi Permission</CardTitle>
            <CardDescription className="text-sm">
              Isi data permission dengan lengkap.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 px-5 py-5 sm:px-7 sm:py-7 mb-5">
            <div className="grid gap-4 md:grid-cols-2">
              <form.Field
                name="menuId"
                validators={{ onChange: formValidators.menuId }}
              >
                {(field) => (
                  <FieldSelect
                    label="Menu"
                    required
                    value={field.state.value ?? ""}
                    onValueChange={(value) => field.handleChange(value)}
                    error={getErrorMessage(field.state.meta.errors[0])}
                    loading={menuOptionsLoading}
                    searchable
                    disabled={readonly}
                    placeholder="Pilih menu"
                    options={menuOptions}
                  />
                )}
              </form.Field>

              <form.Field
                name="name"
                validators={{ onChange: formValidators.name }}
              >
                {(field) => (
                  <FieldInput
                    label="Nama Permission"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getErrorMessage(field.state.meta.errors[0])}
                    placeholder="Create Menu"
                    disabled={readonly}
                  />
                )}
              </form.Field>

              <form.Field
                name="code"
                validators={{ onChange: formValidators.code }}
              >
                {(field) => (
                  <FieldInput
                    label="Code"
                    required
                    hint="Dihasilkan otomatis berdasarkan menu dan nama permission."
                    value={field.state.value}
                    error={getErrorMessage(field.state.meta.errors[0])}
                    placeholder={
                      menuOptionsLoading
                        ? "Menghasilkan code..."
                        : "Code akan terisi otomatis"
                    }
                    disabled
                  />
                )}
              </form.Field>

              <div className="md:col-span-2">
                <form.Field
                  name="description"
                  validators={{ onChange: formValidators.description }}
                >
                  {(field) => (
                    <FieldTextarea
                      label="Deskripsi"
                      rows={4}
                      value={field.state.value ?? ""}
                      onBlur={field.handleBlur}
                      onChange={(event) =>
                        field.handleChange(event.target.value)
                      }
                      error={getErrorMessage(field.state.meta.errors[0])}
                      placeholder="Ability to create new menus"
                      disabled={readonly}
                    />
                  )}
                </form.Field>
              </div>
            </div>
          </CardContent>
        </Card>

        <AdminFormActions
          formId="permission-form"
          readonly={readonly}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          backTo="/admin/setup/permission"
          hint="Pastikan nama dan kode permission sudah sesuai sebelum disimpan."
          basePermissionCode="setup.permission"
        />
      </form>
    </div>
  );
}
