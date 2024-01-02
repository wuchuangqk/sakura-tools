import { ipcMain } from 'electron'
import ffmpeg from './ffmpeg'

// ipc events
const initIpcClient = () => {
  ipcMain.handle('ffmpeg:run', (e, args, cmd, options) => ffmpeg.run(args, cmd, options))
}

export default initIpcClient