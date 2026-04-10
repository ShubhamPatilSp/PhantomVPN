// main.js
const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('node:path');
const fs = require('node:fs');
const { exec } = require('node:child_process');

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: 'hiddenInset', // Modern OS integration styling
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      nodeIntegration: false,
      contextIsolation: true,
    },
  });

  // Load the React app from localhost in dev, or dist in production
  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// ── IPC VPN Handlers ───────────────────────────────────────────────

const getWireguardPath = () => {
  // Common paths for official WireGuard Windows client
  const paths = [
    'C:\\Program Files\\WireGuard\\wireguard.exe',
    'C:\\Program Files (x86)\\WireGuard\\wireguard.exe'
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return `"${p}"`;
  }
  return null;
};

// Ensure app data dir exists
const phantomDir = path.join(app.getPath('userData'), 'VPNConfigs');
if (!fs.existsSync(phantomDir)) {
  fs.mkdirSync(phantomDir, { recursive: true });
}

// ── CONNECT ──
ipcMain.handle('connect-vpn', async (event, configContent) => {
  try {
    const wgPathRaw = getWireguardPath();
    
    if (!wgPathRaw) {
      throw new Error('WireGuard for Windows is not installed. Please download it from wireguard.com/install/');
    }

    const wgPath = wgPathRaw.replace(/"/g, '');

    // Write the .conf file
    const confPath = path.join(phantomDir, 'phantom.conf');
    fs.writeFileSync(confPath, configContent, 'utf8');

    return new Promise((resolve, reject) => {
      // Use native Windows PowerShell to prompt for Admin rights (UAC) and execute WireGuard
      const psCommand = `powershell.exe -Command "Start-Process -FilePath '${wgPath}' -ArgumentList '/installtunnelservice', '${confPath}' -Verb RunAs -WindowStyle Hidden"`;
      
      exec(psCommand, (error) => {
        if (error) {
          console.error('VPN Connect Error:', error);
          reject(error.message || 'Failed to request Admin privileges');
        } else {
          // Give the service 1 second to fully initialize before reporting success
          setTimeout(() => resolve({ success: true, message: 'Tunnel active' }), 1000);
        }
      });
    });

  } catch (err) {
    return Promise.reject(err.message);
  }
});

// ── DISCONNECT ──
ipcMain.handle('disconnect-vpn', async (event) => {
  try {
    const wgPathRaw = getWireguardPath();
    if (!wgPathRaw) return { success: true }; // Nothing to disconnect if missing

    const wgPath = wgPathRaw.replace(/"/g, '');

    return new Promise((resolve, reject) => {
      // Use native Windows PowerShell for uninstallation
      const psCommand = `powershell.exe -Command "Start-Process -FilePath '${wgPath}' -ArgumentList '/uninstalltunnelservice', 'phantom' -Verb RunAs -WindowStyle Hidden"`;
      
      exec(psCommand, (error) => {
        // Ignore errors to prevent UI locking if it was manually uninstalled
        setTimeout(() => resolve({ success: true, message: 'Tunnel inactive' }), 500);
      });
    });

  } catch (err) {
    return Promise.resolve({ success: true }); // Graceful fail
  }
});
