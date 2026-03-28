"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { getInviteDetails, completeRegistration } from "@/lib/api/auth";
import { FaUser, FaLock, FaEnvelope, FaPhone, FaDumbbell } from "react-icons/fa";

// Wrap in Suspense for useSearchParams
function JoinContent() {
    const router = useRouter();
    const searchParams = useSearchParams();

    // URL Params
    const userCode = searchParams.get("u");
    const adminCode = searchParams.get("ref");
    const roleParam = searchParams.get("role") || "USER";

    // State
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [inviteData, setInviteData] = useState(null);
    const [error, setError] = useState("");

    // Form State
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [otp, setOtp] = useState("");

    // Fetch Invite Details
    useEffect(() => {
        if (!userCode || !adminCode) {
            setError("Invalid Invitation Link. Missing required codes.");
            setLoading(false);
            return;
        }

        const fetchDetails = async () => {
            try {
                const data = await getInviteDetails(userCode, adminCode, roleParam);
                setInviteData(data);
            } catch (err) {
                console.error(err);
                setError("Invitation invalid or expired.");
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
    }, [userCode, adminCode, roleParam]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }
        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }
        if (otp.length !== 6) {
            setError("Please enter a valid 6-digit OTP.");
            return;
        }

        setSubmitting(true);
        try {
            await completeRegistration({
                userCode,
                adminCode,
                role: roleParam,
                password,
                otp
            });
            alert("Registration Completed! Reviewing login page...");
            router.push("/auth/login");
        } catch (err) {
            console.error(err);
            setError(err.message || "Registration failed. Please try again.");
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[var(--primary)]"></div>
            </div>
        );
    }

    if (error && !inviteData) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white p-4">
                <div className="bg-gray-900 p-8 rounded-2xl border border-red-500 max-w-md w-full text-center">
                    <h1 className="text-2xl font-bold text-red-500 mb-4">Invitation Error</h1>
                    <p className="text-gray-300 mb-6">{error}</p>
                    <Link href="/auth/login" className="text-[var(--primary)] hover:underline">Go to Login</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <img src="https://images.unsplash.com/photo-1540497077202-7c8a33801524?q=80&w=2670&auto=format&fit=crop"
                    className="w-full h-full object-cover opacity-50" alt="Gym Background" />
            </div>

            <div className="relative z-10 w-full max-w-lg bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl p-8 shadow-2xl">
                <div className="text-center mb-8">
                    <div className="inline-block p-4 rounded-full bg-[var(--primary)]/20 mb-4">
                        <FaDumbbell className="text-4xl text-[var(--primary)]" />
                    </div>
                    <h1 className="text-3xl font-bold text-white mb-2">Complete your Profile</h1>
                    <p className="text-gray-300">Welcome, <span className="text-[var(--primary)] font-bold">{inviteData.name}</span>!</p>
                    <p className="text-sm text-gray-400 mt-1">Please set a password and enter the OTP sent to your email.</p>
                </div>

                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-200 p-3 rounded-lg mb-6 text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">

                    {/* Read Only Fields */}
                    <div className="space-y-4">
                        <div className="relative">
                            <FaUser className="absolute top-3.5 left-4 text-gray-400" />
                            <input
                                type="text" value={inviteData.username} disabled
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-400 cursor-not-allowed"
                            />
                        </div>
                        <div className="relative">
                            <FaEnvelope className="absolute top-3.5 left-4 text-gray-400" />
                            <input
                                type="text" value={inviteData.email} disabled
                                className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-gray-400 cursor-not-allowed"
                            />
                        </div>
                    </div>

                    <div className="h-px bg-white/10 my-4"></div>

                    {/* Password Fields */}
                    <div className="relative">
                        <FaLock className="absolute top-3.5 left-4 text-[var(--primary)]" />
                        <input
                            type="password"
                            placeholder="Create Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="w-full bg-black/50 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition"
                        />
                    </div>

                    <div className="relative">
                        <FaLock className="absolute top-3.5 left-4 text-[var(--primary)]" />
                        <input
                            type="password"
                            placeholder="Confirm Password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            required
                            className="w-full bg-black/50 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition"
                        />
                    </div>

                    {/* OTP Field */}
                    <div className="relative">
                        <FaLock className="absolute top-3.5 left-4 text-[var(--primary)]" />
                        <input
                            type="text"
                            placeholder="Enter 6-digit OTP"
                            value={otp}
                            maxLength={6}
                            onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                            required
                            className="w-full bg-black/50 border border-white/20 rounded-xl py-3 pl-12 pr-4 text-white focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] outline-none transition tracking-widest"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full bg-[var(--primary)] hover:bg-[#b8e600] text-black font-bold py-3.5 rounded-xl transition transform hover:scale-[1.02] shadow-lg shadow-[var(--primary)]/20 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? "Verifying..." : "Activate & Login"}
                    </button>
                </form>

                <div className="text-center mt-6">
                    <Link href="/auth/login" className="text-sm text-gray-400 hover:text-white transition">
                        Back to Login
                    </Link>
                </div>
            </div>
        </div>
    );
}

export default function JoinPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <JoinContent />
        </Suspense>
    );
}
