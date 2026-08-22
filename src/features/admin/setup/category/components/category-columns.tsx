import type { ColDef } from "ag-grid-community";
import type { CategoryTableRow } from "../hooks/useCategoryList";

// AG Grid column config for the category table: name, slug, parent.
export function getCategoryColumns(): ColDef<CategoryTableRow>[] {
  return [
    {
      headerName: "Nama Kategori",
      field: "name",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 220,
      flex: 2,
    },
    {
      headerName: "Slug",
      field: "slug",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 200,
      flex: 1.5,
    },
    {
      headerName: "Parent",
      field: "parentLabel",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 180,
      flex: 1,
    },
  ];
}
