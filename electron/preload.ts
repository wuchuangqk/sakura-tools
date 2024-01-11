const { contextBridge, ipcRenderer } = require('electron')
// 暴露到渲染进程的window对象上
// 等价于 window.electronAPI = {}
contextBridge.exposeInMainWorld('IPC', {
  ffmpeg: {
    run: (...args) => ipcRenderer.invoke('ffmpeg:run', ...args),
  },
  os: {
    getFileMeta: (filePath) => ipcRenderer.invoke('os:getFileMeta', filePath),
    createTxtFile: (outPathList: string[], dir) => ipcRenderer.invoke('os:createTxtFile', outPathList, dir),
    removeFile: (pathList: string[]) => ipcRenderer.invoke('os:removeFile', pathList),
    openDir: (dirPath) => ipcRenderer.invoke('os:openDir', dirPath),
  },
  app: {
    getVersion: () => ipcRenderer.invoke('app:getVersion'),
    getName: () => ipcRenderer.invoke('app:getName'),
  }
})