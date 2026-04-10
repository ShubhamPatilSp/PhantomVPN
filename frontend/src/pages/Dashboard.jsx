import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Wifi, WifiOff, Shield, Activity, Download, Upload,
  Clock, Server, Zap, TrendingUp, AlertTriangle, Globe
} from 'lucide-react';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import { vpnApi, serverApi } from '../api';
import useVpnStore from '../store/vpnStore';
import useAuthStore from '../store/authStore';

// Fake speed simulation
function useSpeedSimulator(connected) {
  const [stats, setStats] = useState({ dl: 0, ul: 0, ping: 0 });
  useEffect(() => {
    if (!connected) { setStats({ dl: 0, ul: 0, ping: 0 }); return; }
    const t = setInterval(() => {
      setStats({
        dl: (Math.random() * 900 + 100).toFixed(1),
        ul: (Math.random() * 200 + 50).toFixed(1),
        ping: Math.floor(Math.random() * 40 + 5),
      });
    }, 2000);
    return () => clearInterval(t);
  }, [connected]);
  return stats;
}

function StatCard({ icon, label, value, unit, color }) {
  return (
    <div className="glass-card p-5 flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</span>
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <div>
        <span className="text-2xl font-extrabold text-white">{value}</span>
        <span className="text-white/40 text-sm ml-1">{unit}</span>
      </div>
    </div>
  );
}

const WEEKLY_MOCK = [
  { day: 'Mon', download: 1.2, upload: 0.3 },
  { day: 'Tue', download: 3.4, upload: 0.8 },
  { day: 'Wed', download: 2.1, upload: 0.5 },
  { day: 'Thu', download: 4.8, upload: 1.2 },
  { day: 'Fri', download: 2.9, upload: 0.7 },
  { day: 'Sat', download: 5.2, upload: 1.5 },
  { day: 'Sun', download: 3.7, upload: 0.9 },
];

