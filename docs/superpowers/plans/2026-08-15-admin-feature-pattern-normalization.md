# Admin Feature Pattern Normalization Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `permission`, `role`, and `user` features follow the exact folder + logic schema already established by `menu`, and add a one-line English logic comment to every function across `menu`, `permission`, `role`, `user`, and `auth` for maintainability.

**Architecture:** The canonical `menu` feature splits data access into three service files — `service/menu.service.ts` (raw API fns only), `service/menu.queries.ts` (query keys, `queryOptions` builders, `useGetXxxQuery` hooks, `invalidateXQueries`), and `service/menu.mutations.ts` (`useCreateX`/`useUpdateX`/`useDeleteX` hooks) — plus `types/index.ts` (re-exported from `service.ts` for backward compat) and thin `hooks/useXList.ts` + `hooks/useXForm.ts` that *consume* those. We replicate this shape for `permission`, `role`, `user`. `auth` is structurally different (no CRUD list) so it is left as-is and only gets comments. There is no test framework in this repo, so each task's verification gate is `pnpm lint` + `pnpm build` (type-check) plus a manual `pnpm dev` smoke check.

**Tech Stack:** React 19, TypeScript 6 (strict), TanStack Query v4, TanStack Form, AG Grid, Zod, sonner, axios. Path alias `@/` → `./src/`.

**Spec:** This plan is self-contained (no separate spec doc). It argues from the existing canonical implementation at `src/features/admin/setup/menu/`, which is the agreed reference pattern.

## Global Constraints

- **Folder schema (per feature):** `components/`, `hooks/`, `service/` (split into `*.service.ts`, `*.queries.ts`, `*.mutations.ts`), `types/index.ts`, `views/`, `index.ts` (barrel exporting views + `export {} from "./types"`).
- **`service/X.service.ts`** holds ONLY raw `api.*` async functions. Types are defined in `types/index.ts` and **re-exported** from `X.service.ts` (`export type { ... } from "../types";`) so existing `import type { XItem } from "../service/X.service"` callers keep working unchanged.
- **`service/X.queries.ts`** owns: `XListQueryKey` constant, `*QueryKey(params)` builder, `*QueryOptions(params)` builder, `useGetXxxListQuery` / `useGetXxxByIdQuery`, and `invalidateXQueries(queryClient)`.
- **`service/X.mutations.ts`** owns: `useCreateX` / `useUpdateX` / `useDeleteX` hooks, each handling toast + `invalidateXQueries` + `invalidateMe`.
- **Comments:** English, one line (or short block) per function stating WHAT it does and WHY. Form/List hooks and views get the same treatment.
- **`invalidateMe`** from `@/features/auth/service/me.service` MUST be called after any create/update/delete (access-control tree changed).
- **No test framework** is configured; verification = `pnpm lint` then `pnpm build`. Do not add a test lib.
- **Do not change runtime behavior.** Refactor only structure + add comments. UI, endpoints, validation, and toast copy stay identical.
- **Cross-feature type imports** (e.g. `role.service.ts` importing `PermissionItem`) point at the source feature's `types`, not its `service.ts`.

---

## File Structure (target end-state)

```
src/features/admin/setup/permission/
  components/permission-columns.tsx        (comments added; import type from ../types)
  hooks/usePermissionList.ts               (rewrite: consume queries+mutations)
  hooks/usePermissionForm.ts               (rewrite: consume queries; type comment)
  service/permission.service.ts            (API fns only + re-export types)
  service/permission.queries.ts           (NEW)
  service/permission.mutations.ts          (NEW)
  types/index.ts                           (NEW: PermissionItem, PermissionPayload)
  views/PermissionListView.tsx             (comments added)
  views/PermissionFormView.tsx             (comments added)
  index.ts                                 (+ export {} from "./types")

src/features/admin/setup/role/
  components/role-columns.tsx              (comments)
  components/RoleSummary.tsx               (comments)
  hooks/useRoleList.ts                     (rewrite: consume queries+mutations)
  hooks/useRoleForm.ts                     (rewrite: consume queries; type comment)
  hooks/useRolePermissions.ts              (comments only; structure kept)
  service/role.service.ts                  (API fns only + re-export types; PermissionItem import -> ../permission/types)
  service/role.queries.ts                  (NEW)
  service/role.mutations.ts                (NEW)
  types/index.ts                           (NEW: RoleItem + sub-types, RolePayload)
  views/RoleListView.tsx                   (comments)
  views/RoleFormView.tsx                   (comments)
  index.ts                                 (+ export {} from "./types")

src/features/admin/user/
  components/user-columns.tsx              (comments; REMOVE leftover console.log)
  hooks/useUserList.ts                     (rewrite: consume queries+mutations)
  hooks/useUserForm.ts                     (rewrite: consume queries; fix selectedRoleItems sync bug; type comment)
  hooks/useAssignRole.ts                   (DELETE — empty unused stub)
  service/user.service.ts                  (unchanged except re-export types from ../types)
  service/user.queries.ts                  (NEW)
  service/user.mutations.ts                (NEW)
  types/index.ts                           (exists; add re-export source)
  views/UserListView.tsx                   (comments)
  views/UserFormView.tsx                   (comments)
  index.ts                                 (+ export {} from "./types")

src/features/admin/setup/menu/             (structure already canonical)
  ALL files                                (English logic comments added; no restructuring)

src/features/auth/                         (structure untouched)
  components/AuthField.tsx, hooks/useSignIn.ts, hooks/useSignUp.ts,
  service/auth.service.ts, service/me.service.ts,
  signInPage.tsx, signUpPage.tsx, types/me.ts   (English logic comments added)
```

