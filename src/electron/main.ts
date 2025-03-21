import { app, BrowserWindow, shell, ipcMain, screen, Menu } from 'electron'
import { release } from 'node:os'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import initIpcClient from './ipc/index'
import { isDev } from './util'
import compress from './ipc/compress'
import logger from 'electron-log/renderer'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

compress.clearTempDir()
logger.info('缓存图片已清空')

// The built directory structure
//
// ├─┬ dist/electron
// │ ├─- main.mjs    > Electron-Main
// │ └─- preload.mjs    > Preload-Scripts
// ├─┬ dist
// │ └── index.html    > Electron-Renderer
//
process.env.DIST_ELECTRON = __dirname
process.env.DIST_RENDER = join(process.env.DIST_ELECTRON, '../render')
process.env.VITE_PUBLIC = isDev
  ? join(process.env.DIST_ELECTRON, '../public')
  : process.env.DIST_RENDER

// Disable GPU Acceleration for Windows 7
if (release().startsWith('6.1')) app.disableHardwareAcceleration()

// Set application name for Windows 10+ notifications
if (process.platform === 'win32') app.setAppUserModelId(app.getName())

if (!app.requestSingleInstanceLock()) {
  app.quit()
  process.exit(0)
}

// Remove electron security warnings
// This warning only shows in development mode
// Read more on https://www.electronjs.org/docs/latest/tutorial/security
// process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'

export let win: BrowserWindow | null = null
// Here, you can also use other preload
const preload = join(__dirname, 'preload.js')
const url = process.env.VITE_DEV_SERVER_URL
const indexHtml = join(process.env.DIST_RENDER, 'index.html')

async function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize

  win = new BrowserWindow({
    title: 'Main window',
    icon: join(process.env.VITE_PUBLIC, 'app.ico'),
    darkTheme: true,
    width: Math.floor(width * 0.9), // 宽高必须是整数
    height: Math.floor(height * 0.9),
    webPreferences: {
      preload,
      webSecurity: !isDev, // fix: Not allowed to load local resource
    },
  })
  // win.maximize() // 窗口最大化

  if (isDev) { // electron-vite-vue#298
    win.loadURL(url)
    // Open devTool if the app is not packaged
    win.webContents.openDevTools()
  } else {
    win.loadFile(indexHtml)
  }

  // Test actively push message to the Electron-Renderer
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', new Date().toLocaleString())
  })

  // Make all links open with the browser, not with the application
  win.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('https:')) shell.openExternal(url)
    return { action: 'deny' }
  })
  // win.webContents.on('will-navigate', (event, url) => { }) #344
}

app.whenReady().then(() => {
  initIpcClient()
  createWindow()
})

app.on('window-all-closed', () => {
  win = null
  if (process.platform !== 'darwin') app.quit()
})

app.on('second-instance', () => {
  if (win) {
    // Focus on the main window if the user tried to open another
    if (win.isMinimized()) win.restore()
    win.focus()
  }
})

app.on('activate', () => {
  const allWindows = BrowserWindow.getAllWindows()
  if (allWindows.length) {
    allWindows[0].focus()
  } else {
    createWindow()
  }
})

// New window example arg: new windows url
ipcMain.handle('open-win', (_, arg) => {
  const childWindow = new BrowserWindow({
    webPreferences: {
      preload,
      nodeIntegration: true,
      contextIsolation: false,
    },
  })

  if (isDev) {
    childWindow.loadURL(`${url}#${arg}`)
  } else {
    childWindow.loadFile(indexHtml, { hash: arg })
  }
})

// const menuTemplate = [
//   { label: '文件', submenu: [{ role: '打开文件' }] }
// ]
// const menu = Menu.buildFromTemplate(menuTemplate)
// Menu.setApplicationMenu(menu)