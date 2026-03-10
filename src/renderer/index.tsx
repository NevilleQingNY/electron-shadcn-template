import ReactDom from 'react-dom/client'
import React from 'react'

import { ThemeProvider } from 'renderer/components/layout/theme-provider'
import { TooltipProvider } from 'renderer/components/ui/tooltip'
import { Toaster } from 'renderer/components/ui/sonner'
import { AppRoutes } from './app-routes'

import './globals.css'

ReactDom.createRoot(document.querySelector('app') as HTMLElement).render(
  <React.StrictMode>
    <ThemeProvider defaultTheme="system">
      <TooltipProvider>
        <AppRoutes />
        <Toaster
          toastOptions={{
            classNames: {
              toast: 'items-start',
              title: 'line-clamp-2',
              description: 'line-clamp-2',
            },
          }}
        />
      </TooltipProvider>
    </ThemeProvider>
  </React.StrictMode>
)
