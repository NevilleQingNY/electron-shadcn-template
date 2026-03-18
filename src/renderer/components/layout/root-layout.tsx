import { Outlet } from 'react-router-dom'
import { SidebarProvider } from 'renderer/components/ui/sidebar'
import { AppSidebar } from './sidebar'
import { MainHeader } from './header'
import { SidebarResizeHandle } from 'renderer/components/common/sidebar-resize-handle'
import { useSidebarResize } from 'renderer/hooks/use-sidebar-resize'

export function RootLayout() {
  const { width, isDragging, handleMouseDown } = useSidebarResize({
    storageKey: 'app-sidebar-width',
  })

  return (
    <div className="flex h-screen flex-col">
      <SidebarProvider
        className="flex-1 overflow-hidden"
        style={{ '--sidebar-width': `${width}px` } as React.CSSProperties}
      >
        <AppSidebar />
        <SidebarResizeHandle
          isDragging={isDragging}
          onMouseDown={handleMouseDown}
          width={width}
        />
        <div className="relative flex w-full flex-1 flex-col overflow-hidden">
          <MainHeader />
          <div className="flex-1 overflow-hidden bg-background md:rounded-xl md:mr-2 md:mb-2 md:ml-0.5 md:shadow-sm">
            <Outlet />
          </div>
        </div>
      </SidebarProvider>
    </div>
  )
}
