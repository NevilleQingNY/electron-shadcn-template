import { Settings } from 'lucide-react'
import { Link, useLocation } from 'react-router-dom'

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from 'renderer/components/ui/sidebar'
import { ThemeToggle } from 'renderer/components/common/theme-toggle'
import { menuButtonStyles } from 'renderer/components/layout/sidebar-section'

import { mainItems, coreItems } from 'renderer/components/layout/nav-items'

export function AppSidebar() {
  const location = useLocation()

  return (
    <Sidebar variant="inset">
      <SidebarHeader
        className="h-12 shrink-0"
        style={{ WebkitAppRegion: 'drag' } as React.CSSProperties}
      />

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {mainItems.map(item => {
                const isActive = location.pathname === item.url
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      className={menuButtonStyles}
                      isActive={isActive}
                      render={<Link to={item.url} />}
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {coreItems.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent>
              <SidebarMenu className="gap-0.5">
                {coreItems.map(item => {
                  const isActive = location.pathname === item.url
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton
                        className={menuButtonStyles}
                        isActive={isActive}
                        render={<Link to={item.url} />}
                      >
                        <item.icon />
                        <span>{item.title}</span>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  )
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu className="gap-0.5">
          <SidebarMenuItem>
            <SidebarMenuButton
              className={menuButtonStyles}
              isActive={location.pathname === '/settings'}
              render={<Link to="/settings" />}
            >
              <Settings />
              <span>Settings</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <ThemeToggle />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