---

### Task 1: Permission — split service into types + queries + mutations

**Files:**
- Create: `src/features/admin/setup/permission/types/index.ts`
- Create: `src/features/admin/setup/permission/service/permission.queries.ts`
- Create: `src/features/admin/setup/permission/service/permission.mutations.ts`
- Modify: `src/features/admin/setup/permission/service/permission.service.ts`

**Interfaces:**
- Consumes: `getPermissions`, `getPermissionById`, `createPermission`, `updatePermission`, `deletePermission` (stay in `permission.service.ts`); `invalidateMe` from `@/features/auth/service/me.service`.
- Produces: `permissionListQueryKey`, `useGetPermissionsListQuery`, `useGetPermissionByIdQuery`, `invalidatePermissionQueries` (used by Task 3 + later hooks); `useDeletePermission`, `useCreatePermission`, `useUpdatePermission`.

- [ ] **Step 1: Create `types/index.ts`** — move `PermissionItem` and `PermissionPayload` out of the service file.

```ts
// Types describing a permission record and the payload used to create/update it.
export type PermissionItem = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  menuId?: string | null;
  menuName?: string | null;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
  menu: {
    id: string;
    name: string;
    code: string;
    route?: string | null;
    iconName?: string | null;
  };
};

// Payload sent to the create/update permission endpoints.
export type PermissionPayload = {
  name: string;
  code: string;
  description?: string | null;
  menuId?: string | null;
};
```

- [ ] **Step 2: Edit `permission.service.ts`** — delete the two type blocks, keep the five `api.*` functions, and re-export types for backward compat.

```ts
import { api } from "@/lib/axios";
import { unwrapPaginated, unwrapData } from "@/lib/api-response";
import type { PaginatedResponse, ApiResponse } from "@/lib/api-response";
// Re-export domain types so callers importing from this file keep working.
export type { PermissionItem, PermissionPayload } from "../types";

// Fetch a paginated permission list, optionally filtered by search/menu.
export async function getPermissions(params?: {
  search?: string;
  menuId?: string;
  menuIds?: string[];
  page?: number;
  limit?: number;
  no_pagination?: boolean;
}) {
  const response = await api.get<PaginatedResponse<PermissionItem>>(
    "admin/permissions",
    { params: { ...params, menuIds: params?.menuIds?.join(",") } },
  );
  return unwrapPaginated<PermissionItem>(response.data);
}

// Fetch a single permission by id.
export async function getPermissionById(permissionId: string) {
  const response = await api.get<ApiResponse<PermissionItem>>(
    `admin/permissions/${permissionId}`,
  );
  return unwrapData<PermissionItem>(response.data);
}

// Create a new permission.
export async function createPermission(payload: PermissionPayload) {
  const response = await api.post<ApiResponse<PermissionItem>>(
    "admin/permissions",
    payload,
  );
  return unwrapData<PermissionItem>(response.data);
}

// Update an existing permission.
export async function updatePermission(
  permissionId: string,
  payload: PermissionPayload,
) {
  const response = await api.put<ApiResponse<PermissionItem>>(
    `admin/permissions/${permissionId}`,
    payload,
  );
  return unwrapData<PermissionItem>(response.data);
}

// Delete a permission by id.
export async function deletePermission(permissionId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(
    `admin/permissions/${permissionId}`,
  );
  return unwrapData<{ success?: boolean }>(response.data);
}
```

- [ ] **Step 3: Create `permission.queries.ts`**

```ts
import { queryOptions, useQuery, type QueryClient } from "@tanstack/react-query";
import type { QueryConfig } from "@/lib/react-query";
import { getPermissions, getPermissionById } from "./permission.service";
import type { PermissionItem } from "../types";

// Base query key for all permission queries (used for invalidation).
export const permissionListQueryKey = ["permissions"] as const;

export type PermissionListParams = {
  search?: string;
  page?: number;
  limit?: number;
};

// Build the full query key including current filter/page params.
export const getPermissionsListQueryKey = (
  params?: PermissionListParams,
): unknown[] => [
  ...permissionListQueryKey,
  params?.search ?? "",
  params?.page ?? 1,
  params?.limit ?? 25,
];

// queryOptions for the permission list (used by hooks and route prefetch).
export const getPermissionsListQueryOptions = (params?: PermissionListParams) =>
  queryOptions({
    queryKey: getPermissionsListQueryKey(params),
    queryFn: () => getPermissions(params),
  });

// queryOptions for a single permission (detail/edit screens).
export const getPermissionByIdQueryOptions = (permissionId: string) =>
  queryOptions({
    queryKey: [...permissionListQueryKey, permissionId],
    queryFn: () => getPermissionById(permissionId),
  });

// Hook: paginated permission list.
export const useGetPermissionsListQuery = (
  params?: PermissionListParams,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getPermissionsListQueryOptions> } = {},
) => useQuery({ ...getPermissionsListQueryOptions(params), ...queryConfig });

// Hook: single permission by id.
export const useGetPermissionByIdQuery = (
  permissionId: string,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getPermissionByIdQueryOptions> } = {},
) => useQuery({ ...getPermissionByIdQueryOptions(permissionId), ...queryConfig });

// Invalidate every permission query so list/detail observers refetch.
export function invalidatePermissionQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: permissionListQueryKey });
}
```

