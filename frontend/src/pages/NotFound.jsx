import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import Navbar from '../components/layout/Navbar';

/**
 * Branded 404 Not Found page.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#080B14]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-[#6C63FF]/8 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-[#00D4FF]/6 rounded-full blur-[120px]" />
        </div>

        <motion.div
          className="text-center relative z-10 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Glitch 404 */}
          <div className="relative mb-8">
            <h1 className="text-[120px] md:text-[160px] font-black leading-none gradient-text select-none">
              404
            </h1>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-6xl animate-bounce" style={{ animationDuration: '3s' }}>
                👻
              </div>
            </div>
          </div>

          <h2 className="text-2xl md:text-3xl font-extrabold mb-4">
            Page Not <span className="text-[#FF6B6B]">Found</span>
          </h2>
          <p className="text-white/40 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
            Looks like this page went invisible — even our VPN can't find it.
            The page may have been moved, deleted, or never existed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary justify-center">
              ← Back to Home
            </Link>
            <Link to="/dashboard" className="btn-secondary justify-center">
              Go to Dashboard
            </Link>
          </div>

          {/* Fun stats */}
          <div className="mt-14 grid grid-cols-3 gap-4 max-w-xs mx-auto">
            {[
              { value: '95+', label: 'Servers Online' },
              { value: '0', label: 'Pages Like This' },
              { value: '∞', label: 'Privacy Level' },
            ].map((stat, i) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.1 }}
              >
                <p className="text-lg font-extrabold gradient-text">{stat.value}</p>
                <p className="text-[10px] text-white/30">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
