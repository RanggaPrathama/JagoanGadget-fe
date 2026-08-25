/**
 * One segment of a number format: which prefix occupies which position.
 * Mirrors backend `SegmentDto`.
 */
export type NumberFormatSegment = {
  /** UUID referencing a prefix master entry (admin/setup/prefix). */
  prefixId: string;
  /** Zero-based ordinal position within the generated number (0-based). */
  index: number;
};

/**
 * Single number-format row returned by `GET admin/number-formats`.
 *
 * @remarks SHAPE ASSUMED — backend DTO verified only for the create payload
 * (`CreateNumberFormatDto`: `menuId?`, `segments[1..20]`, `isActive?`).
 * Adjust here if the live response drifts (check during manual verification).
 */
export type NumberFormatItem = {
  /** Format UUID. */
  id: string;
  /** Linked menu UUID, or null when the format is not bound to a menu. Enforces 1 format per menu. */
  menuId?: string | null;
  /** Ordered segments composing the format (1..20 entries). */
  segments: NumberFormatSegment[];
  /** Whether this format is active. */
  isActive: boolean;
  /** Creation timestamp (ISO string) — assumed. */
  createdAt?: string;
  /** Last update timestamp (ISO string) — assumed. */
  updatedAt?: string;
};

/** Query params accepted by the list endpoint/service. */
export type NumberFormatListParams = {
  /** Optional search term matched server-side. */
  search?: string;
  /** 1-based page number. */
  page?: number;
  /** Page size (default 25). */
  limit?: number;
};

/**
 * AG Grid row model: item plus derived display fields.
 *
 * @remarks Derived in {@link ../hooks/useNumberFormatList | useNumberFormatList}.
 */
export type NumberFormatTableRow = NumberFormatItem & {
  /** Human-readable ordered segment slots, e.g. `"#1 #3"`. Empty string when no segments. */
  segmentsPreview: string;
  /** `"Aktif"` or `"Nonaktif"`. */
  isActiveLabel: string;
};
