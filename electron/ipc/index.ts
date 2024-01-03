import { ipcMain } from 'electron'
import ffmpeg from './ffmpeg'

// ipc events
const initIpcClient = () => {
  ipcMain.handle('ffmpeg:run', (e, ...args: [string[], string, any]) => ffmpeg.run(...args))
}

export default initIpcClient