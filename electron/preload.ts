const { contextBridge, ipcRenderer } = require('electron')
// 暴露到渲染进程的window对象上
// 等价于 window.invoke
contextBridge.exposeInMainWorld('invoke', (channel, ...args) => ipcRenderer.invoke(channel, ...args))