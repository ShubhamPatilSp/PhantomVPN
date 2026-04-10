import { Link } from 'react-router-dom';
import { Github, Twitter, Shield, ArrowUpRight } from 'lucide-react';

const LINKS = {
  Product: [
    { label: 'Features', href: '/#features' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Download', href: '/download' },
  ],
  Resources: [
    { label: 'Blog', href: '/blog' },
  ],
  Company: [
    { label: 'About', href: '/about' },
    { label: 'Privacy Policy', href: '/privacy' },
    { label: 'Terms', href: '/terms' },
    { label: 'Contact', href: '/contact' },
  ],
};

export default function Footer() {
  return (
    <footer className="border-t border-white/[0.04] bg-[#050508]">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10 mb-14">
          {/* Brand */}
          <div className="col-span-2">
            <Link to="/" className="flex items-center gap-2.5 mb-5">
              <div className="w-7 h-7 rounded-lg bg-[#C8FF00] flex items-center justify-center">
                <Shield size={14} className="text-black" />
              </div>
              <span className="font-display font-bold text-base tracking-tight">
                Phantom<span className="text-[#C8FF00]">VPN</span>
              </span>
            </Link>
            <p className="text-white/30 text-sm leading-relaxed max-w-xs mb-6">
              Military-grade encryption, zero logs, and 95+ server locations.
              Your privacy is our entire purpose.
            </p>
            <div className="flex items-center gap-2">
              {[
                { icon: <Twitter size={14} />, href: '#' },
                { icon: <Github size={14} />, href: 'https://github.com/ShubhamPatilSp/PhantomVPN' },
              ].map((s, i) => (
                <a
                  key={i}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-8 h-8 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-white/30 hover:text-white/60 hover:border-white/[0.1] transition-all"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Link columns */}
          {Object.entries(LINKS).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-[10px] font-semibold text-white/20 uppercase tracking-[0.2em] mb-4">{category}</h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-sm text-white/35 hover:text-white/70 transition-colors"
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
        <div className="pt-8 border-t border-white/[0.04] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-white/20 text-xs">
            © {new Date().getFullYear()} PhantomVPN. All rights reserved.
          </p>
          <div className="flex items-center gap-4 text-[10px] text-white/15 uppercase tracking-widest font-medium">
            <span>AES-256</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>Zero Logs</span>
            <span className="w-1 h-1 rounded-full bg-white/10" />
            <span>WireGuard®</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
