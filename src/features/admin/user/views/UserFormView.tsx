import { ShieldCheck } from "lucide-react";
import { FieldInput } from "@/components/field/FieldInput";
import { FieldSwitch } from "@/components/field/FieldSwitch";
import { FieldUpload } from "@/components/field/FieldUpload";
import { ButtonSelect } from "@/components/button/ButtonSelect";
import { Badge } from "@/components/ui/badge";
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
  FormTable,
} from "@/components/admin";
import { formValidators, useUserForm } from "../hooks/useUserForm";
import { getRoles } from "../../setup/role/service/role.service";
import type { RoleItem } from "../../setup/role/service/role.service";

type UserFormViewProps = {
  userId?: string;
  mode?: "edit" | "readonly";
};

export function UserFormView({ userId, mode = "edit" }: UserFormViewProps) {
  const readonly = mode === "readonly";
  const {
    form,
    isEditMode,
    isSubmitting,
    isLoadingDetail,
    selectedRoleItems,
    setSelectedRoleItems,
    existingAvatarUrl,
  } = useUserForm({
    userId,
  });

  const title = readonly
    ? "Detail User"
    : isEditMode
      ? "Edit User"
      : "Create User";
  const description = readonly
    ? "Melihat detail user dalam mode baca saja. Tidak ada perubahan yang dapat dilakukan."
    : isEditMode
      ? "Perbarui data user dengan tampilan yang lebih tenang dan konsisten."
      : "Tambahkan user baru dengan layout yang bersih, adaptif, dan selaras dengan tema.";

  const getErrorMessage = (
    error: string | { message?: string } | undefined,
  ) => {
    if (!error) {
      return undefined;
    }

    return typeof error === "string" ? error : error.message;
  };

  if (isEditMode && isLoadingDetail) {
    return <FormSkeleton />;
  }

  return (
    <div className="space-y-4 pb-10 lg:space-y-5 lg:pb-14">
      <form
        id="user-form"
        className="space-y-4"
        onSubmit={(event) => {
          event.preventDefault();
          event.stopPropagation();
          void form.handleSubmit();
        }}
      >
        <AdminFormHeader
          backTo="/admin/user"
          badge="User Setup"
          title={title}
          description={description}
          readonly={readonly}
          isEditMode={isEditMode}
        />

        <Card className="admin-form-panel overflow-hidden p-0 gap-0">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
            <CardTitle className="text-base">Informasi User</CardTitle>
            <CardDescription className="text-sm">
              Isi data user dengan lengkap. Kolom yang tidak diisi akan
              dikosongkan otomatis.
            </CardDescription>
          </CardHeader>

          <CardContent className="grid gap-4 px-5 py-5 sm:px-7 sm:py-7 mb-5 ">
            <div className="grid gap-4 md:grid-cols-3">
              <form.Field
                name="name"
                validators={{ onChange: formValidators.name }}
              >
                {(field) => (
                  <FieldInput
                    label="Nama Lengkap"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getErrorMessage(field.state.meta.errors[0])}
                    placeholder="Masukkan nama"
                    disabled={readonly}
                  />
                )}
              </form.Field>

              <form.Field
                name="email"
                validators={{ onChange: formValidators.email }}
              >
                {(field) => (
                  <FieldInput
                    label="Email"
                    required
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getErrorMessage(field.state.meta.errors[0])}
                    placeholder="email@example.com"
                    disabled={readonly}
                  />
                )}
              </form.Field>

              <form.Field
                name="phoneNumber"
                validators={{ onChange: formValidators.phoneNumber }}
              >
                {(field) => (
                  <FieldInput
                    label="Nomor Telepon"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getErrorMessage(field.state.meta.errors[0])}
                    placeholder="Contoh: 081234567890"
                    disabled={readonly}
                  />
                )}
              </form.Field>

              <form.Field
                name="avatarTempKey"
                validators={{ onChange: formValidators.avatarTempKey }}
              >
                {(field) => (
                  <FieldUpload
                    label="Foto Profil"
                    kind="image"
                    value={field.state.value ?? null}
                    previewUrl={existingAvatarUrl}
                    onChange={(url) => field.handleChange(url)}
                    disabled={readonly}
                    hint="Format JPG, PNG, GIF, WEBP, atau SVG. Maksimal 2MB."
                  />
                )}
              </form.Field>

              <div className="space-y-4">
                <form.Field
                  name="isActive"
                  validators={{ onChange: formValidators.isActive }}
                >
                  {(field) => (
                    <FieldSwitch
                      label="Status"
                      checked={field.state.value ?? false}
                      onCheckedChange={(value) => field.handleChange(value)}
                      error={getErrorMessage(field.state.meta.errors[0])}
                      disabled={readonly}
                      switchLabel={field.state.value ? "Aktif" : "Non-Aktif"}
                    />
                  )}
                </form.Field>

                {/* <form.Field
                name="isSuperadmin"
                validators={{ onChange: formValidators.isSuperadmin }}
              >
                {(field) => (
                  <FieldSwitch
                    label="Superadmin"
                    checked={field.state.value ?? false}
                    onCheckedChange={(value) => field.handleChange(value)}
                    error={getErrorMessage(field.state.meta.errors[0])}
                    disabled={readonly}
                    switchLabel={
                      field.state.value ? "Superadmin" : "User Biasa"
                    }
                  />
                )}
              </form.Field> */}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="admin-form-panel overflow-hidden p-0 gap-0">
          <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
            <div className="flex justify-between items-center gap-4">
              <div className="flex flex-col gap-1">
                <CardTitle className="text-base">Role Assignment</CardTitle>
                <CardDescription className="text-sm">
                  {readonly
                    ? "Role yang ditetapkan untuk user ini."
                    : "Pilih role yang ingin diberikan kepada user ini."}
                </CardDescription>
              </div>
              {!readonly && (
                <form.Field name="roleIds">
                  {(field) => (
                    <ButtonSelect<RoleItem>
                      columns={[
                        { header: "Nama", accessorKey: "name" },
                        { header: "Code", accessorKey: "code" },
                      ]}
                      getRowId={(row) => row.id}
                      queryFn={({ search, page, limit }) =>
                        getRoles({ search, page, limit })
                      }
                      queryKey={["admin", "roles"]}
                      value={field.state.value ?? []}
                      onChange={(ids, items) => {
                        field.handleChange(ids);
                        setSelectedRoleItems(items);
                      }}
                      triggerText="Pilih Role"
                      title="Pilih Role untuk User"
                      placeholder="Cari role..."
                    />
                  )}
                </form.Field>
              )}
            </div>
          </CardHeader>

          <CardContent className="px-5 py-5 sm:px-7 sm:py-7">
            <FormTable<RoleItem>
              columns={[
                {
                  header: "No",
                  cell: (_, idx) => idx + 1,
                  className: "w-12 text-muted-foreground",
                },
                {
                  header: "Nama Role",
                  accessorKey: "name",
                  className: "font-medium",
                },
                {
                  header: "Code",
                  cell: (row) => (
                    <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                      {row.code}
                    </code>
                  ),
                },
                {
                  header: "Status",
                  cell: (row) =>
                    row.isActive !== false ? (
                      <Badge
                        variant="default"
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      >
                        Aktif
                      </Badge>
                    ) : (
                      <Badge
                        variant="secondary"
                        className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                      >
                        Non-Aktif
                      </Badge>
                    ),
                },
              ]}
              data={selectedRoleItems}
              keyExtractor={(row) => row.id}
              emptyMessage="User ini belum memiliki role yang ditetapkan. Silakan pilih role dari daftar di atas."
              emptyIcon={<ShieldCheck className="size-8" />}
              onDelete={
                !readonly
                  ? (row) => {
                      const next = selectedRoleItems.filter(
                        (r) => r.id !== row.id,
                      );
                      setSelectedRoleItems(next);
                      form.setFieldValue(
                        "roleIds",
                        next.map((r) => r.id),
                      );
                    }
                  : undefined
              }
            />
          </CardContent>
        </Card>

        <AdminFormActions
          formId="user-form"
          readonly={readonly}
          isEditMode={isEditMode}
          isSubmitting={isSubmitting}
          backTo="/admin/user"
          hint="Pastikan nama, email, dan status sudah sesuai sebelum disimpan."
          entityLabels={{ create: "Simpan User", update: "Update User" }}
          basePermissionCode="user"
          onSubmit={() => void form.handleSubmit()}
        />
      </form>
    </div>
  );
}
