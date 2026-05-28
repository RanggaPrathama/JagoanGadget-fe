import { createFileRoute } from '@tanstack/react-router'
import { Category } from '@/features/admin/category'

export const Route = createFileRoute('/admin/category/')({
  component: Category,
})