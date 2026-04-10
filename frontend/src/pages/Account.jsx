import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Shield, Download, CreditCard, Activity, AlertTriangle } from 'lucide-react';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useAuthStore from '../store/authStore';
import { vpnApi } from '../api';

export default function Account() {
  const { user } = useAuthStore();

  const { data: usageData } = useQuery({
    queryKey: ['vpn-usage'],
    queryFn: () => vpnApi.getUsage().then(r => r.data),
    enabled: !!user,
  });

  const dataUsedGB = usageData?.usage ? usageData.usage.dataUsedThisMonth / (1024 ** 3) : 0;
  const dataLimitGB = usageData?.usage?.dataLimitGB === Infinity ? null : usageData?.usage?.dataLimitGB;
  const usagePercent = dataLimitGB ? Math.min((dataUsedGB / dataLimitGB) * 100, 100) : 0;

  return (
    <div className="min-h-screen bg-[#080B14]">
      <Navbar />
      
      <div className="max-w-4xl mx-auto px-6 pt-28 pb-16">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <h1 className="text-3xl font-extrabold mb-8 flex items-center gap-3">
            <Shield className="text-[#C8FF00]" size={32} />
            My Account
          </h1>

          <div className="grid md:grid-cols-2 gap-6 mb-6">
            {/* Profile Info */}
            <div className="glass-card p-6">
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">Profile Details</p>
              <div className="space-y-4">
                <div>
                  <p className="text-white/40 text-xs">Full Name</p>
                  <p className="font-semibold text-white">{user?.name}</p>
                </div>
                <div>
                  <p className="text-white/40 text-xs">Email Address</p>
                  <p className="font-semibold text-white">{user?.email}</p>
                </div>
              </div>
            </div>

            {/* Plan Details */}
            <div className="glass-card p-6 relative overflow-hidden">
              {user?.plan === 'premium' && (
                <div className="absolute top-0 right-0 bg-gradient-to-r from-[#C8FF00] to-yellow-400 text-black text-[10px] font-bold px-6 py-1 transform translate-x-[30%] translate-y-[50%] rotate-45">
                  PRO ACTIVE
                </div>
              )}
              <p className="text-white/40 text-xs font-medium uppercase tracking-wider mb-4">Subscription</p>
              <div className="flex items-center gap-3 mb-2">
                <p className="text-3xl font-extrabold capitalize text-white">
                  {user?.plan}
                </p>
              </div>
              <p className="text-white/50 text-sm mb-6">
                {user?.plan === 'free' 
                  ? 'Upgrade to unlock global servers and unlimited bandwidth.' 
                  : 'You have full access to all premium features.'}
              </p>
              
              {user?.plan === 'free' && (
                <a href="/pricing" className="btn-primary w-full text-center flex justify-center py-2.5">
                  Upgrade to Pro
                </a>
              )}
            </div>
          </div>

          {/* Data Usage & Desktop App CTA Row */}
          <div className="grid md:grid-cols-2 gap-6">
            {/* Data Usage */}
            {user?.plan === 'free' ? (
              <div className="glass-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity size={18} className="text-[#00D4FF]" />
                  <p className="text-white/40 text-xs font-medium uppercase tracking-wider">Monthly Bandwidth</p>
                </div>
                
                <div className="flex items-end gap-2 mb-3">
                  <p className="text-2xl font-bold text-white">{dataUsedGB.toFixed(2)} GB</p>
                  <p className="text-white/40 text-sm mb-1">/ {dataLimitGB} GB</p>
                </div>
                
                <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-[#00D4FF] to-[#6C63FF]"
                    initial={{ width: 0 }}
                    animate={{ width: `${usagePercent}%` }}
                    transition={{ duration: 1, ease: 'easeOut' }}
                  />
                </div>
                
                {usagePercent > 80 && (
                  <p className="text-xs text-[#FFB347] mt-3 flex items-center gap-1.5 focus:outline-none">
                    <AlertTriangle size={14} /> You're running low on free data!
                  </p>
                )}
              </div>
            ) : (
                <div className="glass-card p-6 flex flex-col justify-center items-center text-center">
                   <Activity size={24} className="text-[#C8FF00] mb-2" />
                   <h3 className="text-lg font-bold text-white mb-1">Unlimited Bandwidth</h3>
                   <p className="text-sm text-white/50">Your Pro plan has absolutely no daily or monthly data limits.</p>
                </div>
            )}

            {/* Desktop App Download CTA */}
            <div className="glass-card p-6 bg-gradient-to-br from-[#6C63FF]/10 to-transparent border-[#6C63FF]/30 flex flex-col justify-center items-center text-center">
              <Download size={32} className="text-[#6C63FF] mb-3" />
              <h3 className="text-lg font-bold text-white mb-2">Ready to connect?</h3>
              <p className="text-sm text-white/60 mb-5">
                You must download the PhantomVPN desktop application to secure your connection.
              </p>
              <a href="/download" className="bg-[#6C63FF] hover:bg-[#5a52d6] text-white px-6 py-2.5 rounded-lg font-bold transition-all w-full text-center shadow-lg shadow-[#6C63FF]/20">
                Download PhantomVPN
              </a>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
}
