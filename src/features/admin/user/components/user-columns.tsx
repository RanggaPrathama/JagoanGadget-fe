import type { ColDef } from "ag-grid-community";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import type { UserEntity } from "../types";

function NameCellRenderer(params: { data: UserEntity }) {
  return (
    // align content center horizontally and vertically
    <div className="flex h-full w-full items-center gap-2">
      {params.data.avatarUrl ? (
        <img
          src={params.data.avatarUrl}
          alt={params.data.name}
          className="h-8 w-8 rounded-full object-cover"
        />
      ) : (
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
          {params.data.name.charAt(0).toUpperCase()}
        </div>
      )}
      <div className="space-y-1 text-left">
        <p className="font-medium leading-none">{params.data.name}</p>
        <p className="text-xs text-muted-foreground">{params.data.email}</p>
      </div>
    </div>
  );
}

function StatusCellRenderer(params: { data: UserEntity }) {
  return (
    <Badge
      variant={params.data.isActive ? "secondary" : "outline"}
      className="rounded-full px-3 py-1"
    >
      {params.data.isActive ? "Active" : "Inactive"}
    </Badge>
  );
}

function SuperadminCellRenderer(params: { data: UserEntity }) {
  return params.data.isSuperadmin ? (
    <Badge variant="default" className="rounded-full px-2 py-0.5 text-[10px]">
      Superadmin
    </Badge>
  ) : null;
}

function DateCellRenderer(params: { value: string | null }) {
  if (!params.value) return <span className="text-muted-foreground">-</span>;
  return <span>{format(new Date(params.value), "dd MMM yyyy, HH:mm")}</span>;
}

export const userColumns: ColDef<UserEntity>[] = [
  {
    field: "name",
    headerName: "User",
    cellRenderer: NameCellRenderer,
    minWidth: 260,
    filter: "agTextColumnFilter",
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
  {
    field: "phoneNumber",
    headerName: "Phone Number",
    minWidth: 160,
    filter: "agTextColumnFilter",
    floatingFilterComponentParams: {
      suppressFilterButton: true,
    },
  },
  {
    field: "isActive",
    headerName: "Status",
    cellRenderer: StatusCellRenderer,
    maxWidth: 140,
    filter: false, // Could be boolean filter
  },
  {
    field: "isSuperadmin",
    headerName: "Role",
    cellRenderer: SuperadminCellRenderer,
    maxWidth: 140,
    filter: false,
  },
  {
    field: "lastActiveAt",
    headerName: "Last Active",
    cellRenderer: DateCellRenderer,
    minWidth: 180,
    filter: false,
  },
  {
    field: "createdAt",
    headerName: "Joined Date",
    cellRenderer: DateCellRenderer,
    minWidth: 180,
    filter: false,
  },
];
