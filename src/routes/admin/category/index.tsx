import { createFileRoute } from '@tanstack/react-router'
import { Category } from '@/features/admin/category'
import { requireAdminPageAccess } from '@/lib/auth'

export const Route = createFileRoute('/admin/category/')({
  beforeLoad: requireAdminPageAccess,
  component: Category,
})
