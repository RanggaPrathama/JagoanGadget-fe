import { createFileRoute } from '@tanstack/react-router'
import { Dashboard } from '@/features/admin/dashboard'
import { requireAdminPageAccess } from '@/lib/auth'

export const Route = createFileRoute('/admin/')({
  beforeLoad: requireAdminPageAccess,
  component: Dashboard,
})
