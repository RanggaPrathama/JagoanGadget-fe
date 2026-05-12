
export interface AuthUser {
  accountNo: string
  email: string
  role: string[]
  exp: number
}

export interface AuthContextValue {
  user: AuthUser | null
  accessToken: string
  setUser: (user: AuthUser | null) => void
  setAccessToken: (token: string) => void
  resetAccessToken: () => void
  reset: () => void
}