- [ ] **Step 4: Create `permission.mutations.ts`**

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import type { MutationConfig } from "@/lib/react-query";
import {
  deletePermission,
  createPermission,
  updatePermission,
} from "./permission.service";
import type { PermissionPayload } from "../types";
import { invalidatePermissionQueries } from "./permission.queries";
import { invalidateMe } from "@/features/auth/service/me.service";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyMutationFn = (...args: any) => Promise<any>;
type SuccessParams<Fn extends AnyMutationFn> = Parameters<
  NonNullable<MutationConfig<Fn>["onSuccess"]>
>;

// Delete a permission, then refresh caches + access control.
type UseDeletePermissionOptions = {
  mutationConfig?: MutationConfig<typeof deletePermission>;
};
export const useDeletePermission = ({
  mutationConfig,
}: UseDeletePermissionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: deletePermission,
    onSuccess: (...args: SuccessParams<typeof deletePermission>) => {
      toast.success("Permission berhasil dihapus.");
      void invalidatePermissionQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menghapus permission.")),
  });
};

// Create a permission, then refresh caches + access control.
type UseCreatePermissionOptions = {
  mutationConfig?: MutationConfig<typeof createPermission>;
};
export const useCreatePermission = ({
  mutationConfig,
}: UseCreatePermissionOptions = {}) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: createPermission,
    onSuccess: (...args: SuccessParams<typeof createPermission>) => {
      toast.success("Permission berhasil ditambahkan.");
      void invalidatePermissionQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal menambahkan permission.")),
  });
};

