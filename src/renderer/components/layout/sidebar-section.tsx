import { useState, type ReactNode } from 'react'
import {
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
} from 'renderer/components/ui/sidebar'

function DisclosureArrow({ isExpanded }: { isExpanded: boolean }) {
  return (
    <svg
      className={`size-1.5 shrink-0 fill-current transition-transform duration-250 ${isExpanded ? 'rotate-90' : ''}`}
      viewBox="0 0 8 10"
    >
      <path d="M0 0L8 5L0 10Z" />
    </svg>
  )
}

const disclosureButtonStyles =
  'flex h-8 w-full font-medium items-center gap-1.5 rounded-[calc(var(--radius-sm)+2px)] px-2 text-xs text-muted-foreground hover:bg-sidebar-accent/70 hover:text-sidebar-foreground mb-0.5'

// Override SidebarMenuButton cva defaults:
// - text color never changes across states
// - icon: muted by default, matches text on hover/active
// - bg: hover 70% opacity, active solid
export const menuButtonStyles = [
  'hover:text-sidebar-foreground',
  'active:text-sidebar-foreground',
  'data-active:text-sidebar-foreground',
  'hover:bg-sidebar-accent/70',
  'active:bg-sidebar-accent/70',
  'data-active:bg-sidebar-accent',
  'data-active:hover:bg-sidebar-accent',
  '[&_svg]:text-muted-foreground',
  'hover:[&_svg]:text-sidebar-foreground',
  'data-active:[&_svg]:text-sidebar-foreground',
].join(' ')

export function SidebarSection({
  title,
  action,
  children,
  defaultExpanded = true,
  className,
}: {
  title: string
  action?: ReactNode
  children: ReactNode
  defaultExpanded?: boolean
  className?: string
}) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)

  return (
    <SidebarGroup className={className ?? 'py-0.5'}>
      <button
        className={`${disclosureButtonStyles}${action ? ' justify-between' : ''}`}
        onClick={() => setIsExpanded(!isExpanded)}
        type="button"
      >
        <span className="flex items-center gap-1.5">
          {title}
          <DisclosureArrow isExpanded={isExpanded} />
        </span>
        {action}
      </button>
      {isExpanded && (
        <SidebarGroupContent className="ml-2 border-l border-sidebar-border pl-1 pr-2">
          <SidebarMenu className="gap-0.5">{children}</SidebarMenu>
        </SidebarGroupContent>
      )}
    </SidebarGroup>
  )
}
