import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Shield, Menu, X, ChevronDown, Bell, User,
  LogOut, Settings, LayoutDashboard, Zap, ArrowRight
} from 'lucide-react';
import useAuthStore from '../../store/authStore';
import { userApi } from '../../api';
import { useQuery } from '@tanstack/react-query';

const NAV_LINKS = [
  { label: 'Pricing', href: '/pricing' },
  { label: 'Blog', href: '/blog' },
  { label: 'Download', href: '/download' },
];

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const navigate = useNavigate();
  const isDesktop = !!window.electronAPI;

  const { data: notifData } = useQuery({
    queryKey: ['notifications'],
    queryFn: () => userApi.getNotifications().then(r => r.data),
    enabled: !!user,
    refetchInterval: 60000,
  });

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const unreadCount = notifData?.unreadCount || 0;

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#050508]/80 backdrop-blur-2xl border-b border-white/[0.04]'
          : 'bg-transparent'
      }`}
      initial={{ y: -80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-7 h-7 rounded-lg bg-[#C8FF00] flex items-center justify-center transition-shadow group-hover:shadow-lg group-hover:shadow-[#C8FF00]/20">
            <Shield size={14} className="text-black" />
          </div>
          <span className="font-display font-bold text-base tracking-tight">
            Phantom<span className="text-[#C8FF00]">VPN</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-0.5">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              to={link.href}
              className={`px-3.5 py-2 rounded-lg text-[13px] font-medium transition-all duration-200 ${
                location.pathname === link.href
                  ? 'text-white bg-white/[0.06]'
                  : 'text-white/45 hover:text-white/80'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        {/* Right Side */}
        <div className="hidden md:flex items-center gap-2.5">
          {user ? (
            <>
              {/* Notifications */}
              <Link to={isDesktop ? "/dashboard" : "/account"} className="relative p-2 rounded-lg hover:bg-white/[0.04] transition-colors">
                <Bell size={16} className="text-white/40" />
                {unreadCount > 0 && (
                  <span className="absolute top-1 right-1 w-3.5 h-3.5 bg-[#C8FF00] rounded-full text-[8px] font-bold flex items-center justify-center text-black">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </Link>

              {/* User Menu */}
              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.07] border border-white/[0.06] transition-all text-sm"
                >
                  <div className="w-5 h-5 rounded-full bg-[#C8FF00]/20 flex items-center justify-center text-[10px] font-bold text-[#C8FF00]">
                    {user.name?.charAt(0).toUpperCase()}
                  </div>
                  <span className="font-medium text-white/70 max-w-[80px] truncate text-xs">{user.name}</span>
                  <ChevronDown size={12} className={`text-white/30 transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
                </button>

                <AnimatePresence>
                  {userMenuOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-52 rounded-xl border border-white/[0.06] bg-[#0A0A0F] shadow-2xl shadow-black/60 py-1"
                      initial={{ opacity: 0, y: -8, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -8, scale: 0.96 }}
                      transition={{ duration: 0.15 }}
                    >
                      <div className="px-3 py-2.5 border-b border-white/[0.04] mb-1">
                        <p className="text-xs font-semibold truncate text-white/80">{user.name}</p>
                        <p className="text-[10px] text-white/30 truncate mt-0.5">{user.email}</p>
                      </div>
                      <MenuLink to={isDesktop ? "/dashboard" : "/account"} icon={isDesktop ? <LayoutDashboard size={13} /> : <User size={13} />} label={isDesktop ? "Dashboard" : "My Account"} />
                      <MenuLink to="/settings" icon={<Settings size={13} />} label="Settings" />
                      {user.role === 'admin' && (
                        <MenuLink to="/admin" icon={<Shield size={13} />} label="Admin Panel" />
                      )}
                      <div className="border-t border-white/[0.04] mt-1 pt-1">
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors rounded-lg mx-0"
                        >
                          <LogOut size={13} />
                          Sign out
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </>
          ) : (
            <>
              <Link to="/login" className="text-xs font-medium text-white/45 hover:text-white/80 px-3 py-2 transition-colors">
                Sign in
              </Link>
              <Link to="/register" className="btn-primary text-xs px-4 py-2">
                Get Started
                <ArrowRight size={12} />
              </Link>
            </>
          )}
        </div>

        {/* Mobile Menu Button */}
        <button
          className="md:hidden p-2 rounded-lg hover:bg-white/[0.04] transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={18} /> : <Menu size={18} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            className="md:hidden bg-[#050508]/95 backdrop-blur-2xl border-b border-white/[0.04]"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <div className="px-4 py-4 flex flex-col gap-0.5">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  to={link.href}
                  className="px-4 py-3 rounded-xl text-sm font-medium text-white/50 hover:text-white hover:bg-white/[0.04] transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/[0.04] mt-3 pt-3 flex flex-col gap-2">
                {user ? (
                  <>
                    <Link to={isDesktop ? "/dashboard" : "/account"} className="btn-secondary text-sm justify-center">
                      {isDesktop ? <LayoutDashboard size={14} /> : <User size={14} />} {isDesktop ? "Dashboard" : "My Account"}
                    </Link>
                    <button onClick={handleLogout} className="btn-ghost text-red-400 justify-center text-sm">
                      <LogOut size={14} /> Sign out
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="btn-secondary text-sm justify-center">Sign in</Link>
                    <Link to="/register" className="btn-primary text-sm justify-center">
                      Get Started <ArrowRight size={14} />
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
}

function MenuLink({ to, icon, label }) {
  return (
    <Link
      to={to}
      className="flex items-center gap-2.5 px-3 py-2 text-xs text-white/50 hover:text-white/80 hover:bg-white/[0.04] transition-colors"
    >
      {icon}
      {label}
    </Link>
  );
}