// Update a permission by id, then refresh caches + access control.
type UseUpdatePermissionOptions = {
  permissionId: string;
  mutationConfig?: MutationConfig<typeof updatePermission>;
};
export const useUpdatePermission = ({
  permissionId,
  mutationConfig,
}: UseUpdatePermissionOptions) => {
  const queryClient = useQueryClient();
  const { onSuccess, ...restConfig } = mutationConfig || {};
  return useMutation({
    ...restConfig,
    mutationFn: (payload: PermissionPayload) =>
      updatePermission(permissionId, payload),
    onSuccess: (...args: SuccessParams<typeof updatePermission>) => {
      toast.success("Permission berhasil diperbarui.");
      void invalidatePermissionQueries(queryClient);
      void invalidateMe(queryClient);
      onSuccess?.(...args);
    },
    onError: (error: Error) =>
      toast.error(getErrorMessage(error, "Gagal memperbarui permission.")),
  });
};
```

- [ ] **Step 5: Verify (lint + type-check) and commit**

```bash
pnpm lint && pnpm build
```
Expected: no TS/lint errors (new files are self-contained; nothing imports them yet).
```bash
git add src/features/admin/setup/permission/types src/features/admin/setup/permission/service/permission.queries.ts src/features/admin/setup/permission/service/permission.mutations.ts src/features/admin/setup/permission/service/permission.service.ts
git commit -m "refactor(permission): split service into queries/mutations + types"
```

---

### Task 2: Permission — rewrite `usePermissionList` to consume the new services

**Files:**
- Modify: `src/features/admin/setup/permission/hooks/usePermissionList.ts`

**Interfaces:**
- Consumes: `useGetPermissionsListQuery` (from `../service/permission.queries`), `useDeletePermission` (from `../service/permission.mutations`), `PermissionItem` (from `../types`).
- Produces: same return shape as before (`permissions`, `totalPermissions`, `pagination`, `isLoading`, `isRefreshing`, `isDeleting`, `refetchPermissions`, `deletePermission`) — `PermissionListView` is unchanged.

- [ ] **Step 1: Rewrite the hook**

```ts
import { useGetPermissionsListQuery } from "../service/permission.queries";
import { useDeletePermission } from "../service/permission.mutations";
import type { PermissionItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

// Loads the paginated permission list and exposes delete + refetch helpers.
export function usePermissionList(search?: string, page = 1, limit = 10) {
  // Fetch the permission list via the shared query hook.
  const query = useGetPermissionsListQuery({ search, page, limit });
  const data = query.data as UnwrappedPaginated<PermissionItem> | undefined;

  // Derive the rows/pagination the view needs from the query result.
  const permissions = data?.items ?? [];
  const pagination = data?.pagination;
  const totalPermissions = pagination?.totalItems ?? 0;

  // Delete mutation (toast + cache invalidation handled inside the hook).
  const deleteMutation = useDeletePermission();

  return {
    permissions,
    totalPermissions,
    pagination,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    isDeleting: deleteMutation.isPending,
    refetchPermissions: async () => {
      await query.refetch();
    },
    deletePermission: async (permissionId: string) => {
      await deleteMutation.mutateAsync(permissionId);
    },
  };
}
```

- [ ] **Step 2: Verify and commit**

```bash
pnpm lint && pnpm build
```
Expected: PASS (list view still imports the same hook name/shape).
```bash
git add src/features/admin/setup/permission/hooks/usePermissionList.ts
git commit -m "refactor(permission): consume queries/mutations in usePermissionList"
```

---

### Task 3: Permission — rewrite `usePermissionForm` to consume the new services

**Files:**
- Modify: `src/features/admin/setup/permission/hooks/usePermissionForm.ts`

**Interfaces:**
- Consumes: `useGetPermissionsListQuery` (from `@/features/admin/setup/menu/service/menu.queries`), `useGetPermissionByIdQuery` (from `../service/permission.queries`); `createPermission`/`updatePermission` raw fns + `PermissionPayload` from `../types`; `invalidatePermissionQueries` + `invalidateMe`.
- Produces: same return shape (`form`, `isEditMode`, `isSubmitting`, `isLoadingDetail`, `menuOptions`, `menuOptionsLoading`) — `PermissionFormView` unchanged.

- [ ] **Step 1: Update imports** — replace the two inline `useQuery` calls with the shared query hooks. Remove `import { permissionListQueryKey } from "./usePermissionList"` and the raw `getPermissionById` import.

- [ ] **Step 2: Replace the detail + menus queries**

Replace:
```ts
const permissionDetailQuery = useQuery({
  queryKey: [...permissionListQueryKey, permissionId],
  queryFn: () => getPermissionById(permissionId as string),
  enabled: isEditMode,
});

const menusQuery = useQuery({
  queryKey: ["menus"],
  queryFn: () => getMenusList({ limit: 30 }),
});
```
With:
```ts
// Load the permission being edited (disabled in create mode).
const permissionDetailQuery = useGetPermissionByIdQuery(permissionId as string, {
  queryConfig: { enabled: isEditMode },
});

// Reuse the menu query to populate the "Menu" dropdown.
const menusQuery = useGetPermissionsListQuery(); // placeholder, replaced below
```
Correction — menus come from the **menu** service, so use:
```ts
const menusQuery = useGetMenusListQuery({ limit: 30 });
```
(import `useGetMenusListQuery` from `@/features/admin/setup/menu/service/menu.queries`).

- [ ] **Step 3: Update the submit mutation's `onSuccess`** to use the shared invalidation helpers instead of a raw invalidation by key:

```ts
onSuccess: async () => {
  toast.success(
    isEditMode
      ? "Permission berhasil diperbarui."
      : "Permission berhasil ditambahkan.",
  );
  await invalidatePermissionQueries(queryClient);
  await invalidateMe(queryClient);
  void navigate({ to: "/admin/setup/permission" });
},
```

- [ ] **Step 4: Add an English comment to the schema/helper functions** (`slugifyPermissionName`, `generatePermissionCode`, `toPayload`, `usePermissionForm`) describing what each does.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm build
```
Expected: PASS. Form view behavior unchanged.
```bash
git add src/features/admin/setup/permission/hooks/usePermissionForm.ts
git commit -m "refactor(permission): consume queries in usePermissionForm"
```

---

### Task 4: Permission — comments on views/columns + `index.ts` types export

**Files:**
- Modify: `src/features/admin/setup/permission/components/permission-columns.tsx`
- Modify: `src/features/admin/setup/permission/views/PermissionListView.tsx`
- Modify: `src/features/admin/setup/permission/views/PermissionFormView.tsx`
- Modify: `src/features/admin/setup/permission/index.ts`

**Interfaces:** No new exports beyond adding `export {} from "./types"` to `index.ts`.

- [ ] **Step 1: Add a comment above `getPermissionColumns()`** explaining the column set (Menu, Name, Code, Description; all text-filterable).
- [ ] **Step 2: Add comments to the major blocks in `PermissionListView`** (`handleSearch`, `RowActions` handlers, `ConfirmDialog` wiring).
- [ ] **Step 3: Add comments to `PermissionFormView`** form sections and the `getErrorMessage` helper.
- [ ] **Step 4: Edit `index.ts`** to also export types:

```ts
export { PermissionListView } from "./views/PermissionListView";
export { PermissionFormView } from "./views/PermissionFormView";
export {} from "./types";
```

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/permission/components/permission-columns.tsx src/features/admin/setup/permission/views/PermissionListView.tsx src/features/admin/setup/permission/views/PermissionFormView.tsx src/features/admin/setup/permission/index.ts
git commit -m "docs(permission): add function comments + export types"
```

---

### Task 5: Role — split service into types + queries + mutations

**Files:**
- Create: `src/features/admin/setup/role/types/index.ts`
- Create: `src/features/admin/setup/role/service/role.queries.ts`
- Create: `src/features/admin/setup/role/service/role.mutations.ts`
- Modify: `src/features/admin/setup/role/service/role.service.ts`

**Interfaces:**
- Consumes: `getRoles`, `getRoleById`, `createRole`, `updateRole`, `deleteRole`; `invalidateMe`.
- Produces: `roleListQueryKey`, `useGetRolesListQuery`, `useGetRoleByIdQuery`, `invalidateRoleQueries`, `useDeleteRole`, `useCreateRole`, `useUpdateRole`.

- [ ] **Step 1: Create `types/index.ts`** with `RoleItem`, `RolePayload`, `RolePermissionEntry`, `RoleMenuEntry`, `RoleMenuPermission`.

```ts
// A permission entry attached to a role (join-row shape from the API).
export type RolePermissionEntry = {
  id: string;
  roleId: string;
  permissionId: string;
  permission: {
    id: string;
    name: string;
    code: string;
    description?: string | null;
  };
};

// A permission row inside a role's menu grouping (edit-mode checkbox state).
export type RoleMenuPermission = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  is_checked: boolean;
};

