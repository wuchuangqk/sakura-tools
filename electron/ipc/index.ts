import { ipcMain } from 'electron'
import ffmpeg from './ffmpeg'

// ipc events
const initIpcClient = () => {
  ipcMain.handle('ffmpeg:runFfmpeg', (e, args) => ffmpeg.run(args))
}

export default initIpcClient