import { Home, Settings } from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface NavItem {
  title: string
  url: string
  icon: LucideIcon
}

export const mainItems: NavItem[] = [
  { title: 'Home', url: '/home', icon: Home },
]

export const coreItems: NavItem[] = []

export const allNavItems: NavItem[] = [
  ...mainItems,
  ...coreItems,
  { title: 'Settings', url: '/settings', icon: Settings },
]
