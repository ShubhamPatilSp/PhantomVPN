import api from './axios';

// ── Auth ──────────────────────────────────────────────────────────
export const authApi = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  logout: (refreshToken) => api.post('/auth/logout', { refreshToken }),
  verifyEmail: (token) => api.get(`/auth/verify-email/${token}`),
  resendVerification: (email) => api.post('/auth/resend-verification', { email }),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (data) => api.post('/auth/reset-password', data),
  enable2FA: () => api.post('/auth/2fa/enable'),
  verify2FA: (code) => api.post('/auth/2fa/verify', { code }),
  disable2FA: (code) => api.post('/auth/2fa/disable', { code }),
};

// ── User ──────────────────────────────────────────────────────────
export const userApi = {
  getProfile: () => api.get('/user/profile'),
  updateProfile: (data) => api.put('/user/profile', data),
  changePassword: (data) => api.put('/user/password', data),
  updateAvatar: (avatarUrl) => api.post('/user/avatar', { avatarUrl }),
  deleteAccount: (password) => api.delete('/user/account', { data: { password } }),
  getDevices: () => api.get('/user/devices'),
  revokeDevice: (id) => api.delete(`/user/devices/${id}`),
  getReferrals: () => api.get('/user/referrals'),
  getNotifications: () => api.get('/user/notifications'),
  markNotificationRead: (id) => api.put(`/user/notifications/${id}/read`),
  markAllRead: () => api.put('/user/notifications/all/read'),
  updatePreferences: (data) => api.put('/user/preferences', data),
};

// ── VPN ───────────────────────────────────────────────────────────
export const vpnApi = {
  connect: (serverId) => api.post('/vpn/connect', { serverId }),
  disconnect: () => api.post('/vpn/disconnect'),
  getStatus: () => api.get('/vpn/status'),
  getConfig: (serverId) => api.get(`/vpn/config/${serverId}`, { responseType: 'blob' }),
  getQRCode: (serverId) => api.get(`/vpn/qrcode/${serverId}`),
  getHistory: (params) => api.get('/vpn/connections/history', { params }),
  getUsage: () => api.get('/vpn/usage'),
};

// ── Servers ───────────────────────────────────────────────────────
export const serverApi = {
  getAll: (params) => api.get('/servers', { params }),
  getById: (id) => api.get(`/servers/${id}`),
};

// ── Tools ─────────────────────────────────────────────────────────
export const toolsApi = {
  getIpInfo: () => api.get('/tools/ip-info'),
  dnsLeak: () => api.get('/tools/dns-leak'),
  webrtcCheck: () => api.get('/tools/webrtc-check'),
  speedTest: () => api.get('/tools/speed-test'),
  ping: (serverId) => api.get(`/tools/ping/${serverId}`),
  blacklistCheck: () => api.get('/tools/blacklist-check'),
};

// ── Blog ──────────────────────────────────────────────────────────
export const blogApi = {
  getPosts: (params) => api.get('/blog/posts', { params }),
  getPost: (slug) => api.get(`/blog/posts/${slug}`),
  getCategories: () => api.get('/blog/categories'),
};

// ── Plans ─────────────────────────────────────────────────────────
export const planApi = {
  getAll: () => api.get('/plans'),
  subscribe: (data) => api.post('/plans/subscribe', data),
  cancel: () => api.post('/plans/cancel'),
};

// ── Admin ─────────────────────────────────────────────────────────
export const adminApi = {
  getStats: () => api.get('/admin/stats'),
  getUsers: (params) => api.get('/admin/users', { params }),
  updateUser: (id, data) => api.put(`/admin/users/${id}`, data),
  deleteUser: (id) => api.delete(`/admin/users/${id}`),
  banUser: (id, reason) => api.post(`/admin/users/${id}/ban`, { reason }),
  getServers: () => api.get('/admin/servers'),
  createServer: (data) => api.post('/admin/servers', data),
  updateServer: (id, data) => api.put(`/admin/servers/${id}`, data),
  deleteServer: (id) => api.delete(`/admin/servers/${id}`),
  getConnections: () => api.get('/admin/connections'),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data) => api.put('/admin/settings', data),
  createBlogPost: (data) => api.post('/admin/blog', data),
  updateBlogPost: (id, data) => api.put(`/admin/blog/${id}`, data),
  deleteBlogPost: (id) => api.delete(`/admin/blog/${id}`),
};
