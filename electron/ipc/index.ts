import { ipcMain } from 'electron'
import ffmpeg from './ffmpeg'
import os from './os'

// ipc events
const initIpcClient = () => {
  ipcMain.handle('ffmpeg:run', (e, ...args: [string[], string, any]) => ffmpeg.run(...args))
  ipcMain.handle('os:getFileMeta', (e, filePath: string) => os.getFileMeta(filePath))
  ipcMain.handle('os:createTxt', (e, outPathList: string[], dir) => os.createTxt(outPathList, dir))
  ipcMain.handle('os:removeFile', (e, pathList: string[]) => os.removeFile(pathList))
}

export default initIpcClient