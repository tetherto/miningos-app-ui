import { MenuSubItem } from './MenuItem/MenuItem'

export interface SidebarItem {
  authPermKey?: string
  featConfigKey?: string
  featFlagKey?: string
  items?: SidebarItem[]
  to?: string
  [key: string]: unknown
}

export interface Site {
  id: string
  name: string
}

export type NavigationItem = SidebarItem | MenuSubItem
