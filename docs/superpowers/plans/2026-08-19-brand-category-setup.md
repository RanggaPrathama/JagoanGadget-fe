# Brand & Category Setup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Tambah dua fitur setup admin — Brand (name + logo) dan Category (name + slug + parent) — dengan list-view tunggal dan form yang diedit lewat **modal dialog** (bukan halaman terpisah), mengikuti pola yang sudah ada di `src/features/admin/setup/menu`.

**Architecture:** Setiap fitur pakai struktur folder `views/`, `hooks/`, `types/`, `service/` (split `*.service.ts`, `*.queries.ts`, `*.mutations.ts`, `index.ts`) persis seperti `menu`. Bedanya: tidak ada route `/create` & `/$id/edit`; form dirender sebagai Radix `Dialog` di dalam `XxxListView` sendiri, dibuka lewat state lokal `dialogMode` (`create` | `edit` | `readonly` | `closed`). Mutasi create/update memanggil `invalidateXQueries` (brand/category bukan access-control tree, jadi **tidak** panggil `invalidateMe`). Brand logo pakai `FieldUpload` (value = `tempKey` string|null, `previewUrl` = `logoUrl` committed). Category slug di-generate client-side lewat util `slugify` (TDD vitest).

**Tech Stack:** React 19, TanStack Router v1, TanStack Query v4, TanStack Form, Radix UI Dialog, AG Grid, shadcn/ui (radix-maia), Zod, lucide-react, vitest (untuk `slugify` saja).

**Spec:** `src/features/admin/setup/menu` (reference pattern — baca sebelum kerjakan task apa pun). Entity backend:
- `brands`: `{ name: string(150), logoUrl: string(512)|null }`
- `categories`: `{ name: string(150), slug: string(150) unique, parentId: uuid|null → self-ref CategoryEntity, children: CategoryEntity[] }`

## Global Constraints

- Path alias `@/` → `./src/`. Selalu impor via `@/...`, bukan relative panjang.
- TypeScript strict aktif (`tsc -b` di `pnpm build`). Tidak ada `any` tanpa `// eslint-disable`.
- TanStack Query v4: hook service pakai `queryOptions`, `useQuery`, `useMutation` dari `@tanstack/react-query`. Invalidate pakai `queryClient.invalidateQueries({ queryKey })`.
- Toast error/sukses via `sonner` (`toast.success` / `toast.error`). Ambil pesan server via `getErrorMessage(error, fallback)` dari `@/utils/error`.
- axios instance `api` dari `@/lib/axios` (baseURL `config.apiBaseUrl`, `withCredentials: true`). Unwrap via `unwrapData` / `unwrapPaginated` dari `@/lib/api-response`.
- API endpoint: `admin/brands`, `admin/categories` (list paginasi, create POST, update PUT `/:id`, delete DELETE `/:id`).
- Permission code base: Brand = `setup.brand`, Category = `setup.category`. Action digate via `ActionButton permission={`${base}.create|.update|.delete`}` dan `RowActions basePermissionCode={base}`.
- Route guard: setiap route pake `beforeLoad: requireAdminPageAccess` dari `@/lib/auth`.
- Tidak ada test runner utama di repo kecuali vitest untuk `slugify` (ditambahkan di Task 6). Verifikasi fitur = `pnpm lint` + `pnpm build`.
- Base entity `BaseEntity` menyediakan `id` (uuid) + timestamp. Type frontend `BrandItem`/`CategoryItem` asumsikan punya `id: string` dan field sesuai entity.

---

## File Structure

### Brand fitur — `src/features/admin/setup/brand/`
- `types/index.ts` — `BrandItem`, `BrandPayload`, `BrandDialogMode`.
- `service/brand.service.ts` — `getBrandsList`, `getBrandById`, `createBrand`, `updateBrand`, `deleteBrand`.
- `service/brand.queries.ts` — `brandListQueryKey`, `getBrandsListQueryOptions`, `useGetBrandsListQuery`, `invalidateBrandQueries`.
- `service/brand.mutations.ts` — `useCreateBrand`, `useUpdateBrand`, `useDeleteBrand`.
- `service/index.ts` — re-export semua di atas.
- `hooks/useBrandList.ts` — fetch + shape + delete + dialog state.
- `hooks/useBrandForm.ts` — form state (TanStack Form + Zod), create/update mutation, edit-load.
- `components/brand-columns.tsx` — `getBrandColumns()`.
- `views/BrandListView.tsx` — list + search + toolbar + AG Grid + `BrandFormDialog` + `ConfirmDialog`.
- `views/BrandFormDialog.tsx` — Radix `Dialog` berisi form fields (name + logo upload).
- `index.ts` — export `BrandListView`.

### Category fitur — `src/features/admin/setup/category/`
- `types/index.ts` — `CategoryItem`, `CategoryPayload`, `CategoryDialogMode`.
- `service/category.service.ts` — `getCategoriesList`, `getCategoryById`, `createCategory`, `updateCategory`, `deleteCategory`.
- `service/category.queries.ts` — `categoryListQueryKey`, `getCategoriesListQueryOptions`, `useGetCategoriesListQuery`, `invalidateCategoryQueries`.
- `service/category.mutations.ts` — `useCreateCategory`, `useUpdateCategory`, `useDeleteCategory`.
- `service/index.ts` — re-export.
- `hooks/useCategoryList.ts` — fetch + shape + delete + dialog + parent options.
- `hooks/useCategoryForm.ts` — form state + zod + auto-slugify + create/update + edit-load.
- `components/category-columns.tsx` — `getCategoryColumns()` (name, slug, parentLabel, status).
- `views/CategoryListView.tsx` — list + search + status filter + AG Grid + `CategoryFormDialog` + `ConfirmDialog`.
- `views/CategoryFormDialog.tsx` — Dialog berisi name, slug (auto), parent select.
- `index.ts` — export `CategoryListView`.

### Shared / util
- `src/lib/slugify.ts` — `slugify(input: string): string` (TDD, Task 6).
- `src/lib/slugify.test.ts` — vitest.
- `vitest.config.ts` + `vitest` devDep (Task 6).
- `src/routes/admin/setup/brand/index.tsx` — route baru.
- `src/routes/admin/category/index.tsx` — **ubah** import `Category` dari `@/features/admin/setup/category` (ganti dari `@/features/admin/category` lama yang kosong).
- Hapus `src/features/admin/category/` lama (kosong, tidak dipakai).

---

## Task 1: Brand — types & service layer

**Files:**
- Create: `src/features/admin/setup/brand/types/index.ts`
- Create: `src/features/admin/setup/brand/service/brand.service.ts`
- Create: `src/features/admin/setup/brand/service/brand.queries.ts`
- Create: `src/features/admin/setup/brand/service/brand.mutations.ts`
- Create: `src/features/admin/setup/brand/service/index.ts`

