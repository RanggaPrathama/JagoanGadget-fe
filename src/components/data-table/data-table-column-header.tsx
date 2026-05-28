"use client"

import type { Column } from "@tanstack/react-table"
import { ArrowDown01Icon } from "@hugeicons/core-free-icons"
import { HugeiconsIcon } from "@hugeicons/react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps<TData, TValue> {
  column: Column<TData, TValue>
  title: string
  className?: string
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <div className={cn("text-xs font-semibold tracking-wide", className)}>{title}</div>
  }

  const sorted = column.getIsSorted()

  return (
    <Button
      variant="ghost"
      className={cn(
        "-ml-3 h-8 rounded-full px-3 text-xs font-semibold tracking-wide text-muted-foreground hover:bg-muted/80 hover:text-foreground",
        className
      )}
      onClick={() => column.toggleSorting(sorted === "asc")}
    >
      <span>{title}</span>
      <HugeiconsIcon
        icon={ArrowDown01Icon}
        size={16}
        className={cn(
          "transition-transform duration-200",
          sorted === "asc" && "rotate-180 text-foreground",
          sorted === "desc" && "text-foreground",
          !sorted && "opacity-50"
        )}
      />
    </Button>
  )
}
