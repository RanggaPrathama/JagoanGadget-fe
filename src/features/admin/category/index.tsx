import type { ColumnDef } from '@tanstack/react-table'

import { DataTable, DataTableColumnHeader } from '@/components/data-table'
import { AdminPageShell } from '@/components/layouts/admin/AdminPageShell'
import { Badge } from '@/components/ui/badge'

type CategoryItem = {
  id: string
  name: string
  slug: string
  totalProducts: number
  status: 'Active' | 'Draft'
}

const categories: CategoryItem[] = [
  {
    id: 'CAT-001',
    name: 'Smartphone',
    slug: 'smartphone',
    totalProducts: 128,
    status: 'Active',
  },
  {
    id: 'CAT-002',
    name: 'Laptop',
    slug: 'laptop',
    totalProducts: 84,
    status: 'Active',
  },
  {
    id: 'CAT-003',
    name: 'Tablet',
    slug: 'tablet',
    totalProducts: 42,
    status: 'Active',
  },
  {
    id: 'CAT-004',
    name: 'Audio',
    slug: 'audio',
    totalProducts: 56,
    status: 'Draft',
  },
  {
    id: 'CAT-005',
    name: 'Wearable',
    slug: 'wearable',
    totalProducts: 31,
    status: 'Active',
  },
  {
    id: 'CAT-006',
    name: 'Gaming',
    slug: 'gaming',
    totalProducts: 19,
    status: 'Draft',
  },
]

const columns: ColumnDef<CategoryItem>[] = [
  {
    accessorKey: 'name',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Category' />
    ),
    cell: ({ row }) => (
      <div className='space-y-1'>
        <p className='font-medium'>{row.original.name}</p>
        <p className='text-sm text-muted-foreground'>{row.original.id}</p>
      </div>
    ),
  },
  {
    accessorKey: 'slug',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Slug' />
    ),
    cell: ({ row }) => (
      <span className='rounded-full bg-muted px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground'>
        /{row.original.slug}
      </span>
    ),
  },
  {
    accessorKey: 'totalProducts',
    header: ({ column }) => (
      <DataTableColumnHeader
        column={column}
        title='Products'
        className='justify-end'
      />
    ),
    cell: ({ row }) => (
      <div className='text-right font-medium'>{row.original.totalProducts}</div>
    ),
  },
  {
    accessorKey: 'status',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title='Status' />
    ),
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === 'Active' ? 'secondary' : 'outline'}
        className='rounded-full px-3 py-1'
      >
        {row.original.status}
      </Badge>
    ),
  },
]

export function Category() {
  return (
    <AdminPageShell
      breadcrumbs={[
        { title: 'Admin', href: '/admin/' },
        { title: 'Catalog' },
        { title: 'Category' },
      ]}
      notificationCount={6}
    >
      <div className='space-y-6'>
        <div className='space-y-2'>
          <h1 className='text-3xl font-semibold tracking-tight'>Category</h1>
          <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
            Reusable data table ini mengikuti pola dokumentasi shadcn, lalu
            dipoles dengan shell yang lebih modern supaya cocok untuk dashboard
            admin yang lebih rapi.
          </p>
        </div>

        <DataTable
          columns={columns}
          data={categories}
          searchColumn='name'
          searchPlaceholder='Search category...'
          emptyMessage='No categories matched your search.'
        />
      </div>
    </AdminPageShell>
  )
}
