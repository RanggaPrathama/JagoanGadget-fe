import type { ColDef } from 'ag-grid-community'

import { DataTable } from '@/components/data-table'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'

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

function NameCellRenderer(params: { data: CategoryItem }) {
  return (
    <div className='space-y-1'>
      <p className='font-medium'>{params.data.name}</p>
      <p className='text-sm text-muted-foreground'>{params.data.id}</p>
    </div>
  )
}

function SlugCellRenderer(params: { data: CategoryItem }) {
  return (
    <span className='rounded-full bg-muted px-3 py-1 text-xs font-medium tracking-wide text-muted-foreground'>
      /{params.data.slug}
    </span>
  )
}

function ProductsCellRenderer(params: { data: CategoryItem }) {
  return <div className='text-right font-medium'>{params.data.totalProducts}</div>
}

function StatusCellRenderer(params: { data: CategoryItem }) {
  return (
    <Badge
      variant={params.data.status === 'Active' ? 'secondary' : 'outline'}
      className='rounded-full px-3 py-1'
    >
      {params.data.status}
    </Badge>
  )
}

const columns: ColDef<CategoryItem>[] = [
  {
    field: 'name',
    headerName: 'Category',
    cellRenderer: NameCellRenderer,
    minWidth: 260,
    filter: 'agTextColumnFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
  {
    field: 'slug',
    headerName: 'Slug',
    cellRenderer: SlugCellRenderer,
    minWidth: 220,
    filter: 'agTextColumnFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
  {
    field: 'totalProducts',
    headerName: 'Products',
    type: 'rightAligned',
    cellRenderer: ProductsCellRenderer,
    maxWidth: 160,
    filter: 'agNumberColumnFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
  {
    field: 'status',
    headerName: 'Status',
    cellRenderer: StatusCellRenderer,
    maxWidth: 180,
    filter: 'agTextColumnFilter',
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
]

export function Category() {
  return (
    <div className='space-y-6'>
      <div className='space-y-2'>
        <h1 className='text-3xl font-semibold tracking-tight'>Category</h1>
        <p className='max-w-2xl text-sm leading-6 text-muted-foreground'>
          Reusable data table ini mengikuti pola dokumentasi shadcn, lalu
          dipoles dengan shell yang lebih modern supaya cocok untuk dashboard
          admin yang lebih rapi.
        </p>
      </div>

      <Card className='overflow-hidden border-border/60 bg-card/90 shadow-sm'>
        <CardContent className='px-0 pb-0 pt-0'>
          <div className='h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden'>
            <DataTable
              columns={columns}
              rows={categories}
              emptyMessage='No categories matched your search.'
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