export default function Dashboard() {
  const { user } = useAuthStore();
  const { connected, connecting, connection, connect, disconnect, setConnecting, formatTimer } = useVpnStore();
  const qc = useQueryClient();
  const liveStats = useSpeedSimulator(connected);
  const [threatCount] = useState(() => Math.floor(Math.random() * 300 + 50));

  // Fetch servers for quick connect
  const { data: serversData } = useQuery({
    queryKey: ['servers', 'fast'],
    queryFn: () => serverApi.getAll({ limit: 5, sortBy: 'ping' }).then(r => r.data),
  });

  // Fetch usage
  const { data: usageData } = useQuery({
    queryKey: ['vpn-usage'],
    queryFn: () => vpnApi.getUsage().then(r => r.data),
    enabled: !!user,
  });

  // Fetch connection history
  const { data: historyData } = useQuery({
    queryKey: ['vpn-history'],
    queryFn: () => vpnApi.getHistory({ limit: 8 }).then(r => r.data),
  });

  // Connect mutation
  const connectMutation = useMutation({
    mutationFn: (serverId) => vpnApi.connect(serverId),
    onMutate: () => setConnecting(true),
    onSuccess: (res) => {
      connect(res.data.connection);
      toast.success(`Connected to ${res.data.connection.server.city}, ${res.data.connection.server.country}`);
      qc.invalidateQueries(['vpn-usage']);
    },
    onError: (err) => {
      setConnecting(false);
      toast.error(err.response?.data?.message || 'Connection failed');
    },
  });

  // Disconnect mutation
  const disconnectMutation = useMutation({
    mutationFn: () => vpnApi.disconnect(),
    onSuccess: () => {
      disconnect();
      toast.success('Disconnected successfully');
      qc.invalidateQueries(['vpn-usage', 'vpn-history']);
    },
    onError: () => toast.error('Disconnection failed'),
  });

  const handleConnectToggle = () => {
    if (connected) {
      disconnectMutation.mutate();
    } else if (serversData?.servers?.length) {
      connectMutation.mutate(serversData.servers[0]._id);
    } else {
      toast.error('No servers available');
    }
  };

  const fmtBytes = (bytes) => {
    if (!bytes) return '0 B';
    const gb = bytes / (1024 ** 3);
    if (gb >= 1) return `${gb.toFixed(2)} GB`;
    const mb = bytes / (1024 ** 2);
    return `${mb.toFixed(0)} MB`;
  };

  const dataUsedGB = usageData?.usage ? usageData.usage.dataUsedThisMonth / (1024 ** 3) : 0;
  const dataLimitGB = usageData?.usage?.dataLimitGB === Infinity ? null : usageData?.usage?.dataLimitGB;
  const usagePercent = dataLimitGB ? Math.min((dataUsedGB / dataLimitGB) * 100, 100) : 0;

  return (
    <div className="flex h-screen bg-[#080B14] overflow-hidden">
      <DashboardSidebar />

      {/* Main content */}
      <div className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-[#080B14]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-bold text-base">Dashboard</h1>
            <p className="text-white/35 text-xs">Welcome back, {user?.name?.split(' ')[0]}</p>
          </div>
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              connected
                ? 'bg-[#00FF88]/10 text-[#00FF88] border-[#00FF88]/20'
                : 'bg-white/[0.04] text-white/40 border-white/[0.08]'
            }`}>
              <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-[#00FF88] shadow-[0_0_6px_#00FF88]' : 'bg-white/20'}`} />
              {connected ? 'Protected' : 'Unprotected'}
            </div>
            <div className="text-xs text-white/25 px-2 py-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              {user?.plan?.toUpperCase()}
            </div>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Main connection area */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Big Connect Widget */}
            <div className="lg:col-span-1">
              <div className={`glass-card p-8 flex flex-col items-center text-center h-full relative overflow-hidden ${
                connected ? 'border-[#00FF88]/20' : ''
              }`}>
                {connected && (
                  <div className="absolute inset-0 bg-gradient-to-b from-[#00FF88]/05 to-transparent pointer-events-none" />
                )}

                {/* Ripple rings when connected */}
                {connected && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    {[1, 2, 3].map(i => (
                      <motion.div
                        key={i}
                        className="absolute rounded-full border border-[#00FF88]/20"
                        animate={{ scale: [0.5, 2], opacity: [0.6, 0] }}
                        transition={{ duration: 3, repeat: Infinity, delay: i * 0.8, ease: 'easeOut' }}
                        style={{ width: 120, height: 120 }}
                      />
                    ))}
                  </div>
                )}

                <div className="relative z-10 flex flex-col items-center gap-5">
                  {/* Main Button */}
                  <motion.button
                    onClick={handleConnectToggle}
                    disabled={connecting || connectMutation.isPending || disconnectMutation.isPending}
                    className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
                      connected
                        ? 'bg-gradient-to-br from-[#00FF88]/20 to-[#00FF88]/10 border-2 border-[#00FF88]/50 shadow-[0_0_40px_rgba(0,255,136,0.3)]'
                        : 'bg-gradient-to-br from-[#6C63FF]/20 to-[#6C63FF]/10 border-2 border-[#6C63FF]/40 hover:shadow-[0_0_40px_rgba(108,99,255,0.4)]'
                    }`}
                    whileTap={{ scale: 0.95 }}
                    whileHover={{ scale: 1.03 }}
                  >
                    {(connecting || connectMutation.isPending || disconnectMutation.isPending) ? (
                      <div className="w-10 h-10 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    ) : connected ? (
                      <Wifi size={36} className="text-[#00FF88]" />
                    ) : (
                      <WifiOff size={36} className="text-[#6C63FF]" />
                    )}
                  </motion.button>

                  <div>
                    <p className={`text-xl font-bold ${connected ? 'text-[#00FF88]' : 'text-white/60'}`}>
                      {connecting ? 'Connecting...' : connected ? 'Connected' : 'Not Connected'}
                    </p>
                    {connected && (
                      <p className="text-white/40 text-sm mt-1 font-mono">{formatTimer()}</p>
                    )}
                  </div>

                  {connected && connection?.server && (
                    <div className="glass-card px-4 py-2.5 flex items-center gap-2 text-sm w-full justify-center">
                      <span className="text-lg">{connection.server.flag}</span>
                      <span className="font-medium">{connection.server.city}</span>
                      <span className="text-white/40">·</span>
                      <span className="text-[#00FF88] text-xs">{connection.server.ping}ms</span>
                    </div>
                  )}

                  <p className="text-xs text-white/25 max-w-[160px]">
                    {connected ? 'Tap to disconnect and restore your original IP' : 'Tap to connect to the fastest server'}
                  </p>
                </div>
              </div>
            </div>

            {/* Stats + Quick Connect */}
            <div className="lg:col-span-2 space-y-5">
              {/* Speed stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <StatCard icon={<Download size={15} />} label="Download" value={connected ? liveStats.dl : '–'} unit={connected ? 'Mbps' : ''} color="bg-[#6C63FF]/15 text-[#6C63FF]" />
                <StatCard icon={<Upload size={15} />} label="Upload" value={connected ? liveStats.ul : '–'} unit={connected ? 'Mbps' : ''} color="bg-[#00D4FF]/15 text-[#00D4FF]" />
                <StatCard icon={<Activity size={15} />} label="Ping" value={connected ? liveStats.ping : '–'} unit={connected ? 'ms' : ''} color="bg-[#00FF88]/15 text-[#00FF88]" />
                <StatCard icon={<Shield size={15} />} label="Threats" value={threatCount} unit="blocked" color="bg-[#FF6B6B]/15 text-[#FF6B6B]" />
              </div>

              {/* IP Display */}
              <div className="glass-card p-5">
                <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">IP Address</p>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-white/30 mb-1">Your Real IP</p>
                    <p className="font-mono text-sm text-[#FF6B6B]">192.168.1.105</p>
                    <p className="text-xs text-white/25 mt-0.5">Your ISP</p>
                  </div>
                  <div>
                    <p className="text-xs text-white/30 mb-1">VPN IP</p>
                    <p className={`font-mono text-sm ${connected ? 'text-[#00FF88]' : 'text-white/20'}`}>
                      {connected && connection?.server ? connection.server.ip : '–.–.–.–'}
                    </p>
                    <p className="text-xs text-white/25 mt-0.5">{connected ? 'PhantomVPN' : 'Not connected'}</p>
                  </div>
                </div>
              </div>

              {/* Data usage */}
              {user?.plan === 'free' && (
                <div className="glass-card p-5">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Monthly Data</p>
                    <p className="text-xs text-white/50">{dataUsedGB.toFixed(2)} GB / {dataLimitGB} GB</p>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00D4FF]"
                      initial={{ width: 0 }}
                      animate={{ width: `${usagePercent}%` }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                    />
                  </div>
                  {usagePercent > 80 && (
                    <p className="text-xs text-[#FFB347] mt-2 flex items-center gap-1">
                      <AlertTriangle size={12} /> Running low — upgrade for unlimited data
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Weekly Chart + Quick Connect */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Chart */}
            <div className="lg:col-span-2 glass-card p-5">
              <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <TrendingUp size={16} className="text-[#6C63FF]" /> Weekly Data Usage
              </p>
              <ResponsiveContainer width="100%" height={180}>
                <AreaChart data={WEEKLY_MOCK}>
                  <defs>
                    <linearGradient id="dlGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="ulGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00D4FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#00D4FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="day" stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis stroke="rgba(255,255,255,0.2)" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip
                    contentStyle={{ background: '#0d1117', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, fontSize: 12 }}
                    labelStyle={{ color: 'rgba(255,255,255,0.6)' }}
                  />
                  <Area type="monotone" dataKey="download" stroke="#6C63FF" strokeWidth={2} fill="url(#dlGrad)" name="Download (GB)" />
                  <Area type="monotone" dataKey="upload" stroke="#00D4FF" strokeWidth={2} fill="url(#ulGrad)" name="Upload (GB)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Quick Connect */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Zap size={16} className="text-[#00D4FF]" /> Quick Connect
              </p>
              <div className="space-y-2">
                {serversData?.servers?.slice(0, 5).map((server) => (
                  <button
                    key={server._id}
                    onClick={() => connectMutation.mutate(server._id)}
                    disabled={connecting || connected}
                    className="w-full flex items-center gap-3 p-2.5 rounded-xl hover:bg-white/[0.06] transition-colors group"
                  >
                    <span className="text-xl">{server.flag}</span>
                    <div className="flex-1 text-left">
                      <p className="text-sm font-medium text-white/80 group-hover:text-white">{server.city}</p>
                      <p className="text-xs text-white/35">{server.country}</p>
                    </div>
                    <span className={`text-xs font-semibold ${
                      server.ping < 50 ? 'text-[#00FF88]' : server.ping < 100 ? 'text-yellow-400' : 'text-[#FF6B6B]'
                    }`}>
                      {server.ping}ms
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Connection History */}
          <div className="glass-card p-5">
            <p className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={16} className="text-white/40" /> Recent Connections
            </p>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-white/30 text-xs border-b border-white/[0.06]">
                    <th className="text-left pb-3 font-medium">Server</th>
                    <th className="text-left pb-3 font-medium hidden sm:table-cell">Duration</th>
                    <th className="text-left pb-3 font-medium hidden md:table-cell">Data</th>
                    <th className="text-left pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {historyData?.connections?.map((conn) => (
                    <tr key={conn._id} className="text-white/60 hover:text-white hover:bg-white/[0.02] transition-colors">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-2">
                          <span>{conn.serverId?.flag || '🌐'}</span>
                          <span className="font-medium text-white/80">{conn.serverId?.city || 'Unknown'}</span>
                          <span className="text-white/30 text-xs hidden sm:block">{conn.serverId?.country}</span>
                        </div>
                      </td>
                      <td className="py-3 pr-4 hidden sm:table-cell">
                        {conn.duration ? `${Math.floor(conn.duration / 60)}m` : '–'}
                      </td>
                      <td className="py-3 pr-4 hidden md:table-cell">
                        {fmtBytes((conn.dataDownloaded || 0) + (conn.dataUploaded || 0))}
                      </td>
                      <td className="py-3 text-white/35">
                        {new Date(conn.connectedAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                  {!historyData?.connections?.length && (
                    <tr>
                      <td colSpan={4} className="py-8 text-center text-white/25 text-sm">
                        No connections yet. Connect to a server to get started.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
