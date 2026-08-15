import type { ColDef, ICellRendererParams } from "ag-grid-community";
import { format } from "date-fns";

import { Badge } from "@/components/ui/badge";
import type { UserEntity } from "../types";

// Returns column definitions for the AG Grid user table.
export function getUserColumns(): ColDef<UserEntity>[] {
  return [
    {
      field: "name",
      headerName: "User",
      minWidth: 260,
      filter: "agTextColumnFilter",
      floatingFilterComponentParams: {
        suppressFilterButton: true,
      },
      // Renders avatar + name + email for each row.
      cellRenderer: ({ data }: ICellRendererParams<UserEntity>) => {
        return data ? (
          <div className="flex h-full w-full items-center gap-2">
            {data.avatarUrl ? (
              <img
                src={data.avatarUrl}
                alt={data.name}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary">
                {data.name.charAt(0).toUpperCase()}
              </div>
            )}
            <div className="space-y-1 text-left">
              <p className="font-medium leading-none">{data.name}</p>
              <p className="text-xs text-muted-foreground">{data.email}</p>
            </div>
          </div>
        ) : null;
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
      cellRenderer: ({ value }: ICellRendererParams<UserEntity, boolean>) => (
        <Badge
          variant={value ? "secondary" : "outline"}
          className="rounded-full px-3 py-1"
        >
          {value ? "Active" : "Inactive"}
        </Badge>
      ),
      maxWidth: 140,
      filter: false,
    },
    {
      field: "isSuperadmin",
      headerName: "Role",
      cellRenderer: ({ value }: ICellRendererParams<UserEntity, boolean>) =>
        value ? (
          <Badge
            variant="default"
            className="rounded-full px-2 py-0.5 text-[10px]"
          >
            Superadmin
          </Badge>
        ) : null,
      maxWidth: 140,
      filter: false,
    },
    {
      field: "lastActiveAt",
      headerName: "Last Active",
      cellRenderer: ({ value }: { value: string | null }) =>
        value ? (
          <span>{format(new Date(value), "dd MMM yyyy, HH:mm")}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      minWidth: 180,
      filter: false,
    },
    {
      field: "createdAt",
      headerName: "Joined Date",
      cellRenderer: ({ value }: { value: string | null }) =>
        value ? (
          <span>{format(new Date(value), "dd MMM yyyy, HH:mm")}</span>
        ) : (
          <span className="text-muted-foreground">-</span>
        ),
      minWidth: 180,
      filter: false,
    },
  ];
}
