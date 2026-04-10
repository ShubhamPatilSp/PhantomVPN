import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, ArrowRight, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authApi } from '../api';

// ── Auth Layout Wrapper ───────────────────────────────────────────
function AuthLayout({ children }) {
  return (
    <div className="min-h-screen bg-[#080B14] flex items-center justify-center p-6">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[400px] bg-[#6C63FF]/10 rounded-full blur-[120px]" />
      </div>
      <motion.div
        className="w-full max-w-[400px] relative z-10"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className="flex items-center gap-2 mb-10">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#6C63FF] to-[#00D4FF] flex items-center justify-center text-base">⚡</div>
          <span className="font-extrabold">PhantomVPN</span>
        </Link>
        {children}
      </motion.div>
    </div>
  );
}

// ── Forgot Password Page ──────────────────────────────────────────
export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      {sent ? (
        <div className="glass-card p-8 text-center">
          <div className="text-5xl mb-5">📬</div>
          <h2 className="text-xl font-bold mb-3">Check your email</h2>
          <p className="text-white/50 text-sm mb-8">
            If an account exists for <strong className="text-white">{email}</strong>, you'll receive a password reset link shortly.
          </p>
          <Link to="/login" className="btn-primary w-full justify-center">
            <ArrowLeft size={16} /> Back to Login
          </Link>
        </div>
      ) : (
        <>
          <h1 className="text-2xl font-extrabold mb-2">Forgot password?</h1>
          <p className="text-white/40 text-sm mb-8">Enter your email and we'll send you a reset link.</p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="input-field"
              />
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
              {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Send Reset Link <ArrowRight size={16} /></>}
            </button>
          </form>
          <Link to="/login" className="flex items-center gap-1.5 text-white/40 hover:text-white text-sm mt-6 justify-center transition-colors">
            <ArrowLeft size={14} /> Back to Login
          </Link>
        </>
      )}
    </AuthLayout>
  );
}

// ── Reset Password Page ───────────────────────────────────────────
export function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirm) { toast.error('Passwords do not match'); return; }
    if (password.length < 8) { toast.error('Password must be at least 8 characters'); return; }
    if (!token) { toast.error('Invalid reset link'); return; }
    setLoading(true);
    try {
      await authApi.resetPassword({ token, password });
      toast.success('Password reset successfully!');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset failed. Link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <h1 className="text-2xl font-extrabold mb-2">Set new password</h1>
      <p className="text-white/40 text-sm mb-8">Choose a strong password for your account.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">New Password</label>
          <div className="relative">
            <input
              type={showPw ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-field pr-10"
            />
            <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60">
              {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div>
          <label className="label">Confirm Password</label>
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            placeholder="••••••••"
            className="input-field"
          />
          {confirm && password !== confirm && (
            <p className="text-[#FF6B6B] text-xs mt-1">Passwords do not match</p>
          )}
        </div>
        <button type="submit" disabled={loading} className="btn-primary w-full justify-center py-3.5">
          {loading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <>Reset Password <ArrowRight size={16} /></>}
        </button>
      </form>
    </AuthLayout>
  );
}

// ── Verify Email Page ─────────────────────────────────────────────
export function VerifyEmail() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [status, setStatus] = useState('idle'); // idle | loading | success | error
  const navigate = useNavigate();

  const handleVerify = async () => {
    if (!token) { setStatus('error'); return; }
    setStatus('loading');
    try {
      await authApi.verifyEmail(token);
      setStatus('success');
      setTimeout(() => navigate('/login'), 3000);
    } catch {
      setStatus('error');
    }
  };

  const resendEmail = async () => {
    const email = prompt('Enter your email to resend verification:');
    if (!email) return;
    try {
      await authApi.resendVerification(email);
      toast.success('Verification email sent!');
    } catch {
      toast.error('Failed to resend. Please try again.');
    }
  };

  return (
    <AuthLayout>
      <div className="glass-card p-8 text-center">
        {status === 'idle' && (
          <>
            <div className="text-5xl mb-5">✉️</div>
            <h2 className="text-xl font-bold mb-3">Verify Your Email</h2>
            <p className="text-white/50 text-sm mb-8">Click the button below to verify your email address and activate your account.</p>
            <button onClick={handleVerify} className="btn-primary w-full justify-center mb-4">
              Verify Email Address
            </button>
            <button onClick={resendEmail} className="text-sm text-white/40 hover:text-white transition-colors">
              Didn't receive email? Resend
            </button>
          </>
        )}
        {status === 'loading' && (
          <>
            <div className="w-12 h-12 border-2 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin mx-auto mb-5" />
            <p className="text-white/60">Verifying your email...</p>
          </>
        )}
        {status === 'success' && (
          <>
            <div className="text-5xl mb-5">✅</div>
            <h2 className="text-xl font-bold mb-3 text-[#00FF88]">Email Verified!</h2>
            <p className="text-white/50 text-sm mb-6">Your account is now active. Redirecting to login...</p>
            <Link to="/login" className="btn-primary w-full justify-center">Go to Login</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div className="text-5xl mb-5">❌</div>
            <h2 className="text-xl font-bold mb-3 text-[#FF6B6B]">Verification Failed</h2>
            <p className="text-white/50 text-sm mb-8">The verification link is invalid or has expired. Request a new one.</p>
            <button onClick={resendEmail} className="btn-primary w-full justify-center mb-4">Resend Verification Email</button>
            <Link to="/login" className="btn-ghost w-full justify-center text-sm">Back to Login</Link>
          </>
        )}
      </div>
    </AuthLayout>
  );
}

export default ForgotPassword;
