import { motion } from 'framer-motion';
import { cn, formatSpeed, getPingColor, getLoadColor } from '../../utils';

/**
 * Individual server card for the Servers listing page.
 */
export function ServerCard({ server, onConnect, onDownloadConfig, isConnected, disabled }) {
  return (
    <motion.div
      className={cn(
        'glass-card-hover p-4 cursor-pointer group',
        isConnected && 'border-[#00FF88]/30 bg-[#00FF88]/[0.04]'
      )}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.01 }}
      onClick={() => !disabled && onConnect?.(server)}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <span className="text-2xl">{server.flag}</span>
          <div>
            <p className="font-semibold text-sm">{server.city}</p>
            <p className="text-xs text-white/40">{server.country}</p>
          </div>
        </div>
        <div className={cn(
          'w-2 h-2 rounded-full mt-1.5',
          server.isOnline ? 'bg-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.5)]' : 'bg-[#FF6B6B]'
        )} />
      </div>

      <div className="flex items-center justify-between text-xs mb-3">
        <span className={getPingColor(server.ping)}>
          {server.ping}ms
        </span>
        <div className="flex items-center gap-1.5">
          <div className="w-16 h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className={cn('h-full rounded-full transition-all', {
                'bg-[#00FF88]': server.load < 40,
                'bg-yellow-400': server.load >= 40 && server.load < 70,
                'bg-[#FF6B6B]': server.load >= 70,
              })}
              style={{ width: `${server.load || 0}%` }}
            />
          </div>
          <span className={cn('text-[10px]', getLoadColor(server.load))}>
            {server.load || 0}%
          </span>
        </div>
      </div>

      <div className="flex gap-1 flex-wrap">
        {server.supportsP2P && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00FF88]/10 text-[#00FF88] font-medium">P2P</span>
        )}
        {server.supportsStreaming && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF] font-medium">Streaming</span>
        )}
        {server.supportsTor && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#6C63FF]/10 text-[#6C63FF] font-medium">Tor</span>
        )}
        {server.isPremium && (
          <span className="text-[9px] px-1.5 py-0.5 rounded bg-yellow-400/10 text-yellow-400 font-medium">Premium</span>
        )}
      </div>
    </motion.div>
  );
}

/**
 * Region filter tabs for servers page.
 */
export function RegionFilter({ regions, selected, onChange }) {
  const regionLabels = {
    all: '🌍 All',
    americas: '🌎 Americas',
    europe: '🌍 Europe',
    asia: '🌏 Asia',
    africa: '🌍 Africa',
    oceania: '🌏 Oceania',
    middleeast: '🕌 Middle East',
  };

  return (
    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
      {regions.map(region => (
        <button
          key={region}
          onClick={() => onChange(region)}
          className={cn(
            'px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all',
            selected === region
              ? 'bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] text-white shadow-lg'
              : 'bg-white/[0.05] text-white/50 hover:bg-white/[0.08] hover:text-white/70'
          )}
        >
          {regionLabels[region] || region}
        </button>
      ))}
    </div>
  );
}

/**
 * Server search bar.
 */
export function ServerSearch({ value, onChange, placeholder = 'Search servers...' }) {
  return (
    <div className="relative">
      <input
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="input-field pl-10"
      />
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    </div>
  );
}
