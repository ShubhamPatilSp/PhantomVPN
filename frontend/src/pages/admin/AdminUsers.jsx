import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Search, Shield, Ban, Trash2, ChevronDown, Users } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { adminApi } from '../../api';

const PLAN_COLORS = {
  free: 'bg-white/10 text-white/50',
  pro: 'bg-[#6C63FF]/15 text-[#6C63FF]',
  business: 'bg-[#00D4FF]/15 text-[#00D4FF]',
};

export default function AdminUsers() {
  const [search, setSearch] = useState('');
  const [plan, setPlan] = useState('');
  const [page, setPage] = useState(1);
  const [actionUser, setActionUser] = useState(null);
  const qc = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', search, plan, page],
    queryFn: () => adminApi.getUsers({ search, plan, page, limit: 20 }).then(r => r.data),
    keepPreviousData: true,
  });

  const banMutation = useMutation({
    mutationFn: ({ id, reason }) => adminApi.banUser(id, reason),
    onSuccess: () => { toast.success('User banned'); qc.invalidateQueries(['admin-users']); setActionUser(null); },
    onError: () => toast.error('Failed to ban user'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, updates }) => adminApi.updateUser(id, updates),
    onSuccess: () => { toast.success('User updated'); qc.invalidateQueries(['admin-users']); },
    onError: () => toast.error('Failed to update user'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteUser(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries(['admin-users']); },
    onError: () => toast.error('Failed to delete user'),
  });

  const handleDelete = (user) => {
    if (confirm(`Delete ${user.name}? This cannot be undone.`)) {
      deleteMutation.mutate(user._id);
    }
  };

  return (
    <div className="flex h-screen bg-[#080B14] overflow-hidden">
      <DashboardSidebar isAdmin />
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#080B14]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 h-16 flex items-center justify-between">
          <h1 className="font-bold flex items-center gap-2"><Users size={18} /> User Management</h1>
          <span className="text-xs text-white/30">{data?.total || 0} total users</span>
        </div>

        <div className="p-6 space-y-5">
          {/* Filters */}
          <div className="glass-card p-4 flex flex-wrap gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/30" />
              <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                className="input-field pl-9 h-9 text-sm"
              />
            </div>
            <select
              value={plan}
              onChange={e => { setPlan(e.target.value); setPage(1); }}
              className="input-field h-9 text-sm w-36"
            >
              <option value="">All Plans</option>
              <option value="free">Free</option>
              <option value="pro">Pro</option>
              <option value="business">Business</option>
            </select>
          </div>

          {/* Table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['User', 'Plan', 'Status', 'Joined', 'Last Active', 'Actions'].map(h => (
                      <th key={h} className="text-left px-5 py-4 text-xs font-medium text-white/30 uppercase tracking-wider">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {isLoading
                    ? [...Array(8)].map((_, i) => (
                        <tr key={i}><td colSpan={6} className="px-5 py-3"><div className="skeleton h-8 rounded-lg" /></td></tr>
                      ))
                    : data?.users?.map(user => (
                        <motion.tr
                          key={user._id}
                          className="hover:bg-white/[0.02] transition-colors"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                        >
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#6C63FF]/50 to-[#00D4FF]/50 flex items-center justify-center text-xs font-bold shrink-0">
                                {user.name?.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-white/90">{user.name}</p>
                                <p className="text-xs text-white/35">{user.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <select
                              value={user.plan}
                              onChange={e => updateMutation.mutate({ id: user._id, updates: { plan: e.target.value } })}
                              className={`text-xs px-2.5 py-1 rounded-full font-semibold cursor-pointer border-0 outline-none ${PLAN_COLORS[user.plan] || 'bg-white/10 text-white/50'}`}
                            >
                              <option value="free">FREE</option>
                              <option value="pro">PRO</option>
                              <option value="business">BUSINESS</option>
                            </select>
                          </td>
                          <td className="px-5 py-3.5">
                            <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                              user.isBanned ? 'bg-[#FF6B6B]/15 text-[#FF6B6B]' :
                              !user.isEmailVerified ? 'bg-yellow-500/15 text-yellow-400' :
                              'bg-[#00FF88]/15 text-[#00FF88]'
                            }`}>
                              {user.isBanned ? 'Banned' : !user.isEmailVerified ? 'Unverified' : 'Active'}
                            </span>
                          </td>
                          <td className="px-5 py-3.5 text-white/40 text-xs">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="px-5 py-3.5 text-white/40 text-xs">
                            {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleDateString() : '–'}
                          </td>
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-1.5">
                              {!user.isBanned ? (
                                <button
                                  onClick={() => {
                                    const reason = prompt('Ban reason:');
                                    if (reason !== null) banMutation.mutate({ id: user._id, reason });
                                  }}
                                  className="p-1.5 rounded-lg hover:bg-[#FF6B6B]/10 text-white/25 hover:text-[#FF6B6B] transition-all"
                                  title="Ban user"
                                >
                                  <Ban size={14} />
                                </button>
                              ) : (
                                <button
                                  onClick={() => updateMutation.mutate({ id: user._id, updates: { isBanned: false } })}
                                  className="p-1.5 rounded-lg hover:bg-[#00FF88]/10 text-white/25 hover:text-[#00FF88] transition-all"
                                  title="Unban user"
                                >
                                  <Shield size={14} />
                                </button>
                              )}
                              <button
                                onClick={() => handleDelete(user)}
                                className="p-1.5 rounded-lg hover:bg-[#FF6B6B]/10 text-white/25 hover:text-[#FF6B6B] transition-all"
                                title="Delete user"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </motion.tr>
                      ))
                  }
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {data && data.pages > 1 && (
              <div className="flex items-center justify-between px-5 py-4 border-t border-white/[0.06]">
                <span className="text-xs text-white/30">Page {page} of {data.pages}</span>
                <div className="flex gap-2">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">← Prev</button>
                  <button onClick={() => setPage(p => Math.min(data.pages, p + 1))} disabled={page >= data.pages}
                    className="btn-ghost text-xs px-3 py-1.5 disabled:opacity-30">Next →</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
