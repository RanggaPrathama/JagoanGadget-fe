import type * as React from "react";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type Column<T> = {
  header: string;
  accessorKey?: keyof T & string;
  cell?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
};

type FormTableProps<T> = {
  columns: Column<T>[];
  data: T[];
  keyExtractor: (row: T, index: number) => string;
  emptyMessage?: string;
  emptyIcon?: React.ReactNode;
  className?: string;
  onDelete?: (row: T) => void;
};

export function FormTable<T>({
  columns,
  data,
  keyExtractor,
  emptyMessage = "Tidak ada data",
  emptyIcon,
  className,
  onDelete,
}: FormTableProps<T>) {
  if (data.length === 0) {
    return (
      <div
        className={cn(
          "flex min-h-[8rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center",
          className,
        )}
      >
        {emptyIcon ? (
          <span className="text-muted-foreground [&>svg]:size-8">
            {emptyIcon}
          </span>
        ) : null}
        <p className="text-sm text-muted-foreground">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "overflow-hidden rounded-2xl border border-border/60",
        className,
      )}
    >
      <Table>
        <TableHeader className="bg-muted/50">
          <TableRow>
            {columns.map((col) => (
              <TableHead
                key={String(col.accessorKey ?? col.header)}
                className={cn(
                  "h-10 text-xs font-semibold uppercase tracking-wider",
                  col.headerClassName,
                )}
              >
                {col.header}
              </TableHead>
            ))}
            {onDelete ? (
              <TableHead className="w-14 text-xs font-semibold uppercase tracking-wider">
                Aksi
              </TableHead>
            ) : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, idx) => (
            <TableRow
              key={keyExtractor(row, idx)}
              className="transition-colors hover:bg-muted/30 [&:nth-child(even)]:bg-muted/10"
            >
              {columns.map((col) => (
                <TableCell
                  key={String(col.accessorKey ?? col.header)}
                  className={cn("text-sm", col.className)}
                >
                  {col.cell
                    ? col.cell(row, idx)
                    : col.accessorKey
                      ? String(row[col.accessorKey] ?? "-")
                      : null}
                </TableCell>
              ))}
              {onDelete ? (
                <TableCell className="w-14">
                  <Button
                    type="button"
                    size="icon-sm"
                    variant="ghost"
                    onClick={() => onDelete(row)}
                    className="rounded-lg text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label="Hapus"
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
