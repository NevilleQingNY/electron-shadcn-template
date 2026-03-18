import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'

import { RootLayout } from './components/layout/root-layout'
import { TodayPage } from './routes/today'
import { CalendarPage } from './routes/calendar'
import { OverviewPage } from './routes/overview'
import { LogPage } from './routes/log'
import { SettingsPage } from './routes/settings'

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<RootLayout />} path="/">
          <Route element={<Navigate replace to="/today" />} index />
          <Route element={<TodayPage />} path="today" />
          <Route element={<CalendarPage />} path="calendar" />
          <Route element={<OverviewPage />} path="overview" />
          <Route element={<LogPage />} path="log" />
          <Route element={<SettingsPage />} path="settings" />
        </Route>
      </Routes>
    </HashRouter>
  )
}
