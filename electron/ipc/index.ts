import { ipcMain } from 'electron'
import ffmpeg from './ffmpeg'

// ipc events
const initIpcClient = () => {
  ipcMain.handle('ffmpeg:run', (e, cmd, args) => ffmpeg.run(cmd, args))
}

export default initIpcClient