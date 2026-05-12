import {
  createContext,
  useState,
  useCallback,
  type ReactNode,
} from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { getCookie, setCookie, removeCookie } from '@/lib/cookies'
import type { AuthUser, AuthContextValue } from '@/types/auth'
const ACCESS_TOKEN = 'thisisjustarandomstring'


export const AuthContext = createContext<AuthContextValue | null>(null)

// ── Provider
export function AuthProvider({ children }: { children: ReactNode }) {
  const queryClient = useQueryClient()

  const [user, setUserState] = useState<AuthUser | null>(null)
  const [accessToken, setAccessTokenState] = useState<string>(() => {
    const cookie = getCookie(ACCESS_TOKEN)
    return cookie ? JSON.parse(cookie) : ''
  })

  const setUser = useCallback((user: AuthUser | null) => {
    setUserState(user)
  }, [])

  const setAccessToken = useCallback((token: string) => {
    setCookie(ACCESS_TOKEN, JSON.stringify(token))
    setAccessTokenState(token)
  }, [])

  const resetAccessToken = useCallback(() => {
    removeCookie(ACCESS_TOKEN)
    setAccessTokenState('')
  }, [])

  const reset = useCallback(() => {
    removeCookie(ACCESS_TOKEN)
    setUserState(null)
    setAccessTokenState('')
    queryClient.clear() // bersihkan semua cache TanStack Query sekaligus
  }, [queryClient])

  return (
    <AuthContext.Provider
      value={{ user, accessToken, setUser, setAccessToken, resetAccessToken, reset }}
    >
      {children}
    </AuthContext.Provider>
  )
}