**Interfaces:**
- Consumes: `api` (`@/lib/axios`), `unwrapData`/`unwrapPaginated` (`@/lib/api-response`), `getErrorMessage` (`@/utils/error`), `mutationOptions`/`MutationConfig` (`@/lib/react-query`).
- Produces: `BrandItem`, `BrandPayload` (types); `useGetBrandsListQuery`, `invalidateBrandQueries`, `useCreateBrand`, `useUpdateBrand`, `useDeleteBrand` (hooks di Task 3/4).

- [ ] **Step 1: Write brand types**

```ts
// src/features/admin/setup/brand/types/index.ts

/** Single brand row returned by the API. */
export type BrandItem = {
  id: string;
  name: string;
  logoUrl: string | null;
  createdAt?: string;
  updatedAt?: string;
};

/** Payload sent to create/update a brand. `logoUrl` holds a tempKey when newly uploaded, or a committed URL. */
export type BrandPayload = {
  name: string;
  logoUrl: string | null;
};

/** Dialog visibility state for the brand form modal. */
export type BrandDialogMode = "create" | "edit" | "readonly" | "closed";
```

- [ ] **Step 2: Write brand.service.ts**

```ts
// src/features/admin/setup/brand/service/brand.service.ts
import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { BrandItem, BrandPayload } from "../types";

export type { BrandItem, BrandPayload } from "../types";

// GET admin/brands — fetch paginated brand list with optional search + pagination.
export async function getBrandsList(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<PaginatedResponse<BrandItem>>("admin/brands", {
    params,
  });
  return unwrapPaginated<BrandItem>(response.data);
}

// GET admin/brands/:brandId — fetch single brand detail by ID.
export async function getBrandById(brandId: string) {
  const response = await api.get<ApiResponse<BrandItem>>(`admin/brands/${brandId}`);
  return unwrapData<BrandItem>(response.data);
}

// POST admin/brands — create a new brand.
export async function createBrand(payload: BrandPayload) {
  const response = await api.post<ApiResponse<BrandItem>>("admin/brands", payload);
  return unwrapData<BrandItem>(response.data);
}

// PUT admin/brands/:brandId — update an existing brand.
export async function updateBrand(brandId: string, payload: BrandPayload) {
  const response = await api.put<ApiResponse<BrandItem>>(
    `admin/brands/${brandId}`,
    payload,
  );
  return unwrapData<BrandItem>(response.data);
}

// DELETE admin/brands/:brandId — delete a brand by ID.
export async function deleteBrand(brandId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/brands/${brandId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
```

- [ ] **Step 3: Write brand.queries.ts**

```ts
// src/features/admin/setup/brand/service/brand.queries.ts
import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getBrandsList, getBrandById } from "./brand.service";

// Base query key for all brand list queries — used as the root key for invalidation.
export const brandListQueryKey = ["brands"] as const;

// Filter params shape accepted by brand list queries.
export type BrandListParams = {
  search?: string;
  page?: number;
  limit?: number;
};

// Build a stable query key that includes filter + pagination params.
export const getBrandsListQueryKey = (params?: BrandListParams): unknown[] => [
  ...brandListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.limit ?? 25,
];

// Query options factory for the paginated brand list.
export const getBrandsListQueryOptions = (params?: BrandListParams) =>
  queryOptions({
    queryKey: getBrandsListQueryKey(params),
    queryFn: () => getBrandsList(params),
  });

// Query options factory for a single brand detail by ID.
export const getBrandByIdQueryOptions = (brandId: string) =>
  queryOptions({
    queryKey: [...brandListQueryKey, brandId],
    queryFn: () => getBrandById(brandId),
  });

type UseBrandsQueryOptions = { queryConfig?: QueryConfig<typeof getBrandsListQueryOptions> };

// Hook: fetch paginated brand list with optional search + pagination.
export const useGetBrandsListQuery = (
  params?: BrandListParams,
  { queryConfig }: UseBrandsQueryOptions = {},
) => useQuery({ ...getBrandsListQueryOptions(params), ...queryConfig });

// Hook: fetch a single brand by ID; disabled automatically when brandId is falsy.
export const useGetBrandByIdQuery = (
  brandId: string,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getBrandByIdQueryOptions> } = {},
) => useQuery({ ...getBrandByIdQueryOptions(brandId), ...queryConfig });

// Invalidate all queries keyed under brandListQueryKey.
export function invalidateBrandQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: brandListQueryKey });
}
```

- [ ] **Step 4: Write brand.mutations.ts**

```ts
// src/features/admin/setup/brand/service/brand.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import { createBrand, updateBrand, deleteBrand } from "./brand.service";
import type { BrandPayload } from "../types";
import { invalidateBrandQueries } from "./brand.queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;
type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

// Hook: create a new brand. Invalidates brand list queries on success.
export const useCreateBrand = ({ mutationConfig }: { mutationConfig?: MutationConfig<typeof createBrand> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createBrand,
    onSuccess: (...args: SuccessParams<typeof createBrand>) => {
      toast.success("Brand berhasil ditambahkan.");
      void invalidateBrandQueries(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menambahkan brand.")),
  });
};

// Hook: update an existing brand by ID. Invalidates brand list + detail queries on success.
export const useUpdateBrand = ({ brandId, mutationConfig }: { brandId: string; mutationConfig?: MutationConfig<typeof updateBrand> }) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: (payload: BrandPayload) => updateBrand(brandId, payload),
    onSuccess: (...args: SuccessParams<typeof updateBrand>) => {
      toast.success("Brand berhasil diperbarui.");
      void invalidateBrandQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: [...brandListQueryKey, brandId] });
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal memperbarui brand.")),
  });
};

// Hook: delete a brand by ID. Invalidates brand list queries on success.
export const useDeleteBrand = ({ mutationConfig }: { mutationConfig?: MutationConfig<typeof deleteBrand> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deleteBrand,
    onSuccess: (...args: SuccessParams<typeof deleteBrand>) => {
      toast.success("Brand berhasil dihapus.");
      void invalidateBrandQueries(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menghapus brand.")),
  });
};

import { brandListQueryKey } from "./brand.queries";
```

- [ ] **Step 5: Write brand/service/index.ts**

```ts
// src/features/admin/setup/brand/service/index.ts
export {
  brandListQueryKey,
  getBrandsListQueryKey,
  getBrandsListQueryOptions,
  getBrandByIdQueryOptions,
  useGetBrandsListQuery,
  useGetBrandByIdQuery,
  invalidateBrandQueries,
} from "./brand.queries";
export { useCreateBrand, useUpdateBrand, useDeleteBrand } from "./brand.mutations";
export {
  getBrandsList,
  getBrandById,
  createBrand,
  updateBrand,
  deleteBrand,
} from "./brand.service";
```

- [ ] **Step 6: Lint & typecheck**

