// preload.js
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  connectVPN: (configContent) => ipcRenderer.invoke('connect-vpn', configContent),
  disconnectVPN: () => ipcRenderer.invoke('disconnect-vpn'),
});
