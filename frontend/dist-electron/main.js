import require$$0 from "electron";
import require$$1 from "node:path";
import require$$2 from "node:fs";
import "child_process";
import "crypto";
import "fs";
import "os";
import "path";
import "util";
import require$$4 from "node:child_process";
var main = {};
({
  process
});
const { app, BrowserWindow, ipcMain, dialog } = require$$0;
const path = require$$1;
const fs = require$$2;
const { exec } = require$$4;
let mainWindow;
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    // Modern OS integration styling
    webPreferences: {
      preload: path.join(__dirname, "preload.cjs"),
      nodeIntegration: false,
      contextIsolation: true
    }
  });
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}
app.whenReady().then(() => {
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
const getWireguardPath = () => {
  const paths = [
    "C:\\Program Files\\WireGuard\\wireguard.exe",
    "C:\\Program Files (x86)\\WireGuard\\wireguard.exe"
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return `"${p}"`;
  }
  return null;
};
const phantomDir = path.join(app.getPath("userData"), "VPNConfigs");
if (!fs.existsSync(phantomDir)) {
  fs.mkdirSync(phantomDir, { recursive: true });
}
ipcMain.handle("connect-vpn", async (event, configContent) => {
  try {
    const wgPathRaw = getWireguardPath();
    if (!wgPathRaw) {
      throw new Error("WireGuard for Windows is not installed. Please download it from wireguard.com/install/");
    }
    const wgPath = wgPathRaw.replace(/"/g, "");
    const confPath = path.join(phantomDir, "phantom.conf");
    fs.writeFileSync(confPath, configContent, "utf8");
    return new Promise((resolve, reject) => {
      const psCommand = `powershell.exe -Command "Start-Process -FilePath '${wgPath}' -ArgumentList '/installtunnelservice', '${confPath}' -Verb RunAs -WindowStyle Hidden"`;
      exec(psCommand, (error) => {
        if (error) {
          console.error("VPN Connect Error:", error);
          reject(error.message || "Failed to request Admin privileges");
        } else {
          setTimeout(() => resolve({ success: true, message: "Tunnel active" }), 1e3);
        }
      });
    });
  } catch (err) {
    return Promise.reject(err.message);
  }
});
ipcMain.handle("disconnect-vpn", async (event) => {
  try {
    const wgPathRaw = getWireguardPath();
    if (!wgPathRaw) return { success: true };
    const wgPath = wgPathRaw.replace(/"/g, "");
    return new Promise((resolve, reject) => {
      const psCommand = `powershell.exe -Command "Start-Process -FilePath '${wgPath}' -ArgumentList '/uninstalltunnelservice', 'phantom' -Verb RunAs -WindowStyle Hidden"`;
      exec(psCommand, (error) => {
        setTimeout(() => resolve({ success: true, message: "Tunnel inactive" }), 500);
      });
    });
  } catch (err) {
    return Promise.resolve({ success: true });
  }
});
export {
  main as default
};
