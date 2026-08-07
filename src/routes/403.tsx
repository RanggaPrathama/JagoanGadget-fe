import { createFileRoute } from '@tanstack/react-router'
import { UnauthorisedError } from '@/features/errors/Unauthorized'

export const Route = createFileRoute('/403')({
  component: UnauthorisedError,
})
