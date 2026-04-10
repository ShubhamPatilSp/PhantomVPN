import { motion } from 'framer-motion';
import { Download, ExternalLink, Shield, CheckCircle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

const DOWNLOAD_URL = 'https://github.com/ShubhamPatilSp/PhantomVPN/releases/latest/download/PhantomVPN-Setup-1.0.0.exe';
const RELEASES_URL = 'https://github.com/ShubhamPatilSp/PhantomVPN/releases';

const PLATFORMS = [
  {
    icon: '🪟', name: 'Windows', sub: 'Windows 10 / 11 (64-bit)',
    action: 'Download .exe', size: '101 MB', available: true,
    href: DOWNLOAD_URL,
  },
  { icon: '🍎', name: 'macOS', sub: 'macOS 12+', action: 'Coming Soon', available: false },
  { icon: '🐧', name: 'Linux', sub: 'Ubuntu / Debian', action: 'Coming Soon', available: false },
  { icon: '📱', name: 'iOS', sub: 'iPhone & iPad', action: 'Coming Soon', available: false },
  { icon: '🤖', name: 'Android', sub: 'Android 8+', action: 'Coming Soon', available: false },
  { icon: '🔌', name: 'Browser', sub: 'Chrome / Firefox', action: 'Coming Soon', available: false },
];

export default function DownloadPage() {
  return (
    <div className="min-h-screen bg-[#050508]">
      <Navbar />
      <div className="max-w-5xl mx-auto px-6 pt-28 pb-20">
        <motion.div className="text-center mb-14" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-4xl font-bold mb-3">
            Get <span className="text-[#C8FF00]">PhantomVPN</span>
          </h1>
          <p className="text-white/40 text-lg">Download the app and protect your digital life in seconds.</p>
        </motion.div>

        {/* Featured Windows download */}
        <motion.a
          href={DOWNLOAD_URL}
          target="_blank"
          rel="noopener noreferrer"
          className="block rounded-2xl border border-[#C8FF00]/20 bg-[#C8FF00]/[0.03] p-8 mb-8 text-center group hover:border-[#C8FF00]/40 transition-all"
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
        >
          <div className="text-5xl mb-4">🪟</div>
          <h2 className="font-display text-2xl font-bold mb-2">Download for Windows</h2>
          <p className="text-white/40 text-sm mb-6">Windows 10/11 · 64-bit · v1.0.0 · 101 MB</p>
          <span className="btn-primary inline-flex text-sm px-8 py-3.5 group-hover:shadow-lg group-hover:shadow-[#C8FF00]/20">
            <Download size={16} />
            Download PhantomVPN-Setup-1.0.0.exe
          </span>
          <div className="flex items-center justify-center gap-6 mt-6 text-xs text-white/25">
            {['WireGuard® Protocol', 'No Ads', 'Free Forever'].map(tag => (
              <span key={tag} className="flex items-center gap-1.5">
                <CheckCircle size={10} className="text-[#C8FF00]/50" />
                {tag}
              </span>
            ))}
          </div>
        </motion.a>

        {/* Other platforms grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-14">
          {PLATFORMS.filter(p => !p.available).map((p, i) => (
            <motion.div
              key={p.name}
              className="glass-card-hover p-6 opacity-60"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 0.6, y: 0 }}
              transition={{ delay: 0.2 + i * 0.06 }}
            >
              <div className="text-3xl mb-3">{p.icon}</div>
              <h3 className="font-display font-semibold text-base mb-0.5">{p.name}</h3>
              <p className="text-white/30 text-xs mb-4">{p.sub}</p>
              <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.04] border border-white/[0.06] text-xs text-white/30 font-medium">
                {p.action}
              </span>
            </motion.div>
          ))}
        </div>

        {/* Requirements */}
        <motion.div
          className="glass-card p-8"
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        >
          <h2 className="font-display text-lg font-bold mb-4">System Requirements</h2>
          <div className="grid md:grid-cols-2 gap-6 text-sm">
            <div>
              <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Minimum</h4>
              <ul className="space-y-1.5 text-white/40">
                <li>• Windows 10 or later (64-bit)</li>
                <li>• 4 GB RAM</li>
                <li>• 200 MB disk space</li>
                <li>• Internet connection</li>
              </ul>
            </div>
            <div>
              <h4 className="text-white/50 text-xs uppercase tracking-wider mb-2">Required Software</h4>
              <ul className="space-y-1.5 text-white/40">
                <li>• <a href="https://www.wireguard.com/install/" target="_blank" rel="noopener noreferrer" className="text-[#C8FF00]/70 hover:underline">WireGuard for Windows</a> (free)</li>
              </ul>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-white/[0.04]">
            <a
              href={RELEASES_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-white/30 hover:text-white/50 transition-colors inline-flex items-center gap-1.5"
            >
              View all releases on GitHub <ExternalLink size={10} />
            </a>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
}
