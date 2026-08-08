import { authSessionQueryOptions } from '@/features/auth/service/auth.service'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useRouter } from '@tanstack/react-router'
import { resetAuth } from '@/features/auth/service/logout'

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
  const queryClient = useQueryClient()
  const router = useRouter()

  const signOutMutation = useMutation({
    mutationFn: async () => {
      await resetAuth(queryClient, router)
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