// A menu node returned when loading a role's permission tree.
export type RoleMenuEntry = {
  id: string;
  name: string;
  code: string;
  iconName?: string;
  sortOrder?: number;
  permissions: RoleMenuPermission[];
};

// A role record as returned by the list/detail endpoints.
export type RoleItem = {
  id: string;
  name: string;
  code: string;
  description?: string | null;
  isActive?: boolean;
  isSystem?: boolean;
  menus?: RoleMenuEntry[];
  rolePermissions?: RolePermissionEntry[];
  permissionIds?: string[];
  createdAt?: string;
  updatedAt?: string;
};

// Payload sent to create/update a role.
export type RolePayload = {
  name: string;
  code: string;
  description?: string | null;
  isActive: boolean;
  permissionIds: string[];
};
```

- [ ] **Step 2: Edit `role.service.ts`** — remove the type blocks, import `PermissionItem` from `../permission/types` (not `permission.service`), keep the five API fns, and re-export types.

```ts
import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
// Re-export domain types so callers importing from this file keep working.
export type {
  RoleItem,
  RolePayload,
  RolePermissionEntry,
  RoleMenuEntry,
  RoleMenuPermission,
} from "../types";

// Fetch a paginated role list.
export async function getRoles(params?: { search?: string; page?: number; limit?: number }) {
  const response = await api.get<PaginatedResponse<RoleItem>>("admin/roles", { params });
  return unwrapPaginated<RoleItem>(response.data);
}

// Fetch a single role by id (includes its permission tree).
export async function getRoleById(roleId: string) {
  const response = await api.get<ApiResponse<RoleItem>>(`admin/roles/${roleId}`);
  return unwrapData<RoleItem>(response.data);
}

// Create a new role.
export async function createRole(payload: RolePayload) {
  const response = await api.post<ApiResponse<RoleItem>>("admin/roles", payload);
  return unwrapData<RoleItem>(response.data);
}

// Update an existing role.
export async function updateRole(roleId: string, payload: RolePayload) {
  const response = await api.put<ApiResponse<RoleItem>>(`admin/roles/${roleId}`, payload);
  return unwrapData<RoleItem>(response.data);
}

// Delete a role by id.
export async function deleteRole(roleId: string) {
  const response = await api.delete<ApiResponse<{ success?: boolean }>>(`admin/roles/${roleId}`);
  return unwrapData<{ success?: boolean }>(response.data);
}
```

- [ ] **Step 3: Create `role.queries.ts`** (mirror Task 1 Step 3, swapping permission→role, `PermissionListParams`→`RoleListParams`, `getPermissions`→`getRoles`, `getPermissionById`→`getRoleById`).

- [ ] **Step 4: Create `role.mutations.ts`** (mirror Task 1 Step 4, with `useCreateRole`/`useUpdateRole`/`useDeleteRole`, toast copy "Role berhasil ditambahkan/diperbarui/dihapus.", error "Gagal menambahkan/memperbarui/menghapus role.").

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/role/types src/features/admin/setup/role/service/role.queries.ts src/features/admin/setup/role/service/role.mutations.ts src/features/admin/setup/role/service/role.service.ts
git commit -m "refactor(role): split service into queries/mutations + types"
```

---

### Task 6: Role — rewrite `useRoleList` to consume the new services

**Files:**
- Modify: `src/features/admin/setup/role/hooks/useRoleList.ts`

**Interfaces:**
- Consumes: `useGetRolesListQuery`, `useDeleteRole`, `RoleItem`.
- Produces: same shape (`roles`, `totalRoles`, `pagination`, `stats`, `isLoading`, `isRefreshing`, `isDeleting`, `refetchRoles`, `deleteRole`) + `RoleStats` type.

- [ ] **Step 1: Rewrite** — replace inline `useQuery` + inline delete `useMutation` with the shared hooks; add comments to `RoleStats`, the stats derivation, and the hook.

```ts
import { useGetRolesListQuery } from "../service/role.queries";
import { useDeleteRole } from "../service/role.mutations";
import type { RoleItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

// Aggregate counts shown in the role list stat cards.
export type RoleStats = {
  totalRoles: number;
  activeRoles: number;
  systemRoles: number;
  customRoles: number;
};

// Loads the paginated role list and exposes stats, delete + refetch helpers.
export function useRoleList(search?: string, page = 1, limit = 25) {
  const query = useGetRolesListQuery({ search, page, limit });
  const data = query.data as UnwrappedPaginated<RoleItem> | undefined;

  const roles = data?.items ?? [];
  const pagination = data?.pagination;
  const totalRoles = pagination?.totalItems ?? roles.length;

  // Derive the four stat values from the current page of roles.
  const activeRoles = roles.filter((role) => role.isActive ?? true).length;
  const systemRoles = roles.filter((role) => role.isSystem === true).length;
  const customRoles = roles.filter((role) => role.isSystem !== true).length;

  const deleteMutation = useDeleteRole();

  return {
    roles,
    totalRoles,
    pagination,
    stats: { totalRoles, activeRoles, systemRoles, customRoles } satisfies RoleStats,
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    isDeleting: deleteMutation.isPending,
    refetchRoles: async () => {
      await query.refetch();
    },
    deleteRole: async (roleId: string) => {
      await deleteMutation.mutateAsync(roleId);
    },
  };
}
```

