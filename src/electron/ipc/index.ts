import { ipcMain } from 'electron'
import ffmpeg from './ffmpeg'
import os from './os'
import app from './app'
import compress from './compress'

// ipc events
const initIpcClient = () => {
  ipcMain.handle('ffmpeg:run', (e, ...args: [string[], string, any]) => ffmpeg.run(...args))

  ipcMain.handle('os:getFileMeta', (e, filePath: string) => os.getFileMeta(filePath))
  ipcMain.handle('os:createTxtFile', (e, outPathList: string[], dir) => os.createTxtFile(outPathList, dir))
  ipcMain.handle('os:removeFile', (e, pathList: string[]) => os.removeFile(pathList))
  ipcMain.handle('os:openDir', (e, dirPath) => os.openDir(dirPath))

  ipcMain.handle('app:getName', (e) => app.getName())
  ipcMain.handle('app:getVersion', (e) => app.getVersion())

  ipcMain.handle('compress:run', (e, payload) => compress.run(payload))
  ipcMain.handle('compress:clearTempDir', (e) => compress.clearTempDir())
  ipcMain.handle('compress:save', (e, payload) => compress.save(payload))
  ipcMain.handle('compress:tmpdir', (e) => compress.tmpdir)
}

export default initIpcClient