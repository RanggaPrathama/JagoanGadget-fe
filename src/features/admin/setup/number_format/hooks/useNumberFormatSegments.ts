import { useCallback, useEffect, useMemo, useSyncExternalStore, useState } from "react";
import { useQueries } from "@tanstack/react-query";

import type { PrefixItem } from "@/features/admin/setup/prefix/types";
import { getPrefixByIdQueryOptions } from "@/features/admin/setup/prefix/services";
import { resolveSegmentsPreview } from "../utils/segments";
import type { NumberFormatSegment } from "../types";

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

/* eslint-disable @typescript-eslint/no-explicit-any -- TanStack Form generics are too complex to type narrowly */
function useNumberFormatSegments({ form }: { form: any }) {
  // User-selected prefixes (from ButtonSelect dialog)
  const [selectedPrefixes, setSelectedPrefixes] = useState<PrefixItem[]>([]);

  // --- Reactive segments from form store (no deprecated useStore) ---
  const segments: NumberFormatSegment[] = useSyncExternalStore(
    (listener) => form.store.subscribe(listener),
    () => form.store.get().values.segments,
  );

  // --- Proactively fetch prefix details for edit mode (unknown prefixIds) ---
  const missingPrefixIds = useMemo(() => {
    const selectedIds = new Set(selectedPrefixes.map((p) => p.id));
    return segments
      .filter((s) => !selectedIds.has(s.prefixId))
      .map((s) => s.prefixId);
  }, [segments, selectedPrefixes]);

  const prefixQueries = useQueries({
    queries: missingPrefixIds.map((id) => getPrefixByIdQueryOptions(id)),
  });

  // --- Derived prefixMap: merge selected + queried (no setState in effect) ---
  const prefixMap = useMemo(() => {
    const map = new Map<string, PrefixItem>();

    // 1. User selections
    for (const item of selectedPrefixes) {
      map.set(item.id, item);
    }

    // 2. Query results (edit mode seeding)
    for (const q of prefixQueries) {
      if (q.isSuccess && q.data) {
        const item = q.data as PrefixItem;
        if (!map.has(item.id)) {
          map.set(item.id, item);
        }
      }
    }

    return map;
  }, [selectedPrefixes, prefixQueries]);

  // --- Preview computation ---
  const preview = useMemo(
    () => resolveSegmentsPreview(segments, prefixMap),
    [segments, prefixMap],
  );

  // --- Sync preview back to form field (external system sync — allowed) ---
  useEffect(() => {
    form.setFieldValue("preview", preview);
  }, [form, preview]);

  // --- Handlers ---
  const handlePrefixesAdded = useCallback((items: PrefixItem[]) => {
    setSelectedPrefixes((prev) => {
      const existing = new Set(prev.map((p) => p.id));
      const newItems = items.filter((item) => !existing.has(item.id));
      return newItems.length > 0 ? [...prev, ...newItems] : prev;
    });
  }, []);

  const handleSegmentsChange = useCallback(
    (newSegments: NumberFormatSegment[]) => {
      form.setFieldValue("segments", newSegments);
    },
    [form],
  );

  return {
    segments,
    prefixMap,
    preview,
    handlePrefixesAdded,
    handleSegmentsChange,
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export { useNumberFormatSegments };
