import React, { useState, useEffect, useRef, FormEvent } from 'react';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  LockKeyhole,
  Mail,
  RefreshCw,
  ShieldCheck,
  XCircle,
} from 'lucide-react';
import { forgotPassword, resetPassword, resendOtp } from '../../../lib/api/auth';

type Step = 'EMAIL' | 'OTP' | 'PASSWORD' | 'SUCCESS';

interface ForgotPasswordFlowProps {
  initialEmail?: string;
  onBackToLogin: (prefilledEmail?: string) => void;
}

export function ForgotPasswordFlow({ initialEmail = '', onBackToLogin }: ForgotPasswordFlowProps) {
  const [step, setStep] = useState<Step>('EMAIL');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [infoMessage, setInfoMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Resend cooldown timer
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  // Focus first OTP box when entering OTP step
  useEffect(() => {
    if (step === 'OTP') {
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    }
  }, [step]);

  // Password validation checks (matching backend pattern: ^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]).{8,16}$)
  const hasLength = newPassword.length >= 8 && newPassword.length <= 16;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasLower = /[a-z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const hasSpecial = /[@$!%*?&#^()_+\-=\[\]{};':"\\|,.<>\/?]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid = hasLength && hasUpper && hasLower && hasNumber && hasSpecial && passwordsMatch;

  // 1. Submit Email (Request OTP)
  const handleSendEmail = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    setInfoMessage(null);

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Please enter your email address.');
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    try {
      await forgotPassword(trimmedEmail);
      setStep('OTP');
      setResendCooldown(60);
      setInfoMessage(`Verification code sent to ${trimmedEmail}`);
    } catch (err: any) {
      setError(err.message || 'Failed to send verification code. Please check your email and try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 2. OTP Input Handler
  const handleOtpChange = (index: number, value: string) => {
    setError(null);
    const cleaned = value.replace(/\D/g, '');

    if (!cleaned) {
      const newOtp = [...otp];
      newOtp[index] = '';
      setOtp(newOtp);
      return;
    }

    // Handle paste of multiple characters
    if (cleaned.length > 1) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = cleaned[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(cleaned.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
      return;
    }

    const newOtp = [...otp];
    newOtp[index] = cleaned[cleaned.length - 1];
    setOtp(newOtp);

    // Auto advance focus
    if (index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newOtp = [...otp];
      for (let i = 0; i < 6; i++) {
        newOtp[i] = pasted[i] || '';
      }
      setOtp(newOtp);
      const nextIndex = Math.min(pasted.length, 5);
      otpInputRefs.current[nextIndex]?.focus();
    }
  };

  // 3. Verify OTP (Move to Password step)
  const handleVerifyOtp = (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const otpCode = otp.join('');

    if (otpCode.length < 6) {
      setError('Please enter the complete 6-digit verification code.');
      return;
    }

    setStep('PASSWORD');
  };

  // 4. Resend OTP
  const handleResendCode = async () => {
    if (resendCooldown > 0 || isSubmitting) return;
    setError(null);
    setInfoMessage(null);
    setIsSubmitting(true);

    try {
      await resendOtp(email.trim(), undefined, 'FORGOT_PASSWORD');
      setResendCooldown(60);
      setInfoMessage('A new verification code has been sent to your email.');
    } catch (err: any) {
      setError(err.message || 'Failed to resend code. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 5. Submit New Password & Reset
  const handleResetPassword = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);

    const otpCode = otp.join('');
    if (otpCode.length < 6) {
      setError('OTP code missing or incomplete. Please go back and re-enter.');
      return;
    }

    if (!isPasswordValid) {
      if (!passwordsMatch) {
        setError('Passwords do not match.');
      } else {
        setError('Please meet all password requirements before continuing.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      await resetPassword(email.trim(), otpCode, newPassword);
      setStep('SUCCESS');
    } catch (err: any) {
      setError(err.message || 'Failed to reset password. The OTP may be invalid or expired.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Step Indicator */}
      {step !== 'SUCCESS' && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => {
              if (step === 'PASSWORD') setStep('OTP');
              else if (step === 'OTP') setStep('EMAIL');
              else onBackToLogin(email);
            }}
            className="group flex items-center gap-1.5 text-xs font-semibold text-zinc-500 transition hover:text-zinc-900"
          >
            <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-0.5" />
            <span>{step === 'EMAIL' ? 'Back to sign in' : 'Back'}</span>
          </button>

          {/* Steps Progress */}
          <div className="flex items-center gap-1.5">
            {(['EMAIL', 'OTP', 'PASSWORD'] as const).map((s, idx) => {
              const activeIdx = ['EMAIL', 'OTP', 'PASSWORD'].indexOf(step);
              const isCurrent = step === s;
              const isPast = activeIdx > idx;
              return (
                <div
                  key={s}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    isCurrent
                      ? 'w-6 bg-blue-600'
                      : isPast
                      ? 'w-3 bg-emerald-500'
                      : 'w-3 bg-zinc-200'
                  }`}
                  title={`Step ${idx + 1}`}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Global Alerts */}
      {error && (
        <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-700 shadow-sm" role="alert">
          <XCircle className="h-4 w-4 shrink-0 text-red-500 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      {infoMessage && (
        <div className="flex items-start gap-2.5 rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs font-medium text-blue-700 shadow-sm" role="status">
          <CheckCircle2 className="h-4 w-4 shrink-0 text-blue-600 mt-0.5" />
          <span>{infoMessage}</span>
        </div>
      )}

      {/* ── STEP 1: EMAIL ADDRESS ── */}
      {step === 'EMAIL' && (
        <form onSubmit={handleSendEmail} className="space-y-4" noValidate>
          <div>
            <h3 className="text-xl font-black tracking-tight text-zinc-900">Reset your password</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Enter the email address associated with your account. We'll send you a 6-digit verification code.
            </p>
          </div>

          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-600">Email Address</span>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@yourgym.com"
                autoFocus
                required
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-3 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
            </div>
          </label>

          <button
            type="submit"
            disabled={isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Sending Code…</span>
              </>
            ) : (
              <>
                <span>Send Verification Code</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>
      )}

      {/* ── STEP 2: VERIFY OTP ── */}
      {step === 'OTP' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5" noValidate>
          <div>
            <h3 className="text-xl font-black tracking-tight text-zinc-900">Check your inbox</h3>
            <p className="mt-1 text-xs text-zinc-500">
              We sent a 6-digit verification code to <strong className="text-zinc-800">{email}</strong>.
            </p>
          </div>

          {/* 6 Segmented OTP Inputs */}
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-wider text-zinc-600">Verification Code</label>
            <div className="flex items-center justify-between gap-1.5 sm:gap-2" onPaste={handleOtpPaste}>
              {otp.map((digit, idx) => (
                <input
                  key={idx}
                  ref={(el) => {
                    otpInputRefs.current[idx] = el;
                  }}
                  type="text"
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(e) => handleOtpChange(idx, e.target.value)}
                  onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                  className="h-12 w-full rounded-xl border border-zinc-300 bg-white text-center text-lg font-black text-zinc-900 shadow-sm outline-none transition focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
                />
              ))}
            </div>
          </div>

          {/* Resend Action & Cooldown */}
          <div className="flex items-center justify-between text-xs">
            <span className="text-zinc-500">Didn't receive the code?</span>
            {resendCooldown > 0 ? (
              <span className="font-semibold text-zinc-400">Resend in {resendCooldown}s</span>
            ) : (
              <button
                type="button"
                onClick={handleResendCode}
                disabled={isSubmitting}
                className="flex items-center gap-1 font-bold text-blue-600 hover:text-blue-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-3 w-3 ${isSubmitting ? 'animate-spin' : ''}`} />
                <span>Resend Code</span>
              </button>
            )}
          </div>

          <button
            type="submit"
            disabled={otp.join('').length < 6 || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>Verify & Continue</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>
      )}

      {/* ── STEP 3: SET NEW PASSWORD ── */}
      {step === 'PASSWORD' && (
        <form onSubmit={handleResetPassword} className="space-y-4" noValidate>
          <div>
            <h3 className="text-xl font-black tracking-tight text-zinc-900">Set new password</h3>
            <p className="mt-1 text-xs text-zinc-500">
              Create a secure password for <strong className="text-zinc-800">{email}</strong>.
            </p>
          </div>

          {/* New Password */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-600">New Password</span>
            <div className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Enter new password"
                autoFocus
                required
                className="w-full rounded-xl border border-zinc-300 bg-white py-2.5 pl-10 pr-10 text-sm text-zinc-900 outline-none transition placeholder:text-zinc-400 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-700"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          {/* Live Password Requirement Checklist */}
          <div className="rounded-xl border border-zinc-200 bg-zinc-50/80 p-3 space-y-1.5 text-[11px]">
            <p className="font-bold text-zinc-600 uppercase tracking-wider text-[10px] mb-1">Password Requirements:</p>
            <RequirementItem met={hasLength} label="8 to 16 characters long" />
            <RequirementItem met={hasUpper} label="At least 1 uppercase letter (A-Z)" />
            <RequirementItem met={hasLower} label="At least 1 lowercase letter (a-z)" />
            <RequirementItem met={hasNumber} label="At least 1 number (0-9)" />
            <RequirementItem met={hasSpecial} label="At least 1 special character (@$!%*?&#...)" />
          </div>

          {/* Confirm Password */}
          <label className="block">
            <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-zinc-600">Confirm New Password</span>
            <div className="relative">
              <KeyRound className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-400" />
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter new password"
                required
                className={`w-full rounded-xl border py-2.5 pl-10 pr-10 text-sm outline-none transition placeholder:text-zinc-400 ${
                  confirmPassword && !passwordsMatch
                    ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-600 focus:ring-4 focus:ring-red-500/10'
                    : confirmPassword && passwordsMatch
                    ? 'border-emerald-400 bg-emerald-50/30 text-emerald-900 focus:border-emerald-600 focus:ring-4 focus:ring-emerald-500/10'
                    : 'border-zinc-300 bg-white text-zinc-900 focus:border-blue-600 focus:ring-4 focus:ring-blue-600/10'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-zinc-400 hover:text-zinc-700"
                aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </label>

          <button
            type="submit"
            disabled={!isPasswordValid || isSubmitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/25 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                <span>Updating Password…</span>
              </>
            ) : (
              <>
                <ShieldCheck className="h-4 w-4" />
                <span>Reset Password</span>
              </>
            )}
          </button>
        </form>
      )}

      {/* ── STEP 4: SUCCESS ── */}
      {step === 'SUCCESS' && (
        <div className="text-center py-4 space-y-4">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600 ring-8 ring-emerald-50">
            <CheckCircle2 className="h-8 w-8" />
          </div>

          <div className="space-y-1.5">
            <h3 className="text-2xl font-black tracking-tight text-zinc-900">Password Reset Complete</h3>
            <p className="text-xs text-zinc-500 max-w-sm mx-auto">
              Your password has been successfully updated. You can now sign in with your new credentials.
            </p>
          </div>

          <button
            type="button"
            onClick={() => onBackToLogin(email)}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 text-sm font-bold text-white shadow-md shadow-blue-600/20 transition hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-600/25"
          >
            <span>Proceed to Sign In</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function RequirementItem({ met, label }: { met: boolean; label: string }) {
  return (
    <div className={`flex items-center gap-2 transition-colors ${met ? 'text-emerald-600 font-semibold' : 'text-zinc-400'}`}>
      {met ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500 shrink-0" /> : <div className="h-1.5 w-1.5 rounded-full bg-zinc-300 ml-1 shrink-0" />}
      <span>{label}</span>
    </div>
  );
}
