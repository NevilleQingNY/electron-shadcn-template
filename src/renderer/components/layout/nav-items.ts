import { Sun, Calendar, LayoutGrid, ScrollText, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

export const mainItems: NavItem[] = [
  { title: 'Today', url: '/today', icon: Sun },
  { title: 'Calendar', url: '/calendar', icon: Calendar },
  { title: 'Overview', url: '/overview', icon: LayoutGrid },
  { title: 'Log', url: '/log', icon: ScrollText },
]

export const coreItems: NavItem[] = []

export const allNavItems: NavItem[] = [
  ...mainItems,
  ...coreItems,
  { title: 'Settings', url: '/settings', icon: Settings },
]
