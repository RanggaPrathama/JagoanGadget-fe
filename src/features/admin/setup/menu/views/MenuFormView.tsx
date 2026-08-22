import { FieldInput, FieldSelect, FieldSelectIcons, FieldSwitch, getFieldError } from "@/components/field";
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
import { useStore } from "@tanstack/react-store";
import { formValidators, useMenuForm } from "../hooks/useMenuForm";

type MenuFormViewProps = {
  menuId?: string;
  mode?: "edit" | "readonly";
};

export function MenuFormView({ menuId, mode = "edit" }: MenuFormViewProps) {
  const readonly = mode === "readonly";
  const {
    form,
    isEditMode,
    isGeneratingCode,
    isSubmitting,
    isLoadingDetail,
    parentOptions,
    parentOptionsLoading,
  } = useMenuForm({ menuId });

  const typeValue = useStore(form.store, (state) => state.values.type);

  const title = readonly
    ? "Detail Menu"
    : isEditMode
      ? "Edit Menu"
      : "Create Menu";
  const description = readonly
    ? "Melihat detail menu dalam mode baca saja. Tidak ada perubahan yang dapat dilakukan."
    : isEditMode
      ? "Perbarui struktur navigasi admin dengan tampilan yang lebih tenang dan konsisten."
      : "Tambahkan menu baru dengan layout yang bersih, adaptif, dan selaras dengan tema.";

  if (isEditMode && isLoadingDetail) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-4 pb-10 lg:space-y-5 lg:pb-14">
      <form
        id="menu-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        {/* Header section: back button, badge, title, description, and edit/readonly indicators. */}
        <AdminFormHeader
          backTo="/admin/setup/menu"
          badge="Menu Setup"
          title={title}
          description={description}
          readonly={readonly}
          isEditMode={isEditMode}
        />

        {/* Form card: "Informasi Menu" section with type, parent, name, icon, code, sortOrder, route, and status fields. */}
        <Card className="admin-form-panel overflow-hidden p-0 gap-0">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
            <CardTitle className="text-base">Informasi Menu</CardTitle>
            <CardDescription className="text-sm">
              Isi data menu dengan lengkap. Kolom yang tidak diisi akan
              dikosongkan otomatis.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 px-5 py-5 sm:px-7 sm:py-7 mb-5 md:grid-cols-3">
            {/* Menu type: "menu" is a leaf, "group" is a parent container (clears parentId/route). */}
            <form.Field
              name="type"
              validators={{ onBlur: formValidators.type, onSubmit: formValidators.type }}
            >
              {(field) => (
                <FieldSelect
                  placeholder="Pilih type menu"
                  emptyText="Tidak ada type menu"
                  label="Type"
                  required
                  value={field.state.value ?? ""}
                  onValueChange={(value) => {
                    const newType = (value || "menu") as "menu" | "group";
                    field.handleChange(newType);
                    if (newType === "group") {
                      form.setFieldValue("parentId", "");
                      form.setFieldValue("route", "");
                      void form.validateField("parentId", "change");
                    }
                  }}
                  error={getFieldError(field.state.meta)}
                  disabled={readonly}
                  options={[
                    { label: "Menu", value: "menu" },
                    { label: "Group", value: "group" },
                  ]}
                />
              )}
            </form.Field>

            {/* Parent menu: required for "menu" type; disabled for "group" type. */}
            <form.Field
              name="parentId"
              // validators={{
              //   onChange: ({ value }) => {
              //     const currentType = form.getFieldValue("type");
              //     if (currentType === "menu" && (!value || value === "")) {
              //       return "Parent menu wajib diisi untuk tipe menu.";
              //     }
              //     return undefined;
              //   },
              // }}
            >
              {(field) => {
                const isGroup = typeValue === "group";
                return (
                  <FieldSelect
                    label="Parent Menu"
                    value={field.state.value ?? ""}
                    onValueChange={(value) => field.handleChange(value)}
                    error={getFieldError(field.state.meta)}
                    loading={parentOptionsLoading}
                    searchable
                    disabled={readonly || isGroup}
                    placeholder={
                      isGroup
                        ? "Parent tidak tersedia untuk tipe group"
                        : "Pilih parent menu"
                    }
                    options={parentOptions}
                  />
                );
              }}
            </form.Field>

            {/* Menu display name — shown in the sidebar and used for code generation. */}
            <form.Field
              name="name"
              validators={{ onBlur: formValidators.name, onSubmit: formValidators.name }}
            >
              {(field) => (
                <FieldInput
                  label="Nama Menu"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getFieldError(field.state.meta)}
                  placeholder="Dashboard"
                  disabled={readonly}
                />
              )}
            </form.Field>

            {/* Icon name (hugeicons) shown next to the menu in the sidebar. */}
            <form.Field
              name="iconName"
              validators={{ onBlur: formValidators.iconName, onSubmit: formValidators.iconName }}
            >
              {(field) => (
                <FieldSelectIcons
                  label="Icon Name"
                  value={field.state.value ?? ""}
                  onValueChange={(value) => field.handleChange(value)}
                  error={getFieldError(field.state.meta)}
                  placeholder="LayoutDashboard"
                  disabled={readonly}
                />
              )}
            </form.Field>

            {/* Menu code — auto-generated from name + parent, but editable. */}
            <form.Field name="code">
              {(field) => (
                <FieldInput
                  label="Code"
                  hint="Dihasilkan otomatis berdasarkan nama dan parent. Bisa diubah manual."
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getFieldError(field.state.meta)}
                  placeholder={
                    isGeneratingCode
                      ? "Menghasilkan code..."
                      : "Code akan terisi otomatis"
                  }
                  disabled={readonly}
                />
              )}
            </form.Field>

            {/* Sort order — controls menu position within its sibling group. */}
            <form.Field
              name="sortOrder"
              validators={{ onBlur: formValidators.sortOrder, onSubmit: formValidators.sortOrder }}
            >
              {(field) => (
                <FieldInput
                  label="Sort Order"
                  type="number"
                  min={0}
                  value={String(field.state.value)}
                  onBlur={field.handleBlur}
                  onChange={(event) =>
                    field.handleChange(Number(event.target.value || 0))
                  }
                  error={getFieldError(field.state.meta)}
                  disabled={readonly}
                />
              )}
            </form.Field>

            <div className="md:col-span-3">
              {/* Route — derived from code for "menu" type; empty for "group" type. */}
              <form.Field
                name="route"
                validators={{ onBlur: formValidators.route, onSubmit: formValidators.route }}
              >
                {(field) => (
                  <FieldInput
                    label="Route"
                    hint={
                      typeValue === "group"
                        ? "Tipe group tidak memerlukan route."
                        : "Dihasilkan otomatis berdasarkan code. Bisa diubah manual."
                    }
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getFieldError(field.state.meta)}
                    placeholder={
                      typeValue === "group"
                        ? "Tipe group tidak memiliki route"
                        : "/admin/dashboard"
                    }
                    disabled={readonly || typeValue === "group"}
                  />
                )}
              </form.Field>
            </div>

            {/* Status — whether the menu is visible/active in the sidebar. */}
            <form.Field
              name="isActive"
              validators={{ onBlur: formValidators.isActive, onSubmit: formValidators.isActive }}
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
          formId="menu-form"
          readonly={readonly}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          backTo="/admin/setup/menu"
          hint="Pastikan nama menu, code, route, dan status sudah sesuai sebelum disimpan."
          disabled={parentOptionsLoading}
          basePermissionCode="setup.menu"
        />
      </form>
    </div>
  );
}
