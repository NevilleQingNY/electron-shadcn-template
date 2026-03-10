import { app, BrowserWindow } from 'electron'

import { initDatabase, closeDatabase } from './database'
import { registerItemHandlers } from './ipc/item'
import { createMainWindow } from './windows/main'

// Single instance lock
if (!app.requestSingleInstanceLock()) {
  app.quit()
} else {
  app.whenReady().then(async () => {
    initDatabase()

    // Register IPC handlers
    registerItemHandlers()
    // TODO: Add your IPC handlers here

    await createMainWindow()

    // macOS: reopen window on dock click
    app.on('activate', async () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        await createMainWindow()
      }
    })
  })

  // Non-macOS: quit when all windows closed
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') app.quit()
  })

  app.on('will-quit', () => closeDatabase())
}
