const { contextBridge, ipcRenderer } = require('electron')
// 暴露到渲染进程的window对象上
// 等价于 window.electronAPI = {}
contextBridge.exposeInMainWorld('IPC', {
  ffmpeg: {
    runFfmpeg: (args: any[]) => ipcRenderer.invoke('ffmpeg:runFfmpeg', args),
  }
})