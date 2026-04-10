import { motion } from 'framer-motion';
import { cn } from '../../utils';

/**
 * Reusable modal component with glass-card styling and overlay.
 */
export function Modal({ isOpen, onClose, title, children, maxWidth = 'max-w-lg' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <motion.div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      />
      {/* Content */}
      <motion.div
        className={cn('relative w-full glass-card p-6 z-10', maxWidth)}
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.2 }}
      >
        {title && (
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-bold text-lg">{title}</h3>
            <button
              onClick={onClose}
              className="text-white/30 hover:text-white p-1 hover:bg-white/10 rounded-lg transition-all"
            >
              ✕
            </button>
          </div>
        )}
        {children}
      </motion.div>
    </div>
  );
}

/**
 * Status badge component.
 */
export function Badge({ variant = 'default', children, className }) {
  const variants = {
    default: 'bg-white/10 text-white/70',
    success: 'bg-[#00FF88]/10 text-[#00FF88]',
    warning: 'bg-yellow-400/10 text-yellow-400',
    error: 'bg-[#FF6B6B]/10 text-[#FF6B6B]',
    primary: 'bg-[#6C63FF]/10 text-[#6C63FF]',
    info: 'bg-[#00D4FF]/10 text-[#00D4FF]',
  };

  return (
    <span className={cn(
      'inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-semibold',
      variants[variant] || variants.default,
      className
    )}>
      {children}
    </span>
  );
}

/**
 * Online/Offline status dot.
 */
export function StatusDot({ online, size = 'sm' }) {
  const sizes = { sm: 'w-2 h-2', md: 'w-2.5 h-2.5', lg: 'w-3 h-3' };
  return (
    <span className={cn(
      'rounded-full inline-block',
      sizes[size],
      online ? 'bg-[#00FF88] shadow-[0_0_8px_rgba(0,255,136,0.5)]' : 'bg-[#FF6B6B]'
    )} />
  );
}

/**
 * Stat card with icon, value, and label.
 */
export function StatCard({ icon, label, value, sub, trend, className }) {
  return (
    <motion.div
      className={cn('glass-card p-5', className)}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-start justify-between mb-3">
        <div className="p-2 rounded-xl bg-white/[0.06] text-white/60">
          {icon}
        </div>
        {trend !== undefined && (
          <span className={cn(
            'text-xs font-semibold',
            trend >= 0 ? 'text-[#00FF88]' : 'text-[#FF6B6B]'
          )}>
            {trend >= 0 ? '↑' : '↓'} {Math.abs(trend)}%
          </span>
        )}
      </div>
      <p className="text-2xl font-extrabold tracking-tight">{value}</p>
      <p className="text-xs text-white/40 mt-0.5">{label}</p>
      {sub && <p className="text-[10px] text-white/25 mt-1">{sub}</p>}
    </motion.div>
  );
}

/**
 * Skeleton loading placeholder.
 */
export function Skeleton({ className, lines = 1 }) {
  if (lines === 1) {
    return <div className={cn('skeleton h-4 rounded', className)} />;
  }
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn('skeleton h-4 rounded', i === lines - 1 && 'w-3/4', className)} />
      ))}
    </div>
  );
}

/**
 * Empty state illustration.
 */
export function EmptyState({ icon = '📭', title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="font-bold text-lg mb-2 text-white/80">{title}</h3>
      {description && <p className="text-sm text-white/40 max-w-sm mb-6">{description}</p>}
      {action}
    </div>
  );
}

/**
 * Toggle switch component.
 */
export function Toggle({ enabled, onChange, label, description, danger = false }) {
  return (
    <div className="flex items-center justify-between py-3">
      <div className="flex-1 mr-4">
        {label && <p className={cn('text-sm font-medium', danger && enabled && 'text-[#FF6B6B]')}>{label}</p>}
        {description && <p className="text-xs text-white/35 mt-0.5">{description}</p>}
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={() => onChange(!enabled)}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200',
          enabled ? (danger ? 'bg-[#FF6B6B]' : 'bg-[#6C63FF]') : 'bg-white/10'
        )}
      >
        <span className={cn(
          'inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform duration-200',
          enabled ? 'translate-x-5' : 'translate-x-0.5'
        )} />
      </button>
    </div>
  );
}