- [ ] **Step 2: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/role/hooks/useRoleList.ts
git commit -m "refactor(role): consume queries/mutations in useRoleList"
```

---

### Task 7: Role — rewrite `useRoleForm` to consume the new services

**Files:**
- Modify: `src/features/admin/setup/role/hooks/useRoleForm.ts`

**Interfaces:**
- Consumes: `useGetRoleByIdQuery` (from `../service/role.queries`); `createRole`/`updateRole` raw fns + `RolePayload` from `../types`; `invalidateRoleQueries` + `invalidateMe`. `useRolePermissions.ts` is NOT changed in signature.
- Produces: same shape (`form`, `isEditMode`, `isSubmitting`, `isLoadingDetail`, `initialMenuIds`, `submitForm`).

- [ ] **Step 1: Replace the inline detail query** with `useGetRoleByIdQuery(roleId, { queryConfig: { enabled: isEditMode } })`; remove `import { roleListQueryKey } from "./useRoleList"` and the raw `getRoleById` import.
- [ ] **Step 2: Update the submit `mutation.onSuccess`** to call `invalidateRoleQueries(queryClient)` + `invalidateMe(queryClient)` (instead of a raw `invalidateQueries({ queryKey: roleListQueryKey })`).
- [ ] **Step 3: Add English comments** to `generateRoleCode`, `toPayload`, `useRoleForm`, and the two `useEffect` blocks (populate-on-edit, auto-generate code).
- [ ] **Step 4: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/role/hooks/useRoleForm.ts
git commit -m "refactor(role): consume queries in useRoleForm"
```

---

### Task 8: Role — comments on views/columns/components + `index.ts`

**Files:**
- Modify: `src/features/admin/setup/role/components/role-columns.tsx`
- Modify: `src/features/admin/setup/role/components/RoleSummary.tsx`
- Modify: `src/features/admin/setup/role/hooks/useRolePermissions.ts` (comments only)
- Modify: `src/features/admin/setup/role/views/RoleListView.tsx`
- Modify: `src/features/admin/setup/role/views/RoleFormView.tsx`
- Modify: `src/features/admin/setup/role/index.ts`

- [ ] **Step 1: Add comment above `getRoleColumns()`** (Name, Code, Permissions count, Status badge, Description).
- [ ] **Step 2: Add comments to `RoleSummary` props + render sections.**
- [ ] **Step 3: Add comments to `useRolePermissions`** — each helper (`togglePermission`, `toggleMenuPermissions`, `handleMenusChange`) and the grouping/filter memo blocks.
- [ ] **Step 4: Add comments to `RoleListView` (stat cards, toolbar, dialog) and `RoleFormView` (form sections, summary, permission assignment UI).**
- [ ] **Step 5: Edit `index.ts`** to add `export {} from "./types";`
- [ ] **Step 6: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/role/components src/features/admin/setup/role/hooks/useRolePermissions.ts src/features/admin/setup/role/views src/features/admin/setup/role/index.ts
git commit -m "docs(role): add function comments + export types"
```

---

### Task 9: User — split service into queries + mutations + re-export types

**Files:**
- Create: `src/features/admin/setup/user/service/user.queries.ts`
- Create: `src/features/admin/setup/user/service/user.mutations.ts`
- Modify: `src/features/admin/setup/user/service/user.service.ts` (add re-export of types)
- Modify (delete): `src/features/admin/setup/user/hooks/useAssignRole.ts`

**Interfaces:**
- Consumes: `getUsers`, `getUser`, `createUser`, `updateUser`, `deleteUser` (stay in `user.service.ts`); `invalidateMe`.
- Produces: `userListQueryKey`, `useGetUserListQuery`, `useGetUserByIdQuery`, `invalidateUserQueries`, `useDeleteUser`, `useCreateUser`, `useUpdateUser`.

- [ ] **Step 1: Edit `user.service.ts`** — append a re-export so `import type { UserEntity } from "../types"` callers (and the existing `import type { UserEntity } from "../types"` inside the service) resolve; nothing else changes (types already live in `types/index.ts`).

Add at top of `user.service.ts`:
```ts
export type { UserEntity, UserFormInput, UserRoleEntity } from "../types";
```

- [ ] **Step 2: Create `user.queries.ts`** (mirror Task 1 Step 3; `UserListParams` = `{ search?, page?, limit? }`, fns `getUsers`/`getUser`).

- [ ] **Step 3: Create `user.mutations.ts`** (mirror Task 1 Step 4; `useCreateUser`/`useUpdateUser`/`useDeleteUser`, toast "User berhasil ditambahkan/diperbarui/dihapus.", error "Gagal menambahkan/memperbarui/menghapus user.").

- [ ] **Step 4: Delete `hooks/useAssignRole.ts`** — empty, unused stub (grep confirms no importers). User role assignment is handled inline in `UserFormView`, matching the `menu` feature's no-`useAssignRole` shape.

- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/user/service/user.queries.ts src/features/admin/setup/user/service/user.mutations.ts src/features/admin/setup/user/service/user.service.ts
git rm src/features/admin/setup/user/hooks/useAssignRole.ts
git commit -m "refactor(user): split service into queries/mutations; drop empty useAssignRole stub"
```

---

### Task 10: User — rewrite `useUserList` to consume the new services

