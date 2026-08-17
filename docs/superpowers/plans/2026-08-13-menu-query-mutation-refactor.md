# Menu Query/Mutation Refactor Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Refactor menu data access to go through typed query/mutation option factories built on the generic types in `src/lib/react-query.ts`, so `useMenuForm` and `useMenuList` just call those functions instead of hand-rolling `useQuery`/`useMutation` inline.

**Architecture:** Centralize TanStack Query `queryOptions` + `mutationOptions` factories in `menu.service.ts` (typed via `QueryConfig`/`MutationConfig` from `src/lib/react-query.ts`). Hooks consume the factories directly. Query keys move to the service as the single source of truth. No public hook signatures change, so the two `views/*` callers are untouched.

**Tech Stack:** TypeScript 6 (strict), TanStack Query v4, TanStack Router v1, sonner (toasts), zod (form validation).

**Spec:** This plan is self-contained; it implements the user's request: "refactor query/mutation to use the generic types already defined in `@/lib/react-query.ts`, then refactor `useMenuForm` and `useMenuList` so they just call the query functions." No external spec doc.

## Global Constraints

- TypeScript `strict` mode is on — every generic must resolve with explicit types, no `any` leaking into hook return values.
- TanStack Query is **v4**: there is no built-in `mutationOptions` helper (that shipped in v5) — the plan adds our own typed `mutationOptions` in `react-query.ts`.
- No test framework is configured in this repo. Verification gate per task = `pnpm build` (runs `tsc -b`) + `pnpm lint`. Manual runtime check at the end via `pnpm dev`.
- Cache invalidation rule (from CLAUDE.md): `["me"]` must be invalidated via `invalidateMe(queryClient)` inside `onSuccess` of any menu mutation. Keep this in the mutation factory, not the hook.
- Query key `["menus"]` is the canonical base; `menuListQueryKey` (currently duplicated in the hook) becomes the only definition, owned by `menu.service.ts`.
- Comments stay short and professional — no long prose. One line per factory max.

---

### Task 1: Add typed mutation helper to `src/lib/react-query.ts`

**Files:**
- Modify: `src/lib/react-query.ts`

**Interfaces:**
- Consumes: existing `MutationConfig` (lines 20-26) and `QueryConfig` (lines 15-18) already in the file.
- Produces: `mutationOptions<Fn>()` factory — returns a `MutationConfig<Fn>` unchanged, only for ergonomic typing. Consumed by Task 2.

- [ ] **Step 1: Add the `mutationOptions` factory and a one-line doc to `MutationConfig`**

Open `src/lib/react-query.ts`. Replace the `MutationConfig` block (lines 20-26) and append the factory:

```ts
/** Typed `useMutation` options derived from a service mutation fn. */
export type MutationConfig<
  MutationFnType extends (...args: any) => Promise<any>,
> = UseMutationOptions<
  ApiFnReturnType<MutationFnType>,
  Error,
  Parameters<MutationFnType>[0]
>;

/** Ergonomic builder so service files read `mutationOptions({...})`. v4 has no built-in. */
export function mutationOptions<FnType extends (...args: any) => Promise<any>>(
  options: MutationConfig<FnType>,
): MutationConfig<FnType> {
  return options;
}
```

- [ ] **Step 2: Verify it type-checks in isolation**

Run: `pnpm build`
Expected: PASS (no new errors; `MutationConfig` already compiled, factory is type-only addition).

- [ ] **Step 3: Commit**

```bash
git add src/lib/react-query.ts
git commit -m "refactor(react-query): add typed mutationOptions helper"
```

---

### Task 2: Add typed query/mutation factories to `menu.service.ts`

**Files:**
- Modify: `src/features/admin/setup/menu/service/menu.service.ts`

