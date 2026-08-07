import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { toast } from "sonner";
import { z } from "zod";
import {
  authSessionQueryKey,
  signInWithEmail,
  type SignInCredentials,
} from "../service/auth.service";
import { meQueryKey } from "../service/me.service";
import { getErrorMessage } from "@/utils/error";
import { useAuthSession } from "@/hooks/useAuth";

interface UseSignInFormOptions {
  redirectTo?: string | null;
}

export const signInSchema = z.object({
  email: z
    .string()
    .trim()
    .min(1, "Email wajib diisi.")
    .email("Format email tidak valid."),
  password: z.string().trim().min(1, "Password wajib diisi."),
});

export function validateSignInEmail(value: string) {
  const result = signInSchema.shape.email.safeParse(value);

  return result.success ? undefined : result.error.issues[0]?.message;
}

export function validateSignInPassword(value: string) {
  const result = signInSchema.shape.password.safeParse(value);

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

export function useSignInForm({ redirectTo }: UseSignInFormOptions = {}) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const session = useAuthSession();

  const mutation = useMutation({
    mutationFn: async (credentials: SignInCredentials) => {
      const result = signInSchema.safeParse(credentials);

      if (!result.success) {
        throw new Error(
          result.error.issues[0]?.message ?? "Input tidak valid.",
        );
      }

      return signInWithEmail(result.data);
    },
    onSuccess: async () => {
      // Remove stale `/me` from a previous session so the route guard refetches
      // the newly signed-in user's access control on first navigation.
      queryClient.removeQueries({ queryKey: meQueryKey });
      await queryClient.invalidateQueries({ queryKey: authSessionQueryKey });
      await router.invalidate();
      toast.success("Welcome back!");
      redirectToTarget(router, redirectTo);
    },
    onError: (error) => {
      toast.error(getErrorMessage(error, "Gagal masuk ke akun."));
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
      password: "",
    } satisfies SignInCredentials,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  useEffect(() => {
    if (!session.isPending && session.isAuthenticated) {
      redirectToTarget(router, redirectTo);
    }
  }, [redirectTo, router, session.isAuthenticated, session.isPending]);

  return {
    form,
    isLoading: mutation.isPending,
    isSessionReady: !session.isPending,
    isAuthenticated: session.isAuthenticated,
  };
}
