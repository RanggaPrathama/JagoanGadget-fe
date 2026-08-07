import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Eye, EyeOff } from "lucide-react";
import { AuthLayout } from "@/components/layouts/auth/AuthLayout";
import { FieldInput } from "@/components/field/FieldInput";
import { Button } from "@/components/ui/button";
import {
  useSignInForm,
  validateSignInEmail,
  validateSignInPassword,
} from "./hooks/useSignIn";

function getFieldError(meta: {
  isTouched: boolean;
  errors?: Array<string | undefined>;
}) {
  if (!meta.isTouched) {
    return undefined;
  }

  return meta.errors?.find((error) => typeof error === "string");
}

export function SignInPage() {
  const redirectTo = new URLSearchParams(window.location.search).get(
    "redirect",
  );
  const [showPassword, setShowPassword] = useState(false);
  const { form, isLoading, isSessionReady, isAuthenticated } = useSignInForm({
    redirectTo,
  });

  if (isSessionReady && isAuthenticated) {
    return null;
  }

  return (
    <AuthLayout
      mode="sign-in"
      eyebrow="Member access"
      title="Masuk cepat untuk lanjut belanja."
      subtitle="Cukup isi email dan password. Fokus utamanya tetap ke akses akun dan checkout."
      asideTitle="Sign in yang singkat dan tetap terasa rapi."
      asideBody="Dipadatkan supaya user tidak capek membaca sebelum benar-benar masuk."
    >
      <div className="mt-7 mx-auto max-w-[30rem] space-y-4">
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
              name="email"
              validators={{
                onBlur: ({ value }) => validateSignInEmail(value),
                onSubmit: ({ value }) => validateSignInEmail(value),
              }}
            >
              {(field) => (
                <FieldInput
                  id="email"
                  label="Email"
                  type="email"
                  autoComplete="email"
                  placeholder="demo@jagoan.com"
                  required
                  value={field.state.value}
                  error={getFieldError(field.state.meta)}
                  inputClassName="h-10 rounded-[1rem] border-border/70 bg-background/85 px-4 text-sm shadow-none placeholder:text-muted-foreground/70"
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>

            <form.Field
              name="password"
              validators={{
                onBlur: ({ value }) => validateSignInPassword(value),
                onSubmit: ({ value }) => validateSignInPassword(value),
              }}
            >
              {(field) => (
                <FieldInput
                  id="password"
                  label="Password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Masukkan password"
                  required
                  value={field.state.value}
                  error={getFieldError(field.state.meta)}
                  inputClassName="h-10 rounded-[1rem] border-border/70 bg-background/85 px-4 text-sm shadow-none placeholder:text-muted-foreground/70"
                  endIcon={
                    showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )
                  }
                  onEndIconClick={() => setShowPassword((value) => !value)}
                  endIconLabel={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                />
              )}
            </form.Field>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row">
              <Button
                type="submit"
                disabled={isLoading}
                className="h-11 flex-1 rounded-full px-5 text-sm font-semibold"
              >
                {isLoading ? "Signing in..." : "Sign In"}
                <ArrowRight className="size-4" />
              </Button>
            </div>
          </form>
        </div>

        <div className="px-1 text-sm text-muted-foreground">
          <p className="text-center">
            Belum punya akun?{" "}
            <Link
              to="/sign-up"
              className="font-semibold text-foreground no-underline transition-colors hover:text-primary"
            >
              Buat akun
            </Link>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
}