Run: `pnpm lint --quiet src/features/admin/setup/brand/service 2>&1 | head -30`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/admin/setup/brand/types src/features/admin/setup/brand/service
git commit -m "feat(brand): add types and service layer (queries, mutations, api)"
```

---

## Task 2: Brand — hooks (list + form)

**Files:**
- Create: `src/features/admin/setup/brand/hooks/useBrandList.ts`
- Create: `src/features/admin/setup/brand/hooks/useBrandForm.ts`

**Interfaces:**
- Consumes: `useGetBrandsListQuery`, `invalidateBrandQueries`, `useDeleteBrand`, `useCreateBrand`, `useUpdateBrand` dari `../service/index`; `BrandDialogMode` dari `../types`; `useMutation`, `useQueryClient` dari `@tanstack/react-query`; `useForm` dari `@tanstack/react-form`.
- Produces: `useBrandList` (returns `{ brands, totalBrands, pagination, isLoading, isRefreshing, isDeleting, refetchBrands, deleteBrand, dialog state setters }`), `useBrandForm` (returns `{ form, isEditMode, isSubmitting, isLoadingDetail, readonly }`).

- [ ] **Step 1: Write useBrandList.ts**

```ts
// src/features/admin/setup/brand/hooks/useBrandList.ts
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
    selectedBrand,
    dialogMode,
    editingId,
    setSelectedId,
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
```

- [ ] **Step 2: Write useBrandForm.ts**

```ts
// src/features/admin/setup/brand/hooks/useBrandForm.ts
import { useEffect } from "react";
import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  createBrand,
  updateBrand,
  brandListQueryKey,
  useGetBrandByIdQuery,
} from "../service/index";
import type { BrandPayload } from "../types";
import type { ApiFnReturnType } from "@/lib/react-query";

const brandFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama brand wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  logoUrl: z
    .string()
    .nullable()
    .refine((value) => !value || value.length <= 512, {
      message: "URL logo maksimal 512 karakter.",
    }),
});

type BrandFormValues = z.input<typeof brandFormSchema>;

const defaultValues: BrandFormValues = {
  name: "",
  logoUrl: null,
};

// Convert validated form values to the API payload shape expected by createBrand/updateBrand.
function toPayload(values: BrandFormValues): BrandPayload {
  const parsed = brandFormSchema.parse(values);
  return { name: parsed.name, logoUrl: parsed.logoUrl };
}

type UseBrandFormOptions = { brandId?: string };

