import { createFileRoute } from '@tanstack/react-router'
import { AuthenticatedLayout } from '@/components/layouts/admin/AppLayout'

export const Route = createFileRoute('/admin')({
  component: AuthenticatedLayout,
})