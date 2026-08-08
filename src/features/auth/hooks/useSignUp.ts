import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import { getErrorMessage } from "@/utils/error";
import {
  authSessionQueryKey,
  signUpWithEmail,
  type SignUpCredentials,
} from "../service/auth.service";
import { useAuth } from "@/hooks/useAuth";

interface UseSignUpFormOptions {
  redirectTo?: string | null;
}

const signUpFieldSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama wajib diisi.")
    .min(2, "Nama minimal 2 karakter."),
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email(),
  password: z
    .string()
    .trim()
    .min(1, "Password wajib diisi.")
    .min(6, "Password minimal 6 karakter."),
  confirmPassword: z.string().trim().min(1, "Konfirmasi password wajib diisi."),
});

const signUpPasswordMatchSchema = z
  .object({
    password: signUpFieldSchema.shape.password,
    confirmPassword: signUpFieldSchema.shape.confirmPassword,
  })
  .refine((value) => value.password === value.confirmPassword, {
    message: "Konfirmasi password belum sama.",
    path: ["confirmPassword"],
  });

export const signUpSchema = signUpFieldSchema.and(signUpPasswordMatchSchema);

export function validateSignUpName(value: string) {
  const result = signUpFieldSchema.shape.name.safeParse(value);

  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateSignUpEmail(value: string) {
  const result = signUpFieldSchema.shape.email.safeParse(value);

  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateSignUpPassword(value: string) {
  const result = signUpFieldSchema.shape.password.safeParse(value);

  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateSignUpConfirmPassword(
  confirmPassword: string,
  password: string,
) {
  const result = signUpPasswordMatchSchema.safeParse({
    password,
    confirmPassword,
  });

  return result.success ? undefined : result.error.issues[0]?.message;
}

function redirectToTarget(
  router: ReturnType<typeof useRouter>,
  target?: string | null,
) {
  if (target && target.startsWith("/")) {
    window.location.assign(target);
    return;
  }

  void router.navigate({ to: "/" });
}

export function useSignUpForm({ redirectTo }: UseSignUpFormOptions = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: isSessionPending } = useAuth();

  const mutation = useMutation({
    mutationFn: async (credentials: SignUpCredentials) => {
      const result = signUpSchema.safeParse(credentials);

      if (!result.success) {
        throw new Error(
          result.error.issues[0]?.message ?? "Input tidak valid.",
        );
      }

      return signUpWithEmail(result.data);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
      await router.invalidate();
      toast.success("Akun berhasil dibuat.");
      redirectToTarget(router, redirectTo);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal mendaftar akun."));
    },
  });

  const form = useForm({
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
    } satisfies SignUpCredentials,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  useEffect(() => {
    if (!isSessionPending && isAuthenticated) {
      redirectToTarget(router, redirectTo);
    }
  }, [redirectTo, router, isAuthenticated, isSessionPending]);

  return {
    form,
    isLoading: mutation.isPending,
    isSessionReady: !isSessionPending,
    isAuthenticated,
  };
}
