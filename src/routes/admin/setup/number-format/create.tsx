import { createFileRoute } from '@tanstack/react-router'
import { NumberFormatFormView } from '@/features/admin/setup/number_format/views/NumberFormatFormView'
export const Route = createFileRoute('/admin/setup/number-format/create')({
  component: NumberFormatFormView,
})

