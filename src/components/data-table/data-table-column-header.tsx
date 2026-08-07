import { cn } from "@/lib/utils"

interface DataTableColumnHeaderProps {
  title: string
  className?: string
}

export function DataTableColumnHeader({ title, className }: DataTableColumnHeaderProps) {
  return <div className={cn("text-xs font-semibold tracking-wide", className)}>{title}</div>
}
