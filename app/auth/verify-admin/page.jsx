"use client";

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { verifyAccount } from '@/lib/api/auth';
import Link from 'next/link';

function VerifyAdminContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState('verifying'); // verifying, success, error
    const [message, setMessage] = useState('Verifying your account...');

    useEffect(() => {
        const email = searchParams.get('email');
        const otp = searchParams.get('otp');

        if (!email || !otp) {
            setStatus('error');
            setMessage('Invalid verification link. Missing email or verification code.');
            return;
        }

        const runVerification = async () => {
            try {
                await verifyAccount(email, otp);
                setStatus('success');
                setMessage('Account verified successfully! Redirecting to login...');

                // Redirect after 3 seconds
                setTimeout(() => {
                    router.push('/auth/login');
                }, 3000);
            } catch (err) {
                setStatus('error');
                setMessage(err.message || 'Verification failed. The link may be expired or invalid.');
            }
        };

        runVerification();
    }, [searchParams, router]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a] p-4 font-sans">
            <div className="max-w-md w-full glass-card p-8 text-center bg-[#111] border border-white/10 rounded-2xl shadow-2xl">
                <div className="mb-6">
                    <h1 className="text-3xl font-extrabold text-white mb-2 tracking-tight">
                        GymBross <span className="text-[#b8e600]">Admin</span>
                    </h1>
                    <div className="h-1 w-20 bg-[#b8e600] mx-auto rounded-full"></div>
                </div>

                <div className={`p-6 rounded-xl border ${status === 'verifying' ? 'bg-white/5 border-white/10' :
                        status === 'success' ? 'bg-[#b8e600]/10 border-[#b8e600]/30' :
                            'bg-red-500/10 border-red-500/30'
                    } mb-8 transition-all duration-300`}>

                    {status === 'verifying' && (
                        <div className="flex flex-col items-center">
                            <div className="w-12 h-12 border-4 border-[#b8e600]/20 border-t-[#b8e600] rounded-full animate-spin mb-4"></div>
                            <p className="text-white/80 font-medium">{message}</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-[#b8e600] rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(184,230,0,0.4)]">
                                <svg className="w-10 h-10 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Verification Successful</h2>
                            <p className="text-white/70">{message}</p>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="flex flex-col items-center">
                            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mb-4 shadow-[0_0_20px_rgba(239,68,68,0.4)]">
                                <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">Verification Failed</h2>
                            <p className="text-red-400">{message}</p>
                        </div>
                    )}
                </div>

                <div className="space-y-4">
                    <Link
                        href="/auth/login"
                        className="block w-full py-3 px-4 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-xl border border-white/10 transition-all duration-200"
                    >
                        Go to Login
                    </Link>

                    {status === 'error' && (
                        <p className="text-sm text-white/40">
                            If you're having trouble, please contact support or try registering again.
                        </p>
                    )}
                </div>
            </div>

            <style jsx>{`
                .glass-card {
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                }
            `}</style>
        </div>
    );
}

export default function VerifyAdminPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#0a0a0a]">
                <div className="w-12 h-12 border-4 border-[#b8e600]/20 border-t-[#b8e600] rounded-full animate-spin"></div>
            </div>
        }>
            <VerifyAdminContent />
        </Suspense>
    );
}
