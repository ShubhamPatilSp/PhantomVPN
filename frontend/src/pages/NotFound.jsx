import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, LayoutDashboard } from 'lucide-react';
import Navbar from '../components/layout/Navbar';

/**
 * Branded 404 Not Found page.
 */
export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#050508]">
      <Navbar />
      <div className="flex items-center justify-center min-h-[calc(100vh-80px)] p-6 relative">
        <div className="absolute inset-0 grid-bg opacity-30 pointer-events-none" />

        <motion.div
          className="text-center relative z-10 max-w-lg"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="font-display text-[120px] md:text-[160px] font-bold leading-none text-white/[0.04] select-none mb-[-40px]">
            404
          </h1>

          <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 relative z-10">
            Page not <span className="text-[#C8FF00]">found</span>
          </h2>
          <p className="text-white/30 text-sm mb-10 max-w-sm mx-auto leading-relaxed">
            This page went invisible — even our VPN can't locate it.
            It may have been moved, deleted, or never existed.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link to="/" className="btn-primary justify-center">
              <ArrowLeft size={14} />
              Back to Home
            </Link>
            <Link to="/dashboard" className="btn-secondary justify-center">
              <LayoutDashboard size={14} />
              Dashboard
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
