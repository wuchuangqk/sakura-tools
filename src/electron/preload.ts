const { contextBridge, ipcRenderer, webUtils } = require('electron')
// 暴露到渲染进程的window对象上
// 等价于 window.invoke
contextBridge.exposeInMainWorld('invoke', (channel: string, ...args: any) => ipcRenderer.invoke(channel, ...args))
contextBridge.exposeInMainWorld('webUtils', webUtils)