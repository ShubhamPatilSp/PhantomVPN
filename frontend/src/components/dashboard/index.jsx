import { motion } from 'framer-motion';
import { cn, formatDuration, formatBytes, formatSpeed } from '../../utils';

/**
 * VPN connection status widget — the main connect/disconnect button + status display.
 */
export function ConnectionWidget({ connected, connecting, server, timer, onConnect, onDisconnect }) {
  return (
    <motion.div
      className="glass-card p-6 text-center"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Connection ring */}
      <div className="relative w-44 h-44 mx-auto mb-6">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 160 160">
          <circle cx="80" cy="80" r="70" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="6" />
          <circle
            cx="80" cy="80" r="70" fill="none"
            stroke={connected ? '#00FF88' : connecting ? '#6C63FF' : 'rgba(255,255,255,0.1)'}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={connected ? '440' : connecting ? '220' : '0'}
            strokeDashoffset="0"
            className={cn('transition-all duration-1000', connecting && 'animate-spin')}
            style={connecting ? { transformOrigin: 'center', animationDuration: '2s' } : {}}
          />
        </svg>
        <button
          onClick={connected ? onDisconnect : onConnect}
          disabled={connecting}
          className={cn(
            'absolute inset-4 rounded-full flex flex-col items-center justify-center transition-all duration-500',
            connected
              ? 'bg-[#00FF88]/10 border-2 border-[#00FF88]/30 hover:bg-[#00FF88]/20'
              : connecting
                ? 'bg-[#6C63FF]/10 border-2 border-[#6C63FF]/30 cursor-wait'
                : 'bg-white/[0.04] border-2 border-white/10 hover:bg-white/[0.08] hover:border-[#6C63FF]/30'
          )}
        >
          <div className={cn(
            'w-8 h-8 mb-1.5',
            connected ? 'text-[#00FF88]' : connecting ? 'text-[#6C63FF]' : 'text-white/50'
          )}>
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
            </svg>
          </div>
          <span className={cn(
            'text-xs font-semibold',
            connected ? 'text-[#00FF88]' : connecting ? 'text-[#6C63FF]' : 'text-white/50'
          )}>
            {connected ? 'Connected' : connecting ? 'Connecting...' : 'Connect'}
          </span>
        </button>
      </div>

      {/* Timer */}
      {connected && (
        <p className="text-3xl font-mono font-bold tracking-wider text-[#00FF88] mb-2">
          {timer}
        </p>
      )}

      {/* Server info */}
      {server && (
        <div className="flex items-center justify-center gap-2 text-sm text-white/60">
          <span className="text-lg">{server.flag}</span>
          <span>{server.city}, {server.country}</span>
        </div>
      )}
    </motion.div>
  );
}

/**
 * Speed gauge component.
 */
export function SpeedGauge({ label, value, max = 300, unit = 'Mbps', color = '#00D4FF' }) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className="text-center">
      <div className="relative w-28 h-14 mx-auto mb-2 overflow-hidden">
        <svg viewBox="0 0 120 60" className="w-full h-full">
          <path d="M 10 55 A 50 50 0 0 1 110 55" fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" strokeLinecap="round" />
          <path
            d="M 10 55 A 50 50 0 0 1 110 55"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${percentage * 1.57} 157`}
            className="transition-all duration-500"
          />
        </svg>
      </div>
      <p className="text-xl font-bold" style={{ color }}>{value.toFixed(1)}</p>
      <p className="text-[10px] text-white/40 uppercase tracking-wide">{label} ({unit})</p>
    </div>
  );
}

/**
 * Usage chart placeholder — pairs with Recharts.
 */
export function UsageStats({ stats }) {
  return (
    <div className="glass-card p-5">
      <h3 className="font-bold text-sm mb-4">Session Stats</h3>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-xs text-white/40">Download</p>
          <p className="text-lg font-bold text-[#00D4FF]">{formatSpeed(stats.downloadSpeed)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40">Upload</p>
          <p className="text-lg font-bold text-[#6C63FF]">{formatSpeed(stats.uploadSpeed)}</p>
        </div>
        <div>
          <p className="text-xs text-white/40">Ping</p>
          <p className="text-lg font-bold text-[#00FF88]">{stats.ping} ms</p>
        </div>
        <div>
          <p className="text-xs text-white/40">Data Used</p>
          <p className="text-lg font-bold text-white/80">{formatBytes(stats.dataUsed)}</p>
        </div>
      </div>
    </div>
  );
}
