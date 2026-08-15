import type { ColDef, ICellRendererParams } from "ag-grid-community";

import { StatusBadge } from "@/components/data-table";
import type { MenuTableRow } from "../hooks/useMenuList";

// Define AG Grid column config for the menu table: name, code, route, type, status (with StatusBadge), plus commented-out icon/sortOrder/parent columns.
export function getMenuColumns(): ColDef<MenuTableRow>[] {
  return [
    {
      headerName: "Nama Menu",
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
      headerName: "Code",
      field: "code",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: {
        debounceMs: 250,
      },
      minWidth: 180,
      flex: 1.1,
    },
    {
      headerName: "Route",
      field: "route",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: {
        debounceMs: 250,
      },
      minWidth: 240,
      flex: 1.4,
    },
    {
      headerName: "Type",
      field: "type",
      filter: "agSetColumnFilter",
      floatingFilter: true,
      filterParams: {
        suppressMiniFilter: true,
      },
      minWidth: 140,
      width: 140,
    },
    // {
    //   headerName: "Icon",
    //   field: "icon",
    //   filter: "agTextColumnFilter",
    //   floatingFilter: true,
    //   filterParams: {
    //     debounceMs: 250,
    //   },
    //   minWidth: 180,
    //   flex: 0.9,
    // },
    // {
    //   headerName: "Urutan",
    //   field: "sortOrder",
    //   filter: "agNumberColumnFilter",
    //   floatingFilter: true,
    //   filterParams: {
    //     debounceMs: 250,
    //   },
    //   minWidth: 120,
    //   width: 120,
    // },
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
      cellRenderer: ({ value }: ICellRendererParams<MenuTableRow, boolean>) => (
        <StatusBadge status={value} />
      ),
    },
    // {
    //   headerName: "Parent Menu",
    //   field: "parentLabel",
    //   filter: "agSetColumnFilter",
    //   floatingFilter: true,
    //   filterParams: {
    //     suppressMiniFilter: true,
    //   },
    //   minWidth: 180,
    //   flex: 0.9,
    // },
  ];
}
