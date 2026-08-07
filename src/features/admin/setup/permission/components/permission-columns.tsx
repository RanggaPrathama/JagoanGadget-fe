import type { ColDef } from "ag-grid-community";
import type { PermissionItem } from "../service/permission.service";

export function getPermissionColumns(): ColDef<PermissionItem>[] {
  return [
    {
      headerName: "Menu",
      field: "menu.name",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 180,
      flex: 0.9,
      valueFormatter: ({ value }) => value ?? "-",
    },
    {
      headerName: "Nama Permission",
      field: "name",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 220,
      flex: 1.1,
    },
    {
      headerName: "Code",
      field: "code",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 200,
      flex: 1,
    },
    {
      headerName: "Deskripsi",
      field: "description",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 280,
      flex: 1.2,
      valueFormatter: ({ value }) => value ?? "-",
    },
  ];
}
