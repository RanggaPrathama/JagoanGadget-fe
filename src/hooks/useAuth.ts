import { authSessionQueryOptions } from '@/features/auth/service/auth.service'
import { useMutation, useQuery } from '@tanstack/react-query'
import { useAuthStore } from '@/stores/auth-store'

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

function useAuth() {
  const { isAuthenticated, ...sessionState } = useAuthSession()
  const { auth } = useAuthStore()

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await auth.reset()
    },
  })

  return {
    ...sessionState,
    isAuthenticated,
    handleSignOut: signOutMutation.mutateAsync,
    isSigningOut: signOutMutation.isPending,
  }
}

export { useAuth, useAuthSession }
