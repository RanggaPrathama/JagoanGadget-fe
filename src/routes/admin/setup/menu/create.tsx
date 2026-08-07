import { createFileRoute } from '@tanstack/react-router'
import { MenuFormView } from '@/features/admin/setup/menu'
import { requireAdminPageAccess } from '@/lib/auth'

export const Route = createFileRoute('/admin/setup/menu/create')({
  beforeLoad: requireAdminPageAccess,
  component: MenuFormView,
})