// Hook: manage brand form state, create/update mutation, and load detail when editing.
export function useBrandForm({ brandId }: UseBrandFormOptions) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(brandId);
  const readonly = false;

  const brandDetailQuery = useGetBrandByIdQuery(brandId as string, {
    queryConfig: { enabled: isEditMode },
  });

  const mutation = useMutation<
    ApiFnReturnType<typeof createBrand>,
    Error,
    BrandFormValues
  >({
    mutationFn: async (values: BrandFormValues) => {
      const payload = toPayload(values);
      if (isEditMode && brandId) {
        return updateBrand(brandId, payload);
      }
      return createBrand(payload);
    },
    onSuccess: async () => {
      toast.success(isEditMode ? "Brand berhasil diperbarui." : "Brand berhasil ditambahkan.");
      await queryClient.invalidateQueries({ queryKey: brandListQueryKey });
      if (brandId) {
        await queryClient.invalidateQueries({ queryKey: [...brandListQueryKey, brandId] });
      }
    },
    onError: (error) => {
      const msg = getErrorMessage(error, isEditMode ? "Gagal memperbarui brand." : "Gagal menambahkan brand.");
      toast.error(msg, { id: msg });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  // Populate form fields from the fetched brand detail when editing.
  useEffect(() => {
    if (!brandDetailQuery.data) return;
    const data = brandDetailQuery.data;
    form.setFieldValue("name", data.name ?? "");
    form.setFieldValue("logoUrl", data.logoUrl ?? null);
  }, [form, brandDetailQuery.data]);

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: brandDetailQuery.isLoading,
    readonly,
  };
}
```

- [ ] **Step 3: Lint & typecheck**

Run: `pnpm lint --quiet src/features/admin/setup/brand/hooks 2>&1 | head -30`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/setup/brand/hooks
git commit -m "feat(brand): add list and form hooks"
```

---

## Task 3: Brand — columns & views (dialog form)

**Files:**
- Create: `src/features/admin/setup/brand/components/brand-columns.tsx`
- Create: `src/features/admin/setup/brand/views/BrandFormDialog.tsx`
- Create: `src/features/admin/setup/brand/views/BrandListView.tsx`
- Create: `src/features/admin/setup/brand/index.ts`

**Interfaces:**
- Consumes: `useBrandList` (Task 2), `useBrandForm` (Task 2), `getBrandColumns`, `FieldInput`, `FieldUpload`, `FieldShell`, `Dialog`/`DialogContent`/`DialogHeader`/`DialogTitle`/`DialogFooter` dari `@/components/ui/dialog`, `DataTable`, `RowActions`, `ConfirmDialog`, `ActionButton`, `Button`, `Card`, `Input`, `useDebounce`.
- Produces: `BrandListView` (route component).

- [ ] **Step 1: Write brand-columns.tsx**

```tsx
// src/features/admin/setup/brand/components/brand-columns.tsx
import type { ColDef } from "ag-grid-community";
import { StatusBadge } from "@/components/data-table";
import type { BrandItem } from "../types";

// AG Grid column config for the brand table: name + logo preview (image thumbnail).
export function getBrandColumns(): ColDef<BrandItem>[] {
  return [
    {
      headerName: "Nama Brand",
      field: "name",
      filter: "agTextColumnFilter",
      floatingFilter: true,
      filterParams: { debounceMs: 250 },
      minWidth: 220,
      flex: 2,
    },
    {
      headerName: "Logo",
      field: "logoUrl",
      filter: false,
      sortable: false,
      minWidth: 120,
      width: 120,
      cellRenderer: ({ value }: { value: string | null }) =>
        value ? (
          <img
            src={value}
            alt="logo"
            className="h-9 w-9 rounded-lg border border-border object-cover"
            loading="lazy"
          />
        ) : (
          <span className="text-muted-foreground">—</span>
        ),
    },
  ];
}
```

- [ ] **Step 2: Write BrandFormDialog.tsx**

```tsx
// src/features/admin/setup/brand/views/BrandFormDialog.tsx
import { FieldInput } from "@/components/field/FieldInput";
import { FieldUpload } from "@/components/field/FieldUpload";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@tanstack/react-store";
import { useBrandForm } from "../hooks/useBrandForm";
import type { BrandDialogMode } from "../types";

type BrandFormDialogProps = {
  mode: BrandDialogMode;
  brandId: string | null;
  onClose: () => void;
  onSaved?: () => void;
};

// Normalize TanStack Form error (string or { message }) to a displayable string or undefined.
function getErrorMessage(error: string | { message?: string } | undefined) {
  if (!error) return undefined;
  return typeof error === "string" ? error : error.message;
}

// Modal dialog rendering the brand create/edit form. Visible only when mode is create/edit.
export function BrandFormDialog({ mode, brandId, onClose, onSaved }: BrandFormDialogProps) {
  const open = mode === "create" || mode === "edit";
  const {
    form,
    isEditMode,
    isSubmitting,
    isLoadingDetail,
  } = useBrandForm({ brandId: open ? brandId ?? undefined : undefined });

  const title = isEditMode ? "Edit Brand" : "Tambah Brand";

  const logoValue = useStore(form.store, (state) => state.values.logoUrl);

  function handleOpenChange(next: boolean) {
    if (!next) onClose();
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingDetail ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Memuat data...</div>
        ) : (
          <form
            id="brand-form"
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.Field name="name" validators={{ onChange: ({ value }) => (value.trim() ? undefined : "Nama brand wajib diisi.") }}>
              {(field) => (
                <FieldInput
                  label="Nama Brand"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getErrorMessage(field.state.meta.errors[0])}
                  placeholder="Lenovo"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>

            <form.Field name="logoUrl">
              {(field) => (
                <FieldUpload
                  label="Logo Brand"
                  kind="image"
                  value={field.state.value}
                  previewUrl={field.state.value ?? null}
                  onChange={(tempKey) => field.handleChange(tempKey)}
                  disabled={isSubmitting}
                  hint="Unggah logo brand (format gambar)."
                />
              )}
            </form.Field>

            {/* onSubmit fires the mutation; signal success up so the parent can close the dialog. */}
            <form.Subscribe selector={(state) => state.values}>
              {() => null}
            </form.Subscribe>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="brand-form"
            disabled={isSubmitting}
            onClick={() => {
              void form.handleSubmit().then(() => onSaved?.());
            }}
          >
            {isSubmitting ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Write BrandListView.tsx**

```tsx
// src/features/admin/setup/brand/views/BrandListView.tsx
import { Plus, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton } from "@/components/admin";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { getBrandColumns } from "../components/brand-columns";
import { useBrandList } from "../hooks/useBrandList";
import { BrandFormDialog } from "./BrandFormDialog";

// View: brand list page with search, toolbar actions, AG Grid table, form dialog, and delete confirmation.
export function BrandListView() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const {
    brands,
    totalBrands,
    pagination,
    isDeleting,
    isLoading,
    isRefreshing,
    selectedId,
    selectedBrand,
    dialogMode,
    editingId,
    setSelectedId,
    openCreate,
    openEdit,
    openReadonly,
    closeDialog,
    refetchBrands,
    deleteBrand,
  } = useBrandList(debouncedSearch, page);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Brand Setup</h1>
          <p className="text-sm text-muted-foreground">
            Kelola daftar brand produk beserta logo-nya.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
        <CardContent className="px-0 pb-0 pt-0">
          <div className="flex flex-col gap-2.5 border-b border-border/60 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Cari nama brand..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
              <RowActions
                basePermissionCode="setup.brand"
                iconOnly
                className="shrink-0"
                disabled={!selectedBrand || isDeleting}
                onView={() => selectedBrand && openReadonly(selectedBrand.id)}
                onEdit={() => selectedBrand && openEdit(selectedBrand.id)}
                onDelete={() => selectedBrand && setConfirmDeleteId(selectedBrand.id)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-border/70"
                onClick={() => void refetchBrands()}
                disabled={isRefreshing}
                aria-label="Refresh data"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <ActionButton
                permission="setup.brand.create"
                size="sm"
                className="rounded-lg"
                onClick={openCreate}
                icon={<Plus className="h-4 w-4" />}
              >
                Tambah Brand
              </ActionButton>
            </div>
          </div>

          <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
            <DataTable
              columns={getBrandColumns()}
              rows={brands}
              loading={isLoading || isRefreshing}
              emptyMessage="Belum ada data brand."
              totalRows={totalBrands}
              currentPage={pagination?.page}
              totalPagesOverride={pagination?.totalPages}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
              onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
              onNextPage={() => {
                if (pagination?.hasNextPage) setPage((p) => p + 1);
              }}
              selectedRowId={selectedId}
              getRowId={(row) => row.id}
              onRowClick={(row) =>
                setSelectedId((prev) => (prev === row.id ? null : row.id))
              }
            />
          </div>
        </CardContent>
      </Card>

      <BrandFormDialog
        mode={dialogMode}
        brandId={editingId}
        onClose={closeDialog}
        onSaved={closeDialog}
      />

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Brand"
        desc="Apakah Anda yakin ingin menghapus brand ini? Tindakan ini tidak dapat dibatalkan."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) deleteBrand(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Write index.ts**

```ts
// src/features/admin/setup/brand/index.ts
export { BrandListView } from "./views/BrandListView";
export {} from "./types";
```

- [ ] **Step 5: Lint & typecheck**

Run: `pnpm lint --quiet src/features/admin/setup/brand 2>&1 | head -40`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/admin/setup/brand
git commit -m "feat(brand): add columns, dialog form, and list view"
```

---

## Task 4: Brand — route registration

**Files:**
- Create: `src/routes/admin/setup/brand/index.tsx`

**Interfaces:**
- Consumes: `BrandListView` (`@/features/admin/setup/brand`), `requireAdminPageAccess` (`@/lib/auth`).

- [ ] **Step 1: Write route file**

```tsx
// src/routes/admin/setup/brand/index.tsx
import { createFileRoute } from "@tanstack/react-router";
import { BrandListView } from "@/features/admin/setup/brand";
import { requireAdminPageAccess } from "@/lib/auth";

export const Route = createFileRoute("/admin/setup/brand/")({
  beforeLoad: requireAdminPageAccess,
  component: BrandListView,
});
```

- [ ] **Step 2: Verify route tree builds**

Run: `pnpm build 2>&1 | tail -20`
Expected: tsc + vite build succeed; `src/routeTree.gen.ts` regenerated with `/admin/setup/brand/`.

- [ ] **Step 3: Commit**

```bash
git add src/routes/admin/setup/brand/index.tsx src/routeTree.gen.ts
git commit -m "feat(brand): register admin/setup/brand route"
```

---

## Task 5: Category — types & service layer

**Files:**
- Create: `src/features/admin/setup/category/types/index.ts`
- Create: `src/features/admin/setup/category/service/category.service.ts`
- Create: `src/features/admin/setup/category/service/category.queries.ts`
- Create: `src/features/admin/setup/category/service/category.mutations.ts`
- Create: `src/features/admin/setup/category/service/index.ts`

**Interfaces:** sama dengan Task 1 (brand), ganti nama `brand`→`category`, field `name`+`slug`+`parentId`.

- [ ] **Step 1: Write category types**

```ts
// src/features/admin/setup/category/types/index.ts

/** Single category row returned by the API. */
export type CategoryItem = {
  id: string;
  name: string;
  slug: string;
  parentId: string | null;
  parent?: { id: string; name: string } | null;
  parentName?: string | null;
  children?: CategoryItem[];
  createdAt?: string;
  updatedAt?: string;
};

/** Payload sent to create/update a category. */
export type CategoryPayload = {
  name: string;
  slug: string;
  parentId: string | null;
};

/** Dialog visibility state for the category form modal. */
export type CategoryDialogMode = "create" | "edit" | "readonly" | "closed";
```

- [ ] **Step 2: Write category.service.ts**

```ts
// src/features/admin/setup/category/service/category.service.ts
import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { CategoryItem, CategoryPayload } from "../types";

export type { CategoryItem, CategoryPayload } from "../types";

// GET admin/categories — fetch paginated category list with optional search + pagination.
export async function getCategoriesList(params?: {
  search?: string;
  page?: number;
  limit?: number;
}) {
  const response = await api.get<PaginatedResponse<CategoryItem>>("admin/categories", {
    params,
  });
  return unwrapPaginated<CategoryItem>(response.data);
}

// GET admin/categories/:categoryId — fetch single category detail by ID.
export async function getCategoryById(categoryId: string) {
  const response = await api.get<ApiResponse<CategoryItem>>(
    `admin/categories/${categoryId}`,
  );
  return unwrapData<CategoryItem>(response.data);
}

// POST admin/categories — create a new category.
export async function createCategory(payload: CategoryPayload) {
  const response = await api.post<ApiResponse<CategoryItem>>("admin/categories", payload);
  return unwrapData<CategoryItem>(response.data);
}

// PUT admin/categories/:categoryId — update an existing category.
export async function updateCategory(categoryId: string, payload: CategoryPayload) {
  const response = await api.put<ApiResponse<CategoryItem>>(
    `admin/categories/${categoryId}`,
    payload,
  );
  return unwrapData<CategoryItem>(response.data);
}

// DELETE admin/categories/:categoryId — delete a category by ID.
export async function deleteCategory(categoryId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/categories/${categoryId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
```

- [ ] **Step 3: Write category.queries.ts**

```ts
// src/features/admin/setup/category/service/category.queries.ts
import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getCategoriesList, getCategoryById } from "./category.service";

// Base query key for all category list queries.
export const categoryListQueryKey = ["categories"] as const;

export type CategoryListParams = {
  search?: string;
  page?: number;
  limit?: number;
};

export const getCategoriesListQueryKey = (params?: CategoryListParams): unknown[] => [
  ...categoryListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.limit ?? 25,
];

export const getCategoriesListQueryOptions = (params?: CategoryListParams) =>
  queryOptions({
    queryKey: getCategoriesListQueryKey(params),
    queryFn: () => getCategoriesList(params),
  });

export const getCategoryByIdQueryOptions = (categoryId: string) =>
  queryOptions({
    queryKey: [...categoryListQueryKey, categoryId],
    queryFn: () => getCategoryById(categoryId),
  });

type UseCategoriesQueryOptions = { queryConfig?: QueryConfig<typeof getCategoriesListQueryOptions> };

export const useGetCategoriesListQuery = (
  params?: CategoryListParams,
  { queryConfig }: UseCategoriesQueryOptions = {},
) => useQuery({ ...getCategoriesListQueryOptions(params), ...queryConfig });

export const useGetCategoryByIdQuery = (
  categoryId: string,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getCategoryByIdQueryOptions> } = {},
) => useQuery({ ...getCategoryByIdQueryOptions(categoryId), ...queryConfig });

export function invalidateCategoryQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: categoryListQueryKey });
}
```

- [ ] **Step 4: Write category.mutations.ts**

```ts
// src/features/admin/setup/category/service/category.mutations.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import { createCategory, updateCategory, deleteCategory } from "./category.service";
import type { CategoryPayload } from "../types";
import { invalidateCategoryQueries, categoryListQueryKey } from "./category.queries";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;
type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

