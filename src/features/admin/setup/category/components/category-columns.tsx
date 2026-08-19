import type { ColDef } from "ag-grid-community";
import type { CategoryItem } from "../types";

function resolveParentLabel(category: CategoryItem, map: Map<string, CategoryItem>): string {
  if (category.parent?.name) return category.parent.name;
  if (category.parentName) return category.parentName;
  if (category.parentId) return map.get(category.parentId)?.name ?? "-";
  return "-";
}

// AG Grid column config for the category table: name, slug, parent.
export function getCategoryColumns(): ColDef<CategoryItem>[] {
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
      colId: "parentLabel",
      valueGetter: (params) => {
        const data = params.data as CategoryItem | undefined;
        if (!data) return "-";
        const map = new Map<string, CategoryItem>();
        return resolveParentLabel(data, map);
      },
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 180,
      flex: 1,
    },
  ];
}
