import v from "electron";
import y from "node:path";
import R from "node:fs";
import "child_process";
import "crypto";
import "fs";
import "os";
import "path";
import "util";
import W from "node:child_process";
var A = {};
process;
const { app: t, BrowserWindow: w, ipcMain: h, dialog: T } = v, n = y, i = R, { exec: g } = W;
let m;
function p() {
  m = new w({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    // Modern OS integration styling
    webPreferences: {
      preload: n.join(__dirname, "preload.cjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), process.env.VITE_DEV_SERVER_URL ? m.loadURL(process.env.VITE_DEV_SERVER_URL) : m.loadFile(n.join(__dirname, "../dist/index.html"));
}
t.whenReady().then(() => {
  p(), t.on("activate", () => {
    w.getAllWindows().length === 0 && p();
  });
});
t.on("window-all-closed", () => {
  process.platform !== "darwin" && t.quit();
});
const f = () => {
  const o = [
    "C:\\Program Files\\WireGuard\\wireguard.exe",
    "C:\\Program Files (x86)\\WireGuard\\wireguard.exe"
  ];
  for (const e of o)
    if (i.existsSync(e)) return `"${e}"`;
  return null;
}, d = n.join(t.getPath("userData"), "VPNConfigs");
i.existsSync(d) || i.mkdirSync(d, { recursive: !0 });
h.handle("connect-vpn", async (o, e) => {
  try {
    const r = f();
    if (!r)
      throw new Error("WireGuard for Windows is not installed. Please download it from wireguard.com/install/");
    const s = r.replace(/"/g, ""), a = n.join(d, "phantom.conf");
    return i.writeFileSync(a, e, "utf8"), new Promise((c, u) => {
      const P = `powershell.exe -Command "Start-Process -FilePath '${s}' -ArgumentList '/installtunnelservice', '${a}' -Verb RunAs -WindowStyle Hidden"`;
      g(P, (l) => {
        l ? (console.error("VPN Connect Error:", l), u(l.message || "Failed to request Admin privileges")) : setTimeout(() => c({ success: !0, message: "Tunnel active" }), 1e3);
      });
    });
  } catch (r) {
    return Promise.reject(r.message);
  }
});
h.handle("disconnect-vpn", async (o) => {
  try {
    const e = f();
    if (!e) return { success: !0 };
    const r = e.replace(/"/g, "");
    return new Promise((s, a) => {
      const c = `powershell.exe -Command "Start-Process -FilePath '${r}' -ArgumentList '/uninstalltunnelservice', 'phantom' -Verb RunAs -WindowStyle Hidden"`;
      g(c, (u) => {
        setTimeout(() => s({ success: !0, message: "Tunnel inactive" }), 500);
      });
    });
  } catch {
    return Promise.resolve({ success: !0 });
  }
});
export {
  A as default
};
