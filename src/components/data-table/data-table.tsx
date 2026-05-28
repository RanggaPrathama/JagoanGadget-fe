"use client"

import * as React from "react"
import {
  type ColumnDef,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { SearchIcon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { cn } from "@/lib/utils"

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[]
  data: TData[]
  title?: string
  description?: string
  searchPlaceholder?: string
  searchColumn?: string
  emptyMessage?: string
  className?: string
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchPlaceholder = "Search data...",
  searchColumn,
  emptyMessage = "No results found.",
  className,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = React.useState<SortingState>([])

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    state: {
      sorting,
    },
  })

  const filterColumn = searchColumn ? table.getColumn(searchColumn) : undefined
  const filteredRows = table.getFilteredRowModel().rows.length
  const totalRows = table.getCoreRowModel().rows.length

  return (
    <Card
      className={cn(
        "overflow-hidden border-border/60 bg-background/95 shadow-[0_20px_60px_-40px_hsl(var(--foreground)/0.2)] backdrop-blur supports-[backdrop-filter]:bg-background/80",
        className
      )}
    >
      <div className="flex flex-col gap-3 border-b border-border/60 bg-muted/10 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-1 items-center gap-3">
          {filterColumn ? (
            <div className="relative w-full max-w-sm">
              <HugeiconsIcon
                icon={SearchIcon}
                size={16}
                className="pointer-events-none absolute top-1/2 left-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={(filterColumn.getFilterValue() as string) ?? ""}
                onChange={(event) => filterColumn.setFilterValue(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-10 rounded-full border-border/70 bg-background/70 pl-11 shadow-none"
              />
            </div>
          ) : null}
        </div>
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{filteredRows}</span> dari{" "}
          <span className="font-medium text-foreground">{totalRows}</span> data
        </p>
      </div>

      <CardContent className="p-0">
        <div className="overflow-hidden">
          <Table>
            <TableHeader className="bg-muted/35">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="h-12 px-6 text-xs uppercase tracking-[0.16em] text-muted-foreground">
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>

            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="border-border/60 transition-colors hover:bg-muted/30"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="px-6 py-4 align-middle">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-40 px-6 text-center">
                    <div className="mx-auto flex max-w-sm flex-col items-center gap-2 rounded-3xl border border-dashed border-border/70 bg-muted/20 px-6 py-8 text-center">
                      <p className="text-sm font-medium">{emptyMessage}</p>
                      <p className="text-sm text-muted-foreground">
                        Try adjusting your search or add new data to populate this table.
                      </p>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex flex-col gap-3 border-t border-border/60 bg-muted/20 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">
            Showing{" "}
            <span className="font-medium text-foreground">{table.getRowModel().rows.length}</span> of{" "}
            <span className="font-medium text-foreground">{filteredRows}</span> filtered rows
          </p>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Previous
            </Button>
            <div className="rounded-full border border-border/70 bg-background px-4 py-2 text-sm font-medium text-foreground">
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </div>
            <Button
              variant="outline"
              size="sm"
              className="rounded-full px-4"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
