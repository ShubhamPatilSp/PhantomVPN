import require$$0 from "electron";
var preload = {};
const { contextBridge, ipcRenderer } = require$$0;
contextBridge.exposeInMainWorld("electronAPI", {
  connectVPN: (configContent) => ipcRenderer.invoke("connect-vpn", configContent),
  disconnectVPN: () => ipcRenderer.invoke("disconnect-vpn")
});
export {
  preload as default
};
