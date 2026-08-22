import { useState } from "react";
import { Loader2, Save, Pencil, ArrowLeft } from "lucide-react";
import { useMe } from "@/hooks/useMe";
import { FieldInput, FieldUpload, getFieldError } from "@/components/field";
import { FormSkeleton } from "@/components/admin";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getRoleLabel } from "../lib/role";
import { formValidators, useAccountForm } from "../hooks/useAccountForm";

export function AccountView() {
  const { data: me } = useMe();
  const [isEditing, setIsEditing] = useState(false);
  const { form, isSubmitting, isLoading, avatarPreviewUrl } = useAccountForm({
    onSuccess: () => setIsEditing(false),
  });

  if (isLoading || !me) {
    return <FormSkeleton />;
  }

  const roleLabel = getRoleLabel(me);

  const handleCancel = () => {
    // Re-initialize values from current user data to clear unsaved inputs
    form.setFieldValue("name", me.user.name ?? "");
    form.setFieldValue("email", me.user.email ?? "");
    form.setFieldValue("phoneNumber", me.user.phoneNumber ?? "");
    setIsEditing(false);
  };

  return (
    <div className="space-y-6 pb-10 lg:space-y-7 lg:pb-14">
      {/* Page Title */}
      <div className="flex items-center gap-3">
        {isEditing && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCancel}
            className="rounded-full h-8 w-8 hover:bg-muted text-muted-foreground cursor-pointer"
          >
            <ArrowLeft className="size-4" />
          </Button>
        )}
        <h2 className="text-xl font-bold tracking-tight text-foreground">
          {isEditing ? "Ubah Akun" : "Akun"}
        </h2>
      </div>

      {!isEditing ? (
        /* Pusat Akun Card - Read Only Mode */
        <Card className="overflow-hidden border border-border/10 shadow-sm rounded-2xl">
          <CardContent className="p-5 sm:p-6 space-y-4">
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-1.5">
                <span className="text-blue-600 dark:text-blue-400 font-extrabold text-sm tracking-tight">jagoan</span>
                <span className="text-amber-500 dark:text-amber-400 font-extrabold text-sm tracking-tight">gadget</span>
                <span className="text-xs font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-2 py-0.5 rounded-full ml-1">
                  Pusat Akun
                </span>
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Berikut adalah detail profilmu yang terdaftar di Jagoan Gadget.
              </p>
            </div>

            <div className="relative flex flex-col gap-4 rounded-xl bg-blue-50/40 dark:bg-slate-900/40 p-4 border border-blue-100/50 dark:border-slate-800">
              {/* Pencil Icon Button on the top-right of the inner profile detail box */}
              <div className="absolute top-4 right-4">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsEditing(true)}
                  className="rounded-full h-8 w-8 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-slate-800 border-border/50 shadow-xs cursor-pointer"
                  title="Ubah Profil"
                >
                  <Pencil className="size-3.5" />
                </Button>
              </div>

              <div className="flex items-center gap-4 pr-10">
                <div className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-yellow-400 overflow-hidden border-2 border-white dark:border-slate-800 shadow-sm">
                  {avatarPreviewUrl ? (
                    <img src={avatarPreviewUrl} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-blue-600 text-white">
                      <svg className="size-7" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-3.5-9c.83 0 1.5-.67 1.5-1.5S9.33 8 8.5 8 7 8.67 7 9.5s.67 1.5 1.5 1.5zm7 0c.83 0 1.5-.67 1.5-1.5S16.33 8 15.5 8s-1.5.67-1.5 1.5.67 1.5 1.5 1.5zm-3.5 5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
                      </svg>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-bold text-foreground text-sm truncate">{me.user.name}</h4>
                    <Badge
                      variant={roleLabel === "Karyawan" ? "default" : "secondary"}
                      className="rounded-full px-2 py-0 text-[10px] font-medium shrink-0"
                    >
                      {roleLabel}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1 truncate">{me.user.phoneNumber || "+6281234567890"}</p>
                  <p className="text-xs text-muted-foreground truncate">{me.user.email}</p>
                </div>
              </div>

              <div className="text-[10px] text-muted-foreground border-t border-blue-100/30 dark:border-slate-800/50 pt-2 font-medium">
                Peran kamu ditentukan dari akun yang digunakan untuk masuk ke Jagoan Gadget.
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        /* Edit Mode Form */
        <form
          id="settings-account-form"
          className="space-y-6"
          onSubmit={(event) => {
            event.preventDefault();
            event.stopPropagation();
            void form.handleSubmit();
          }}
        >
          <Card className="overflow-hidden border border-border/10 shadow-sm rounded-2xl p-0 gap-0">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
              <CardTitle className="text-base">Foto Profil &amp; Role</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Foto profil kamu tampil di seluruh aplikasi, termasuk identitas
                peranmu saat ini.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-6 px-5 py-5 sm:px-7 sm:py-7 md:grid-cols-[auto,1fr] md:gap-8">
              <form.Field
                name="avatarTempKey"
                validators={{ onBlur: formValidators.avatarTempKey, onSubmit: formValidators.avatarTempKey }}
              >
                {(field) => (
                  <div className="[&_img]:size-32">
                    <FieldUpload
                       label="Foto Profil"
                       kind="image"
                       value={field.state.value ?? null}
                       previewUrl={avatarPreviewUrl}
                       onChange={(url) => field.handleChange(url)}
                       hint="Format JPG, PNG, GIF, WEBP, atau SVG. Maksimal 2MB."
                    />
                  </div>
                )}
              </form.Field>

              <div className="flex flex-col items-start gap-3 justify-center">
                <Badge
                  variant={roleLabel === "Karyawan" ? "default" : "secondary"}
                  className="rounded-full px-2.5 py-0.5 text-xs font-medium"
                >
                  {roleLabel}
                </Badge>
                <div className="text-sm">
                  <p className="font-semibold">{me.user.name}</p>
                  <p className="mt-0.5 text-muted-foreground">{me.user.email}</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  Peran kamu ditentukan dari akun yang digunakan untuk masuk ke
                  Jagoan Gadget.
                </p>
              </div>
            </CardContent>
          </Card>

          <Card className="overflow-hidden border border-border/10 shadow-sm rounded-2xl p-0 gap-0">
            <CardHeader className="border-b border-border/50 bg-gradient-to-r from-muted/50 via-muted/30 to-muted/50 px-5 pt-5 pb-5 sm:px-7 sm:pt-6 sm:pb-6">
              <CardTitle className="text-base">Informasi Pribadi</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                Perbarui identitas dasar yang digunakan di akun kamu.
              </CardDescription>
            </CardHeader>

            <CardContent className="grid gap-4 px-5 py-5 sm:px-7 sm:py-7 md:grid-cols-2">
              <form.Field
                name="name"
                validators={{ onBlur: formValidators.name, onSubmit: formValidators.name }}
              >
                {(field) => (
                  <FieldInput
                    label="Nama Lengkap"
                    required
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getFieldError(field.state.meta)}
                    placeholder="Masukkan nama lengkap"
                  />
                )}
              </form.Field>

              <form.Field
                name="email"
                validators={{ onBlur: formValidators.email, onSubmit: formValidators.email }}
              >
                {(field) => (
                  <FieldInput
                    label="Email"
                    type="email"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getFieldError(field.state.meta)}
                    placeholder="email@example.com"
                    disabled
                    hint="Email tidak dapat diubah dari halaman ini."
                  />
                )}
              </form.Field>

              <form.Field
                name="phoneNumber"
                validators={{ onBlur: formValidators.phoneNumber, onSubmit: formValidators.phoneNumber }}
              >
                {(field) => (
                  <FieldInput
                    label="Nomor Telepon"
                    type="tel"
                    value={field.state.value ?? ""}
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                    error={getFieldError(field.state.meta)}
                    placeholder="Contoh: 081234567890"
                  />
                )}
              </form.Field>
            </CardContent>
          </Card>

          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="rounded-full px-6 cursor-pointer"
            >
              Batal
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full px-6 shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer"
            >
              {isSubmitting ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="size-4" aria-hidden="true" />
              )}
              {isSubmitting ? "Menyimpan..." : "Simpan Perubahan"}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}
