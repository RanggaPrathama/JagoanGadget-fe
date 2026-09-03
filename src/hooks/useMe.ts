import { useQuery } from "@tanstack/react-query";
import { authSessionQueryOptions } from "@/features/auth/service/auth.service";
import { meQueryOptions } from "@/features/auth/service/me.service";

export function useMe() {
  const sessionQuery = useQuery(authSessionQueryOptions());
  const isAuthenticated = Boolean(sessionQuery.data?.data?.session);

  // Fire `/me` only when there's a session — avoids 401 bursts on
  // logout/login transitions while stale components still remount.
  return useQuery({
    ...meQueryOptions(),
    enabled: isAuthenticated,
  });
}