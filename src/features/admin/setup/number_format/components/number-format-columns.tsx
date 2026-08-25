import type { ColDef } from "ag-grid-community";
import type { NumberFormatTableRow } from "../types";

/**
 * AG Grid column config for the number-format table.
 *
 * @remarks Read-only module: no action column. Prefix labels are not shown
 * because segments carry only `prefixId`; see `formatSegmentsPreview`.
 *
 * @returns array of column definitions (Segmen, Jumlah Segmen, Status).
 */
export function getNumberFormatColumns(): ColDef<NumberFormatTableRow>[] {
  return [
    {
      headerName: "Segmen",
      field: "segmentsPreview",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 220,
      flex: 2,
    },
    {
      headerName: "Jumlah Segmen",
      valueGetter: (params) => params.data?.segments?.length ?? 0,
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 140,
      flex: 1,
    },
    {
      headerName: "Status",
      field: "isActiveLabel",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 120,
      flex: 1,
    },
  ];
}
