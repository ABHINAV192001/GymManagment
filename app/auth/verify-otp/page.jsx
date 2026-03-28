'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import { verifyOTP, resendOTP } from '@/lib/api';

function VerifyOTPContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const [email] = useState(searchParams.get('email') || '');
    const [otpType] = useState(searchParams.get('type') || 'REGISTER');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [countdown, setCountdown] = useState(30);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess('');

        try {
            await verifyOTP({ email, otpCode: otp, otpType });
            setSuccess('Verification successful! Redirecting to login...');
            setTimeout(() => {
                router.push('/auth/login');
            }, 2000);
        } catch (err) {
            setError(err.message || 'Verification failed. Invalid OTP.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;
        try {
            await resendOTP({ email, otpType });
            setSuccess('OTP resent successfully.');
            setCountdown(30);
        } catch (err) {
            setError(err.message || 'Failed to resend OTP.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-[var(--bg-dark)]">
            <div className="w-full max-w-md bg-[var(--bg-darker)] p-8 rounded-2xl border border-gray-800 shadow-2xl">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">Verify OTP</h1>
                    <p className="text-[var(--text-secondary)]">
                        Enter the code sent to <br /> <span className="text-white font-medium">{email}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit}>
                    <Input
                        id="otp"
                        label="OTP Code"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        required
                        className="text-center text-2xl tracking-widest"
                    />

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-500 p-3 rounded-lg text-sm mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-500/10 border border-green-500/20 text-green-500 p-3 rounded-lg text-sm mb-6">
                            {success}
                        </div>
                    )}

                    <Button type="submit" loading={loading} className="w-full mb-6">
                        Verify Email
                    </Button>

                    <div className="text-center">
                        <button
                            type="button"
                            onClick={handleResend}
                            disabled={countdown > 0}
                            className={`text-sm ${countdown > 0 ? 'text-gray-500 cursor-not-allowed' : 'text-[var(--primary)] hover:underline'}`}
                        >
                            {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default function VerifyOTPPage() {
    return (
        <Suspense fallback={<div className="text-white text-center mt-20">Loading...</div>}>
            <VerifyOTPContent />
        </Suspense>
    );
}
