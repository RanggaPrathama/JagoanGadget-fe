import { useState } from "react";
import { useDeleteCategory } from "../service/category.mutations";
import { useGetCategoriesListQuery } from "../service/category.queries";
import type { CategoryItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

export type CategoryTableRow = CategoryItem & {
  parentLabel: string;
};

// Resolve the parent category label for a row: prefers the embedded parent object,
// then parentName, then a lookup by parentId (like menu's resolveParentLabel).
function resolveParentLabel(
  category: CategoryItem,
  map: Map<string, CategoryItem>,
): string {
  if (category.parent?.name) return category.parent.name;
  if (category.parentName) return category.parentName;
  if (category.parentId) return map.get(category.parentId)?.name ?? "-";
  return "-";
}

// Hook: fetch, shape, and manage the category list table data + delete + dialog mode + parent options.
export function useCategoryList(search?: string, page = 1, limit = 25) {
  const categoryQuery = useGetCategoriesListQuery(
    { search, page, limit },
    { queryConfig: { enabled: true } },
  );
  const deleteMutation = useDeleteCategory();

  const data = categoryQuery.data as UnwrappedPaginated<CategoryItem> | undefined;
  const rawCategories = data?.items ?? [];
  const pagination = data?.pagination;
  const totalCategories = pagination?.totalItems ?? 0;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "readonly" | "closed">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);

  const categoryMap = new Map(rawCategories.map((c) => [c.id, c]));
  const categories: CategoryTableRow[] = rawCategories.map((c) => ({
    ...c,
    parentLabel: resolveParentLabel(c, categoryMap),
  }));

  const selectedCategory = categories.find((c) => c.id === selectedId) ?? null;

  const parentOptions = [
    { label: "Tidak Ada", value: "" },
    ...rawCategories.map((c) => ({ label: c.name, value: c.id })),
  ];

  function openCreate() {
    setEditingId(null);
    setDialogMode("create");
  }
  function openEdit(categoryId: string) {
    setEditingId(categoryId);
    setDialogMode("edit");
  }
  function openReadonly(categoryId: string) {
    setEditingId(categoryId);
    setDialogMode("readonly");
  }
  function closeDialog() {
    setDialogMode("closed");
    setEditingId(null);
  }

  return {
    categories,
    totalCategories,
    pagination,
    isLoading: categoryQuery.isLoading,
    isRefreshing: categoryQuery.isFetching,
    isDeleting: deleteMutation.isPending,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedCategory,
    dialogMode,
    editingId,
    parentOptions,
    openCreate,
    openEdit,
    openReadonly,
    closeDialog,
    refetchCategories: async () => {
      await categoryQuery.refetch();
    },
    deleteCategory: async (categoryId: string) => {
      await deleteMutation.mutateAsync(categoryId);
    },
  };
}
