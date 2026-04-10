import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Search, Filter, Zap, Globe, Lock, Tv, Download } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { serverApi, vpnApi } from '../api';
import useAuthStore from '../store/authStore';
import useVpnStore from '../store/vpnStore';

const REGIONS = [
  { id: 'all', label: 'All Regions' },
  { id: 'americas', label: '🌎 Americas' },
  { id: 'europe', label: '🌍 Europe' },
  { id: 'asia', label: '🌏 Asia' },
  { id: 'middleeast', label: '🏜️ Middle East' },
  { id: 'africa', label: '🌍 Africa' },
  { id: 'oceania', label: '🦘 Oceania' },
];

const SORT_OPTIONS = [
  { id: 'ping', label: 'Fastest' },
  { id: 'load', label: 'Least Load' },
  { id: 'country', label: 'Country A–Z' },
];

function LoadBar({ value }) {
  const color = value < 40 ? '#00FF88' : value < 70 ? '#FFB347' : '#FF6B6B';
  return (
    <div className="w-full h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
      <motion.div
        className="h-full rounded-full"
        style={{ backgroundColor: color }}
        initial={{ width: 0 }}
        animate={{ width: `${value}%` }}
        transition={{ duration: 0.8, ease: 'easeOut' }}
      />
    </div>
  );
}

function ServerCard({ server, onConnect, onDisconnect, connecting }) {
  const { user } = useAuthStore();
  const { connected, connection } = useVpnStore();
  const isConnected = connected && connection?.server?.id === server._id;
  const isLocked = server.isPremium && user?.plan === 'free';

  const pingColor = server.ping < 50 ? 'text-[#00FF88]' : server.ping < 100 ? 'text-yellow-400' : 'text-[#FF6B6B]';

  return (
    <motion.div
      className={`glass-card-hover p-4 ${isConnected ? 'border-[#00FF88]/30 bg-[#00FF88]/[0.03]' : ''}`}
      layout
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3">
        <span className="text-2xl">{server.flag}</span>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 mb-0.5">
            <p className="font-semibold text-sm text-white truncate">{server.city}</p>
            {server.isObfuscated && (
              <span className="text-[9px] px-1.5 py-0.5 bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/20 rounded-full font-medium">STEALTH</span>
            )}
            {isLocked && <Lock size={12} className="text-white/30 shrink-0" />}
          </div>
          <p className="text-xs text-white/40">{server.country}</p>
        </div>
        <div className="text-right shrink-0">
          <p className={`text-sm font-bold ${pingColor}`}>{server.ping}ms</p>
          <p className="text-[10px] text-white/30">{server.load}% load</p>
        </div>
      </div>

      <div className="mt-3">
        <LoadBar value={server.load} />
      </div>

      <div className="flex items-center justify-between mt-3">
        <div className="flex gap-1.5">
          {server.supportsStreaming && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/15">
              <Tv size={9} className="inline mr-0.5" />Stream
            </span>
          )}
          {server.supportsP2P && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/15">P2P</span>
          )}
          {server.supportsTor && (
            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/15">Tor</span>
          )}
        </div>
        <button
          onClick={() => {
            if (isLocked || connecting) return;
            if (isConnected) onDisconnect();
            else onConnect(server._id);
          }}
          disabled={connecting || isLocked}
          className={`text-xs px-4 py-1.5 rounded-lg font-semibold transition-all ${
            isConnected
              ? 'bg-[#FF6B6B]/15 text-[#FF6B6B] border border-[#FF6B6B]/20 hover:bg-[#FF6B6B]/25'
              : isLocked
              ? 'bg-white/[0.04] text-white/25 border border-white/[0.06] cursor-not-allowed'
              : 'bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/20 hover:bg-[#6C63FF]/25'
          }`}
        >
          {isConnected ? 'Disconnect' : isLocked ? '🔒 Pro' : connecting ? '...' : 'Connect'}
        </button>
      </div>
    </motion.div>
  );
}

