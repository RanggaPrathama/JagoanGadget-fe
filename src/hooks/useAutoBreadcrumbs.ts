import { useRouterState } from '@tanstack/react-router'
import { type BreadcrumbLinkItem } from '@/components/layouts/admin/TopNav'

// Route to breadcrumb mapping
const routeBreadcrumbs: Record<string, { title: string; href?: string }> = {
  '/admin': { title: 'Admin', href: '/admin/' },
  '/admin/': { title: 'Dashboard', href: '/admin/' },
  '/admin/setup/': { title: 'Setup', href: '/admin/setup/menu/' },
  '/admin/setup/menu/': { title: 'Menu', href: '/admin/setup/menu/' },
  '/admin/setup/menu/create/': { title: 'Create Menu' },
  '/admin/setup/role/': { title: 'Role', href: '/admin/setup/role/' },
  '/admin/setup/role/create/': { title: 'Create Role' },
  '/admin/setup/permission/': { title: 'Permission', href: '/admin/setup/permission/' },
  '/admin/setup/permission/create/': { title: 'Create Permission' },
  '/admin/category/': { title: 'Category', href: '/admin/category/' },
}

export function useAutoBreadcrumbs(): BreadcrumbLinkItem[] {
  const pathname = useRouterState({ select: (state) => state.location.pathname })

  // Build breadcrumbs from route hierarchy
  const segments = pathname.split('/').filter(Boolean)
  const breadcrumbs: BreadcrumbLinkItem[] = []

  // Add root admin if we're in admin routes
  if (segments[0] === 'admin') {
    breadcrumbs.push({ title: 'Admin', href: '/admin/' })

    // Build path progressively
    let currentPath = '/admin'
    for (let i = 1; i < segments.length; i++) {
      if (
        segments[1] === 'setup' &&
        ['menu', 'role', 'permission'].includes(segments[2]) &&
        i === segments.length - 2 &&
        segments[segments.length - 1] === 'edit'
      ) {
        const titlePrefix =
          segments[2] === 'role'
            ? 'Role'
            : segments[2] === 'permission'
              ? 'Permission'
              : 'Menu'

        breadcrumbs.push({
          title: `Edit ${titlePrefix}`,
          href: undefined,
        })
        break
      }

      currentPath += `/${segments[i]}`
      const routeKey = currentPath + (i === segments.length - 1 ? '/' : '')
      const breadcrumb = routeBreadcrumbs[routeKey] || routeBreadcrumbs[currentPath]

      if (breadcrumb) {
        breadcrumbs.push({
          title: breadcrumb.title,
          href: i === segments.length - 1 ? undefined : breadcrumb.href,
        })
      } else {
        // Fallback: capitalize segment name
        breadcrumbs.push({
          title: segments[i].charAt(0).toUpperCase() + segments[i].slice(1),
          href: i === segments.length - 1 ? undefined : currentPath + '/',
        })
      }
    }
  }

  return breadcrumbs
}
