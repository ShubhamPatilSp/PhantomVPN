import { motion } from 'framer-motion';
import { Download, Monitor, Smartphone, Chrome, Router, Tv } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const PLATFORMS = [
  { icon: '🪟', name: 'Windows', sub: 'Windows 10 / 11', action: 'Download .exe', size: '12.4 MB' },
  { icon: '🍎', name: 'macOS', sub: 'macOS 12+', action: 'Download .dmg', size: '14.8 MB' },
  { icon: '🐧', name: 'Linux', sub: 'Ubuntu / Debian / RPM', action: 'Download .deb', size: '9.2 MB' },
  { icon: '📱', name: 'iOS', sub: 'iPhone & iPad', action: 'App Store', store: true },
  { icon: '🤖', name: 'Android', sub: 'Android 8+', action: 'Play Store', store: true },
  { icon: '🔌', name: 'Browser', sub: 'Chrome / Firefox', action: 'Get Extension', store: true },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#080B14]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-extrabold mb-3">
            Get <span className="gradient-text">PhantomVPN</span>
          </h1>
          <p className="text-white/50 text-lg">Available on all your devices. Protect everything.</p>
        </motion.div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-14">
          {PLATFORMS.map((p, i) => (
            <motion.div
              key={p.name}
              className="glass-card-hover p-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.08 }}
            >
              <div className="text-4xl mb-4">{p.icon}</div>
              <h3 className="font-bold text-lg mb-0.5">{p.name}</h3>
              <p className="text-white/40 text-sm mb-5">{p.sub}</p>
              <button className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all ${
                p.store
                  ? 'btn-secondary justify-center'
                  : 'btn-primary justify-center'
              }`}>
                <Download size={14} />
                {p.action}
                {p.size && <span className="text-xs opacity-60 ml-1">({p.size})</span>}
              </button>
            </motion.div>
          ))}
        </div>

        <div className="glass-card p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Need WireGuard Config?</h2>
          <p className="text-white/50 text-sm mb-5">Download config files for manual setup on any WireGuard-compatible router or device.</p>
          <a href="/dashboard" className="btn-primary inline-flex">Go to Dashboard → Download Config</a>
        </div>
      </div>
      <Footer />
    </div>
  );
}
