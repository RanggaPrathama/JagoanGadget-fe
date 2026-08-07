import { useQuery } from '@tanstack/react-query'
import { meQueryOptions } from '@/features/auth/service/me.service'

export function useMe() {
  return useQuery(meQueryOptions())
}
