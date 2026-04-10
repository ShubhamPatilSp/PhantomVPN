import { useState } from 'react';
import { motion } from 'framer-motion';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  Globe, Shield, Zap, Activity, Search, Lock,
  Copy, RefreshCw, CheckCircle, XCircle, AlertTriangle
} from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { toolsApi } from '../api';

function ToolCard({ icon, title, description, children, badge }) {
  return (
    <div className="glass-card p-6">
      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4FF]/10 border border-[#6C63FF]/15 flex items-center justify-center text-[#6C63FF]">
            {icon}
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">{title}</h3>
            <p className="text-xs text-white/40">{description}</p>
          </div>
        </div>
        {badge && <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/20 font-medium">{badge}</span>}
      </div>
      {children}
    </div>
  );
}

// IP Checker
function IPChecker() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ip-info'],
    queryFn: () => toolsApi.getIpInfo().then(r => r.data),
  });

  return (
    <ToolCard icon={<Globe size={18} />} title="IP Address Checker" description="See what websites know about your IP">
      {isLoading ? <div className="skeleton h-24 rounded-xl" /> : data && (
        <div className="space-y-2.5">
          <InfoRow label="IP Address" value={data.ip} copy />
          <InfoRow label="Country" value={`${data.info?.country || 'Unknown'} ${data.info?.countryCode || ''}`} />
          <InfoRow label="City" value={data.info?.city || 'Unknown'} />
          <InfoRow label="ISP" value={data.info?.isp || 'Unknown'} />
          <InfoRow label="Timezone" value={data.info?.timezone || 'Unknown'} />
          <div className="flex gap-2 mt-3">
            {data.info?.proxy && <Badge color="red" text="🔍 Proxy Detected" />}
            {data.info?.hosting && <Badge color="yellow" text="🏢 Hosting/VPN" />}
            {!data.info?.proxy && !data.info?.hosting && <Badge color="green" text="✓ Clean IP" />}
          </div>
          <button onClick={refetch} className="btn-ghost text-xs mt-2"><RefreshCw size={12} /> Refresh</button>
        </div>
      )}
    </ToolCard>
  );
}

