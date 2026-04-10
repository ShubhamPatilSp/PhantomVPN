import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api';

const schema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  referralCode: z.string().optional(),
  terms: z.boolean().refine(v => v === true, 'You must accept the terms'),
}).refine(d => d.password === d.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

const PASSWORD_CHECKS = [
  { label: '8+ characters', test: (p) => p.length >= 8 },
  { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
  { label: 'Number', test: (p) => /\d/.test(p) },
  { label: 'Special character', test: (p) => /[!@#$%^&*]/.test(p) },
];

function PasswordStrength({ password }) {
  const score = PASSWORD_CHECKS.filter(c => c.test(password)).length;
  const colors = ['', '#FF6B6B', '#FFB347', '#6C63FF', '#00FF88'];
  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];

  return (
    <div className="mt-2">
      <div className="flex gap-1 mb-2">
        {[1, 2, 3, 4].map(i => (
          <motion.div
            key={i}
            className="h-1 flex-1 rounded-full transition-all duration-300"
            style={{ backgroundColor: i <= score ? colors[score] : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      <div className="flex items-center justify-between">
        <div className="flex flex-wrap gap-3">
          {PASSWORD_CHECKS.map(c => (
            <span key={c.label} className={`flex items-center gap-1 text-[11px] ${c.test(password) ? 'text-[#00FF88]' : 'text-white/30'}`}>
              {c.test(password) ? <CheckCircle size={10} /> : <XCircle size={10} />}
              {c.label}
            </span>
          ))}
        </div>
        {password && (
          <span className="text-[11px] font-semibold" style={{ color: colors[score] }}>
            {labels[score]}
          </span>
        )}
      </div>
    </div>
  );
}

export default function Register() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const referral = searchParams.get('ref') || '';

  const { register, handleSubmit, watch, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: { referralCode: referral },
  });

  const password = watch('password', '');

  const onSubmit = async (data) => {
    setLoading(true);
    try {
      await authApi.register(data);
      setSuccess(true);
      toast.success('Account created! Check your email to verify.');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-[#080B14] flex items-center justify-center p-6">
        <motion.div
          className="glass-card max-w-md w-full p-10 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="text-6xl mb-6">📧</div>
          <h2 className="text-2xl font-extrabold mb-3">Check your inbox!</h2>
          <p className="text-white/50 text-sm mb-8">
            We've sent a verification link to your email. Click it to activate your PhantomVPN account.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">Go to Login</Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#080B14] flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-1 relative overflow-hidden bg-gradient-to-br from-[#0d1117] to-[#080B14] items-center justify-center p-12">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[400px] h-[400px] bg-[#00D4FF]/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-1/3 right-1/3 w-[300px] h-[300px] bg-[#6C63FF]/12 rounded-full blur-[80px]" />
        </div>
        <motion.div
          className="relative z-10 text-center max-w-sm"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="text-6xl mb-6">🛡️</div>
          <h2 className="text-3xl font-extrabold mb-4">Join <span className="gradient-text">2.8M+</span> Protected Users</h2>
          <p className="text-white/50 text-sm mb-10">Start protecting your digital life today. Free forever, no credit card required.</p>
          <div className="glass-card p-5 text-left space-y-3">
            {['10GB free data every month', 'Connect from any device', 'No logs, ever', '24/7 customer support'].map(item => (
              <div key={item} className="flex items-center gap-3 text-sm text-white/70">
                <CheckCircle size={15} className="text-[#00FF88] shrink-0" />
                {item}
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center p-6 lg:p-12 overflow-y-auto">
        <motion.div
          className="w-full max-w-[420px] py-8"
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Link to="/" className="flex items-center gap-2 mb-8 lg:hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center">⚡</div>
            <span className="font-extrabold text-lg">PhantomVPN</span>
          </Link>

          <h1 className="text-2xl font-extrabold mb-1">Create free account</h1>
          <p className="text-white/40 text-sm mb-8">
            Already have an account?{' '}
            <Link to="/login" className="text-[#6C63FF] hover:underline font-medium">Sign in</Link>
          </p>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div>
              <label className="label">Full Name</label>
              <input {...register('name')} type="text" placeholder="John Doe" className="input-field" autoComplete="name" />
              {errors.name && <p className="text-[#FF6B6B] text-xs mt-1">{errors.name.message}</p>}
            </div>

            <div>
              <label className="label">Email</label>
              <input {...register('email')} type="email" placeholder="you@example.com" className="input-field" autoComplete="email" />
              {errors.email && <p className="text-[#FF6B6B] text-xs mt-1">{errors.email.message}</p>}
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  {...register('password')}
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {password && <PasswordStrength password={password} />}
              {errors.password && <p className="text-[#FF6B6B] text-xs mt-1">{errors.password.message}</p>}
            </div>

            <div>
              <label className="label">Confirm Password</label>
              <div className="relative">
                <input
                  {...register('confirmPassword')}
                  type={showConfirm ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="input-field pr-10"
                  autoComplete="new-password"
                />
                <button type="button" onClick={() => setShowConfirm(!showConfirm)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
                  {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.confirmPassword && <p className="text-[#FF6B6B] text-xs mt-1">{errors.confirmPassword.message}</p>}
            </div>

            <div>
              <label className="label">Referral Code <span className="text-white/25 font-normal">(optional)</span></label>
              <input {...register('referralCode')} type="text" placeholder="PHANTOM8" className="input-field uppercase tracking-widest" />
            </div>

            <label className="flex items-start gap-3 cursor-pointer group">
              <input {...register('terms')} type="checkbox" className="mt-0.5 w-4 h-4 rounded accent-[#6C63FF]" />
              <span className="text-sm text-white/50 group-hover:text-white/70 transition-colors">
                I agree to the{' '}
                <Link to="/terms" className="text-[#6C63FF] hover:underline">Terms of Service</Link>
                {' '}and{' '}
                <Link to="/privacy" className="text-[#6C63FF] hover:underline">Privacy Policy</Link>
              </span>
            </label>
            {errors.terms && <p className="text-[#FF6B6B] text-xs">{errors.terms.message}</p>}

            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5 text-base">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Create Account <ArrowRight size={16} /></>}
            </button>
          </form>

          <div className="relative my-5">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/[0.08]" /></div>
            <div className="relative text-center"><span className="px-3 bg-[#080B14] text-white/30 text-xs">or</span></div>
          </div>

          <button 
            type="button"
            onClick={() => window.location.href = 'http://localhost:5000/api/auth/google'}
            className="btn-secondary w-full justify-center py-3 text-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" fill="currentColor">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Continue with Google
          </button>
        </motion.div>
      </div>
    </div>
  );
}
