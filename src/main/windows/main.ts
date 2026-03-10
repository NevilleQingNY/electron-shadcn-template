import { BrowserWindow } from 'electron'
import { join } from 'node:path'
import { displayName } from '~/package.json'

export async function createMainWindow() {
  const window = new BrowserWindow({
    title: displayName,
    width: 1200,
    height: 800,
    minWidth: 500,
    minHeight: 520,
    show: false,
    center: true,
    titleBarStyle: 'hiddenInset',
    trafficLightPosition: { x: 16, y: 16 },
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
    },
  })

  window.webContents.on('did-finish-load', () => window.show())

  // electron-vite: dev 用 URL，prod 用文件
  if (
    process.env.NODE_ENV === 'development' &&
    process.env['ELECTRON_RENDERER_URL']
  ) {
    window.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    window.loadFile(join(__dirname, '../renderer/index.html'))
  }

  return window
}
