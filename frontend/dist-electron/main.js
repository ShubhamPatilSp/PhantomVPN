import v from "electron";
import y from "node:path";
import R from "node:fs";
import W from "node:child_process";
var V = {};
const { app: n, BrowserWindow: h, ipcMain: p, dialog: _ } = v, r = y, s = R, { exec: g } = W;
let d;
function w() {
  d = new h({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    titleBarStyle: "hiddenInset",
    // Modern OS integration styling
    webPreferences: {
      preload: r.join(__dirname, "preload.cjs"),
      nodeIntegration: !1,
      contextIsolation: !0
    }
  }), process.env.VITE_DEV_SERVER_URL ? d.loadURL(process.env.VITE_DEV_SERVER_URL) : d.loadFile(r.join(__dirname, "../dist/index.html"));
}
n.whenReady().then(() => {
  w(), n.on("activate", () => {
    h.getAllWindows().length === 0 && w();
  });
});
n.on("window-all-closed", () => {
  process.platform !== "darwin" && n.quit();
});
const f = () => {
  const i = [
    "C:\\Program Files\\WireGuard\\wireguard.exe",
    "C:\\Program Files (x86)\\WireGuard\\wireguard.exe"
  ];
  for (const e of i)
    if (s.existsSync(e)) return `"${e}"`;
  return null;
}, u = r.join(n.getPath("userData"), "VPNConfigs");
s.existsSync(u) || s.mkdirSync(u, { recursive: !0 });
p.handle("connect-vpn", async (i, e) => {
  try {
    const t = f();
    if (!t)
      throw new Error("WireGuard for Windows is not installed. Please download it from wireguard.com/install/");
    const o = t.replace(/"/g, ""), a = r.join(u, "phantom.conf");
    return s.writeFileSync(a, e, "utf8"), new Promise((c, m) => {
      const P = `powershell.exe -Command "Start-Process -FilePath '${o}' -ArgumentList '/installtunnelservice', '${a}' -Verb RunAs -WindowStyle Hidden"`;
      g(P, (l) => {
        l ? (console.error("VPN Connect Error:", l), m(l.message || "Failed to request Admin privileges")) : setTimeout(() => c({ success: !0, message: "Tunnel active" }), 1e3);
      });
    });
  } catch (t) {
    return Promise.reject(t.message);
  }
});
p.handle("disconnect-vpn", async (i) => {
  try {
    const e = f();
    if (!e) return { success: !0 };
    const t = e.replace(/"/g, "");
    return new Promise((o, a) => {
      const c = `powershell.exe -Command "Start-Process -FilePath '${t}' -ArgumentList '/uninstalltunnelservice', 'phantom' -Verb RunAs -WindowStyle Hidden"`;
      g(c, (m) => {
        setTimeout(() => o({ success: !0, message: "Tunnel inactive" }), 500);
      });
    });
  } catch {
    return Promise.resolve({ success: !0 });
  }
});
export {
  V as default
};
