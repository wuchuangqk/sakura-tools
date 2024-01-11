import { ipcMain } from 'electron'
import ffmpeg from './ffmpeg'
import os from './os'
import app from './app'

// ipc events
const initIpcClient = () => {
  ipcMain.handle('ffmpeg:run', (e, ...args: [string[], string, any]) => ffmpeg.run(...args))

  ipcMain.handle('os:getFileMeta', (e, filePath: string) => os.getFileMeta(filePath))
  ipcMain.handle('os:createTxtFile', (e, outPathList: string[], dir) => os.createTxtFile(outPathList, dir))
  ipcMain.handle('os:removeFile', (e, pathList: string[]) => os.removeFile(pathList))
  ipcMain.handle('os:openDir', (e, dirPath) => os.openDir(dirPath))

  ipcMain.handle('app:getName', (e) => app.getName())
  ipcMain.handle('app:getVersion', (e) => app.getVersion())
}

export default initIpcClient