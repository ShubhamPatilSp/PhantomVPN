import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  Users, Server, DollarSign, Wifi, TrendingUp,
  Activity, Globe, Shield
} from 'lucide-react';
import {
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell,
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend
} from 'recharts';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { adminApi } from '../../api';

const PIE_COLORS = ['rgba(255,255,255,0.15)', '#6C63FF', '#00D4FF'];

function KPICard({ icon, label, value, sub, color }) {
  return (
    <motion.div
      className="glass-card p-5 flex flex-col gap-4"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center justify-between">
        <span className="text-white/40 text-xs font-medium uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>{icon}</div>
      </div>
      <div>
        <p className="text-2xl font-extrabold">{value}</p>
        {sub && <p className="text-xs text-white/35 mt-1">{sub}</p>}
      </div>
    </motion.div>
  );
}

export default function AdminDashboard() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: () => adminApi.getStats().then(r => r.data),
    refetchInterval: 30000,
  });

  const stats = data?.stats;

  const planData = stats?.planBreakdown?.map(p => ({
    name: p._id,
    value: p.count,
  })) || [];

  const tooltipStyle = {
    contentStyle: { background: '#0d1117', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10, fontSize: 12 },
    labelStyle: { color: 'rgba(255,255,255,0.6)' },
  };

  return (
    <div className="flex h-screen bg-[#080B14] overflow-hidden">
      <DashboardSidebar isAdmin />
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#080B14]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 h-16 flex items-center justify-between">
          <div>
            <h1 className="font-bold">Admin Dashboard</h1>
            <p className="text-xs text-white/30">Real-time platform overview</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-[#00FF88]">
            <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
            Live
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* KPIs */}
          {isLoading ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => <div key={i} className="skeleton h-28 rounded-2xl" />)}
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <KPICard icon={<Users size={17} />} label="Total Users" value={stats?.totalUsers?.toLocaleString() || '0'} sub="All registered accounts" color="bg-[#6C63FF]/15 text-[#6C63FF]" />
              <KPICard icon={<Wifi size={17} />} label="Active Connections" value={stats?.activeConnections?.toLocaleString() || '0'} sub="Connected right now" color="bg-[#00FF88]/15 text-[#00FF88]" />
              <KPICard icon={<DollarSign size={17} />} label="MRR" value={`$${parseFloat(stats?.mrr || 0).toLocaleString()}`} sub="Monthly recurring revenue" color="bg-[#00D4FF]/15 text-[#00D4FF]" />
              <KPICard icon={<Server size={17} />} label="Servers Online" value={`${stats?.onlineServers || 0} / ${stats?.totalServers || 0}`} sub="Server availability" color="bg-[#FFB347]/15 text-[#FFB347]" />
            </div>
          )}

          {/* Charts row 1 */}
          <div className="grid lg:grid-cols-3 gap-5">
            {/* Signups trend */}
            <div className="lg:col-span-2 glass-card p-5">
              <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                <TrendingUp size={15} className="text-[#6C63FF]" /> New Signups (Last 30 Days)
              </p>
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={stats?.signupsTrend || []}>
                  <defs>
                    <linearGradient id="sigGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6C63FF" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6C63FF" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="_id" stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false}
                    tickFormatter={v => v.slice(5)} />
                  <YAxis stroke="rgba(255,255,255,0.15)" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                  <Tooltip {...tooltipStyle} />
                  <Area type="monotone" dataKey="count" stroke="#6C63FF" strokeWidth={2} fill="url(#sigGrad)" name="Signups" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            {/* Plan distribution */}
            <div className="glass-card p-5">
              <p className="text-sm font-semibold mb-4 flex items-center gap-2">
                <Activity size={15} className="text-[#00D4FF]" /> Plan Distribution
              </p>
              {planData.length > 0 ? (
                <>
                  <ResponsiveContainer width="100%" height={160}>
                    <PieChart>
                      <Pie data={planData} cx="50%" cy="50%" innerRadius={45} outerRadius={75} paddingAngle={3} dataKey="value">
                        {planData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                      </Pie>
                      <Tooltip {...tooltipStyle} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2 mt-3">
                    {planData.map((p, i) => (
                      <div key={p.name} className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full" style={{ background: PIE_COLORS[i] }} />
                          <span className="text-white/60 capitalize">{p.name}</span>
                        </div>
                        <span className="font-semibold">{p.value}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-[160px] flex items-center justify-center text-white/20 text-sm">No data yet</div>
              )}
            </div>
          </div>

          {/* Quick links */}
          <div className="grid sm:grid-cols-3 gap-4">
            {[
              { href: '/admin/users', icon: <Users size={18} />, label: 'Manage Users', desc: 'View, ban, change plans', color: 'from-[#6C63FF]/15 to-[#6C63FF]/05' },
              { href: '/admin/servers', icon: <Server size={18} />, label: 'Manage Servers', desc: 'Add, edit, toggle servers', color: 'from-[#00D4FF]/15 to-[#00D4FF]/05' },
              { href: '/admin/settings', icon: <Shield size={18} />, label: 'Platform Settings', desc: 'Configure the platform', color: 'from-[#00FF88]/10 to-[#00FF88]/03' },
            ].map(item => (
              <a
                key={item.href}
                href={item.href}
                className={`glass-card-hover p-5 bg-gradient-to-br ${item.color}`}
              >
                <div className="text-[#6C63FF] mb-3">{item.icon}</div>
                <p className="font-bold text-sm">{item.label}</p>
                <p className="text-xs text-white/35 mt-0.5">{item.desc}</p>
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
