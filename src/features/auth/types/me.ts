export type MePermission = {
  id: string
  name: string
  code: string
  description: string | null
}

export type MeMenu = {
  id: string
  name: string
  code: string
  route: string | null
  iconName: string | null
  type: 'group' | 'menu'
  sortOrder: number
  parentId: string | null
  permissions: MePermission[]
  children: MeMenu[]
}

export type MeRole = {
  id: string
  name: string
  code: string
  description: string | null
}

export type MeUser = {
  id: string
  name: string
  email: string
  emailVerified: boolean
  image: string | null
  phoneNumber: string | null
  avatarUrl: string | null
  isActive: boolean
  isSuperadmin: boolean
  lastActiveAt: string | null
  createdAt: string
  updatedAt: string
}

export type MeAccessControl = {
  canAccessAdmin: boolean
  roles: MeRole[]
  menus: MeMenu[]
}

export type MeData = {
  user: MeUser
  accessControl: MeAccessControl
}

export type MeResponse = {
  success: boolean
  message: string
  data: MeData
}
