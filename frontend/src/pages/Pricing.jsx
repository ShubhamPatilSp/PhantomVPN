import { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CheckCircle, XCircle, Zap, Crown, Building2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { planApi } from '../api';
import useAuthStore from '../store/authStore';

const PLANS = [
  {
    id: 'free', icon: <Zap size={20} />, name: 'Free', badge: null,
    price: { monthly: 0, yearly: 0 },
    features: ['10 GB / month data', '5 server locations', '1 device', 'Standard speed', 'Basic encryption', 'Community support'],
    missing: ['Unlimited data', 'Premium servers', 'Kill switch', 'Split tunneling', 'Streaming servers', 'Priority support'],
    color: 'border-white/[0.1]',
    cta: 'Get Started Free',
  },
  {
    id: 'pro', icon: <Crown size={20} />, name: 'Pro', badge: 'MOST POPULAR',
    price: { monthly: 9.99, yearly: 4.99 },
    features: ['Unlimited data', '95+ server locations', '6 devices', '10 Gbps speed', 'AES-256 encryption', 'Kill switch', 'Split tunneling', 'Streaming servers', 'P2P / Torrenting', 'Priority support'],
    missing: ['Dedicated IP', 'Team management', 'API access'],
    color: 'border-[#6C63FF]/50',
    glow: true,
    cta: 'Start Pro Plan',
  },
  {
    id: 'business', icon: <Building2 size={20} />, name: 'Business', badge: null,
    price: { monthly: 19.99, yearly: 9.99 },
    features: ['Everything in Pro', '10 devices', 'Dedicated IP option', 'Team management', 'Admin panel access', 'API access', 'Custom DNS', '24/7 Priority support', 'SLA guarantee'],
    missing: [],
    color: 'border-[#00D4FF]/30',
    cta: 'Start Business',
  },
];

const ALL_FEATURES = [
  'Data per month', 'Server locations', 'Simultaneous devices', 'Speed', 'Encryption',
  'Kill switch', 'Split tunneling', 'Streaming servers', 'P2P / Torrenting', 'Obfuscated servers',
  'Dedicated IP', 'Team management', 'Priority support', 'API access', 'SLA guarantee',
];

const FEATURE_VALUES = {
  free: ['10 GB', '5', '1', 'Standard', 'AES-256', false, false, false, false, false, false, false, false, false, false],
  pro: ['Unlimited', '95+', '6', '10 Gbps', 'AES-256', true, true, true, true, true, false, false, true, false, false],
  business: ['Unlimited', '95+', '10', '10 Gbps', 'AES-256', true, true, true, true, true, true, true, true, true, true],
};

export default function Pricing() {
  const [billing, setBilling] = useState('yearly');
  const { user } = useAuthStore();

  const handleSubscribe = async (planId) => {
    if (!user) { window.location.href = '/register'; return; }
    try {
      await planApi.subscribe({ planName: planId, billing });
      toast.success(`Subscribed to ${planId} plan!`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Subscription failed');
    }
  };

  return (
    <div className="min-h-screen bg-[#080B14]">
      <Navbar />
      <div className="max-w-7xl mx-auto px-6 pt-28 pb-24">
        {/* Header */}
        <motion.div
          className="text-center mb-14"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <p className="text-[#6C63FF] font-semibold text-sm uppercase tracking-widest mb-3">Pricing</p>
          <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
            Privacy at Every <span className="gradient-text">Price Point</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-10">
            Start free, upgrade when you're ready. All plans include our core privacy protection.
          </p>

          {/* Billing Toggle */}
          <div className="inline-flex items-center gap-3 glass-card px-2 py-2 rounded-2xl">
            <button
              onClick={() => setBilling('monthly')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all ${
                billing === 'monthly' ? 'bg-white/[0.1] text-white' : 'text-white/40'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBilling('yearly')}
              className={`px-5 py-2 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 ${
                billing === 'yearly' ? 'bg-[#6C63FF]/20 text-[#6C63FF]' : 'text-white/40'
              }`}
            >
              Yearly
              <span className="text-[10px] px-1.5 py-0.5 bg-[#00FF88]/15 text-[#00FF88] border border-[#00FF88]/20 rounded-full">
                Save 50%
              </span>
            </button>
          </div>
        </motion.div>

        {/* Plan Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-20">
          {PLANS.map((plan, i) => {
            const price = billing === 'yearly' ? plan.price.yearly : plan.price.monthly;
            return (
              <motion.div
                key={plan.id}
                className={`glass-card p-7 relative flex flex-col border ${plan.color} ${plan.glow ? 'shadow-[0_0_40px_rgba(108,99,255,0.2)]' : ''}`}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 bg-gradient-to-r from-[#6C63FF] to-[#00D4FF] rounded-full text-[11px] font-bold tracking-wider text-white shadow-lg">
                    {plan.badge}
                  </div>
                )}

                {plan.glow && (
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#6C63FF]/08 to-[#00D4FF]/04 pointer-events-none" />
                )}

                <div className="relative z-10 flex flex-col h-full">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 ${
                    plan.id === 'free' ? 'bg-white/[0.08] text-white/60' :
                    plan.id === 'pro' ? 'bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] text-white shadow-lg' :
                    'bg-[#00D4FF]/15 text-[#00D4FF]'
                  }`}>
                    {plan.icon}
                  </div>

                  <h3 className="text-xl font-extrabold mb-1">{plan.name}</h3>

                  <div className="mb-6">
                    {price === 0 ? (
                      <p className="text-4xl font-extrabold text-white">Free <span className="text-base font-normal text-white/40">forever</span></p>
                    ) : (
                      <>
                        <p className="text-4xl font-extrabold">
                          <span className="gradient-text">${price}</span>
                          <span className="text-base font-normal text-white/40">/mo</span>
                        </p>
                        {billing === 'yearly' && (
                          <p className="text-xs text-white/40 mt-1">Billed ${(price * 12).toFixed(2)}/year</p>
                        )}
                      </>
                    )}
                  </div>

                  <ul className="space-y-2.5 flex-1 mb-7">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/75">
                        <CheckCircle size={14} className="text-[#00FF88] shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                    {plan.missing.map(f => (
                      <li key={f} className="flex items-start gap-2.5 text-sm text-white/25">
                        <XCircle size={14} className="shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={() => handleSubscribe(plan.id)}
                    className={`w-full py-3 rounded-xl font-semibold text-sm transition-all ${
                      plan.glow
                        ? 'btn-primary justify-center'
                        : plan.id === 'business'
                        ? 'bg-[#00D4FF]/10 text-[#00D4FF] border border-[#00D4FF]/25 hover:bg-[#00D4FF]/20'
                        : 'btn-secondary justify-center'
                    }`}
                  >
                    {plan.cta}
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          className="glass-card overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="p-6 border-b border-white/[0.06]">
            <h2 className="text-xl font-bold">Full Feature Comparison</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.06]">
                  <th className="text-left p-5 text-sm font-medium text-white/40 w-1/2">Feature</th>
                  {PLANS.map(p => (
                    <th key={p.id} className="p-5 text-center text-sm font-bold">
                      <span className={p.id === 'pro' ? 'gradient-text' : ''}>{p.name}</span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {ALL_FEATURES.map((feature, fi) => (
                  <tr key={feature} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="p-5 text-sm text-white/70">{feature}</td>
                    {PLANS.map(plan => {
                      const val = FEATURE_VALUES[plan.id][fi];
                      return (
                        <td key={plan.id} className="p-5 text-center text-sm">
                          {typeof val === 'boolean' ? (
                            val
                              ? <CheckCircle size={16} className="text-[#00FF88] mx-auto" />
                              : <XCircle size={16} className="text-white/15 mx-auto" />
                          ) : (
                            <span className="text-white/70">{val}</span>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Money back */}
        <div className="text-center mt-12">
          <div className="inline-flex items-center gap-3 glass-card px-6 py-4 rounded-2xl">
            <span className="text-3xl">💰</span>
            <div className="text-left">
              <p className="font-bold text-sm">30-Day Money-Back Guarantee</p>
              <p className="text-xs text-white/40">Not satisfied? Full refund, no questions asked.</p>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
