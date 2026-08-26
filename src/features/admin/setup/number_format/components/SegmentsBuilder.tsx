import { Hash, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ButtonSelect } from "@/components/button";
import {
  DraggableTable,
  DraggableTableBody,
  DraggableRow,
  TableCell,
} from "@/components/draggable";
import {
  Table,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getPrefixesList } from "@/features/admin/setup/prefix/services/prefix.service";
import type { PrefixItem } from "@/features/admin/setup/prefix/types";
import { sortSegmentsByIndex } from "../utils/segments";
import type { NumberFormatSegment } from "../types";

type SegmentsBuilderProps = {
  segments: NumberFormatSegment[];
  prefixMap: Map<string, PrefixItem>;
  readonly?: boolean;
  onSegmentsChange: (segments: NumberFormatSegment[]) => void;
  onPrefixesAdded: (items: PrefixItem[]) => void;
};

const MAX_SEGMENTS = 20;

function SegmentsBuilder({
  segments,
  prefixMap,
  readonly = false,
  onSegmentsChange,
  onPrefixesAdded,
}: SegmentsBuilderProps) {
  // Sorted segments for display
  const sortedSegments = sortSegmentsByIndex(segments);
  const segmentIds = sortedSegments.map((s) => s.prefixId);

  // --- Reorder handler (called by DraggableTable after drag) ---
  const handleReorder = (reordered: NumberFormatSegment[]) => {
    onSegmentsChange(reordered.map((s, i) => ({ ...s, index: i })));
  };

  // --- ButtonSelect onChange: detect newly added prefixes ---
  const handlePrefixSelect = (_ids: string[], items: PrefixItem[]) => {
    const currentIds = new Set(segments.map((s) => s.prefixId));
    const added = items.filter((item) => !currentIds.has(item.id));

    if (added.length === 0) return;

    // Check max limit
    if (segments.length + added.length > MAX_SEGMENTS) {
      // TODO: toast warning
      return;
    }

    const nextIndex =
      segments.length > 0
        ? Math.max(...segments.map((s) => s.index)) + 1
        : 0;

    const newSegments: NumberFormatSegment[] = added.map((item, i) => ({
      prefixId: item.id,
      index: nextIndex + i,
    }));

    onPrefixesAdded(items);
    onSegmentsChange([...segments, ...newSegments]);
  };

  // --- Remove handler ---
  const handleRemove = (prefixId: string) => {
    const remaining = segments.filter((s) => s.prefixId !== prefixId);
    const reindexed = remaining.map((s, i) => ({ ...s, index: i }));
    onSegmentsChange(reindexed);
  };

  return (
    <div className="flex flex-col gap-4">
      {/* ButtonSelect trigger */}
      {!readonly && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            {segments.length > 0
              ? `${segments.length} / ${MAX_SEGMENTS} segmen`
              : "Belum ada segmen"}
          </p>
          <ButtonSelect<PrefixItem>
            triggerText="Pilih Prefix"
            title="Pilih Prefix untuk Segmen"
            queryKey={["prefixes"]}
            queryFn={({ search, page, limit }) =>
              getPrefixesList({ search, show: "active", page, limit })
            }
            columns={[
              { header: "Name", accessorKey: "name" },
              { header: "Value", accessorKey: "value" },
              { header: "Type", accessorKey: "type" },
            ]}
            getRowId={(row) => row.id}
            value={segmentIds}
            onChange={handlePrefixSelect}
            emptyMessage="Tidak ada prefix aktif"
            limit={10}
          />
        </div>
      )}

      {/* Table or empty state */}
      {sortedSegments.length === 0 ? (
        <div className="flex min-h-[8rem] flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-border/70 bg-muted/20 p-6 text-center">
          <Hash className="size-8 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {readonly
              ? "Tidak ada segmen untuk number format ini."
              : 'Klik "Pilih Prefix" untuk menambahkan segmen.'}
          </p>
        </div>
      ) : (
        <div className="rounded-xl border border-border/70">
          <DraggableTable
            items={sortedSegments}
            onReorder={handleReorder}
            getKey={(s) => s.prefixId}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10" />
                  <TableHead className="w-20">Index</TableHead>
                  <TableHead>Nama Prefix</TableHead>
                  <TableHead>Value</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead className="w-16">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <DraggableTableBody>
                {sortedSegments.map((segment, i) => {
                  const prefix = prefixMap.get(segment.prefixId);
                  if (!prefix) return null;

                  return (
                    <DraggableRow
                      key={segment.prefixId}
                      id={segment.prefixId}
                      disabled={readonly}
                    >
                      <TableCell className="w-20">
                        <span className="flex size-7 items-center justify-center rounded-lg border border-primary/15 bg-primary/10 text-xs font-bold text-primary">
                          #{i + 1}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-semibold text-foreground">
                          {prefix.name}
                        </span>
                      </TableCell>
                      <TableCell>
                        <span className="font-mono text-sm text-muted-foreground">
                          {prefix.value}
                        </span>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="capitalize">
                          {prefix.type}
                        </Badge>
                      </TableCell>
                      <TableCell className="w-16">
                        {!readonly && (
                          <Button
                            type="button"
                            size="icon"
                            variant="ghost"
                            onClick={() => handleRemove(segment.prefixId)}
                            className="rounded-lg p-1.5 text-destructive opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </TableCell>
                    </DraggableRow>
                  );
                })}
              </DraggableTableBody>
            </Table>
          </DraggableTable>
        </div>
      )}
    </div>
  );
}

export { SegmentsBuilder };
