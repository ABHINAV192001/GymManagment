"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaDumbbell, FaRunning, FaHeartbeat, FaBicycle, FaArrowLeft, FaEnvelope, FaLock, FaKey } from "react-icons/fa";
import { apiPost } from "@/lib/api/client";
import "@/app/components/login/login.css";

export default function ForgotPassword() {
    const router = useRouter();
    const [step, setStep] = useState(1); // 1: Email, 2: OTP & New Password
    const [email, setEmail] = useState("");
    const [otp, setOtp] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSendOTP = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!email) {
            setError("Please enter your email address");
            return;
        }

        setLoading(true);
        try {
            await apiPost("/api/auth/forgot-password", { email }, { skipAuth: true });
            setSuccess("OTP has been sent to your email.");
            setStep(2);
        } catch (err) {
            setError(err.message || "Failed to send OTP. Please check your email.");
        } finally {
            setLoading(false);
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (!otp || !newPassword || !confirmPassword) {
            setError("All fields are required");
            return;
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match");
            return;
        }

        if (newPassword.length < 8) {
            setError("Password must be at least 8 characters");
            return;
        }

        setLoading(true);
        try {
            await apiPost("/api/auth/reset-password", {
                email,
                otp,
                newPassword
            }, { skipAuth: true });
            setSuccess("Password reset successful! Redirecting to login...");
            setTimeout(() => {
                router.push("/auth/login");
            }, 3000);
        } catch (err) {
            setError(err.message || "Failed to reset password. Please check your OTP.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            {/* Background Slider - Absolute Positioned */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                <div className="absolute inset-0 bg-black/60 z-10"></div>
                <div className="absolute inset-0 animate-ken-burns">
                    <img
                        src="https://images.unsplash.com/photo-1540497077202-7c8a3999166f?q=80&w=2070&auto=format&fit=crop"
                        className="w-full h-full object-cover"
                        alt="Gym Background"
                    />
                </div>
            </div>

            <div className="login-wrapper relative z-10">
                <style jsx global>{`
                    @keyframes ken-burns {
                        0% { transform: scale(1); }
                        100% { transform: scale(1.1); }
                    }
                    .animate-ken-burns {
                        animation: ken-burns 20s ease-in-out infinite alternate;
                    }
                    @keyframes float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(10deg); }
                    }
                    .floating-icon {
                        position: absolute;
                        color: rgba(217, 250, 112, 0.1); 
                        animation: float 6s ease-in-out infinite;
                        z-index: 5;
                    }
                    .message-box {
                        padding: 12px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        font-size: 14px;
                        text-align: center;
                    }
                    .error-box {
                        background: rgba(255, 77, 77, 0.1);
                        border: 1px solid #ff4d4d;
                        color: #ff4d4d;
                    }
                    .success-box {
                        background: rgba(72, 187, 120, 0.1);
                        border: 1px solid #48bb78;
                        color: #48bb78;
                    }
                    .login-right-header {
                        margin-bottom: 25px;
                        text-align: center;
                    }
                    .login-right-header h2 {
                        color: #d9fa70;
                        font-size: 24px;
                        font-weight: 700;
                        margin-bottom: 8px;
                    }
                    .login-right-header p {
                        color: #a0a0a0;
                        font-size: 14px;
                    }
                `}</style>

                {/* Floating Icons Overlay */}
                <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
                    <FaDumbbell className="floating-icon" style={{ top: '15%', left: '10%', fontSize: '60px', animationDelay: '0s' }} />
                    <FaRunning className="floating-icon" style={{ top: '25%', right: '15%', fontSize: '80px', animationDelay: '2s' }} />
                    <FaHeartbeat className="floating-icon" style={{ bottom: '20%', left: '25%', fontSize: '100px', animationDelay: '4s' }} />
                    <FaBicycle className="floating-icon" style={{ bottom: '30%', right: '12%', fontSize: '70px', animationDelay: '1s' }} />
                </div>

                <div className="login-container">
                    {/* LEFT SECTION */}
                    <div className="login-left">
                        <div className="login-left-title">Reset Your Password</div>
                        <div className="login-left-line"></div>
                        <div className="login-left-text">
                            We'll help you get back into your account.
                            Follow the simple steps to securely reset
                            your password and continue managing
                            your fitness journey.
                        </div>
                        <Link href="/auth/login" className="flex items-center gap-2 text-[#d9fa70] mt-8 hover:underline italic font-medium">
                            <FaArrowLeft /> Back to Login
                        </Link>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="login-right">
                        <div className="login-right-header">
                            <h2>{step === 1 ? "Forgot Password" : "Reset Password"}</h2>
                            <p>{step === 1 ? "Enter your email to receive an OTP" : "Enter the OTP and your new password"}</p>
                        </div>

                        {error && <div className="message-box error-box">{error}</div>}
                        {success && <div className="message-box success-box">{success}</div>}

                        {step === 1 ? (
                            <form onSubmit={handleSendOTP}>
                                <div className="float-box">
                                    <input
                                        type="email"
                                        placeholder=" "
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        required
                                    />
                                    <label className="flex items-center gap-2"><FaEnvelope className="text-xs" /> Email Address</label>
                                </div>
                                <button
                                    type="submit"
                                    className={`login-btn ${loading ? "loading" : ""}`}
                                    disabled={loading}
                                >
                                    {loading ? "Sending..." : "Send OTP"}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handleResetPassword}>
                                <div className="float-box">
                                    <input
                                        type="text"
                                        placeholder=" "
                                        value={otp}
                                        onChange={(e) => setOtp(e.target.value)}
                                        required
                                    />
                                    <label className="flex items-center gap-2"><FaKey className="text-xs" /> Enter OTP</label>
                                </div>
                                <div className="float-box">
                                    <input
                                        type="password"
                                        placeholder=" "
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        required
                                    />
                                    <label className="flex items-center gap-2"><FaLock className="text-xs" /> New Password</label>
                                </div>
                                <div className="float-box">
                                    <input
                                        type="password"
                                        placeholder=" "
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        required
                                    />
                                    <label className="flex items-center gap-2"><FaLock className="text-xs" /> Confirm New Password</label>
                                </div>
                                <button
                                    type="submit"
                                    className={`login-btn ${loading ? "loading" : ""}`}
                                    disabled={loading}
                                >
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                                <button
                                    type="button"
                                    className="w-full text-center text-sm text-[#a0a0a0] mt-4 hover:text-[#d9fa70]"
                                    onClick={() => setStep(1)}
                                >
                                    Didn't receive OTP? Try again
                                </button>
                            </form>
                        )}

                        <div className="create-account mt-6">
                            <Link href="/auth/login">Back to Login</Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
