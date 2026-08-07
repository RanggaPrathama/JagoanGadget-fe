import { queryOptions, type QueryClient } from "@tanstack/react-query";
import { authClient } from "@/lib/auth";
import { getErrorMessage } from "@/utils/error";
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

export async function signOutAuth() {
  const result = await authClient.signOut();

  if (
    typeof result === "object" &&
    result !== null &&
    "error" in result &&
    result.error
  ) {
    throw new Error(getErrorMessage(result, "Gagal keluar dari akun."));
  }

  return result;
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
