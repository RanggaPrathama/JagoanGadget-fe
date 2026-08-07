import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { FieldInput } from "@/components/field/FieldInput";
import { AuthLayout } from "@/components/layouts/auth/AuthLayout";
import { Button } from "@/components/ui/button";
import {
  useSignUpForm,
  validateSignUpConfirmPassword,
  validateSignUpEmail,
  validateSignUpName,
  validateSignUpPassword,
} from "./hooks/useSignUp";

function getFieldError(meta: {
  isTouched: boolean;
  errors?: Array<string | undefined>;
}) {
  if (!meta.isTouched) {
    return undefined;
  }

  return meta.errors?.find((error) => typeof error === "string");
}

const inputClassName =
  "h-10 rounded-[1rem] border-border/70 bg-background/85 px-4 text-sm shadow-none placeholder:text-muted-foreground/70";

export function SignUpPage() {
  const redirectTo = new URLSearchParams(window.location.search).get(
    "redirect",
  );
  const { form, isLoading, isSessionReady, isAuthenticated } = useSignUpForm({
    redirectTo,
  });
  const [showPassword, setShowPassword] = useState(false);

  if (isSessionReady && isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout
      mode="sign-up"
      eyebrow="Create account"
      title="Buat akun baru dan langsung siap belanja."
      subtitle="Field dibuat ringkas, jelas, dan tetap kasih feedback yang cepat saat user mengisi form."
      asideTitle="Registrasi yang terasa ringan tapi tetap rapi."
      asideBody="Validasi tampil dekat dengan input supaya user tidak perlu menebak apa yang perlu diperbaiki."
    >
      <div className="mt-7 mx-auto max-w-[31rem] space-y-4">
        <div className="rounded-[1.75rem] border border-border/70 bg-background/82 p-5 shadow-[0_24px_80px_-42px_rgba(15,23,42,0.18)] backdrop-blur sm:p-6">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
            className="mt-6 space-y-4"
          >
            <form.Field
              name="name"
              validators={{
                onBlur: ({ value }) => validateSignUpName(value),
                onSubmit: ({ value }) => validateSignUpName(value),
              }}
            >
              {(field) => (
                <FieldInput
                  id="name"
                  label="Nama"
                  type="text"
                  autoComplete="name"
                  placeholder="Rangga Prathama"
                  required
                  value={field.state.value}
                  error={getFieldError(field.state.meta)}
                  inputClassName={inputClassName}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>

            <form.Field
              name="email"
              validators={{
                onBlur: ({ value }) => validateSignUpEmail(value),
                onSubmit: ({ value }) => validateSignUpEmail(value),
              }}
            >
              {(field) => (
                <FieldInput
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  required
                  value={field.state.value}
                  error={getFieldError(field.state.meta)}
                  inputClassName={inputClassName}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>

            <div className="grid gap-4 sm:grid-cols-2">
              <form.Field
                name="password"
                validators={{
                  onBlur: ({ value }) => validateSignUpPassword(value),
                  onSubmit: ({ value }) => validateSignUpPassword(value),
                }}
              >
                {(field) => (
                  <FieldInput
                    id="password"
                    label="Password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Minimum 6 karakter"
                    required
                    value={field.state.value}
                    error={getFieldError(field.state.meta)}
                    hint="Min. 6 karakter"
                    inputClassName={inputClassName}
                    endIcon={
                      showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )
                    }
                    onEndIconClick={() => setShowPassword((value) => !value)}
                    endIconLabel={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              </form.Field>

              <form.Field
                name="confirmPassword"
                validators={{
                  onBlur: ({ value }) =>
                    validateSignUpConfirmPassword(
                      value,
                      form.state.values.password,
                    ),
                  onSubmit: ({ value }) =>
                    validateSignUpConfirmPassword(
                      value,
                      form.state.values.password,
                    ),
                }}
              >
                {(field) => (
                  <FieldInput
                    id="confirmPassword"
                    label="Konfirmasi"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    placeholder="Ulangi password"
                    required
                    value={field.state.value}
                    error={getFieldError(field.state.meta)}
                    inputClassName={inputClassName}
                    endIcon={
                      showPassword ? (
                        <EyeOff className="size-4" />
                      ) : (
                        <Eye className="size-4" />
                      )
                    }
                    onEndIconClick={() => setShowPassword((value) => !value)}
                    endIconLabel={
                      showPassword
                        ? "Sembunyikan password"
                        : "Tampilkan password"
                    }
                    onBlur={field.handleBlur}
                    onChange={(event) => field.handleChange(event.target.value)}
                  />
                )}
              </form.Field>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="mt-1 h-11 w-full rounded-full px-5 text-sm font-semibold"
            >
              {isLoading ? "Creating account..." : "Create Account"}
              <ArrowRight className="size-4" />
            </Button>
          </form>
        </div>

        <div className="px-1 text-sm text-center text-muted-foreground">
          <p className="leading-7">
            Dengan membuat akun, kamu menyetujui Terms dan Privacy Policy toko
            publik ini.
          </p>
          <p>
            Sudah punya akun?{" "}
            <Link
              to="/sign-in"
              className="font-semibold text-foreground no-underline transition-colors hover:text-primary"
            >
              Masuk
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
