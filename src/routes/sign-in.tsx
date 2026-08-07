import { createFileRoute } from '@tanstack/react-router'

import { requireGuestUser } from '@/lib/auth'

export const Route = createFileRoute('/sign-in')({
  beforeLoad: requireGuestUser,
})
