import { useState } from "react";
import { useDeleteProduct } from "../service/product.mutations";
import { useGetProductsListQuery } from "../service/product.queries";
import type { ProductItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

export type ProductTableRow = ProductItem & {
  /** Display label for the category column — "—" when the category is null. */
  categoryLabel: string;
  /** Display label for the brand column — "—" when the brand is null. */
  brandLabel: string;
  /** Number of SKUs/variants attached to the product. */
  skuCount: number;
};

// Format a numeric(19,2) string price into a compact label (IDR). No decimals for whole values.
function formatPrice(value?: string): string | null {
  if (!value) return null;
  const num = Number(value);
  if (Number.isNaN(num)) return null;
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(num);
}

// Hook: fetch, shape, and manage the product list table data + delete mutation.
export function useProductList(
  search?: string,
  show?: "active" | "inactive" | "all",
  page = 1,
  limit = 25,
) {
  const showParam = show === "all" ? undefined : show;

  const productQuery = useGetProductsListQuery(
    { search, show: showParam, page, limit },
    { queryConfig: { enabled: true } },
  );

  // Selection + delete confirmation state.
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const deleteMutation = useDeleteProduct();

  const data = productQuery.data as UnwrappedPaginated<ProductItem> | undefined;
  const rawProducts = data?.items ?? [];
  const pagination = data?.pagination;
  const totalProducts = pagination?.totalItems ?? 0;

  // Map API rows to table rows with derived display labels + SKU count.
  const products: ProductTableRow[] = rawProducts.map((product) => ({
    ...product,
    isActive: product.isActive ?? true,
    categoryLabel: product.category?.name?.trim() ? product.category.name : "—",
    brandLabel: product.brand?.name?.trim() ? product.brand.name : "—",
    skuCount: product.skus?.length ?? 0,
  }));

  const selectedProduct = products.find((p) => p.id === selectedId) ?? null;

  return {
    products,
    totalProducts,
    pagination,
    isLoading: productQuery.isLoading,
    isRefreshing: productQuery.isFetching,
    isDeleting: deleteMutation.isPending,
    selectedId,
    setSelectedId,
    confirmDeleteId,
    setConfirmDeleteId,
    selectedProduct,
    refetchProducts: async () => {
      await productQuery.refetch();
    },
    deleteProduct: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}

export { formatPrice };
