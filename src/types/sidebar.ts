import { type LinkProps } from '@tanstack/react-router'

type User = {
  name: string
  email: string
  avatar: string
}

type Team = {
  name: string
  logo: React.ElementType
  plan: string
}

/** A flat leaf entry under a group (always a route link). */
type NavChildItem = {
  title: string
  url: LinkProps['to'] | (string & {})
  icon?: React.ElementType
  badge?: string
}

/**
 * One sidebar row. Distinguish by `children`:
 * - `children.length === 0` → a leaf nav item (`url` set).
 * - `children.length > 0`   → a group header (`url` unset, children rendered below).
 */
type NavGroup = {
  title: string
  url?: LinkProps['to'] | (string & {})
  icon?: React.ElementType
  badge?: string
  children: NavChildItem[]
}

type SidebarData = {
  user: User
  teams: Team[]
  navGroups: NavGroup[]
}

export type { SidebarData, NavGroup, NavChildItem }
