import type { ColDef, ICellRendererParams } from "ag-grid-community";

import { StatusBadge } from "@/components/data-table";
import type { PrefixItem } from "../types";

export const getPrefixColumns = (): ColDef<PrefixItem>[] => {
  return [
    {
      headerName: "Nama Prefix",
      field: "name",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: {
        debounceMs: 250,
      },
      minWidth: 250,
      flex: 1.5,
    },
    {
      headerName: "Value Prefix",
      field: "value",
      minWidth: 250,
      flex: 1.5,
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
      cellRenderer: ({ value }: ICellRendererParams<PrefixItem, boolean>) => (
        <StatusBadge status={value} />
      ),
    },
  ];
};
