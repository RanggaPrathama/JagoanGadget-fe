import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { authSessionQueryOptions } from "@/features/auth/service/auth.service";
import { meQueryOptions } from "@/features/auth/service/me.service";
import { signOutAuth } from "@/features/auth/service/auth.service";
import type { MeUser } from "@/features/auth/types/me";

function useAuthSession() {
  const sessionQuery = useQuery(authSessionQueryOptions());
  const payload =
    sessionQuery.data &&
    typeof sessionQuery.data === "object" &&
    "data" in sessionQuery.data
      ? sessionQuery.data.data
      : null;
  const session = payload?.session ?? null;
  const user = payload?.user ?? null;

  return {
    ...sessionQuery,
    session,
    user,
    isPending: sessionQuery.isLoading,
    isAuthenticated: Boolean(session),
  };
}

export function useSignOut() {
  const queryClient = useQueryClient();
  const router = useRouter();

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await signOutAuth(queryClient, router);
    },
  });

  return {
    handleSignOut: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,
  };
}

export function useAuth() {
  const sessionState = useAuthSession();

  const meQuery = useQuery({
    ...meQueryOptions(),
    enabled: sessionState.isAuthenticated,
  });

  const { handleSignOut, isSigningOut } = useSignOut();

  return {
    isAuthenticated: sessionState.isAuthenticated,
    // `/me` is gated off when not authenticated; a disabled query keeps
    // `isLoading` true in react-query v4 (status 'pending'), so only count it
    // when `/me` is actually relevant (authenticated). For guests, loading = session only.
    isLoading:
      sessionState.isPending ||
      (sessionState.isAuthenticated && meQuery.isLoading),
    user: (meQuery.data?.user ?? sessionState.user) as MeUser,
    accessControl: meQuery.data?.accessControl ?? null,
    handleSignOut,
    isSigningOut,
  };
}
