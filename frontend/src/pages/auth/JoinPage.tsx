import React, { useState } from 'react';
import { useSearchParams, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, Lock, KeyRound, CheckCircle2, AlertCircle, Eye, EyeOff, Mail } from 'lucide-react';
import { completeRegistration, resendOtp } from '../../lib/api/auth';

export function JoinPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const userCode = searchParams.get('u') || '';
  const adminCode = searchParams.get('ref') || 'Unknown';
  const role = searchParams.get('role') || 'USER';
  const email = searchParams.get('email') || '';

  const [otp, setOtp] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [isResending, setIsResending] = useState(false);
  const [resendMsg, setResendMsg] = useState<string | null>(null);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[0-9]/.test(pass)) score++;
    if (/[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };

  const strength = getPasswordStrength(password);
  const strengthLabels = ['Weak', 'Fair', 'Good', 'Strong', 'Excellent'];
  const strengthColors = ['bg-red-500', 'bg-amber-500', 'bg-yellow-500', 'bg-emerald-500', 'bg-blue-500'];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!userCode) {
      setError('Invalid registration link. Missing user identifier.');
      return;
    }

    if (!otp || otp.trim().length < 4) {
      setError('Please enter the 6-digit OTP sent to your email.');
      return;
    }

    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);
    const hasSpecial = /[^A-Za-z0-9]/.test(password);

    if (!password || password.length < 8 || !hasUpper || !hasLower || !hasNumber || !hasSpecial) {
      setError('Password must be at least 8 characters long and contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    setIsSubmitting(true);
    try {
      await completeRegistration({
        userCode,
        adminCode,
        role,
        password,
        otp: otp.trim(),
      });

      setSuccess('Account verified and password set successfully! Redirecting to login...');
      setTimeout(() => {
        navigate('/auth/login');
      }, 2500);
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration. Please check your OTP and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResendOtp = async () => {
    if (!email) return;
    setIsResending(true);
    setResendMsg(null);
    try {
      await resendOtp(email, undefined, 'REGISTER');
      setResendMsg('A new 6-digit OTP has been sent to your email.');
    } catch (err: any) {
      setResendMsg('Failed to resend OTP: ' + err.message);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="min-h-screen bg-zinc-900 flex items-center justify-center p-4 text-zinc-100">
      <div className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-blue-600/30">
            G
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight block">GymOS Pro</span>
            <span className="text-[10px] text-zinc-400 font-semibold tracking-wider uppercase">Account Setup</span>
          </div>
        </div>

        <h1 className="text-2xl font-black tracking-tight text-white mb-2">
          Verify & Set Password
        </h1>
        <p className="text-xs text-zinc-400 mb-6">
          Complete your registration by entering the OTP sent to your email and creating a secure password.
        </p>

        {/* Alerts */}
        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-semibold flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-4 p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold flex items-start gap-2.5">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Email (Read Only) */}
          {email && (
            <div>
              <label className="block font-bold text-zinc-300 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
                <input
                  type="email"
                  readOnly
                  value={email}
                  className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-400 font-mono select-none cursor-not-allowed"
                />
              </div>
            </div>
          )}

          {/* OTP Code */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label className="block font-bold text-zinc-300">Enter 6-Digit OTP *</label>
              {email && (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  disabled={isResending}
                  className="text-[11px] text-blue-400 hover:text-blue-300 font-semibold transition disabled:opacity-50"
                >
                  {isResending ? 'Sending...' : 'Resend OTP'}
                </button>
              )}
            </div>
            <div className="relative">
              <KeyRound className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="e.g. 123456"
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-white font-mono tracking-widest text-sm transition"
              />
            </div>
            {resendMsg && <p className="text-[10px] text-emerald-400 mt-1">{resendMsg}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="block font-bold text-zinc-300 mb-1">New Password *</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter strong password..."
                className="w-full pl-9 pr-9 py-2 bg-zinc-900 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-zinc-500 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>

            {/* Strength Bar */}
            {password && (
              <div className="mt-2 space-y-1">
                <div className="flex gap-1 h-1.5 w-full">
                  {[0, 1, 2, 3].map((lvl) => (
                    <div
                      key={lvl}
                      className={`flex-1 rounded-full transition-all duration-300 ${
                        lvl < strength ? strengthColors[strength] : 'bg-zinc-800'
                      }`}
                    />
                  ))}
                </div>
                <span className="text-[10px] text-zinc-400 block text-right font-medium">
                  Strength: {strengthLabels[strength]}
                </span>
              </div>
            )}
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block font-bold text-zinc-300 mb-1">Confirm Password *</label>
            <div className="relative">
              <ShieldCheck className="w-4 h-4 text-zinc-500 absolute left-3 top-2.5" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter password..."
                className="w-full pl-9 pr-3 py-2 bg-zinc-900 border border-zinc-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 rounded-xl text-white transition"
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold text-sm transition shadow-lg shadow-blue-600/20 disabled:opacity-50 mt-4 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              'Verifying & Saving...'
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" /> Complete Setup & Activate
              </>
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-zinc-500 border-t border-zinc-800/80 pt-4">
          Already have an active password?{' '}
          <Link to="/auth/login" className="text-blue-400 hover:text-blue-300 font-bold">
            Sign In Here
          </Link>
        </div>
      </div>
    </main>
  );
}