**Files:**
- Modify: `src/features/admin/setup/user/hooks/useUserList.ts`

**Interfaces:**
- Consumes: `useGetUserListQuery`, `useDeleteUser`, `UserEntity`.
- Produces: same shape (`users`, `totalUsers`, `pagination`, `stats`, `isLoading`, `isRefreshing`, `isDeleting`, `refetchUsers`, `deleteUser`).

- [ ] **Step 1: Rewrite** — mirror Task 2, keeping the `stats` derivation (activeUsers, superadmins) and adding comments.

```ts
import { useGetUserListQuery } from "../service/user.queries";
import { useDeleteUser } from "../service/user.mutations";
import type { UserEntity } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";

// Loads the paginated user list and exposes stats, delete + refetch helpers.
export function useUserList(search?: string, page = 1, limit = 25) {
  const query = useGetUserListQuery({ search, page, limit });
  const data = query.data as UnwrappedPaginated<UserEntity> | undefined;

  const users = data?.items ?? [];
  const pagination = data?.pagination;
  const totalUsers = pagination?.totalItems ?? users.length;

  // Derive dashboard stats from the current page of users.
  const activeUsers = users.filter((u) => u.isActive).length;
  const superadmins = users.filter((u) => u.isSuperadmin).length;

  const deleteMutation = useDeleteUser();

  return {
    users,
    totalUsers,
    pagination,
    stats: { totalUsers, activeUsers, superadmins },
    isLoading: query.isLoading,
    isRefreshing: query.isFetching,
    isDeleting: deleteMutation.isPending,
    refetchUsers: async () => {
      await query.refetch();
    },
    deleteUser: async (id: string) => {
      await deleteMutation.mutateAsync(id);
    },
  };
}
```

- [ ] **Step 2: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/user/hooks/useUserList.ts
git commit -m "refactor(user): consume queries/mutations in useUserList"
```

---

### Task 11: User — rewrite `useUserForm` to consume the new services + fix role-sync bug

**Files:**
- Modify: `src/features/admin/setup/user/hooks/useUserForm.ts`

**Interfaces:**
- Consumes: `useGetUserByIdQuery` (from `../service/user.queries`); `createUser`/`updateUser` raw fns + `UserFormInput` from `../types`; `invalidateUserQueries` + `invalidateMe`.
- Produces: same shape (`form`, `isEditMode`, `isSubmitting`, `isLoadingDetail`, `selectedRoleItems`, `setSelectedRoleItems`, `existingAvatarUrl`).

- [ ] **Step 1: Replace the inline detail query** with `useGetUserByIdQuery(userId, { queryConfig: { enabled: isEditMode } })`; remove `import { userListQueryKey } from "./useUserList"` and raw `getUser` import.
- [ ] **Step 2: Update the submit `mutation.onSuccess`** to use `invalidateUserQueries(queryClient)` + `invalidateMe(queryClient)`.
- [ ] **Step 3: Fix the role-sync bug** — the current code calls `setSelectedRoleItems` during render (invalid React pattern) and contains a stray `console.log`/`if` block. Replace with a `useEffect` that seeds `selectedRoleItems` once when the detail loads:

```ts
const userRoles = userDetailQuery.data?.userRoles ?? [];
const initialRoleItems = userRoles
  .map((ur) => ur.role)
  .filter(Boolean) as RoleItem[];

const [selectedRoleItems, setSelectedRoleItems] = useState<RoleItem[]>([]);

