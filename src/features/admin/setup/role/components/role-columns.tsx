import type { ColDef, ICellRendererParams } from "ag-grid-community";

import { StatusBadge } from "@/components/data-table";
import type { RoleItem } from "../service/role.service";

export function getRoleColumns(): ColDef<RoleItem>[] {
  return [
    {
      headerName: "Nama Role",
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
      minWidth: 180,
      flex: 0.9,
    },
    {
      headerName: "Permissions",
      field: "rolePermissions",
      filter: false,
      sortable: false,
      minWidth: 150,
      width: 150,
      valueFormatter: ({ value }) =>
        Array.isArray(value) ? `${value.length} Permissions` : "0 Permissions",
    },

    {
      headerName: "Status",
      field: "isActive",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterValueGetter: ({ data }) =>
        (data?.isActive ?? true) ? "Active" : "Inactive",
      valueFormatter: ({ value }) => ((value ?? true) ? "Active" : "Inactive"),
      filterParams: {
        debounceMs: 250,
      },
      minWidth: 140,
      width: 140,
      cellRenderer: ({ value }: ICellRendererParams<RoleItem, boolean>) => (
        <StatusBadge status={value ?? true} />
      ),
    },
    {
      headerName: "Deskripsi",
      field: "description",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 260,
      flex: 1.2,
      valueFormatter: ({ value }) => value ?? "-",
    },
  ];
}
