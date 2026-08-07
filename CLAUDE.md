# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Build & Dev Commands

```bash
pnpm dev         # Start Vite dev server
pnpm build       # tsc -b && vite build (type-check then build)
pnpm lint        # ESLint
pnpm preview     # Preview production build
```

No test framework configured (no vitest/jest/cypress/playwright in deps).

## Stack

| Layer | Choice |
|---|---|
| Build | Vite 8 + @vitejs/plugin-react 6 |
| Language | TypeScript 6 (strict) |
| UI | React 19 + Radix primitives via shadcn/ui (style: radix-maia) |
| Routing | @tanstack/react-router v1 (file-based, auto-code-splitting) |
| Server State | @tanstack/react-query v4 + axios |
| Styling | Tailwind CSS v4 (@tailwindcss/vite plugin) + tw-animate-css |
| Icons | @hugeicons/react (sidebar), lucide-react (general UI) |
| Charts | recharts |
| Data Grid | ag-grid-community + ag-grid-react v36 |
| Theme | Custom cookie-based ThemeProvider (cookies: `vite-ui-theme`, `vite-ui-theme-preset`) + 8 CSS custom property theme presets |

## Architecture

**Entry flow:** `src/main.tsx` → QueryClientProvider → ThemeProvider → FontProvider → RouterProvider

**Routes** (`src/routes/`): File-based via @tanstack/router-plugin/vite — auto-generates `src/routeTree.gen.ts` (do not edit manually). Root layout (`__root.tsx`) wraps all routes with NavigationProgress + Toaster + devtools. Three layout groups:

| Group | Route | Layout | Auth? |
|---|---|---|---|
| Public user | `/_user/` | `UserLayout` (UserNav + Outlet + Footer) | No |
| Admin | `/admin` | `AdminLayout` (AppSidebar, SearchProvider, LayoutProvider) | Yes (guarded via `requireAdminPageAccess`) |
| Auth standalone | `/sign-in`, `/sign-up` | `AuthLayout` (2-column form + editorial aside) | No |

**Feature organization** (`src/features/`):
- `admin/dashboard/` — dashboard page + Analytics, Chart, Overview, RecentSales components
- `admin/category/` — category management (page-level)
- `auth/` — signInPage, signUpPage, AuthField component, service placeholder
- `user/landing/` — landing/hero page
- `user/products/` — product listing + detail page
- `user/cart/` — shopping cart page
- `errors/` — GeneralError, NotFoundError, Unauthorized, and a custom 403 page

**Shared UI:** `src/components/ui/` = shadcn primitives. `src/components/` = app-specific (Search, CommandMenu, ThemeSwitch, ProfileDropdown, NavigationProgress). Layouts in `src/components/layouts/{admin,auth,user}/`. Data-display components in `src/components/{data-table,table,dialog,field}/`.

**State:** React Context for UI-only. **Auth is react-query based — there is no AuthProvider/AuthContext.** Auth state lives in the `["auth-session"]` query (better-auth); the current user's access control lives in the `["me"]` query (see Auth section). Providers (in `src/context/`):
- `ThemeProvider` — custom cookie-based provider (cookies `vite-ui-theme` / `vite-ui-theme-preset`, sets `data-theme` + `light`/`dark` class + `colorScheme`) with 8 theme presets
- `FontProvider` — font selection (inter/manrope/system)
- `LayoutProvider` — admin sidebar layout state
- `SearchProvider` — admin command-menu search

TanStack Query for server state (QueryClient configured with 401/403 skip-retry, 3 retries in prod, 10s staleTime, mutation error → sonner toast).

**Styling:** Tailwind CSS v4 utility classes. Theme CSS custom properties in `src/styles/themes/` (8 `.css` files: default, claude, light-green, astro-vista, navy-gold, graphite-pulse, slate-blue, vercel) enumerated in `src/lib/theme.ts` (`THEME_PRESETS`) and all imported via `src/styles/theme.css`. The custom `ThemeProvider` (`src/context/ThemeProvider.tsx`) manages mode (`light`/`dark`/`system`) + preset via cookies (`vite-ui-theme`, `vite-ui-theme-preset`), setting `data-theme`, `light`/`dark` class, and `colorScheme` on `<html>`. User layout custom properties (`--user-ink`, `--user-muted`, `--user-canvas`, etc.) in `src/styles/index.css`.

## Auth

**Better Auth client** (`createAuthClient` in `src/lib/auth.ts`) with session cookie. Auth is react-query based — no context/provider. Two queries hold all session + access state:

- `["auth-session"]` (`src/features/auth/service/auth.service.ts`) — logged in? exposed via `useAuth`/`useAuthSession` (`src/hooks/useAuth.ts`). Sign-out removes both query keys.
- `["me"]` (`src/features/auth/service/me.service.ts`) — current user + access control: `MeData` = `{ user, accessControl: { canAccessAdmin, roles, menus } }`. `MeMenu.permissions[]` holds permission codes.

