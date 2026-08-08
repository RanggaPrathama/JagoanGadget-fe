import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { authSessionQueryOptions } from '@/features/auth/service/auth.service'
import { meQueryOptions } from '@/features/auth/service/me.service'
import { resetAuth } from '@/features/auth/service/logout'
import type { MeUser } from '@/features/auth/types/me'

function useAuthSession() {
  const sessionQuery = useQuery(authSessionQueryOptions())
  const payload =
    sessionQuery.data && typeof sessionQuery.data === 'object' && 'data' in sessionQuery.data
      ? sessionQuery.data.data
      : null
  const session = payload?.session ?? null
  const user = payload?.user ?? null

  return {
    ...sessionQuery,
    session,
    user,
    isPending: sessionQuery.isLoading,
    isAuthenticated: Boolean(session),
  }
}

export function useAuth() {
  const sessionState = useAuthSession()
  const queryClient = useQueryClient()
  const router = useRouter()

  const meQuery = useQuery({
    ...meQueryOptions(),
    enabled: sessionState.isAuthenticated,
  })

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await resetAuth(queryClient, router)
    },
  })

  return {
    isAuthenticated: sessionState.isAuthenticated,
    isLoading: sessionState.isPending || meQuery.isLoading,
    user: (meQuery.data?.user ?? sessionState.user) as MeUser | null,
    accessControl: meQuery.data?.accessControl ?? null,
    handleSignOut: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,
  }
}
