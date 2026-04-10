import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  User, CreditCard, Smartphone, Download, Shield,
  Gift, Bell, Copy, CheckCircle, Trash2, RefreshCw,
  Lock, Globe, Wifi, Key
} from 'lucide-react';
import toast from 'react-hot-toast';
import DashboardSidebar from '../components/layout/DashboardSidebar';
import { userApi, authApi, vpnApi, serverApi } from '../api';
import useAuthStore from '../store/authStore';

const TABS = [
  { id: 'profile', label: 'Profile', icon: <User size={16} /> },
  { id: 'subscription', label: 'Subscription', icon: <CreditCard size={16} /> },
  { id: 'devices', label: 'Devices', icon: <Smartphone size={16} /> },
  { id: 'privacy', label: 'Privacy', icon: <Shield size={16} /> },
  { id: 'downloads', label: 'Downloads', icon: <Download size={16} /> },
  { id: 'referrals', label: 'Referrals', icon: <Gift size={16} /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell size={16} /> },
  { id: '2fa', label: '2FA Security', icon: <Key size={16} /> },
];

// ── Profile Tab ───────────────────────────────────────────────────
function ProfileTab({ user, qc }) {
  const [name, setName] = useState(user?.name || '');
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const { updateUser } = useAuthStore();

  const updateMutation = useMutation({
    mutationFn: () => userApi.updateProfile({ name }),
    onSuccess: () => { updateUser({ name }); toast.success('Profile updated!'); qc.invalidateQueries(['profile']); },
    onError: () => toast.error('Failed to update profile'),
  });

  const pwMutation = useMutation({
    mutationFn: () => userApi.changePassword({ currentPassword: currentPw, newPassword: newPw }),
    onSuccess: () => { toast.success('Password changed!'); setCurrentPw(''); setNewPw(''); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to change password'),
  });

  return (
    <div className="space-y-6">
      <div className="glass-card p-6">
        <h3 className="font-bold mb-5 flex items-center gap-2"><User size={16} className="text-[#6C63FF]" /> Profile Information</h3>
        <div className="flex items-center gap-5 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-2xl font-extrabold shadow-lg">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-semibold">{user?.name}</p>
            <p className="text-sm text-white/40">{user?.email}</p>
            <span className={`text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-semibold ${
              user?.plan === 'pro' ? 'bg-[#6C63FF]/15 text-[#6C63FF]' :
              user?.plan === 'business' ? 'bg-[#00D4FF]/15 text-[#00D4FF]' :
              'bg-white/10 text-white/50'
            }`}>{user?.plan?.toUpperCase()} Plan</span>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="label">Display Name</label>
            <input value={name} onChange={e => setName(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="label">Email</label>
            <input value={user?.email} disabled className="input-field opacity-50 cursor-not-allowed" />
          </div>
          <button onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending || name === user?.name}
            className="btn-primary text-sm px-5 py-2.5">
            {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold mb-5 flex items-center gap-2"><Lock size={16} className="text-[#6C63FF]" /> Change Password</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Current Password</label>
            <input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" className="input-field" />
          </div>
          <div>
            <label className="label">New Password</label>
            <input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" className="input-field" />
          </div>
          <button onClick={() => pwMutation.mutate()} disabled={!currentPw || !newPw || pwMutation.isPending}
            className="btn-primary text-sm px-5 py-2.5">
            {pwMutation.isPending ? 'Updating...' : 'Update Password'}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── 2FA Tab ───────────────────────────────────────────────────────
function TwoFATab({ user, qc }) {
  const [code, setCode] = useState('');
  const [qrData, setQrData] = useState(null);
  const [secret, setSecret] = useState('');
  const { updateUser } = useAuthStore();

  const enableMutation = useMutation({
    mutationFn: authApi.enable2FA,
    onSuccess: (res) => { setQrData(res.data.qrCode); setSecret(res.data.secret); },
    onError: () => toast.error('Failed to start 2FA setup'),
  });

  const verifyMutation = useMutation({
    mutationFn: () => authApi.verify2FA(code),
    onSuccess: () => { toast.success('2FA enabled!'); updateUser({ twoFactorEnabled: true }); setQrData(null); qc.invalidateQueries(); },
    onError: () => toast.error('Invalid code. Try again.'),
  });

  const disableMutation = useMutation({
    mutationFn: () => authApi.disable2FA(code),
    onSuccess: () => { toast.success('2FA disabled.'); updateUser({ twoFactorEnabled: false }); setCode(''); qc.invalidateQueries(); },
    onError: () => toast.error('Invalid code.'),
  });

  return (
    <div className="glass-card p-6 max-w-md">
      <h3 className="font-bold mb-2 flex items-center gap-2"><Key size={16} className="text-[#6C63FF]" /> Two-Factor Authentication</h3>
      <p className="text-sm text-white/50 mb-6">Add an extra layer of security using an authenticator app like Google Authenticator or Authy.</p>

      {user?.twoFactorEnabled ? (
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 rounded-xl bg-[#00FF88]/10 border border-[#00FF88]/20 text-sm text-[#00FF88]">
            <CheckCircle size={16} /> 2FA is enabled on your account
          </div>
          <div>
            <label className="label">Enter your 2FA code to disable</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value)} maxLength={6}
              placeholder="000000" className="input-field tracking-[0.3em] text-center text-lg w-40" />
          </div>
          <button onClick={() => disableMutation.mutate()} disabled={code.length < 6 || disableMutation.isPending}
            className="px-5 py-2.5 rounded-xl bg-[#FF6B6B]/10 text-[#FF6B6B] border border-[#FF6B6B]/20 hover:bg-[#FF6B6B]/20 text-sm font-semibold transition-all">
            {disableMutation.isPending ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      ) : !qrData ? (
        <button onClick={() => enableMutation.mutate()} disabled={enableMutation.isPending} className="btn-primary text-sm px-5 py-2.5">
          {enableMutation.isPending ? 'Setting up...' : 'Enable 2FA'}
        </button>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-white/60">Scan this QR code with your authenticator app:</p>
          <div className="p-4 bg-white rounded-xl inline-block">
            <img src={qrData} alt="2FA QR Code" className="w-40 h-40" />
          </div>
          <div>
            <p className="text-xs text-white/40 mb-1">Or enter manually:</p>
            <code className="text-xs bg-white/[0.05] px-3 py-2 rounded-lg block text-[#6C63FF] break-all">{secret}</code>
          </div>
          <div>
            <label className="label">Verify with 6-digit code</label>
            <input type="text" value={code} onChange={e => setCode(e.target.value)} maxLength={6}
              placeholder="000000" className="input-field tracking-[0.3em] text-center text-lg w-40" />
          </div>
          <button onClick={() => verifyMutation.mutate()} disabled={code.length < 6 || verifyMutation.isPending}
            className="btn-primary text-sm px-5 py-2.5">
            {verifyMutation.isPending ? 'Verifying...' : 'Verify & Enable'}
          </button>
        </div>
      )}
    </div>
  );
}

// ── Privacy Tab ───────────────────────────────────────────────────
function PrivacyTab({ user, qc }) {
  const [prefs, setPrefs] = useState(user?.preferences || {});
  const mutation = useMutation({
    mutationFn: () => userApi.updatePreferences(prefs),
    onSuccess: () => toast.success('Preferences saved!'),
    onError: () => toast.error('Failed to save preferences'),
  });

  const toggle = (key) => setPrefs(p => ({ ...p, [key]: !p[key] }));

  const toggleRow = (label, key, desc) => (
    <div className="flex items-center justify-between py-4 border-b border-white/[0.05] last:border-0">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-white/35 mt-0.5">{desc}</p>
      </div>
      <button
        onClick={() => toggle(key)}
        className={`relative w-11 h-6 rounded-full transition-all duration-200 ${prefs[key] ? 'bg-[#6C63FF]' : 'bg-white/10'}`}
      >
        <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${prefs[key] ? 'left-5' : 'left-0.5'}`} />
      </button>
    </div>
  );

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Shield size={16} className="text-[#6C63FF]" /> Privacy Settings</h3>
        {toggleRow('Kill Switch', 'killSwitch', 'Block all traffic if VPN disconnects unexpectedly')}
        {toggleRow('Split Tunneling', 'splitTunnel', 'Choose which apps bypass the VPN')}
        {toggleRow('Auto-Connect', 'autoConnect', 'Automatically connect VPN on startup')}
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Globe size={16} className="text-[#6C63FF]" /> Network Settings</h3>
        <div className="space-y-4">
          <div>
            <label className="label">Custom DNS</label>
            <input value={prefs.dns || '1.1.1.1'} onChange={e => setPrefs(p => ({ ...p, dns: e.target.value }))}
              placeholder="1.1.1.1" className="input-field font-mono" />
            <p className="text-xs text-white/30 mt-1">Default: 1.1.1.1 (Cloudflare) — PhantomVPN encrypted DNS</p>
          </div>
          <div>
            <label className="label">Connection Protocol</label>
            <select value={prefs.protocol || 'wireguard'} onChange={e => setPrefs(p => ({ ...p, protocol: e.target.value }))}
              className="input-field cursor-pointer">
              <option value="wireguard">WireGuard (Recommended — Fastest)</option>
              <option value="openvpn">OpenVPN (Most Compatible)</option>
              <option value="ikev2">IKEv2 (Best for Mobile)</option>
            </select>
          </div>
        </div>
      </div>

      <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary text-sm px-6 py-2.5">
        {mutation.isPending ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}

// ── Referrals Tab ─────────────────────────────────────────────────
function ReferralsTab({ user }) {
  const { data } = useQuery({
    queryKey: ['referrals'],
    queryFn: () => userApi.getReferrals().then(r => r.data),
  });

  const refLink = `${window.location.origin}/register?ref=${data?.referralCode || user?.referralCode}`;

  const copy = () => { navigator.clipboard.writeText(refLink); toast.success('Referral link copied!'); };

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <h3 className="font-bold mb-2 flex items-center gap-2"><Gift size={16} className="text-[#6C63FF]" /> Refer & Earn</h3>
        <p className="text-sm text-white/50 mb-5">Invite friends and get 30 free Pro days for each friend who signs up and verifies their email.</p>

        <div className="flex gap-2 mb-5">
          <input value={refLink} readOnly className="input-field flex-1 text-xs font-mono" />
          <button onClick={copy} className="btn-secondary px-4 text-sm shrink-0"><Copy size={14} /></button>
        </div>

        <div className="grid grid-cols-3 gap-3 mb-5">
          {[
            { label: 'Total Invited', value: data?.totalReferrals || 0, color: 'text-[#6C63FF]' },
            { label: 'Converted', value: data?.referrals?.filter(r => r.status === 'converted').length || 0, color: 'text-[#00FF88]' },
            { label: 'Days Earned', value: data?.rewardDaysEarned || 0, color: 'text-[#00D4FF]' },
          ].map(s => (
            <div key={s.label} className="text-center p-3 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <p className={`text-2xl font-extrabold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-white/35 mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {[
            { label: 'WhatsApp', href: `https://wa.me/?text=${encodeURIComponent('Try PhantomVPN free! ' + refLink)}`, color: 'text-[#25D366]' },
            { label: 'Twitter', href: `https://twitter.com/intent/tweet?text=${encodeURIComponent('I use PhantomVPN to stay private online. Try it free: ' + refLink)}`, color: 'text-[#1DA1F2]' },
          ].map(s => (
            <a key={s.label} href={s.href} target="_blank" rel="noopener noreferrer"
              className={`btn-ghost border border-white/[0.08] text-sm ${s.color}`}>
              Share via {s.label}
            </a>
          ))}
        </div>
      </div>

      {data?.referrals?.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="font-bold mb-4 text-sm">Referral History</h3>
          <div className="space-y-2">
            {data.referrals.map(r => (
              <div key={r._id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-sm font-medium">{r.referredUserId?.name || 'Anonymous'}</p>
                  <p className="text-xs text-white/30">{new Date(r.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${
                  r.status === 'converted' ? 'bg-[#00FF88]/10 text-[#00FF88]' : 'bg-white/10 text-white/40'
                }`}>
                  {r.status === 'converted' ? '✓ +30 days' : 'Pending'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Downloads Tab ─────────────────────────────────────────────────
function DownloadsTab() {
  const { data: serversData } = useQuery({
    queryKey: ['servers', 'config'],
    queryFn: () => userApi.getProfile().then(() =>
      fetch('/api/servers?limit=5').then(r => r.json())
    ),
  });

  return (
    <div className="space-y-5">
      <div className="glass-card p-6">
        <h3 className="font-bold mb-4 flex items-center gap-2"><Download size={16} className="text-[#6C63FF]" /> WireGuard Config Files</h3>
        <p className="text-sm text-white/50 mb-5">Download WireGuard configuration files for manual setup on any compatible device or router.</p>
        {serversData?.servers?.slice(0, 5).map(server => (
          <div key={server._id} className="flex items-center justify-between py-2.5 border-b border-white/[0.05] last:border-0">
            <div className="flex items-center gap-3">
              <span className="text-xl">{server.flag}</span>
              <div>
                <p className="text-sm font-medium">{server.city}, {server.country}</p>
                <p className="text-xs text-white/30">{server.ping}ms · WireGuard</p>
              </div>
            </div>
            <a href={`/api/vpn/config/${server._id}`} className="btn-ghost text-xs border border-white/[0.08] px-3 py-1.5">
              <Download size={12} /> .conf
            </a>
          </div>
        ))}
        <a href="/servers" className="text-sm text-[#6C63FF] hover:underline mt-3 block">View all 95+ servers →</a>
      </div>

      <div className="glass-card p-6">
        <h3 className="font-bold mb-4">Native Apps</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          {[
            { icon: '🪟', name: 'Windows', sub: '.exe installer' },
            { icon: '🍎', name: 'macOS', sub: '.dmg package' },
            { icon: '🐧', name: 'Linux', sub: '.deb / .rpm' },
            { icon: '📱', name: 'iOS', sub: 'App Store' },
            { icon: '🤖', name: 'Android', sub: 'Google Play' },
            { icon: '🔌', name: 'Extension', sub: 'Chrome / Firefox' },
          ].map(app => (
            <button key={app.name} className="flex items-center gap-3 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06] transition-colors text-left">
              <span className="text-2xl">{app.icon}</span>
              <div>
                <p className="text-sm font-medium">{app.name}</p>
                <p className="text-xs text-white/35">{app.sub}</p>
              </div>
              <Download size={14} className="ml-auto text-white/30" />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ── Notifications Tab ─────────────────────────────────────────────
function NotificationsTab({ user, qc }) {
  const [notifPrefs, setNotifPrefs] = useState(user?.preferences?.notifications || {
    email: true, security: true, usage: true, newsletter: false
  });

  const mutation = useMutation({
    mutationFn: () => userApi.updatePreferences({ notifications: notifPrefs }),
    onSuccess: () => toast.success('Notification preferences saved!'),
  });

  const toggle = (key) => setNotifPrefs(p => ({ ...p, [key]: !p[key] }));

  return (
    <div className="glass-card p-6 max-w-lg">
      <h3 className="font-bold mb-5 flex items-center gap-2"><Bell size={16} className="text-[#6C63FF]" /> Email Notifications</h3>
      {[
        { key: 'email', label: 'Email Alerts', desc: 'Important account notifications sent to your email' },
        { key: 'security', label: 'Security Alerts', desc: 'Suspicious login attempts and account changes' },
        { key: 'usage', label: 'Data Usage Warnings', desc: 'Alert when approaching data limits (free plan)' },
        { key: 'newsletter', label: 'Newsletter', desc: 'Privacy tips, product updates, and news' },
      ].map(({ key, label, desc }) => (
        <div key={key} className="flex items-center justify-between py-4 border-b border-white/[0.05] last:border-0">
          <div>
            <p className="text-sm font-medium">{label}</p>
            <p className="text-xs text-white/35 mt-0.5">{desc}</p>
          </div>
          <button
            onClick={() => toggle(key)}
            className={`relative w-11 h-6 rounded-full transition-all duration-200 ${notifPrefs[key] ? 'bg-[#6C63FF]' : 'bg-white/10'}`}
          >
            <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all duration-200 ${notifPrefs[key] ? 'left-5' : 'left-0.5'}`} />
          </button>
        </div>
      ))}
      <button onClick={() => mutation.mutate()} disabled={mutation.isPending} className="btn-primary text-sm px-5 py-2.5 mt-5">
        {mutation.isPending ? 'Saving...' : 'Save Preferences'}
      </button>
    </div>
  );
}

// ── Devices Tab ───────────────────────────────────────────────────
function DevicesTab() {
  const qc = useQueryClient();
  const { data } = useQuery({
    queryKey: ['devices'],
    queryFn: () => userApi.getDevices().then(r => r.data),
  });

  const revokeMutation = useMutation({
    mutationFn: (id) => userApi.revokeDevice(id),
    onSuccess: () => { toast.success('Device access revoked'); qc.invalidateQueries(['devices']); },
  });

  const osIcons = { windows: '🪟', macos: '🍎', linux: '🐧', ios: '📱', android: '🤖', unknown: '💻' };

  return (
    <div className="glass-card p-6">
      <h3 className="font-bold mb-5 flex items-center gap-2"><Smartphone size={16} className="text-[#6C63FF]" /> Connected Devices</h3>
      {!data?.devices?.length ? (
        <div className="text-center py-10">
          <Smartphone size={40} className="text-white/10 mx-auto mb-3" />
          <p className="text-white/30 text-sm">No devices registered yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.devices.map(device => (
            <div key={device.deviceId} className="flex items-center gap-4 p-4 rounded-xl bg-white/[0.03] border border-white/[0.06]">
              <span className="text-2xl">{osIcons[device.os?.toLowerCase()] || '💻'}</span>
              <div className="flex-1">
                <p className="text-sm font-medium">{device.name || 'Unknown Device'}</p>
                <p className="text-xs text-white/35">Last seen {new Date(device.lastSeen).toLocaleDateString()}</p>
              </div>
              <button
                onClick={() => revokeMutation.mutate(device.deviceId)}
                className="p-2 rounded-lg hover:bg-[#FF6B6B]/10 text-white/30 hover:text-[#FF6B6B] transition-all"
                title="Revoke access"
              >
                <Trash2 size={15} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ── Subscription Tab ──────────────────────────────────────────────
function SubscriptionTab({ user }) {
  const handleCancel = async () => {
    if (!confirm('Are you sure you want to cancel your subscription? You will be downgraded to the free plan.')) return;
    try {
      const { planApi } = await import('../api');
      await planApi.cancel();
      toast.success('Subscription cancelled. Downgraded to free plan.');
    } catch {
      toast.error('Failed to cancel subscription');
    }
  };

  return (
    <div className="space-y-5">
      <div className={`glass-card p-6 border ${
        user?.plan === 'pro' ? 'border-[#6C63FF]/30' :
        user?.plan === 'business' ? 'border-[#00D4FF]/30' :
        'border-white/[0.08]'
      }`}>
        <h3 className="font-bold mb-4 flex items-center gap-2"><CreditCard size={16} className="text-[#6C63FF]" /> Current Plan</h3>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-2xl font-extrabold capitalize">{user?.plan}</p>
            {user?.planExpiry && (
              <p className="text-sm text-white/40 mt-1">
                Expires {new Date(user.planExpiry).toLocaleDateString()}
              </p>
            )}
            {user?.plan === 'free' && <p className="text-sm text-white/40 mt-1">Free forever — no expiry</p>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-extrabold gradient-text">
              {user?.plan === 'free' ? '$0' : user?.plan === 'pro' ? '$4.99' : '$9.99'}
            </p>
            <p className="text-xs text-white/30">/month</p>
          </div>
        </div>
        <div className="flex gap-3">
          <a href="/pricing" className="btn-primary text-sm px-5 py-2.5">
            {user?.plan === 'free' ? 'Upgrade Plan' : 'Change Plan'}
          </a>
          {user?.plan !== 'free' && (
            <button onClick={handleCancel} className="btn-ghost text-sm text-[#FF6B6B] px-4">
              Cancel Plan
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Main Settings Component ───────────────────────────────────────
export default function Settings() {
  const [activeTab, setActiveTab] = useState('profile');
  const { user } = useAuthStore();
  const qc = useQueryClient();

  const { data: profileData } = useQuery({
    queryKey: ['profile'],
    queryFn: () => userApi.getProfile().then(r => r.data),
  });

  const currentUser = profileData?.user || user;

  const renderTab = () => {
    switch (activeTab) {
      case 'profile': return <ProfileTab user={currentUser} qc={qc} />;
      case 'subscription': return <SubscriptionTab user={currentUser} />;
      case 'devices': return <DevicesTab />;
      case 'privacy': return <PrivacyTab user={currentUser} qc={qc} />;
      case 'downloads': return <DownloadsTab />;
      case 'referrals': return <ReferralsTab user={currentUser} />;
      case 'notifications': return <NotificationsTab user={currentUser} qc={qc} />;
      case '2fa': return <TwoFATab user={currentUser} qc={qc} />;
      default: return null;
    }
  };

  return (
    <div className="flex h-screen bg-[#080B14] overflow-hidden">
      <DashboardSidebar />
      <div className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-[#080B14]/90 backdrop-blur-xl border-b border-white/[0.06] px-6 h-16 flex items-center">
          <h1 className="font-bold">Account Settings</h1>
        </div>

        <div className="p-6">
          <div className="flex gap-6 max-w-5xl">
            {/* Sidebar tabs */}
            <div className="w-48 shrink-0 hidden sm:block">
              <nav className="space-y-0.5 sticky top-24">
                {TABS.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium transition-all text-left ${
                      activeTab === tab.id
                        ? 'bg-[#6C63FF]/15 text-[#6C63FF] border border-[#6C63FF]/20'
                        : 'text-white/50 hover:text-white hover:bg-white/[0.05]'
                    }`}
                  >
                    <span className={activeTab === tab.id ? 'text-[#6C63FF]' : 'text-white/30'}>{tab.icon}</span>
                    {tab.label}
                  </button>
                ))}
              </nav>
            </div>

            {/* Mobile tabs */}
            <div className="sm:hidden flex gap-1.5 overflow-x-auto pb-2 mb-4 w-full">
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs whitespace-nowrap flex items-center gap-1.5 shrink-0 ${
                    activeTab === tab.id ? 'bg-[#6C63FF]/15 text-[#6C63FF]' : 'bg-white/[0.04] text-white/50'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  {renderTab()}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
