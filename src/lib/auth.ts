import { redirect } from '@tanstack/react-router'
import { createAuthClient } from 'better-auth/react'
import { isAxiosError } from 'axios'
import type { QueryClient } from '@tanstack/react-query'
import { config } from '@/config/config'
import { getAuthSession } from '@/features/auth/service/auth.service'
import { meQueryOptions } from '@/features/auth/service/me.service'
import { canAccessRoute } from '@/utils/access-control'

export const authClient = createAuthClient({
  baseURL: `${config.apiBaseUrl}/auth`,
})

export async function getCurrentAuthState() {
  const result = await getAuthSession()
  const session = result?.data?.session ?? null
  const user = result?.data?.user ?? null

  return {
    session,
    user,
    isAuthenticated: Boolean(session),
  }
}

export async function requireAuthenticatedUser() {
  const authState = await getCurrentAuthState()

  if (!authState.isAuthenticated) {
    throw redirect({ to: '/' })
  }

  return authState
}

export async function requireGuestUser() {
  const authState = await getCurrentAuthState()

  if (authState.isAuthenticated) {
    throw redirect({ to: '/' })
  }

  return authState
}

type AdminGuardContext = {
  context: {
    queryClient: QueryClient
  }
  location: {
    pathname: string
  }
}

async function getAdminAccessState(queryClient: QueryClient) {
  const authState = await requireAuthenticatedUser()
  let me

  try {
    me = await queryClient.ensureQueryData(meQueryOptions())
  } catch (error) {
    if (isAxiosError(error) && error.response?.status === 401) {
      throw redirect({ to: '/' })
    }

    if (isAxiosError(error) && error.response?.status === 403) {
      throw redirect({ to: '/403' })
    }

    throw error
  }

  if (!me.accessControl.canAccessAdmin) {
    throw redirect({ to: '/403' })
  }

  return {
    ...authState,
    me,
  }
}

export async function requireAdminAccess({ context }: AdminGuardContext) {
  return getAdminAccessState(context.queryClient)
}

export async function requireAdminPageAccess({
  context,
  location,
}: AdminGuardContext) {
  const accessState = await getAdminAccessState(context.queryClient)

  if (
    location.pathname !== '/admin' &&
    location.pathname !== '/admin/' &&
    !canAccessRoute(accessState.me.accessControl.menus, location.pathname)
  ) {
    throw redirect({ to: '/403' })
  }

  return accessState
}