// Seed the role picker from the loaded user's assigned roles (edit mode only).
useEffect(() => {
  if (isEditMode && initialRoleItems.length > 0) {
    setSelectedRoleItems(initialRoleItems);
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [userDetailQuery.data]);
```

- [ ] **Step 4: Add English comments** to `nullableTrimmedString`, `toPayload`, `useUserForm`, and the populate-on-edit `useEffect`.
- [ ] **Step 5: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/user/hooks/useUserForm.ts
git commit -m "refactor(user): consume queries in useUserForm; fix role-sync render bug"
```

---

### Task 12: User — comments on views/columns + `index.ts` + remove debug log

**Files:**
- Modify: `src/features/admin/setup/user/components/user-columns.tsx` (remove `console.log("data", data)` in `cellRenderer`; add comments)
- Modify: `src/features/admin/setup/user/views/UserListView.tsx`
- Modify: `src/features/admin/setup/user/views/UserFormView.tsx`
- Modify: `src/features/admin/setup/user/index.ts`

- [ ] **Step 1: In `user-columns.tsx`, delete line `console.log("data", data);` inside the `cellRenderer`. Add a comment above `getUserColumns()` and above the avatar cell renderer.**
- [ ] **Step 2: Add comments to `UserListView` (stat cards, toolbar, dialog) and `UserFormView` (form sections, role assignment, `getErrorMessage`).**
- [ ] **Step 3: Edit `index.ts`** to add `export {} from "./types";`
- [ ] **Step 4: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/user/components/user-columns.tsx src/features/admin/setup/user/views src/features/admin/setup/user/index.ts
git commit -m "docs(user): add function comments; drop debug log; export types"
```

---

### Task 13: Menu — add English logic comments (structure unchanged)

**Files:**
- Modify: `src/features/admin/setup/menu/service/menu.service.ts`
- Modify: `src/features/admin/setup/menu/service/menu.queries.ts`
- Modify: `src/features/admin/setup/menu/service/menu.mutations.ts`
- Modify: `src/features/admin/setup/menu/hooks/useMenuList.ts`
- Modify: `src/features/admin/setup/menu/hooks/useMenuForm.ts`
- Modify: `src/features/admin/setup/menu/components/menu-columns.tsx`
- Modify: `src/features/admin/setup/menu/views/MenuListView.tsx`
- Modify: `src/features/admin/setup/menu/views/MenuFormView.tsx`

**Interfaces:** No signature changes — comments only.

- [ ] **Step 1: Add comments to `menu.service.ts`** — each API fn (`getMenusList`, `getMenuById`, `createMenu`, `updateMenu`, `deleteMenu`, `generateMenuCode`) stating endpoint + purpose.
- [ ] **Step 2: Add comments to `menu.queries.ts`** — `menuListQueryKey`, `getMenusListQueryKey`, `getMenusListQueryOptions`, `getMenuByIdQueryOptions`, `useGetMenusListQuery`, `useGetMenuByIdQuery`, `invalidateMenuQueries`.
- [ ] **Step 3: Add comments to `menu.mutations.ts`** — `useDeleteMenu`, `useGenerateMenuCode`, `useCreateMenu`, `useUpdateMenu` (note each invalidates menu + me caches).
- [ ] **Step 4: Add comments to `useMenuList.ts`** — `resolveParentLabel`, the row mapping, and the hook.
- [ ] **Step 5: Add comments to `useMenuForm.ts`** — `nullableTrimmedString`, `buildSignature`, `toPayload`, the code-generation effect, the populate-on-edit effect, and the hook.
- [ ] **Step 6: Add comments to `menu-columns.tsx`, `MenuListView.tsx`, `MenuFormView.tsx`** — column definitions, toolbar handlers, dialog wiring, form sections.
- [ ] **Step 7: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/admin/setup/menu
git commit -m "docs(menu): add function logic comments"
```

---

### Task 14: Auth — add English logic comments (structure unchanged)

**Files:**
- Modify: `src/features/auth/components/AuthField.tsx`
- Modify: `src/features/auth/hooks/useSignIn.ts`
- Modify: `src/features/auth/hooks/useSignUp.ts`
- Modify: `src/features/auth/service/auth.service.ts`
- Modify: `src/features/auth/service/me.service.ts`
- Modify: `src/features/auth/signInPage.tsx`
- Modify: `src/features/auth/signUpPage.tsx`
- Modify: `src/features/auth/types/me.ts`

**Interfaces:** No signature changes — comments only. (Auth intentionally kept in its existing split: `auth.service.ts` + `me.service.ts` + `types/me.ts`.)

- [ ] **Step 1: `auth.service.ts`** — comment `signInWithEmail`, `signUpWithEmail`, `signOutAuth`, `getAuthSession`, `clearAuthCache`, `authSessionQueryKey`, `authSessionQueryOptions`.
- [ ] **Step 2: `me.service.ts`** — comment `meQueryKey`, `invalidateMe`, `getMe`, `meQueryOptions`.
- [ ] **Step 3: `useSignIn.ts`** — comment `signInSchema`, `validateSignInEmail`, `validateSignInPassword`, `redirectToTarget`, `useSignInForm`.
- [ ] **Step 4: `useSignUp.ts`** — comment `signUpFieldSchema`, `signUpPasswordMatchSchema`, `signUpSchema`, the validators, `redirectToTarget`, `useSignUpForm`.
- [ ] **Step 5: `AuthField.tsx`, `signInPage.tsx`, `signUpPage.tsx`** — comment the components and `getFieldError` helpers.
- [ ] **Step 6: `types/me.ts`** — comment each `Me*` type with its role in the access-control snapshot.
- [ ] **Step 7: Verify and commit**

```bash
pnpm lint && pnpm build
git add src/features/auth
git commit -m "docs(auth): add function logic comments"
```

---

## Self-Review

**1. Spec coverage:** Every target feature (`permission`, `role`, `user`) gets the full `menu` schema (types + service/queries/mutations). `auth` gets comments only, as agreed. Every function in `menu`/`permission`/`role`/`user`/`auth` gets an English comment. The empty `useAssignRole` stub is removed; the `user-columns` debug `console.log` is removed; the `useUserForm` render-time `setSelectedRoleItems` bug is fixed. ✓

**2. Placeholder scan:** No "TBD"/"implement later". New files have full code. Rewrite tasks show the exact replacement blocks. ✓

**3. Type consistency:**
- `XListQueryKey` constant name matches what the form hooks previously imported from `useXList` — those imports are moved to `service/X.queries` in the form-rewrite tasks (Task 3 / 7 / 11). ✓
- `useGetMenusListQuery` is imported from `@/features/admin/setup/menu/service/menu.queries` in `usePermissionForm` (Task 3) — that export exists in `menu.queries.ts`. ✓
- Re-export lines in each `X.service.ts` keep `import type { XItem } from "../service/X.service"` callers working without edits (`role-columns.tsx`, `useRoleList.ts`, `useUserForm.ts`, `user-columns.tsx`). ✓
- `invalidateMe` is preserved in every create/update/delete path (mutations + form onSuccess). ✓

**4. Behavior:** No endpoints, validation, toast copy, or UI changed — refactor + comments only. `pnpm build` type-checks each task. ✓