// DNS Leak Test
function DNSLeakTest() {
  const [ran, setRan] = useState(false);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['dns-leak'],
    queryFn: () => toolsApi.dnsLeak().then(r => r.data),
    enabled: false,
  });

  const run = () => { setRan(true); refetch(); };

  return (
    <ToolCard icon={<Search size={18} />} title="DNS Leak Test" description="Check if your DNS queries are leaking">
      {!ran ? (
        <button onClick={run} className="btn-primary w-full justify-center text-sm py-2.5">
          Run DNS Leak Test
        </button>
      ) : isFetching ? (
        <div className="text-center py-6">
          <div className="w-8 h-8 border-2 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-3" />
          <p className="text-white/40 text-sm">Testing DNS resolvers...</p>
        </div>
      ) : data && (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${
            data.leaked ? 'bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/20' : 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20'
          }`}>
            {data.leaked ? <XCircle size={16} /> : <CheckCircle size={16} />}
            {data.leaked ? 'DNS Leak Detected!' : 'No DNS Leaks Found'}
          </div>
          {data.results?.map((r, i) => (
            <div key={i} className="flex items-center justify-between text-xs py-1.5 border-b border-white/[0.04]">
              <span className="text-white/60">{r.resolver}</span>
              <span className="font-mono text-white/40">{r.ip}</span>
              {r.isLeak ? <Badge color="red" text="Leak" /> : <Badge color="green" text="OK" />}
            </div>
          ))}
          <button onClick={run} className="btn-ghost text-xs"><RefreshCw size={12} /> Re-test</button>
        </div>
      )}
    </ToolCard>
  );
}

// Speed Test
function SpeedTest() {
  const [ran, setRan] = useState(false);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['speed-test'],
    queryFn: () => toolsApi.speedTest().then(r => r.data),
    enabled: false,
  });

  const run = () => { setRan(true); refetch(); };

  return (
    <ToolCard icon={<Zap size={18} />} title="Speed Test" description="Test your current connection speed" badge="Live">
      {!ran ? (
        <button onClick={run} className="btn-primary w-full justify-center text-sm py-2.5">
          <Activity size={14} /> Start Speed Test
        </button>
      ) : isFetching ? (
        <div className="text-center py-6 space-y-2">
          <div className="text-4xl font-extrabold gradient-text animate-pulse">Testing...</div>
          <p className="text-white/30 text-xs">Measuring your connection speed</p>
        </div>
      ) : data?.results && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-4 rounded-xl bg-[#6C63FF]/08 border border-[#6C63FF]/15">
              <p className="text-2xl font-extrabold text-[#6C63FF]">{data.results.downloadMbps}</p>
              <p className="text-xs text-white/40 mt-1">↓ Download Mbps</p>
            </div>
            <div className="text-center p-4 rounded-xl bg-[#00D4FF]/08 border border-[#00D4FF]/15">
              <p className="text-2xl font-extrabold text-[#00D4FF]">{data.results.uploadMbps}</p>
              <p className="text-xs text-white/40 mt-1">↑ Upload Mbps</p>
            </div>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-white/40">Ping: <span className="text-white">{data.results.pingMs}ms</span></span>
            <span className="text-white/40">Jitter: <span className="text-white">{data.results.jitter}ms</span></span>
          </div>
          <button onClick={run} className="btn-ghost text-xs"><RefreshCw size={12} /> Re-test</button>
        </div>
      )}
    </ToolCard>
  );
}

// Password Generator
function PasswordGenerator() {
  const [password, setPassword] = useState('');
  const [length, setLength] = useState(16);
  const [opts, setOpts] = useState({ upper: true, lower: true, numbers: true, symbols: true });

  const generate = () => {
    const chars = [
      opts.lower ? 'abcdefghijklmnopqrstuvwxyz' : '',
      opts.upper ? 'ABCDEFGHIJKLMNOPQRSTUVWXYZ' : '',
      opts.numbers ? '0123456789' : '',
      opts.symbols ? '!@#$%^&*()_+-=[]{}|;:,.<>?' : '',
    ].join('');
    if (!chars) { toast.error('Select at least one character type'); return; }
    setPassword(Array.from({ length }, () => chars[Math.floor(Math.random() * chars.length)]).join(''));
  };

  const copy = () => {
    navigator.clipboard.writeText(password);
    toast.success('Password copied!');
  };

  return (
    <ToolCard icon={<Lock size={18} />} title="Password Generator" description="Generate strong, random passwords">
      <div className="space-y-4">
        <div className="flex gap-2">
          <input
            value={password}
            readOnly
            placeholder="Click Generate..."
            className="input-field flex-1 font-mono text-sm"
          />
          {password && (
            <button onClick={copy} className="px-3 py-2 rounded-xl bg-white/[0.06] border border-white/[0.1] hover:bg-white/[0.1] transition-colors">
              <Copy size={15} className="text-white/60" />
            </button>
          )}
        </div>

        <div>
          <label className="label text-xs">Length: {length}</label>
          <input type="range" min={8} max={64} value={length} onChange={e => setLength(+e.target.value)}
            className="w-full accent-[#6C63FF]" />
        </div>

        <div className="flex flex-wrap gap-2">
          {Object.entries(opts).map(([key, val]) => (
            <label key={key} className="flex items-center gap-1.5 cursor-pointer">
              <input type="checkbox" checked={val} onChange={() => setOpts(o => ({ ...o, [key]: !o[key] }))}
                className="w-3.5 h-3.5 accent-[#6C63FF]" />
              <span className="text-xs text-white/60 capitalize">{key}</span>
            </label>
          ))}
        </div>

        <button onClick={generate} className="btn-primary w-full justify-center text-sm py-2.5">
          <RefreshCw size={13} /> Generate Password
        </button>
      </div>
    </ToolCard>
  );
}

// Blacklist Checker
function BlacklistChecker() {
  const [ran, setRan] = useState(false);
  const { data, isFetching, refetch } = useQuery({
    queryKey: ['blacklist'],
    queryFn: () => toolsApi.blacklistCheck().then(r => r.data),
    enabled: false,
  });

  return (
    <ToolCard icon={<AlertTriangle size={18} />} title="Blacklist Checker" description="Check if your IP is on spam blacklists">
      {!ran ? (
        <button onClick={() => { setRan(true); refetch(); }} className="btn-secondary w-full justify-center text-sm py-2.5">
          Check Blacklists
        </button>
      ) : isFetching ? (
        <div className="text-center py-4">
          <div className="w-6 h-6 border-2 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-white/30">Checking 6 blacklists...</p>
        </div>
      ) : data && (
        <div className="space-y-2.5">
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${
            data.clean ? 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20' : 'bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/20'
          }`}>
            {data.clean ? <><CheckCircle size={16} /> Your IP is clean</> : <><XCircle size={16} /> IP listed on {data.listedCount} blacklist(s)</>}
          </div>
          {data.blacklists?.map((bl) => (
            <div key={bl.name} className="flex items-center justify-between text-xs">
              <span className="text-white/50">{bl.name}</span>
              {bl.listed ? <Badge color="red" text="Listed" /> : <Badge color="green" text="Clean" />}
            </div>
          ))}
        </div>
      )}
    </ToolCard>
  );
}

