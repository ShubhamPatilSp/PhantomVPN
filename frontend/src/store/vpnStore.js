import { create } from 'zustand';
import { vpnApi } from '../api';
import toast from 'react-hot-toast';

const useVpnStore = create((set, get) => ({
  connected: false,
  connecting: false,
  connection: null,
  selectedServer: null,
  connectionTimer: 0,
  timerInterval: null,
  stats: {
    downloadSpeed: 0,
    uploadSpeed: 0,
    ping: 0,
    dataUsed: 0,
  },
  activeUsers: 2847291,

  setConnecting: (connecting) => set({ connecting }),

  connect: async (connectionObj) => {
    set({ connecting: true });

    // ── NATIVE ELECTRON VPN ──
    if (window.electronAPI) {
      try {
        set({ connection: connectionObj });
        
        // Extract the actual Server ID from the connection payload
        console.log("---- DEBUG VPNSTORE CONNECT ----");
        console.log("Full connectionObj:", connectionObj);
        console.log("connectionObj.server:", connectionObj.server);
        
        const serverId = connectionObj.server?.id || connectionObj.server?._id || connectionObj.serverId;
        console.log("Evaluated serverId:", serverId);
        
        const response = await vpnApi.getConfig(serverId, { responseType: 'blob' });
        
        // Need to ensure blob text parsing works securely
        let configText;
        if (response.data instanceof Blob) {
           configText = await response.data.text();
        } else {
           configText = response.data; // Fallback if returned as raw string
        }

        await window.electronAPI.connectVPN(configText);
        
        const interval = setInterval(() => {
          set((state) => ({ connectionTimer: state.connectionTimer + 1 }));
        }, 1000);

        set({ connected: true, connecting: false, connectionTimer: 0, timerInterval: interval });
        toast.success(`Connected to ${connectionObj.server?.city || 'Server'}`);
      } catch (err) {
        set({ connecting: false, connection: null });
        toast.error(`System Tunnel Error: ${err.message || err}`);
      }
    } 
    // ── WEB SIMULATOR (DASHBOARD ONLY) ──
    else {
      setTimeout(() => {
        const interval = setInterval(() => {
          set((state) => ({ connectionTimer: state.connectionTimer + 1 }));
        }, 1000);
        set({
          connected: true,
          connecting: false,
          connection: connectionObj,
          connectionTimer: 0,
          timerInterval: interval,
        });
      }, 1500); // simulate latency
    }
  },

  disconnect: async () => {
    set({ connecting: true });
    
    if (window.electronAPI) {
      await window.electronAPI.disconnectVPN();
    }

    const { timerInterval } = get();
    if (timerInterval) clearInterval(timerInterval);
    
    set({
      connected: false,
      connecting: false,
      connection: null,
      connectionTimer: 0,
      timerInterval: null,
      stats: { downloadSpeed: 0, uploadSpeed: 0, ping: 0, dataUsed: 0 },
    });
  },

  setSelectedServer: (server) => set({ selectedServer: server }),

  updateStats: (stats) => set((state) => ({
    stats: { ...state.stats, ...stats },
  })),

  setActiveUsers: (count) => set({ activeUsers: count }),

  formatTimer: () => {
    const { connectionTimer } = get();
    const h = Math.floor(connectionTimer / 3600).toString().padStart(2, '0');
    const m = Math.floor((connectionTimer % 3600) / 60).toString().padStart(2, '0');
    const s = (connectionTimer % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
  },
}));

export default useVpnStore;
