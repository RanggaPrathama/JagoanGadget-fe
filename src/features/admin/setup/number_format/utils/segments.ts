import type { NumberFormatSegment } from "../types";

/**
 * Return a NEW array of segments sorted by `index` ascending (stable).
 *
 * @param segments - segments in any order; never mutated.
 * @returns sorted copy; `[]` when input is empty.
 */
export function sortSegmentsByIndex(
  segments: NumberFormatSegment[],
): NumberFormatSegment[] {
  return [...segments].sort((a, b) => a.index - b.index);
}

/**
 * Build a compact ordered preview of segment positions,
 * e.g. `[{index: 2}, {index: 0}]` → `"#1 #3"`.
 *
 * @remarks Shows occupied ordinal slots because prefix LABELS are not
 * resolvable client-side (segments carry only `prefixId`). If the backend
 * later embeds a prefix code/label on each segment, map to those here —
 * this function is the single change point.
 *
 * @param segments - segments in any order; duplicates allowed by backend.
 * @returns slot tokens joined by a single space; `""` when empty.
 */
export function formatSegmentsPreview(
  segments: NumberFormatSegment[],
): string {
  return sortSegmentsByIndex(segments)
    .map((segment) => `#${segment.index + 1}`)
    .join(" ");
}

/**
 * Resolve each segment's prefix value and concatenate into a preview string.
 * Falls back to `#N` position tokens when a prefix is not in the map.
 *
 * @param segments - segments in any order
 * @param prefixMap - map of prefixId → { value } for resolving display values
 * @returns concatenated preview string, e.g. `"INV/2024/001"`
 */
export function resolveSegmentsPreview(
  segments: NumberFormatSegment[],
  prefixMap: Map<string, { value: string }>,
): string {
  return sortSegmentsByIndex(segments)
    .map((s) => prefixMap.get(s.prefixId)?.value ?? `#${s.index + 1}`)
    .join("");
}
