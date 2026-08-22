import { useGetPrefixesListQuery } from "../services/prefix.queries";
import type { PrefixItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";
import { useDeletePrefix } from "../services/prefix.mutations";
import { useState } from "react";

export const usePrefixList = (
  search?: string,
  show?: "active" | "inactive" | "all",
  page = 1,
  limit = 25,
) => {
  // hooks for selected menu and delete confirmation dialog
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const [dialogMode, setDialogMode] = useState<
    "create" | "edit" | "readonly" | "closed"
  >("closed");
  const [editingId, setEditingId] = useState<string | null>(null);

  const prefixQuery = useGetPrefixesListQuery(
    { search, show, page, limit },
    { queryConfig: { enabled: true } },
  );
  const data = prefixQuery.data as UnwrappedPaginated<PrefixItem> | undefined;
  const prefixes = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPrefixes = pagination?.totalItems ?? 0;

  const deleteMutation = useDeletePrefix();

  const selectedPrefix =
    prefixes.find((prefix) => prefix.id === selectedId) || null;

  function openCreate() {
    setEditingId(null);
    setDialogMode("create");
  }
  function openEdit(prefixId: string) {
    setEditingId(prefixId);
    setDialogMode("edit");
  }
  function openReadonly(prefixId: string) {
    setEditingId(prefixId);
    setDialogMode("readonly");
  }
  function closeDialog() {
    setDialogMode("closed");
    setEditingId(null);
  }
  return {
    prefixes,
    pagination,
    totalPrefixes,
    isDeleting: deleteMutation.isPending,
    isRefreshing: prefixQuery.isFetching,
    isLoading: prefixQuery.isLoading,
    selectedPrefix,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    refetchPrefixes: prefixQuery.refetch,
    deletePrefix: async (prefixId: string) => {
      await deleteMutation.mutateAsync(prefixId);
    },

    openCreate,
    openEdit,
    openReadonly,
    closeDialog,
    dialogMode,
    editingId,
  };
};
