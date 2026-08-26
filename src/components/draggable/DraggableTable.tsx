import * as React from "react";
import {
  closestCenter,
  DndContext,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
  type SortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

import { TableBody, TableCell, TableRow } from "@/components/ui/table";
import { cn } from "@/utils/cn";

// ---------------------------------------------------------------------------
// DraggableTable (Provider)
// ---------------------------------------------------------------------------

export type DraggableTableProps<T> = {
  /** The ordered items array. */
  items: T[];
  /** Called with the new array after a drag ends. */
  onReorder: (items: T[]) => void;
  /** Extract a unique key from each item. */
  getKey: (item: T) => string | number;
  /** Sorting strategy. Default: verticalListSortingStrategy. */
  strategy?: SortingStrategy;
  /** Collision detection algorithm. Default: closestCenter. */
  collisionDetection?: CollisionDetection;
  children: React.ReactNode;
};

function DraggableTable<T>({
  items,
  onReorder,
  getKey,
  strategy = verticalListSortingStrategy,
  collisionDetection = closestCenter,
  children,
}: DraggableTableProps<T>) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const keys = React.useMemo(() => items.map(getKey), [items, getKey]);

  const handleDragEnd = React.useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      if (!over || active.id === over.id) return;

      const oldIndex = items.findIndex((item) => getKey(item) === active.id);
      const newIndex = items.findIndex((item) => getKey(item) === over.id);
      if (oldIndex === -1 || newIndex === -1) return;

      onReorder(arrayMove(items, oldIndex, newIndex));
    },
    [items, getKey, onReorder],
  );

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragEnd={handleDragEnd}
    >
      <SortableContext items={keys} strategy={strategy}>
        {children}
      </SortableContext>
    </DndContext>
  );
}

// ---------------------------------------------------------------------------
// DraggableTableBody
// ---------------------------------------------------------------------------

type DraggableTableBodyProps = React.ComponentProps<typeof TableBody>;

function DraggableTableBody({ className, ...props }: DraggableTableBodyProps) {
  return <TableBody className={cn(className)} {...props} />;
}

// ---------------------------------------------------------------------------
// DraggableRow
// ---------------------------------------------------------------------------

export type DraggableRowProps = {
  /** Unique sortable ID — must match the key used in DraggableTable's getKey. */
  id: string | number;
  /** Row cell content (cells only — the drag handle cell is added automatically). */
  children: React.ReactNode;
  /** Hide the drag handle when true (e.g. in readonly mode). */
  disabled?: boolean;
  className?: string;
};

function DraggableRow({
  id,
  children,
  disabled = false,
  className,
}: DraggableRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <TableRow
      ref={setNodeRef}
      style={style}
      className={cn(
        "group",
        isDragging && "z-50 bg-muted/50 opacity-50",
        className,
      )}
    >
      {/* Drag handle cell */}
      <TableCell className="w-10">
        {!disabled && (
          <button
            type="button"
            className="cursor-grab touch-none text-muted-foreground hover:text-foreground active:cursor-grabbing"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-4" />
          </button>
        )}
      </TableCell>

      {/* Consumer content */}
      {children}
    </TableRow>
  );
}

export { DraggableTable, DraggableTableBody, DraggableRow, TableCell };
