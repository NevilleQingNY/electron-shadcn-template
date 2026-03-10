import { HashRouter, Route, Routes, Navigate } from 'react-router-dom'

import { RootLayout } from './components/layout/root-layout'
import { HomePage } from './routes/home'
import { SettingsPage } from './routes/settings'

export function AppRoutes() {
  return (
    <HashRouter>
      <Routes>
        <Route element={<RootLayout />} path="/">
          <Route element={<Navigate replace to="/home" />} index />
          <Route element={<HomePage />} path="home" />
          <Route element={<SettingsPage />} path="settings" />
        </Route>
      </Routes>
    </HashRouter>
  )
}
