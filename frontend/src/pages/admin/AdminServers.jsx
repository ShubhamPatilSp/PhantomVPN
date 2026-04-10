import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Server, Plus, Trash2, Edit, Power, PowerOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardSidebar from '../../components/layout/DashboardSidebar';
import { adminApi } from '../../api';

// ── Admin Servers ─────────────────────────────────────────────────
export function AdminServers() {
  const qc = useQueryClient();
  const [editing, setEditing] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({
    name: '', country: '', city: '', flag: '🌐', countryCode: 'XX',
    region: 'europe', ip: '', port: 51820, ping: 30, latitude: 0, longitude: 0,
    isOnline: true, isPremium: false, supportsStreaming: false, supportsP2P: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['admin-servers'],
    queryFn: () => adminApi.getServers().then(r => r.data),
  });

  const createMutation = useMutation({
    mutationFn: (data) => adminApi.createServer(data),
    onSuccess: () => { toast.success('Server created!'); qc.invalidateQueries(['admin-servers']); setShowAdd(false); },
    onError: () => toast.error('Failed to create server'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => adminApi.updateServer(id, data),
    onSuccess: () => { toast.success('Server updated!'); qc.invalidateQueries(['admin-servers']); setEditing(null); },
    onError: () => toast.error('Failed to update server'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => adminApi.deleteServer(id),
    onSuccess: () => { toast.success('Server deleted'); qc.invalidateQueries(['admin-servers']); },
    onError: () => toast.error('Failed to delete server'),
  });

  const toggleOnline = (server) => {
    updateMutation.mutate({ id: server._id, data: { isOnline: !server.isOnline } });
  };

  const handleSubmit = () => {
    if (editing) updateMutation.mutate({ id: editing, data: form });
    else createMutation.mutate(form);
  };

  const openEdit = (server) => {
    setForm(server);
    setEditing(server._id);
    setShowAdd(true);
  };

  return (
    <div className="flex h-screen bg-[#080B14] overflow-hidden">
      <DashboardSidebar isAdmin />
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#080B14]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 h-16 flex items-center justify-between">
          <h1 className="font-bold flex items-center gap-2"><Server size={18} /> Server Management</h1>
          <button onClick={() => { setEditing(null); setShowAdd(true); }} className="btn-primary text-sm px-4 py-2">
            <Plus size={14} /> Add Server
          </button>
        </div>

        <div className="p-6 space-y-5">
          {/* Add/Edit form */}
          {showAdd && (
            <motion.div
              className="glass-card p-6 border border-[#6C63FF]/20"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
            >
              <h3 className="font-bold mb-5">{editing ? 'Edit Server' : 'Add New Server'}</h3>
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-5">
                {[
                  { key: 'name', label: 'Server Name', ph: 'New York #1' },
                  { key: 'country', label: 'Country', ph: 'United States' },
                  { key: 'city', label: 'City', ph: 'New York' },
                  { key: 'flag', label: 'Flag Emoji', ph: '🇺🇸' },
                  { key: 'countryCode', label: 'Country Code', ph: 'US' },
                  { key: 'ip', label: 'IP Address', ph: '1.2.3.4' },
                  { key: 'ping', label: 'Ping (ms)', ph: '30', type: 'number' },
                  { key: 'latitude', label: 'Latitude', ph: '40.71', type: 'number' },
                  { key: 'longitude', label: 'Longitude', ph: '-74.00', type: 'number' },
                ].map(f => (
                  <div key={f.key}>
                    <label className="label">{f.label}</label>
                    <input
                      type={f.type || 'text'}
                      value={form[f.key] || ''}
                      onChange={e => setForm(p => ({ ...p, [f.key]: f.type === 'number' ? +e.target.value : e.target.value }))}
                      placeholder={f.ph}
                      className="input-field"
                    />
                  </div>
                ))}
                <div>
                  <label className="label">Region</label>
                  <select value={form.region} onChange={e => setForm(p => ({ ...p, region: e.target.value }))} className="input-field">
                    {['americas', 'europe', 'asia', 'middleeast', 'africa', 'oceania'].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex gap-4 flex-wrap mb-5">
                {[
                  { key: 'isOnline', label: 'Online' },
                  { key: 'isPremium', label: 'Premium' },
                  { key: 'supportsStreaming', label: 'Streaming' },
                  { key: 'supportsP2P', label: 'P2P' },
                  { key: 'isObfuscated', label: 'Obfuscated' },
                ].map(f => (
                  <label key={f.key} className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={!!form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.checked }))}
                      className="w-4 h-4 accent-[#6C63FF]" />
                    <span className="text-sm text-white/70">{f.label}</span>
                  </label>
                ))}
              </div>
              <div className="flex gap-3">
                <button onClick={handleSubmit} disabled={createMutation.isPending || updateMutation.isPending}
                  className="btn-primary text-sm px-5 py-2.5">
                  <Save size={14} /> {editing ? 'Update' : 'Create'} Server
                </button>
                <button onClick={() => setShowAdd(false)} className="btn-secondary text-sm px-5">Cancel</button>
              </div>
            </motion.div>
          )}

          {/* Server table */}
          <div className="glass-card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    {['Server', 'Region', 'IP', 'Ping', 'Load', 'Status', 'Features', 'Actions'].map(h => (
                      <th key={h} className="text-left px-4 py-3.5 text-xs font-medium text-white/30 uppercase tracking-wider whitespace-nowrap">
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04]">
                  {isLoading
                    ? [...Array(5)].map((_, i) => <tr key={i}><td colSpan={8} className="px-4 py-3"><div className="skeleton h-8 rounded" /></td></tr>)
                    : data?.servers?.map(server => (
                        <tr key={server._id} className="hover:bg-white/[0.02] transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <span className="text-lg">{server.flag}</span>
                              <div>
                                <p className="font-medium text-white/90 text-xs">{server.name}</p>
                                <p className="text-xs text-white/35">{server.city}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-xs text-white/50 capitalize">{server.region}</td>
                          <td className="px-4 py-3 text-xs font-mono text-white/40">{server.ip}</td>
                          <td className="px-4 py-3 text-xs text-white/60">{server.ping}ms</td>
                          <td className="px-4 py-3 text-xs text-white/60">{server.load || 0}%</td>
                          <td className="px-4 py-3">
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold ${
                              server.isOnline ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'bg-[#FF6B6B]/10 text-[#FF6B6B]'
                            }`}>
                              {server.isOnline ? 'Online' : 'Offline'}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1 flex-wrap">
                              {server.supportsStreaming && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00D4FF]/10 text-[#00D4FF]">Stream</span>}
                              {server.supportsP2P && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#00FF88]/10 text-[#00FF88]">P2P</span>}
                              {server.isPremium && <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#6C63FF]/10 text-[#6C63FF]">Pro</span>}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex gap-1">
                              <button onClick={() => openEdit(server)} className="p-1.5 rounded hover:bg-white/10 text-white/30 hover:text-white transition-all">
                                <Edit size={13} />
                              </button>
                              <button onClick={() => toggleOnline(server)} className={`p-1.5 rounded transition-all ${
                                server.isOnline ? 'hover:bg-[#FF6B6B]/10 text-white/30 hover:text-[#FF6B6B]' : 'hover:bg-[#00FF88]/10 text-white/30 hover:text-[#00FF88]'
                              }`}>
                                {server.isOnline ? <PowerOff size={13} /> : <Power size={13} />}
                              </button>
                              <button onClick={() => { if (confirm('Delete this server?')) deleteMutation.mutate(server._id); }}
                                className="p-1.5 rounded hover:bg-[#FF6B6B]/10 text-white/30 hover:text-[#FF6B6B] transition-all">
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Admin Settings ────────────────────────────────────────────────
export function AdminSettings() {
  const { data } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: () => adminApi.getSettings().then(r => r.data),
  });

  const [settings, setSettings] = useState(data?.settings || {
    siteName: 'PhantomVPN',
    maintenanceMode: false,
    freeDataLimitGB: 10,
    registrationEnabled: true,
    referralRewardDays: 30,
  });

  const mutation = useMutation({
    mutationFn: () => adminApi.updateSettings(settings),
    onSuccess: () => toast.success('Settings saved!'),
    onError: () => toast.error('Failed to save settings'),
  });

  const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }));

  return (
    <div className="flex h-screen bg-[#080B14] overflow-hidden">
      <DashboardSidebar isAdmin />
      <div className="flex-1 overflow-y-auto">
        <div className="sticky top-0 z-10 bg-[#080B14]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 h-16 flex items-center">
          <h1 className="font-bold">Platform Settings</h1>
        </div>
        <div className="p-6 max-w-2xl space-y-5">
          <div className="glass-card p-6 space-y-5">
            <h3 className="font-bold mb-1">General</h3>
            <div>
              <label className="label">Site Name</label>
              <input value={settings.siteName} onChange={e => setSettings(s => ({ ...s, siteName: e.target.value }))} className="input-field" />
            </div>
            <div>
              <label className="label">Free Plan Data Limit (GB)</label>
              <input type="number" value={settings.freeDataLimitGB} onChange={e => setSettings(s => ({ ...s, freeDataLimitGB: +e.target.value }))} className="input-field w-32" />
            </div>
            <div>
              <label className="label">Referral Reward Days</label>
              <input type="number" value={settings.referralRewardDays} onChange={e => setSettings(s => ({ ...s, referralRewardDays: +e.target.value }))} className="input-field w-32" />
            </div>
          </div>

          <div className="glass-card p-6 space-y-4">
            <h3 className="font-bold mb-1">Toggles</h3>
            {[
              { key: 'maintenanceMode', label: 'Maintenance Mode', desc: 'Show maintenance page to all users', danger: true },
              { key: 'registrationEnabled', label: 'Allow New Registrations', desc: 'Enable or disable user signups' },
            ].map(({ key, label, desc, danger }) => (
              <div key={key} className="flex items-center justify-between py-3 border-b border-white/[0.05] last:border-0">
                <div>
                  <p className={`text-sm font-medium ${danger && settings[key] ? 'text-[#FF6B6B]' : ''}`}>{label}</p>
                  <p className="text-xs text-white/35 mt-0.5">{desc}</p>
                </div>
                <button
                  onClick={() => toggle(key)}
                  className={`relative w-11 h-6 rounded-full transition-all duration-200 ${settings[key] ? (danger ? 'bg-[#FF6B6B]' : 'bg-[#6C63FF]') : 'bg-white/10'}`}
                >
                  <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${settings[key] ? 'left-5' : 'left-0.5'}`} />
                </button>
              </div>
            ))}
          </div>

          <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary text-sm px-6 py-2.5">
            <Save size={14} /> {mutation.isPending ? 'Saving...' : 'Save All Settings'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default AdminServers;