**Interfaces:**
- Consumes: `QueryConfig` and `mutationOptions` from `@/lib/react-query`, `queryOptions`/`useQuery` from `@tanstack/react-query`, `invalidateMe` from `@/features/auth/service/me.service`, `getErrorMessage` from `@/utils/error`, `toast` from `sonner`, `MenuItem`/`MenuPayload`/`GenerateMenuCodePayload`/`GenerateMenuCodeData` from `../types`.
- Produces:
  - `menuListQueryKey: string[]` — canonical list key (replaces hook's duplicate).
  - `getMenusListQueryKey(params?): unknown[]` — param-encoded key.
  - `getMenusListQueryOptions(params?)` / `useGetMenusListQuery(params?, opts?)`.
  - `getMenuByIdQueryOptions(menuId)` / `useGetMenuByIdQuery(menuId, opts?)`.
  - `deleteMenuMutationOptions(queryClient)` / `generateMenuCodeMutationOptions(queryClient)`.
  - `createMenuMutationOptions(queryClient)` / `updateMenuMutationOptions(queryClient, menuId)` (used by Task 4 form + reusable elsewhere).
  - `invalidateMenuQueries(queryClient)` — small shared helper for `onSuccess`.
  - Consumed by Task 3 (`useMenuList`) and Task 4 (`useMenuForm`).

- [ ] **Step 1: Write the failing type check — confirm `useGetMenusListQuery` / `deleteMenuMutationOptions` are exported**

Run: `pnpm build`
Expected: FAIL or no-op — these names don't exist yet, so this just establishes the baseline compiles before edits. (No test runner; this is a compile baseline, not a behavioral test.)

- [ ] **Step 2: Replace the dead helpers and add factories**

In `menu.service.ts`:
1. Remove the unused `menuQueryKey`, `getMenuQueryOptions`, `useGetMenuQuery` (lines 13, 81-97). They duplicate the list key and are imported nowhere (verified by grep).
2. Update imports at top — add `useMutation`, `UseMutationOptions`(not needed), `mutationOptions`, `QueryConfig`, `toast`, `getErrorMessage`, `invalidateMe`:

```ts
import { api } from "@/lib/axios";
import { unwrapData, unwrapPaginated } from "@/lib/api-response";
import type { ApiResponse, PaginatedResponse } from "@/lib/api-response";
import type { MenuItem, MenuPayload, GenerateMenuCodePayload, GenerateMenuCodeData } from "../types";
import { queryOptions, useMutation, useQuery, type QueryClient } from "@tanstack/react-query";
import { mutationOptions, type QueryConfig } from "@/lib/react-query";
import { toast } from "sonner";
import { getErrorMessage } from "@/utils/error";
import { invalidateMe } from "@/features/auth/service/me.service";
```

3. After `menuQueryKey` removal, add the canonical key + param key + list params type:

```ts
export const menuListQueryKey = ["menus"] as const;

export type MenuListParams = {
  search?: string;
  show?: "active" | "inactive" | "all";
  page?: number;
  limit?: number;
};

export const getMenusListQueryKey = (params?: MenuListParams): unknown[] => [
  ...menuListQueryKey,
  params?.search ?? "",
  params?.show ?? "all",
  params?.page ?? 1,
  params?.limit ?? 25,
];
```

4. Replace `getMenusList` usage in options with param-aware factory + hook:

```ts
export const getMenusListQueryOptions = (params?: MenuListParams) =>
  queryOptions({
    queryKey: getMenusListQueryKey(params),
    queryFn: () => getMenusList(params),
  });

type UseMenusQueryOptions = { queryConfig?: QueryConfig<typeof getMenusListQueryOptions> };

export const useGetMenusListQuery = (
  params?: MenuListParams,
  { queryConfig }: UseMenusQueryOptions = {},
) => useQuery({ ...getMenusListQueryOptions(params), ...queryConfig });
```

5. Keep `getMenuByIdQueryOptions` (already exists) and add its hook:

```ts
export const useGetMenuByIdQuery = (
  menuId: string,
  { queryConfig }: { queryConfig?: QueryConfig<typeof getMenuByIdQueryOptions> } = {},
) => useQuery({ ...getMenuByIdQueryOptions(menuId), ...queryConfig });
```

6. Add the shared invalidation helper + mutation factories:

```ts
export function invalidateMenuQueries(queryClient: QueryClient) {
  return queryClient.invalidateQueries({ queryKey: menuListQueryKey });
}

export const deleteMenuMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: deleteMenu,
    onSuccess: async () => {
      toast.success("Menu berhasil dihapus.");
      await invalidateMenuQueries(queryClient);
      await invalidateMe(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menghapus menu.")),
  });

export const generateMenuCodeMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: generateMenuCode,
    onError: (error) =>
      toast.error(getErrorMessage(error, "Gagal membuat kode menu secara otomatis.")),
  });

export const createMenuMutationOptions = (queryClient: QueryClient) =>
  mutationOptions({
    mutationFn: createMenu,
    onSuccess: async () => {
      toast.success("Menu berhasil ditambahkan.");
      await invalidateMenuQueries(queryClient);
      await invalidateMe(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal menambahkan menu.")),
  });

export const updateMenuMutationOptions = (queryClient: QueryClient, menuId: string) =>
  mutationOptions({
    mutationFn: (payload: MenuPayload) => updateMenu(menuId, payload),
    onSuccess: async () => {
      toast.success("Menu berhasil diperbarui.");
      await invalidateMenuQueries(queryClient);
      await invalidateMe(queryClient);
    },
    onError: (error) => toast.error(getErrorMessage(error, "Gagal memperbarui menu.")),
  });
```

Note: `updateMenuMutationOptions` wraps `updateMenu(menuId, payload)` so the factory exposes a single-arg `mutationFn` typed `MutationConfig<typeof createMenu>`-compatible (`MenuPayload`). `createMenu`/`updateMenu` service signatures stay unchanged.

- [ ] **Step 3: Run type-check + lint**

Run: `pnpm build && pnpm lint`
Expected: PASS — `menuListQueryKey` now owned here; `QueryConfig` consumed by the two `use*` hooks.

- [ ] **Step 4: Commit**

```bash
git add src/features/admin/setup/menu/service/menu.service.ts
git commit -m "refactor(menu): add typed query/mutation factories and own query key"
```

---

### Task 3: Refactor `useMenuList.ts` to call the factories

**Files:**
- Modify: `src/features/admin/setup/menu/hooks/useMenuList.ts`

**Interfaces:**
- Consumes: `menuListQueryKey` (re-export kept for back-compat), `useGetMenusListQuery`, `deleteMenuMutationOptions` from `../service/menu.service`; `invalidateMe` no longer needed here (moved into factory).
- Produces: unchanged public return shape `{ menus, totalMenus, pagination, isLoading, isRefreshing, isDeleting, refetchMenus, deleteMenu }` — consumed by `views/MenuListView.tsx`.

- [ ] **Step 1: Swap imports and remove inline `useQuery`/`useMutation`**

Replace the top imports (lines 1-7) with:

```ts
import { useQueryClient } from "@tanstack/react-query";
import { menuListQueryKey, useGetMenusListQuery, deleteMenuMutationOptions } from "../service/menu.service";
import type { MenuItem } from "../types";
import type { UnwrappedPaginated } from "@/lib/api-response";
```

`menuListQueryKey` is re-exported here so `useMenuForm` (which imports it from this file) keeps working — add `export { menuListQueryKey } from "../service/menu.service";` after the imports, and delete the old `export const menuListQueryKey = ["menus"];` line (line 9).

- [ ] **Step 2: Use `useGetMenusListQuery` for the list query**

Replace the `menuQuery` block (lines 39-54) with:

```ts
  const menuQuery = useGetMenusListQuery(
    { search, show, page, limit },
    { queryConfig: { enabled: true } },
  );
```

(`enabled: true` is the default; passing `queryConfig` keeps the param shape consistent and lets callers override.)

- [ ] **Step 3: Use `deleteMenuMutationOptions` for the delete mutation**

Replace the `deleteMutation` block (lines 56-66) with:

```ts
  const deleteMutation = useMutation(deleteMenuMutationOptions(queryClient));
```

`useMutation` is now imported from `@tanstack/react-query` — add it to the import on line 1 (change `useQueryClient` import to `import { useMutation, useQueryClient } from "@tanstack/react-query";`).

- [ ] **Step 4: Run type-check + lint**

Run: `pnpm build && pnpm lint`
Expected: PASS — return shape unchanged; `toast`/`getErrorMessage`/`invalidateMe` no longer imported in this file.

- [ ] **Step 5: Commit**

```bash
git add src/features/admin/setup/menu/hooks/useMenuList.ts
git commit -m "refactor(menu): use query/mutation factories in useMenuList"
```

---

### Task 4: Refactor `useMenuForm.ts` to call the factories

**Files:**
- Modify: `src/features/admin/setup/menu/hooks/useMenuForm.ts`

**Interfaces:**
- Consumes: `menuListQueryKey` (still imported from `./useMenuList`, now re-exported), `useGetMenusListQuery`, `useGetMenuByIdQuery`, `generateMenuCodeMutationOptions`, `invalidateMenuQueries`, `createMenuMutationOptions`, `updateMenuMutationOptions` from `../service/menu.service`; `ApiFnReturnType` from `@/lib/react-query` for the submit mutation typing.
- Produces: unchanged public return shape `{ form, isEditMode, isGeneratingCode, isSubmitting, isLoadingDetail, parentOptions, parentOptionsLoading }` — consumed by `views/MenuFormView.tsx`.

- [ ] **Step 1: Update imports**

Replace lines 4, 10-19 with:

```ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import type { FieldOption } from "@/components/field/types";
import { getErrorMessage } from "@/utils/error";
import {
  createMenu,
  generateMenuCode,
  updateMenu,
} from "../service/menu.service";
import type { MenuPayload } from "../types";
import { ApiFnReturnType } from "@/lib/react-query";
import {
  menuListQueryKey,
  useGetMenusListQuery,
  useGetMenuByIdQuery,
  generateMenuCodeMutationOptions,
  invalidateMenuQueries,
} from "../service/menu.service";
import { invalidateMe } from "@/features/auth/service/me.service";
```

Remove `getMenuById`, `getMenusList` from the service import (no longer called directly here). Keep `createMenu`, `generateMenuCode`, `updateMenu`. (Note: two separate import lines from `../service/menu.service` are fine, but prefer merging into one — collapse into the existing block.)

- [ ] **Step 2: Replace the two `useQuery` calls with the factories**

Replace `menusQuery` (lines 107-110) and `menuDetailQuery` (lines 112-116):

```ts
  const menusQuery = useGetMenusListQuery();

  const menuDetailQuery = useGetMenuByIdQuery(menuId as string, {
    queryConfig: { enabled: isEditMode },
  });
```

(`useGetMenuByIdQuery` already returns a queryOptions with the right key; `enabled` is layered via `queryConfig`.)

- [ ] **Step 3: Type the submit mutation with generic types; reuse `invalidateMenuQueries`**

Replace the `mutation` block (lines 118-175) — keep the code-generation `mutationFn` logic intact, but type the mutation with `ApiFnReturnType<typeof createMenu>` and call the shared invalidation helper in `onSuccess`:

```ts
  const mutation = useMutation<ApiFnReturnType<typeof createMenu>, Error, MenuFormValues>({
    mutationFn: async (values: MenuFormValues) => {
      const trimmedName = values.name.trim();
      const normalizedParentId = values.parentId || null;
      const signature = buildSignature(trimmedName, normalizedParentId);

      let payloadValues = values;

      if (!values.code.trim() || lastGeneratedSignatureRef.current !== signature) {
        const generated = await generateMenuCode({
          name: trimmedName,
          parentId: normalizedParentId,
        });

        payloadValues = {
          ...values,
          code: generated.code,
          route: generated.route,
        };
        lastGeneratedSignatureRef.current = signature;
        form.setFieldValue("code", generated.code);
        form.setFieldValue("route", generated.route);
      }

      const payload = toPayload(payloadValues);

      if (isEditMode && menuId) {
        return updateMenu(menuId, payload);
      }

      return createMenu(payload);
    },
    onSuccess: async () => {
      toast.success(
        isEditMode ? "Menu berhasil diperbarui." : "Menu berhasil ditambahkan.",
      );
      await invalidateMenuQueries(queryClient);
      if (menuId) {
        await queryClient.invalidateQueries({ queryKey: [...menuListQueryKey, menuId] });
      }
      await invalidateMe(queryClient);
      void navigate({ to: "/admin/setup/menu" });
    },
    onError: (error) => {
      const msg = getErrorMessage(
        error,
        isEditMode ? "Gagal memperbarui menu." : "Gagal menambahkan menu.",
      );
      toast.error(msg, { id: msg });
    },
  });
```

The submit `onSuccess` keeps `navigate` (view-level concern) and the create/update-specific toast, but delegates cache invalidation to `invalidateMenuQueries` + `invalidateMe`.

- [ ] **Step 4: Replace the generate-code mutation with the factory**

Replace the `generateCodeMutation` block (lines 177-186):

```ts
  const generateCodeMutation = useMutation(generateMenuCodeMutationOptions(queryClient));
```

(`generateCodeMutation.mutateAsync` is still referenced at line 195 and inside the debounced effect — signature unchanged.)

- [ ] **Step 5: Run type-check + lint**

Run: `pnpm build && pnpm lint`
Expected: PASS — `getMenuById`/`getMenusList` no longer imported; submit mutation typed via `ApiFnReturnType`; form return shape unchanged.

- [ ] **Step 6: Commit**

```bash
git add src/features/admin/setup/menu/hooks/useMenuForm.ts
git commit -m "refactor(menu): use query/mutation factories in useMenuForm"
```

---

### Task 5: Full build, lint, and manual runtime check

**Files:**
- None (verification only).

**Interfaces:**
- Consumes: all changes from Tasks 1-4.

- [ ] **Step 1: Type-check + lint the whole project**

Run: `pnpm build && pnpm lint`
Expected: PASS — no type or lint errors anywhere in `src`.

- [ ] **Step 2: Start dev server and exercise the menu flow**

Run: `pnpm dev`
Expected: App boots; navigate to `/admin/setup/menu`:
- List loads (uses `useGetMenusListQuery`).
- Create a menu: code auto-generates (debounced `generateCodeMutation`), submit toast + redirect (submit mutation).
- Edit a menu: detail prefills (uses `useGetMenuByIdQuery`, `enabled: isEditMode`), save updates + redirects.
- Delete a menu: toast + list refreshes (uses `deleteMenuMutationOptions`).

- [ ] **Step 3: Confirm sibling callers still compile**

`src/features/admin/setup/permission/hooks/usePermissionForm.ts` and `src/features/admin/setup/role/views/RoleFormView.tsx` import the raw `getMenusList` from the service — its signature is unchanged, so they still type-check (verified in Step 1). No edits needed there.

- [ ] **Step 4: Commit (if any formatting-only fixes were required)**

Only commit if `pnpm lint --fix` changed files:

```bash
git add -A
git commit -m "chore(menu): apply lint fixes after query/mutation refactor"
```

If no files changed, skip this commit.

---

## Self-Review Notes

- **Spec coverage:** All four requested surfaces addressed — `react-query.ts` generics used (`MutationConfig`→`mutationOptions`, `QueryConfig`→`useGet*Query`), `useMenuList` and `useMenuForm` now call query/mutation factories. `invalidateMe` rule preserved in every mutation factory + submit `onSuccess`.
- **Placeholder scan:** No TBD/TODO. Every step has concrete code.
- **Type consistency:** `menuListQueryKey` is `["menus"]` everywhere (hook re-exports from service). Submit mutation typed `ApiFnReturnType<typeof createMenu>` = `MenuItem`; `updateMenu` wrapped to single-arg `MenuPayload` in `updateMenuMutationOptions` so `MutationConfig` resolves. `useGetMenusListQuery` / `useGetMenuByIdQuery` signatures match hook call sites. View callers (`useMenuList(search, status, page)`, `useMenuForm({menuId})`) unchanged.
- **Out of scope (noted, not changed):** `MenuListView.tsx` still calls raw `deleteMenu` from the service directly rather than the hook's `deleteMenu`. Left as-is to keep the change focused; the hook's `deleteMenu` mutation remains available for later consolidation.
