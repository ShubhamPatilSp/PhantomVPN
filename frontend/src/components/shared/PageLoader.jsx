import { motion } from 'framer-motion';

export default function PageLoader() {
  return (
    <div className="min-h-screen bg-[#080B14] flex items-center justify-center">
      <motion.div
        className="flex flex-col items-center gap-6"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        {/* Logo */}
        <div className="relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-3xl shadow-2xl">
            ⚡
          </div>
          <motion.div
            className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] opacity-30"
            animate={{ scale: [1, 1.5, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity }}
          />
        </div>

        {/* Spinner */}
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 rounded-full bg-gradient-to-r from-[#6C63FF] to-[#00D4FF]"
              animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 0.8, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>

        <p className="text-white/40 text-sm tracking-wider uppercase font-medium">
          PhantomVPN
        </p>
      </motion.div>
    </div>
  );
}
