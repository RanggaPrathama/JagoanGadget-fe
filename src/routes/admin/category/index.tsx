import { createFileRoute } from '@tanstack/react-router'
import { CategoryListView as Category } from '@/features/admin/setup/category'
import { requireAdminPageAccess } from '@/lib/auth'

export const Route = createFileRoute('/admin/category/')({
  beforeLoad: requireAdminPageAccess,
  component: Category,
})