export const useCreateCategory = ({ mutationConfig }: { mutationConfig?: MutationConfig<typeof createCategory> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createCategory,
    onSuccess: (...args: SuccessParams<typeof createCategory>) => {
      toast.success("Kategori berhasil ditambahkan.");
      void invalidateCategoryQueries(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menambahkan kategori.")),
  });
};

export const useUpdateCategory = ({ categoryId, mutationConfig }: { categoryId: string; mutationConfig?: MutationConfig<typeof updateCategory> }) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: (payload: CategoryPayload) => updateCategory(categoryId, payload),
    onSuccess: (...args: SuccessParams<typeof updateCategory>) => {
      toast.success("Kategori berhasil diperbarui.");
      void invalidateCategoryQueries(queryClient);
      void queryClient.invalidateQueries({ queryKey: [...categoryListQueryKey, categoryId] });
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal memperbarui kategori.")),
  });
};

export const useDeleteCategory = ({ mutationConfig }: { mutationConfig?: MutationConfig<typeof deleteCategory> } = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deleteCategory,
    onSuccess: (...args: SuccessParams<typeof deleteCategory>) => {
      toast.success("Kategori berhasil dihapus.");
      void invalidateCategoryQueries(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) => toast.error(getErrorMessage(error, "Gagal menghapus kategori.")),
  });
};
```

- [ ] **Step 5: Write category/service/index.ts**

```ts
// src/features/admin/setup/category/service/index.ts
export {
  categoryListQueryKey,
  getCategoriesListQueryKey,
  getCategoriesListQueryOptions,
  getCategoryByIdQueryOptions,
  useGetCategoriesListQuery,
  useGetCategoryByIdQuery,
  invalidateCategoryQueries,
} from "./category.queries";
export { useCreateCategory, useUpdateCategory, useDeleteCategory } from "./category.mutations";
export {
  getCategoriesList,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
} from "./category.service";
```

- [ ] **Step 6: Lint & typecheck**

Run: `pnpm lint --quiet src/features/admin/setup/category/service 2>&1 | head -30`
Expected: no errors.

- [ ] **Step 7: Commit**

```bash
git add src/features/admin/setup/category/types src/features/admin/setup/category/service
git commit -m "feat(category): add types and service layer"
```

---

## Task 6: Category — slugify util (TDD)

**Files:**
- Create: `src/lib/slugify.ts`
- Create: `src/lib/slugify.test.ts`
- Create: `vitest.config.ts`
- Modify: `package.json` (tambah devDep `vitest` + script `test`)

**Interfaces:**
- Consumes: nothing.
- Produces: `slugify(input: string): string` — lowercased, trimmed, spaces→`-`, hapus karakter non-alphanumerik (kecuali `-`), collapse multiple `-`, trim `-` di ujung.

- [ ] **Step 1: Write the failing test**

```ts
// src/lib/slugify.test.ts
import { describe, it, expect } from "vitest";
import { slugify } from "./slugify";

