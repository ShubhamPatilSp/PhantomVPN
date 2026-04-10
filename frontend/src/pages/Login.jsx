import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, Shield, Lock, Zap } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api';
import useAuthStore from '../store/authStore';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password required'),
  twoFactorCode: z.string().optional(),
  rememberMe: z.boolean().optional(),
});

export default function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [requires2FA, setRequires2FA] = useState(false);
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [searchParams] = useSearchParams();

  // Handle Google OAuth callback tokens
  useState(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');
    const userId = searchParams.get('userId');
    if (accessToken && refreshToken && userId) {
      setAuth({ _id: userId }, accessToken, refreshToken);
      toast.success('Signed in with Google!');
      navigate('/dashboard');
    }
  });

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      const res = await authApi.login(data);
      if (res.data.requiresTwoFactor) {
        setRequires2FA(true);
        toast('Enter your 2FA code to continue.', { icon: '🔐' });
        setLoading(false);
        return;
      }
      setAuth(res.data.user, res.data.accessToken, res.data.refreshToken);
      toast.success(`Welcome back, ${res.data.user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#050508] flex">
      {/* Left panel — branding */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden items-center justify-center p-12">
        {/* Grid pattern */}
        <div className="absolute inset-0 grid-bg opacity-40" />
        {/* Accent glow */}
        <div className="absolute top-1/3 left-1/3 w-[350px] h-[350px] bg-[#C8FF00]/[0.04] rounded-full blur-[100px]" />

        <motion.div
          className="relative z-10 max-w-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <div className="w-14 h-14 rounded-2xl bg-[#C8FF00] flex items-center justify-center mb-8">
            <Shield size={24} className="text-black" />
          </div>

          <h2 className="font-display text-3xl font-bold mb-4 leading-tight">
            Welcome back to<br />
            <span className="text-[#C8FF00]">PhantomVPN</span>
          </h2>

          <p className="text-white/35 text-sm leading-relaxed mb-10">
            Sign in to continue protecting your privacy across all your devices.
          </p>

          <div className="space-y-4">
            {[
              { icon: <Lock size={14} />, text: 'AES-256 encryption on every connection' },
              { icon: <Eye size={14} />, text: 'Zero-logs policy, independently audited' },
              { icon: <Zap size={14} />, text: '10 Gbps WireGuard® servers worldwide' },
            ].map((item) => (
              <div key={item.text} className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.06] flex items-center justify-center text-white/40">
                  {item.icon}
                </div>
                <span className="text-white/40 text-sm">{item.text}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel — form */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
        <motion.div
          className="w-full max-w-[380px]"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          {/* Mobile logo */}
          <Link to="/" className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="w-7 h-7 rounded-lg bg-[#C8FF00] flex items-center justify-center">
              <Shield size={14} className="text-black" />
            </div>
            <span className="font-display font-bold text-base">
              Phantom<span className="text-[#C8FF00]">VPN</span>
            </span>
          </Link>

          <h1 className="font-display text-2xl font-bold mb-1.5">Sign in</h1>
          <p className="text-white/30 text-sm mb-8">
            Don't have an account?{' '}
            <Link to="/register" className="text-[#C8FF00] hover:underline font-medium">Create one free</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Email</label>
              <input
                {...register('email')}
                type="email"
                placeholder="you@example.com"
                className="input-field"
                autoComplete="email"
              />
              {errors.email && <p className="text-red-400 text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/20 hover:text-white/50 transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1">{errors.password.message}</p>}
            </div>

            {requires2FA && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
              >
                <label className="label">2FA Code</label>
                <input
                  {...register('twoFactorCode')}
                  type="text"
                  placeholder="6-digit code"
                  className="input-field tracking-[0.3em] text-center text-lg"
                  maxLength={6}
                />
              </motion.div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input {...register('rememberMe')} type="checkbox" className="w-3.5 h-3.5 rounded accent-[#C8FF00]" />
                <span className="text-xs text-white/35">Remember me</span>
              </label>
              <Link to="/forgot-password" className="text-xs text-[#C8FF00]/70 hover:text-[#C8FF00] hover:underline">Forgot password?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full justify-center py-3.5 text-sm"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
              ) : (
                <>Sign in <ArrowRight size={14} /></>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.06]" /></div>
            <div className="relative text-center"><span className="px-3 bg-[#050508] text-white/20 text-[10px] uppercase tracking-widest">or</span></div>
          </div>

          {/* Google OAuth */}
          <button
            type="button"
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
            className="btn-secondary w-full justify-center py-3 text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-4 h-4">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>

          <p className="text-center text-white/15 text-[10px] mt-8">
            By signing in you agree to our{' '}
            <Link to="/terms" className="text-white/25 hover:underline">Terms</Link>{' '}
            and{' '}
            <Link to="/privacy" className="text-white/25 hover:underline">Privacy Policy</Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}
