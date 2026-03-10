import { useLocation } from 'react-router-dom'
import { SidebarTrigger, useSidebar } from 'renderer/components/ui/sidebar'
import { cn } from 'renderer/lib/utils'
import { allNavItems } from 'renderer/components/layout/nav-items'

export function MainHeader() {
  const { state, isMobile } = useSidebar()
  const location = useLocation()
  const needsTrafficLightSpace = state === 'collapsed' || isMobile

  const currentItem = allNavItems.find(item => location.pathname === item.url)

  return (
    <header
      className="h-12 shrink-0 flex items-center px-4 relative"
      style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
    >
      {/* Left: traffic light spacer + trigger (mobile) */}
      <div className="flex items-center shrink-0">
        <div
          className={cn(
            'h-full shrink-0 transition-[width] duration-200 ease-linear',
            needsTrafficLightSpace ? 'w-16' : 'w-0'
          )}
        />
        <div
          className="md:hidden"
          style={{ WebkitAppRegion: 'no-drag' } as React.CSSProperties}
        >
          <SidebarTrigger size="icon" />
        </div>
      </div>

      {/* Center: page icon + title */}
      {currentItem && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <currentItem.icon className="size-4" />
            <span>{currentItem.title}</span>
          </div>
        </div>
      )}
    </header>
  )
}
