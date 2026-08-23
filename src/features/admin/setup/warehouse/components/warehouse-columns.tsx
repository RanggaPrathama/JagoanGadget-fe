import type { ColDef, ICellRendererParams } from "ag-grid-community";

import { StatusBadge } from "@/components/data-table";
import type { WarehouseTableRow } from "../hooks/useWarehouseList";

// Define AG Grid column config for the warehouse table: code, name, address, and status (with StatusBadge).
export function getWarehouseColumns(): ColDef<WarehouseTableRow>[] {
  return [
    {
      headerName: "Code",
      field: "code",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: {
        debounceMs: 250,
      },
      minWidth: 160,
      flex: 1,
    },
    {
      headerName: "Name",
      field: "name",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: {
        debounceMs: 250,
      },
      minWidth: 220,
      flex: 1.6,
    },
    {
      headerName: "Address",
      field: "addressLabel",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: {
        debounceMs: 250,
      },
      minWidth: 240,
      flex: 1.8,
    },
    {
      headerName: "Status",
      field: "isActive",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterValueGetter: ({ data }) => (data?.isActive ? "Active" : "Inactive"),
      valueFormatter: ({ value }) => (value ? "Active" : "Inactive"),
      filterParams: {
        debounceMs: 250,
      },
      minWidth: 140,
      width: 140,
      cellRenderer: ({ value }: ICellRendererParams<WarehouseTableRow, boolean>) => (
        <StatusBadge status={value} />
      ),
    },
  ];
}