// WebRTC Leak
function WebRTCTest() {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['webrtc'],
    queryFn: () => toolsApi.webrtcCheck().then(r => r.data),
    enabled: false,
  });

  return (
    <ToolCard icon={<Shield size={18} />} title="WebRTC Leak Test" description="Detect WebRTC IP leaks in your browser">
      {!data ? (
        <button onClick={refetch} disabled={isLoading} className="btn-secondary w-full justify-center text-sm py-2.5">
          {isLoading ? 'Testing...' : 'Test WebRTC'}
        </button>
      ) : (
        <div className="space-y-3">
          <div className={`flex items-center gap-2 p-3 rounded-xl text-sm font-semibold ${
            data.leaked ? 'bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/20' : 'bg-[#00FF88]/10 text-[#00FF88] border border-[#00FF88]/20'
          }`}>
            {data.leaked ? <XCircle size={16} /> : <CheckCircle size={16} />}
            {data.leaked ? 'WebRTC Leak Detected' : 'No WebRTC Leak'}
          </div>
          <p className="text-xs text-white/40 leading-relaxed">{data.message}</p>
          <button onClick={refetch} className="btn-ghost text-xs"><RefreshCw size={12} /> Re-test</button>
        </div>
      )}
    </ToolCard>
  );
}

// Helpers
function InfoRow({ label, value, copy: canCopy }) {
  const handleCopy = () => { navigator.clipboard.writeText(value); toast.success('Copied!'); };
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-white/[0.04] last:border-0">
      <span className="text-xs text-white/40">{label}</span>
      <div className="flex items-center gap-1.5">
        <span className="text-sm font-medium text-white/80 font-mono">{value}</span>
        {canCopy && <button onClick={handleCopy} className="text-white/20 hover:text-white/50"><Copy size={12} /></button>}
      </div>
    </div>
  );
}

function Badge({ color, text }) {
  const c = { red: 'bg-[#FF6B6B]/10 text-[#FF6B6B]', green: 'bg-[#00FF88]/10 text-[#00FF88]', yellow: 'bg-yellow-500/10 text-yellow-400' };
  return <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${c[color]}`}>{text}</span>;
}

export default function Tools() {
  return (
    <div className="min-h-screen bg-[#080B14]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-20">
        <motion.div className="mb-10" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-extrabold mb-2">
            <Shield className="inline mr-2 text-[#6C63FF]" size={28} />
            Privacy Tools
          </h1>
          <p className="text-white/50">Free tools to test and protect your online privacy.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <IPChecker />
          <DNSLeakTest />
          <SpeedTest />
          <WebRTCTest />
          <BlacklistChecker />
          <PasswordGenerator />
        </div>
      </div>
      <Footer />
    </div>
  );
}