describe("slugify", () => {
  it("lowercases and replaces spaces with dashes", () => {
    expect(slugify("Smart Phone")).toBe("smart-phone");
  });
  it("strips non-alphanumeric characters", () => {
    expect(slugify("HP & Accessories!")).toBe("hp-accessories");
  });
  it("collapses repeated dashes and trims edges", () => {
    expect(slugify("  New--Arrival  ")).toBe("new-arrival");
  });
  it("keeps an already-valid slug unchanged", () => {
    expect(slugify("laptop-gaming")).toBe("laptop-gaming");
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `pnpm test 2>&1 | tail -20`
Expected: FAIL — `Cannot find module './slugify'`.

- [ ] **Step 3: Write minimal implementation**

```ts
// src/lib/slugify.ts
/**
 * Convert an arbitrary label into a URL-safe slug.
 * Lowercases, trims, replaces spaces with dashes, strips characters that are
 * neither letters/digits nor dashes, collapses repeated dashes, and trims
 * leading/trailing dashes.
 * @param input - raw label, e.g. "Smart Phone!"
 * @returns slug, e.g. "smart-phone"
 */
export function slugify(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .replace(/-{2,}/g, "-");
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `pnpm test 2>&1 | tail -20`
Expected: PASS (4 tests).

- [ ] **Step 5: Add vitest config + package script**

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

In `package.json` scripts, add:
```json
"test": "vitest run"
```
And in devDependencies add (match repo React/TS majors; vitest 2.x):
```json
"vitest": "^2.1.0"
```
Then run: `pnpm install` (to fetch vitest).

- [ ] **Step 6: Commit**

```bash
git add src/lib/slugify.ts src/lib/slugify.test.ts vitest.config.ts package.json pnpm-lock.yaml
git commit -m "feat(category): add slugify util with vitest coverage"
```

---

## Task 7: Category — hooks (list + form)

**Files:**
- Create: `src/features/admin/setup/category/hooks/useCategoryList.ts`
- Create: `src/features/admin/setup/category/hooks/useCategoryForm.ts`

**Interfaces:**
- Consumes: `useGetCategoriesListQuery`, `invalidateCategoryQueries`, `useDeleteCategory`, `useCreateCategory`, `useUpdateCategory` dari `../service/index`; `CategoryDialogMode`, `CategoryItem` dari `../types`; `slugify` (`@/lib/slugify`); `useForm` dari `@tanstack/react-form`; `useStore` dari `@tanstack/react-store`.
- Produces: `useCategoryList`, `useCategoryForm`.

- [ ] **Step 1: Write useCategoryList.ts**

```ts
// src/features/admin/setup/category/hooks/useCategoryList.ts
import { useState } from "react";
import { useDeleteCategory } from "../service/category.mutations";
import { useGetCategoriesListQuery } from "../service/category.queries";
import type { CategoryItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

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
  const [dialogMode, setDialogMode] = useState<"create" | "edit" | "readonly" | "closed">("closed");
  const [editingId, setEditingId] = useState<string | null>(null);

  const selectedCategory = rawCategories.find((c) => c.id === selectedId) ?? null;

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
    categories: rawCategories,
    totalCategories,
    pagination,
    isLoading: categoryQuery.isLoading,
    isRefreshing: categoryQuery.isFetching,
    isDeleting: deleteMutation.isPending,
    selectedId,
    selectedCategory,
    dialogMode,
    editingId,
    parentOptions,
    setSelectedId,
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
```

- [ ] **Step 2: Write useCategoryForm.ts**

```ts
// src/features/admin/setup/category/hooks/useCategoryForm.ts
import { useEffect, useRef } from "react";
import { useForm } from "@tanstack/react-form";
import { useStore } from "@tanstack/react-store";
import { useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import {
  createCategory,
  updateCategory,
  categoryListQueryKey,
  useGetCategoryByIdQuery,
} from "../service/index";
import type { CategoryPayload } from "../types";
import type { ApiFnReturnType } from "@/lib/react-query";
import { slugify } from "@/lib/slugify";

const categoryFormSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Nama kategori wajib diisi.")
    .max(150, "Maksimal 150 karakter."),
  slug: z
    .string()
    .trim()
    .min(1, "Slug wajib diisi.")
    .max(150, "Maksimal 150 karakter.")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug hanya boleh huruf kecil, angka, dan tanda hubung."),
  parentId: z
    .string()
    .trim()
    .transform((value) => (value === "" ? null : value))
    .nullable(),
});

type CategoryFormValues = z.input<typeof categoryFormSchema>;

const defaultValues: CategoryFormValues = {
  name: "",
  slug: "",
  parentId: "",
};

function toPayload(values: CategoryFormValues): CategoryPayload {
  const parsed = categoryFormSchema.parse(values);
  return { name: parsed.name, slug: parsed.slug, parentId: parsed.parentId };
}

type UseCategoryFormOptions = { categoryId?: string };

// Hook: manage category form state, auto-slug generation, create/update mutation, and load detail when editing.
export function useCategoryForm({ categoryId }: UseCategoryFormOptions) {
  const queryClient = useQueryClient();
  const isEditMode = Boolean(categoryId);
  const slugManuallyEditedRef = useRef(false);

  const categoryDetailQuery = useGetCategoryByIdQuery(categoryId as string, {
    queryConfig: { enabled: isEditMode },
  });

  const mutation = useMutation<
    ApiFnReturnType<typeof createCategory>,
    Error,
    CategoryFormValues
  >({
    mutationFn: async (values: CategoryFormValues) => {
      const payload = toPayload(values);
      if (isEditMode && categoryId) {
        return updateCategory(categoryId, payload);
      }
      return createCategory(payload);
    },
    onSuccess: async () => {
      toast.success(isEditMode ? "Kategori berhasil diperbarui." : "Kategori berhasil ditambahkan.");
      await queryClient.invalidateQueries({ queryKey: categoryListQueryKey });
      if (categoryId) {
        await queryClient.invalidateQueries({ queryKey: [...categoryListQueryKey, categoryId] });
      }
    },
    onError: (error) => {
      const msg = getErrorMessage(error, isEditMode ? "Gagal memperbarui kategori." : "Gagal menambahkan kategori.");
      toast.error(msg, { id: msg });
    },
  });

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      await mutation.mutateAsync(value);
    },
  });

  // Auto-generate slug from name until the user edits the slug field manually.
  const nameValue = useStore(form.store, (state) => state.values.name);
  useEffect(() => {
    if (slugManuallyEditedRef.current) return;
    const next = slugify(nameValue ?? "");
    if (next) form.setFieldValue("slug", next);
  }, [form, nameValue]);

  // Populate form fields from the fetched category detail when editing.
  useEffect(() => {
    if (!categoryDetailQuery.data) return;
    const data = categoryDetailQuery.data;
    form.setFieldValue("name", data.name ?? "");
    form.setFieldValue("slug", data.slug ?? "");
    form.setFieldValue("parentId", data.parentId ?? "");
    slugManuallyEditedRef.current = true;
  }, [form, categoryDetailQuery.data]);

  return {
    form,
    isEditMode,
    isSubmitting: mutation.isPending,
    isLoadingDetail: categoryDetailQuery.isLoading,
    readonly: false,
    markSlugEdited: () => {
      slugManuallyEditedRef.current = true;
    },
  };
}
```

- [ ] **Step 3: Lint & typecheck**

Run: `pnpm lint --quiet src/features/admin/setup/category/hooks 2>&1 | head -30`
Expected: no errors.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/setup/category/hooks
git commit -m "feat(category): add list and form hooks with auto-slug"
```

---

## Task 8: Category — columns & views (dialog form)

**Files:**
- Create: `src/features/admin/setup/category/components/category-columns.tsx`
- Create: `src/features/admin/setup/category/views/CategoryFormDialog.tsx`
- Create: `src/features/admin/setup/category/views/CategoryListView.tsx`
- Create: `src/features/admin/setup/category/index.ts`

**Interfaces:** sama dengan Task 3 (brand), ganti field jadi name/slug/parentLabel; form pakai FieldInput name, FieldInput slug (auto), FieldSelect parent.

- [ ] **Step 1: Write category-columns.tsx**

```tsx
// src/features/admin/setup/category/components/category-columns.tsx
import type { ColDef } from "ag-grid-community";
import { StatusBadge } from "@/components/data-table";
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
```

- [ ] **Step 2: Write CategoryFormDialog.tsx**

```tsx
// src/features/admin/setup/category/views/CategoryFormDialog.tsx
import { FieldInput } from "@/components/field/FieldInput";
import { FieldSelect } from "@/components/field/FieldSelect";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useStore } from "@tanstack/react-store";
import { useCategoryForm } from "../hooks/useCategoryForm";
import type { CategoryDialogMode } from "../types";

type CategoryFormDialogProps = {
  mode: CategoryDialogMode;
  categoryId: string | null;
  parentOptions: { label: string; value: string }[];
  onClose: () => void;
  onSaved?: () => void;
};

function getErrorMessage(error: string | { message?: string } | undefined) {
  if (!error) return undefined;
  return typeof error === "string" ? error : error.message;
}

// Modal dialog rendering the category create/edit form. Visible only when mode is create/edit.
export function CategoryFormDialog({ mode, categoryId, parentOptions, onClose, onSaved }: CategoryFormDialogProps) {
  const open = mode === "create" || mode === "edit";
  const {
    form,
    isEditMode,
    isSubmitting,
    isLoadingDetail,
    markSlugEdited,
  } = useCategoryForm({ categoryId: open ? categoryId ?? undefined : undefined });

  const title = isEditMode ? "Edit Kategori" : "Tambah Kategori";

  return (
    <Dialog open={open} onOpenChange={(next) => !next && onClose()}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        {isEditMode && isLoadingDetail ? (
          <div className="py-8 text-center text-sm text-muted-foreground">Memuat data...</div>
        ) : (
          <form
            id="category-form"
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              event.stopPropagation();
              void form.handleSubmit();
            }}
          >
            <form.Field name="name" validators={{ onChange: ({ value }) => (value.trim() ? undefined : "Nama kategori wajib diisi.") }}>
              {(field) => (
                <FieldInput
                  label="Nama Kategori"
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => field.handleChange(event.target.value)}
                  error={getErrorMessage(field.state.meta.errors[0])}
                  placeholder="Smartphone"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>

            <form.Field name="slug" validators={{ onChange: ({ value }) => (/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.trim()) ? undefined : "Slug tidak valid.") }}>
              {(field) => (
                <FieldInput
                  label="Slug"
                  hint="Dihasilkan otomatis dari nama. Bisa diubah manual."
                  required
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(event) => {
                    field.handleChange(event.target.value);
                    markSlugEdited();
                  }}
                  error={getErrorMessage(field.state.meta.errors[0])}
                  placeholder="smartphone"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>

            <form.Field name="parentId">
              {(field) => (
                <FieldSelect
                  label="Parent Kategori"
                  value={field.state.value ?? ""}
                  onValueChange={(value) => field.handleChange(value)}
                  options={parentOptions}
                  placeholder="Pilih parent (opsional)"
                  disabled={isSubmitting}
                />
              )}
            </form.Field>
          </form>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSubmitting}>
            Batal
          </Button>
          <Button
            type="submit"
            form="category-form"
            disabled={isSubmitting}
            onClick={() => {
              void form.handleSubmit().then(() => onSaved?.());
            }}
          >
            {isSubmitting ? "Menyimpan..." : isEditMode ? "Update" : "Simpan"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
```

- [ ] **Step 3: Write CategoryListView.tsx**

```tsx
// src/features/admin/setup/category/views/CategoryListView.tsx
import { Plus, RefreshCw, Search } from "lucide-react";
import { useState } from "react";

import { DataTable } from "@/components/data-table/data-table";
import { RowActions, ActionButton } from "@/components/admin";
import { ConfirmDialog } from "@/components/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/useDebounce";
import { getCategoryColumns } from "../components/category-columns";
import { useCategoryList } from "../hooks/useCategoryList";
import { CategoryFormDialog } from "./CategoryFormDialog";

// View: category list page with search, toolbar actions, AG Grid table, form dialog, and delete confirmation.
export function CategoryListView() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const debouncedSearch = useDebounce(search, 400);

  const {
    categories,
    totalCategories,
    pagination,
    isDeleting,
    isLoading,
    isRefreshing,
    selectedId,
    selectedCategory,
    dialogMode,
    editingId,
    parentOptions,
    setSelectedId,
    openCreate,
    openEdit,
    openReadonly,
    closeDialog,
    refetchCategories,
    deleteCategory,
  } = useCategoryList(debouncedSearch, page);

  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleSearch = (value: string) => {
    setSearch(value);
    setPage(1);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Category Setup</h1>
          <p className="text-sm text-muted-foreground">
            Kelola hierarki kategori produk dengan parent dan slug.
          </p>
        </div>
      </div>

      <Card className="overflow-hidden border-border/60 bg-card/90 shadow-sm">
        <CardContent className="px-0 pb-0 pt-0">
          <div className="flex flex-col gap-2.5 border-b border-border/60 px-4 py-3 sm:px-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-wrap items-center gap-2">
              <div className="relative w-full max-w-xs">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={search}
                  onChange={(event) => handleSearch(event.target.value)}
                  placeholder="Cari nama kategori..."
                  className="h-9 rounded-xl pl-9 pr-3 text-sm"
                />
              </div>
              <RowActions
                basePermissionCode="setup.category"
                iconOnly
                className="shrink-0"
                disabled={!selectedCategory || isDeleting}
                onView={() => selectedCategory && openReadonly(selectedCategory.id)}
                onEdit={() => selectedCategory && openEdit(selectedCategory.id)}
                onDelete={() => selectedCategory && setConfirmDeleteId(selectedCategory.id)}
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="icon-sm"
                className="rounded-lg border-border/70"
                onClick={() => void refetchCategories()}
                disabled={isRefreshing}
                aria-label="Refresh data"
                title="Refresh data"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} />
              </Button>
              <ActionButton
                permission="setup.category.create"
                size="sm"
                className="rounded-lg"
                onClick={openCreate}
                icon={<Plus className="h-4 w-4" />}
              >
                Tambah Kategori
              </ActionButton>
            </div>
          </div>

          <div className="h-[min(72vh,44rem)] min-h-[28rem] overflow-hidden">
            <DataTable
              columns={getCategoryColumns()}
              rows={categories}
              loading={isLoading || isRefreshing}
              emptyMessage="Belum ada data kategori."
              totalRows={totalCategories}
              currentPage={pagination?.page}
              totalPagesOverride={pagination?.totalPages}
              hasNextPage={pagination?.hasNextPage}
              hasPreviousPage={pagination?.hasPreviousPage}
              onPrevPage={() => setPage((p) => Math.max(1, p - 1))}
              onNextPage={() => {
                if (pagination?.hasNextPage) setPage((p) => p + 1);
              }}
              selectedRowId={selectedId}
              getRowId={(row) => row.id}
              onRowClick={(row) =>
                setSelectedId((prev) => (prev === row.id ? null : row.id))
              }
            />
          </div>
        </CardContent>
      </Card>

      <CategoryFormDialog
        mode={dialogMode}
        categoryId={editingId}
        parentOptions={parentOptions}
        onClose={closeDialog}
        onSaved={closeDialog}
      />

      <ConfirmDialog
        open={!!confirmDeleteId}
        onOpenChange={(open) => !open && setConfirmDeleteId(null)}
        title="Hapus Kategori"
        desc="Apakah Anda yakin ingin menghapus kategori ini? Sub-kategori akan terlepas dari parent-nya."
        destructive
        isLoading={isDeleting}
        handleConfirm={() => {
          if (confirmDeleteId) deleteCategory(confirmDeleteId);
          setConfirmDeleteId(null);
        }}
      />
    </div>
  );
}
```

- [ ] **Step 4: Write index.ts**

```ts
// src/features/admin/setup/category/index.ts
export { CategoryListView } from "./views/CategoryListView";
export {} from "./types";
```

- [ ] **Step 5: Lint & typecheck**

Run: `pnpm lint --quiet src/features/admin/setup/category 2>&1 | head -40`
Expected: no errors.

- [ ] **Step 6: Commit**

```bash
git add src/features/admin/setup/category
git commit -m "feat(category): add columns, dialog form, and list view"
```

---

## Task 9: Category — route wiring + cleanup old feature

**Files:**
- Modify: `src/routes/admin/category/index.tsx` (ubah import `Category`)
- Delete: `src/features/admin/category/` (folder lama, kosong/tidak dipakai)

**Interfaces:**
- Consumes: `CategoryListView` (`@/features/admin/setup/category`).

- [ ] **Step 1: Update route import**

Edit `src/routes/admin/category/index.tsx` — ganti baris:
```ts
import { Category } from '@/features/admin/category'
```
menjadi:
```ts
import { CategoryListView as Category } from '@/features/admin/setup/category'
```

- [ ] **Step 2: Remove old empty feature folder**

Run: `rm -rf src/features/admin/category`
Expected: folder gone (verifikasi tidak ada import lain ke `@/features/admin/category`).

- [ ] **Step 3: Verify nothing else imports the old path**

Run: `grep -rn "from '@/features/admin/category'" src || echo "no stale imports"`
Expected: `no stale imports`.

- [ ] **Step 4: Build & lint full project**

Run: `pnpm build 2>&1 | tail -25`
Expected: tsc + vite build OK; `/admin/category/` resolves to new feature.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat(category): wire route to setup/category and remove empty legacy folder"
```

---

## Task 10: Final verification pass

**Files:** none (verification only).

- [ ] **Step 1: Run full lint**

Run: `pnpm lint 2>&1 | tail -30`
Expected: no errors.

- [ ] **Step 2: Run tests**

Run: `pnpm test 2>&1 | tail -20`
Expected: slugify tests pass (4 tests).

- [ ] **Step 3: Run production build**

Run: `pnpm build 2>&1 | tail -25`
Expected: success, `routeTree.gen.ts` includes `/admin/setup/brand/` and `/admin/category/`.

- [ ] **Step 4: Manual smoke (dev server) — optional**

Run: `pnpm dev` then open `http://localhost:5173/admin/setup/brand` and `/admin/category`. Verify: list loads, "Tambah" opens modal, submit creates row, row-select enables edit/delete, delete confirm works.
Expected: all flows functional.

- [ ] **Step 5: Final commit (if any fixups needed)**

```bash
git add -A
git commit -m "chore: final lint/test/build verification for brand & category setup"
```

---

## Self-Review Notes

- **Spec coverage:** Brand entity (name+logoUrl) → Task 1-4. Category entity (name+slug+parentId self-ref) → Task 5-9. Dialog-form (not separate pages) → all view tasks. Folder structure views/hooks/types/service → every feature task. JSDoc → `slugify` has JSDoc; service functions carry block comments mirroring `menu.service.ts` style. TDD → Task 6 for `slugify`. Testing → Task 10 full pass.
- **Placeholder scan:** No TBD/TODO. Each code step shows full content. Types consistent across tasks (`BrandItem`/`BrandPayload`/`BrandDialogMode` in Task 1 used identically in Task 2-4; `CategoryItem`/`CategoryPayload`/`CategoryDialogMode` in Task 5 used in 7-9). `brandListQueryKey`/`categoryListQueryKey` referenced in mutations and hooks match definitions.
- **Type consistency check:** `useBrandForm` returns `form` (TanStack Form API) consumed by `BrandFormDialog` via `form.Field`/`useStore(form.store,...)` — matches `menu` pattern. `parentOptions` shape `{label,value}[]` in `useCategoryList` matches `FieldSelect` `FieldOption`. `slugify` signature `(input: string) => string` used in `useCategoryForm`.
- **Caveat:** Backend endpoints (`admin/brands`, `admin/categories`) and permission codes (`setup.brand.*`, `setup.category.*`) must exist in the API + access-control seed for runtime to work; this plan covers the frontend only. If the API differs (e.g. field names, pagination envelope), adjust `*.service.ts` accordingly — the `unwrapData`/`unwrapPaginated` helpers tolerate both envelope and plain-array shapes.
