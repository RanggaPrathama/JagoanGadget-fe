import type { ColDef, ICellRendererParams } from "ag-grid-community";

import { StatusBadge } from "@/components/admin";
import type { ProductTableRow } from "../hooks/useProductList";

// AG Grid column config for the product table: name, category, brand, SKU count, and status.
export function getProductColumns(): ColDef<ProductTableRow>[] {
  return [
    {
      headerName: "Nama Produk",
      field: "name",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 220,
      flex: 2,
    },
    {
      headerName: "Kategori",
      field: "categoryLabel",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 160,
      flex: 1.2,
    },
    {
      headerName: "Brand",
      field: "brandLabel",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 140,
      flex: 1,
    },
    {
      headerName: "Jumlah SKU",
      field: "skuCount",
      filter: "agNumberColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 120,
      width: 130,
    },
    {
      headerName: "Status",
      field: "isActive",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterValueGetter: ({ data }) => (data?.isActive ? "Active" : "Inactive"),
      valueFormatter: ({ value }) => (value ? "Active" : "Inactive"),
      filterParams: { debounceMs: 250 },
      minWidth: 130,
      width: 130,
      cellRenderer: ({ value }: ICellRendererParams<ProductTableRow, boolean>) => (
        <StatusBadge status={value} />
      ),
    },
  ];
}