### 3-layer access model (all read the same `["me"]` snapshot)

1. **Auth** — `["auth-session"]` gates login.
2. **Route authz** — TanStack Router `beforeLoad` guards in `src/lib/auth.ts` (`requireAdminAccess` parent, `requireAdminPageAccess` children) → `ensureQueryData(meQueryOptions())` + `canAccessRoute(menus, pathname)` → redirect `/403`.
3. **UI authz** — `CanAccess` (`src/components/CanAccess.tsx`) + `useHasPermission` (`src/hooks/useHasPermission.ts`) render-guard actions/columns/tabs. Superadmin bypasses. Permission codes resolved by `hasPermission` in `src/utils/access-control.ts` (ANY/OR semantics for `string | string[]`).

### Cache invalidation

`["me"]` must be invalidated whenever the access-control tree changes. Call the centralized `invalidateMe(queryClient)` helper (`src/features/auth/service/me.service.ts`) in mutation `onSuccess` for role/permission/menu CRUD and user role assignment (`useRoleForm`, `useRoleList`, `usePermissionForm`, `usePermissionList`, `useMenuForm`, `useMenuList`, `useUserForm`). Sign-in removes stale `["me"]` (`removeQueries`) in `useSignIn`. Invalidate is lazy — only mounted observers (sidebar) refetch; other browsers refresh via refetchOnWindowFocus/route-guard ensureQueryData.

## HTTP Client (Axios)

**Instance:** `src/lib/axios.ts` — pre-configured `api` singleton with:
- `baseURL` from `config.apiBaseUrl` (default: `http://localhost:2000/api`)
- `timeout`: 30s
- `withCredentials: true`
- **Request**: all `Content-Type: application/json`
- **Response interceptor:** on 401 → hard redirect to `/sign-in?redirect=<currentPath>` (skip with `config.skipAuthRedirect = true`)
- `handleServerError(error)` called on all non-2xx responses for toast notifications
- `abortable()` helper — returns `{ controller, signal }` for request cancellation

**API services:** Auth and access-control live in `src/features/auth/service/` (`auth.service.ts` — `signInWithEmail`, `signUpWithEmail`, `signOutAuth`, `getAuthSession`, `clearAuthCache` via better-auth client; `me.service.ts` — `getMe`, `meQueryOptions`, `invalidateMe`). The axios instance is `src/lib/axios.ts` (`api` singleton, `baseURL` from `config.apiBaseUrl`, `withCredentials: true`, 401→redirect, `abortable()` helper). Per-feature service files live under `src/features/` (e.g. `src/features/admin/`, `src/features/settings/service/settings.service.ts`, `src/features/uploads/service/upload.service.ts`). The old `src/lib/api/` directory was removed.

Usage (with TanStack Query):
```ts
import { useQuery } from '@tanstack/react-query'
import { api } from '@/lib/axios'

const { data } = useQuery({
  queryKey: ['products', filters],
  queryFn: () => api.get('/products', { params: filters }).then(r => r.data),
})
```

## Key Patterns

- **`cn()`** in `@/lib/utils.ts` (clsx + tailwind-merge) — use for all conditional class merging
- **Cookie persistence** in `@/lib/cookies.ts` — layout settings only (auth session cookie is httpOnly, set server-side by Better Auth). Custom `getCookie`/`setCookie`/`removeCookie` around `document.cookie` (7-day default max-age). No js-cookie dependency.
- **Error handling** — `@/lib/handle-server-error.ts` extracts AxiosError → sonner toast. TanStack Query configured with global mutation onError + queryCache onError (401 → "Session expired!", 500 → "Internal Server Error!")
- **Path alias** `@/` → `./src/` (vite.config.ts + tsconfig)
- **shadcn/ui** — add new components via `pnpm shadcn add <name>` (style: radix-maia, iconLibrary: hugeicons, no RSC)
- **TanStack Query** — v4, configured in `main.tsx`. DEV: skip retries, log errors. PROD: 4 max retries, skip 401/403, refetch on window focus.
- **Mock data** — `src/lib/mock-data.ts` exports `MOCK_PRODUCTS` (9 items) and `MOCK_CATEGORIES` (6 items) for development.
- **AG Grid** — registered in `src/main.tsx` via `ModuleRegistry.registerModules([AllCommunityModule])`
- **Hooks** — `useAuth`/`useAuthSession` (better-auth session via react-query), `useHasPermission(code)` (access check), `useDialogState<T>` (toggle with auto-clear), `useIsMobile` (768px breakpoint matchMedia), `useMe` (fetches current user + access control via TanStack Query).

## Env Vars

See `.env.example`:
```
VITE_APP_TITLE=Jagoan Gadget
VITE_API_BASE_URL=http://localhost:2000/api   # default, used by Better Auth client
VITE_MOCK_BACKEND=true   # default ON; set 'false' when real API is wired (only affects settings + upload services)
NODE_ENV=development
```
