import { Link } from 'react-router-dom';
import { Github, Twitter, Youtube, Shield } from 'lucide-react';

const LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Servers', href: '/servers' },
    { label: 'Download', href: '/download' },
    { label: 'Speed Test', href: '/tools' },
  ],
  Privacy: [
    { label: 'Leak Test', href: '/leak-test' },
    { label: 'IP Checker', href: '/tools' },
    { label: 'DNS Leak Test', href: '/tools' },
    { label: 'Blog', href: '/blog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms of Service', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#080B14]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-12">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-lg">
                ⚡
              </div>
              <span className="font-extrabold text-xl tracking-tight">
                Phantom<span className="bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] bg-clip-text text-transparent">VPN</span>
              </span>
            </Link>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs mb-6">
              Military-grade encryption, zero logs, and 95+ server locations worldwide.
              Your privacy is our mission.
            </p>
            <div className="flex items-center gap-3">
              {[
                { icon: <Twitter size={16} />, href: '#' },
                { icon: <Github size={16} />, href: '#' },
                { icon: <Youtube size={16} />, href: '#' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  className="w-9 h-9 rounded-xl bg-white/[0.06] border border-white/[0.08] flex items-center justify-center text-white/50 hover:text-white hover:bg-white/[0.1] transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-xs font-semibold text-white/30 uppercase tracking-widest mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/55 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="pt-8 border-t border-white/[0.06] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © {new Date().getFullYear()} PhantomVPN. All rights reserved.
          </p>
          <div className="flex items-center gap-2 text-xs text-white/30">
            <Shield size={12} className="text-[#00FF88]" />
            <span>256-bit AES Encrypted</span>
            <span className="mx-1">·</span>
            <span>Zero Logs Verified</span>
            <span className="mx-1">·</span>
            <span>95+ Countries</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
