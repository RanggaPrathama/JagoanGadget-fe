import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { getErrorMessage } from "@/utils/error";
import type { AnyRouter } from "@tanstack/react-router";
import { toast } from "sonner";
export interface SignInCredentials {
  email: string;
  password: string;
}

export interface SignUpCredentials {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export async function signInWithEmail(credentials: SignInCredentials) {
  const result = await authClient.signIn.email({
    email: credentials.email,
    password: credentials.password,
  });

  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    result.error
  ) {
    throw new Error(getErrorMessage(result, "Gagal masuk ke akun."));
  }

  return result;
}

export async function signUpWithEmail(credentials: SignUpCredentials) {
  const result = await authClient.signUp.email({
    name: credentials.name,
    email: credentials.email,
    password: credentials.password,
  });

  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    result.error
  ) {
    throw new Error(getErrorMessage(result, "Gagal mendaftar akun."));
  }

  return result;
}

export async function signOutAuth(
  queryClient: QueryClient,
  router: AnyRouter,
  opts?: { redirectTo?: string },
): Promise<void> {
  if (!queryClient || !router) {
    toast.error("Autentikasi belum dikonfigurasi.");
    return;
  }

  const redirectTo = opts?.redirectTo ?? router.state.location.href;

  try {
    await authClient.signOut();
    clearAuthCache(queryClient);
    await router.invalidate();
    toast.success("Berhasil keluar dari akun.");
    await router.navigate({
      to: "/",
      search: { redirect: redirectTo },
      replace: true,
    });
  } catch (error) {
    toast.error(getErrorMessage(error, "Gagal keluar dari akun."));
  }
}

export async function getAuthSession() {
  return authClient.getSession();
}

/**
 * reset all query cache, including `/me` and `auth-session`
 */
export function clearAuthCache(queryClient: QueryClient) {
  queryClient.clear();
}

export const authSessionQueryKey = ["auth-session"] as const;

export function authSessionQueryOptions() {
  return queryOptions({
    queryKey: authSessionQueryKey,
    queryFn: getAuthSession,
    staleTime: 60_000,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
  });
}
