import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach token
api.interceptors.request.use(
  (config) => {
    const stored = localStorage.getItem('phantom-auth');
    if (stored) {
      try {
        const { state } = JSON.parse(stored);
        if (state?.accessToken) {
          config.headers.Authorization = `Bearer ${state.accessToken}`;
        }
      } catch {}
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle 401 + token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry) {
      original._retry = true;
      try {
        const stored = localStorage.getItem('phantom-auth');
        if (stored) {
          const { state } = JSON.parse(stored);
          if (state?.refreshToken) {
            const { data } = await axios.post(
              `${import.meta.env.VITE_API_URL || '/api'}/auth/refresh-token`,
              { refreshToken: state.refreshToken }
            );
            // Update stored tokens
            const updated = { state: { ...state, accessToken: data.accessToken, refreshToken: data.refreshToken } };
            localStorage.setItem('phantom-auth', JSON.stringify({ state: updated.state }));
            original.headers.Authorization = `Bearer ${data.accessToken}`;
            return api(original);
          }
        }
      } catch {
        localStorage.removeItem('phantom-auth');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
