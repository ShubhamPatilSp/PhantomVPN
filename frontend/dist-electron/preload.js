import o from "electron";
var t = {};
const { contextBridge: c, ipcRenderer: e } = o;
c.exposeInMainWorld("electronAPI", {
  connectVPN: (n) => e.invoke("connect-vpn", n),
  disconnectVPN: () => e.invoke("disconnect-vpn")
});
export {
  t as default
};
