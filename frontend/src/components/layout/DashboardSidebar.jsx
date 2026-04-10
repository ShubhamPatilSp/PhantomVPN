import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Globe, CreditCard, Settings, Wrench,
  BookOpen, Download, Shield, ChevronLeft, ChevronRight,
  LogOut, ShieldCheck, Users, Server
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useVpnStore from '../../store/vpnStore';

const USER_NAV = [
  { icon: <LayoutDashboard size={18} />, label: 'Dashboard', href: '/dashboard' },
  { icon: <Globe size={18} />, label: 'Servers', href: '/servers' },
  { icon: <CreditCard size={18} />, label: 'Pricing', href: '/pricing' },
  { icon: <Wrench size={18} />, label: 'Tools', href: '/tools' },
  { icon: <BookOpen size={18} />, label: 'Blog', href: '/blog' },
  { icon: <Download size={18} />, label: 'Download', href: '/download' },
  { icon: <ShieldCheck size={18} />, label: 'Leak Test', href: '/leak-test' },
  { icon: <Settings size={18} />, label: 'Settings', href: '/settings' },
];

const ADMIN_NAV = [
  { icon: <LayoutDashboard size={18} />, label: 'Overview', href: '/admin' },
  { icon: <Users size={18} />, label: 'Users', href: '/admin/users' },
  { icon: <Server size={18} />, label: 'Servers', href: '/admin/servers' },
  { icon: <Settings size={18} />, label: 'Settings', href: '/admin/settings' },
];

export default function DashboardSidebar({ isAdmin = false }) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { connected } = useVpnStore();

  const isDesktop = !!window.electronAPI;

  const validNav = isAdmin ? ADMIN_NAV : USER_NAV.filter(item => {
    if (!isDesktop) {
      return !['/servers', '/tools', '/leak-test', '/dashboard'].includes(item.href);
    }
    return true;
  });

  const nav = validNav;

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 68 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="hidden md:flex flex-col h-screen sticky top-0 bg-[#080B14] border-r border-white/[0.06] overflow-hidden shrink-0"
    >
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-white/[0.06] shrink-0">
        <Link to="/" className="flex items-center gap-2.5 overflow-hidden">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-base shrink-0">
            ⚡
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                className="font-extrabold text-base tracking-tight whitespace-nowrap"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.15 }}
              >
                PhantomVPN
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
        {nav.map((item) => {
          const active = location.pathname === item.href;
          return (
            <Link
              key={item.href}
              to={item.href}
              title={collapsed ? item.label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-150 group ${
                active
                  ? 'bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/20'
                  : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
              }`}
            >
              <span className={`shrink-0 ${active ? 'text-[#6C63FF]' : 'group-hover:text-white'}`}>
                {item.icon}
              </span>
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    className="text-sm font-medium whitespace-nowrap overflow-hidden"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          );
        })}
      </nav>

      {/* VPN Status */}
      {!isAdmin && (
        <div className="px-3 mb-2">
          <div className={`flex items-center gap-2.5 px-3 py-2 rounded-xl ${
            connected ? 'bg-[#00FF88]/10 border border-[#00FF88]/20' : 'bg-white/[0.04] border border-white/[0.06]'
          }`}>
            <div className={`w-2 h-2 rounded-full shrink-0 ${connected ? 'bg-[#00FF88] shadow-[0_0_8px_#00FF88]' : 'bg-white/20'}`} />
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  className={`text-xs font-semibold ${connected ? 'text-[#00FF88]' : 'text-white/40'}`}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  {connected ? 'Protected' : 'Not Protected'}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* User + Collapse */}
      <div className="p-3 border-t border-white/[0.06] space-y-1">
        <div className="flex items-center gap-2.5 px-3 py-2 rounded-xl overflow-hidden">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-xs font-bold shrink-0">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <AnimatePresence>
            {!collapsed && (
              <motion.div
                className="overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <p className="text-xs font-semibold truncate max-w-[130px]">{user?.name}</p>
                <p className="text-[10px] text-white/35 truncate">{user?.email}</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <button
          onClick={handleLogout}
          title={collapsed ? 'Sign out' : undefined}
          className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-white/40 hover:text-[#FF6B6B] hover:bg-[#FF6B6B]/10 transition-all text-sm"
        >
          <LogOut size={16} className="shrink-0" />
          <AnimatePresence>
            {!collapsed && (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                Sign out
              </motion.span>
            )}
          </AnimatePresence>
        </button>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center py-2 text-white/20 hover:text-white/50 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </motion.aside>
  );
}
