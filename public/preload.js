const { contextBridge, ipcRenderer } = require('electron')
console.log(ipcRenderer)

contextBridge.exposeInMainWorld('electronAPI', {
   dlMovie: (title) => ipcRenderer.send('dlMovie', title),
   reedFile: async (file) => await ipcRenderer.invoke('reedFile', file)
})