export default function Servers() {
  const [region, setRegion] = useState('all');
  const [sort, setSort] = useState('ping');
  const [search, setSearch] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [p2p, setP2P] = useState(false);
  const { user } = useAuthStore();
  const { connect, disconnect, setConnecting, connecting } = useVpnStore();

  const { data, isLoading } = useQuery({
    queryKey: ['servers', region, sort],
    queryFn: () => serverApi.getAll({ region, sortBy: sort, limit: 200 }).then(r => r.data),
  });

  const filtered = useMemo(() => {
    let servers = data?.servers || [];
    if (search) {
      const q = search.toLowerCase();
      servers = servers.filter(s =>
        s.country.toLowerCase().includes(q) || s.city.toLowerCase().includes(q)
      );
    }
    if (streaming) servers = servers.filter(s => s.supportsStreaming);
    if (p2p) servers = servers.filter(s => s.supportsP2P);
    return servers;
  }, [data, search, streaming, p2p]);

  const connectMutation = useMutation({
    mutationFn: (serverId) => vpnApi.connect(serverId),
    onMutate: () => setConnecting(true),
    onSuccess: (res) => {
      connect(res.data.connection);
      toast.success(`Connected to ${res.data.connection.server.city}`);
    },
    onError: (err) => {
      setConnecting(false);
      toast.error(err.response?.data?.message || 'Connection failed');
    },
  });

  const disconnectMutation = useMutation({
    mutationFn: () => vpnApi.disconnect(),
    onSuccess: () => {
      disconnect();
      toast.success('Disconnected successfully');
    },
    onError: () => toast.error('Disconnection failed'),
  });

  return (
    <div className="min-h-screen bg-[#080B14]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-16">
        {/* Header */}
        <motion.div
          className="mb-10"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-extrabold mb-2">
            <Globe className="inline mr-2 text-[#6C63FF]" size={28} />
            Server Locations
          </h1>
          <p className="text-white/50">
            {data?.total || 0} servers across 95+ countries. Connect to the fastest, nearest, or most private.
          </p>
        </motion.div>

        {/* Filters */}
        <div className="glass-card p-4 mb-6 flex flex-col sm:flex-row gap-3 flex-wrap">
          {/* Search */}
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
            <input
              type="text"
              placeholder="Search country or city..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="input-field pl-9 h-10 text-sm"
            />
          </div>

          {/* Sort */}
          <select
            value={sort}
            onChange={e => setSort(e.target.value)}
            className="input-field h-10 text-sm w-auto pr-8 cursor-pointer"
          >
            {SORT_OPTIONS.map(o => <option key={o.id} value={o.id}>{o.label}</option>)}
          </select>

          {/* Feature filters */}
          <div className="flex gap-2">
            <button
              onClick={() => setStreaming(!streaming)}
              className={`flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-medium border transition-all ${
                streaming ? 'bg-[#00D4FF]/15 text-[#00D4FF] border-[#00D4FF]/25' : 'bg-white/[0.04] text-white/50 border-white/[0.08] hover:text-white'
              }`}
            >
              <Tv size={13} /> Streaming
            </button>
            <button
              onClick={() => setP2P(!p2p)}
              className={`flex items-center gap-1.5 px-3 h-10 rounded-xl text-xs font-medium border transition-all ${
                p2p ? 'bg-[#00FF88]/15 text-[#00FF88] border-[#00FF88]/25' : 'bg-white/[0.04] text-white/50 border-white/[0.08] hover:text-white'
              }`}
            >
              <Download size={13} /> P2P
            </button>
          </div>
        </div>

        {/* Region tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {REGIONS.map(r => (
            <button
              key={r.id}
              onClick={() => setRegion(r.id)}
              className={`px-4 py-2 rounded-xl text-sm whitespace-nowrap font-medium transition-all shrink-0 ${
                region === r.id
                  ? 'bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/20'
                  : 'bg-white/[0.04] text-white/50 border border-white/[0.06] hover:text-white hover:bg-white/[0.07]'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        {/* Server count */}
        <p className="text-sm text-white/30 mb-4">
          Showing {filtered.length} servers
          {!user && <span className="ml-2 text-[#6C63FF]">— <a href="/register" className="hover:underline">Sign up free</a> to connect</span>}
        </p>

        {/* Grid */}
        {isLoading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="skeleton h-36 rounded-2xl" />
            ))}
          </div>
        ) : (
          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3" layout>
            {filtered.map(server => (
              <ServerCard
                key={server._id}
                server={server}
                onConnect={connectMutation.mutate}
                onDisconnect={disconnectMutation.mutate}
                connecting={connectMutation.isPending || disconnectMutation.isPending}
              />
            ))}
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}
