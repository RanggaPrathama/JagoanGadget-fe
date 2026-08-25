import { createFileRoute } from '@tanstack/react-router'
import { CategoryListView as Category } from '@/features/admin/category'
import { requireAdminPageAccess } from '@/lib/auth'

export const Route = createFileRoute('/admin/master/category/')({
  beforeLoad: requireAdminPageAccess,
  component: Category,
})
