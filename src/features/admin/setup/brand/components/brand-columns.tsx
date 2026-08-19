import type { ColDef } from "ag-grid-community";
import type { BrandItem } from "../types";

// AG Grid column config for the brand table: name + logo preview (image thumbnail).
export function getBrandColumns(): ColDef<BrandItem>[] {
  return [
    {
      headerName: "Nama Brand",
      field: "name",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 220,
      flex: 2,
    },
    {
      headerName: "Logo",
      field: "logoUrl",
      filter: false,
      sortable: false,
      minWidth: 120,
      width: 120,
      cellRenderer: ({ value }: { value: string | null }) =>
        value ? (
          <img
            src={value}
            alt="logo"
            className="h-9 w-9 rounded-lg border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];
}
