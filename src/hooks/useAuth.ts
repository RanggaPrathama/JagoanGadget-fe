import {
    useContext,
} from 'react'
import { AuthContext } from '@/context/AuthProvider'
import type { AuthContextValue } from '@/types/auth'


export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth harus dipakai di dalam <AuthProvider>')
  return ctx
}