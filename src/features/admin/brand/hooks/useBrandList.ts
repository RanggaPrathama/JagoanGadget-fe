import { useState } from "react";
import { useDeleteBrand } from "../service/brand.mutations";
import { useGetBrandsListQuery } from "../service/brand.queries";
import type { BrandItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

// Hook: fetch, shape, and manage the brand list table data + delete mutation + dialog mode.
export function useBrandList(
  search?: string,
  page = 1,
  limit = 25,
) {
  const brandQuery = useGetBrandsListQuery(
    { search, page, limit },
    { queryConfig: { enabled: true } },
  );
  const deleteMutation = useDeleteBrand();

  const data = brandQuery.data as UnwrappedPaginated<BrandItem> | undefined;
  const rawBrands = data?.items ?? [];
  const pagination = data?.pagination;
  const totalBrands = pagination?.totalItems ?? 0;

  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "readonly" | "closed">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedBrand = rawBrands.find((b) => b.id === selectedId) ?? null;

  function openCreate() {
    setEditingId(null);
    setDialogMode("create");
  }
  function openEdit(brandId: string) {
    setEditingId(brandId);
    setDialogMode("edit");
  }
  function openReadonly(brandId: string) {
    setEditingId(brandId);
    setDialogMode("readonly");
  }
  function closeDialog() {
    setDialogMode("closed");
    setEditingId(null);
  }

  return {
    brands: rawBrands,
    totalBrands,
    pagination,
    isLoading: brandQuery.isLoading,
    isRefreshing: brandQuery.isFetching,
    isDeleting: deleteMutation.isPending,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedBrand,
    dialogMode,
    editingId,
    openCreate,
    openEdit,
    openReadonly,
    closeDialog,
    refetchBrands: async () => {
      await brandQuery.refetch();
    },
    deleteBrand: async (brandId: string) => {
      await deleteMutation.mutateAsync(brandId);
    },
  };
}
