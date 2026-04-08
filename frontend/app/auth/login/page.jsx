"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { FaDumbbell, FaRunning, FaHeartbeat, FaBicycle, FaEye, FaEyeSlash, FaArrowRight } from "react-icons/fa";
import JoyfulBackground from "@/app/components/JoyfulBackground.jsx";

// Reusable Components synchronized with Home Page
const MagneticWrapper = ({ children, strength = 0.5 }) => {
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const handleMouse = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = (clientX - (left + width / 2)) * strength;
        const y = (clientY - (top + height / 2)) * strength;
        setPosition({ x, y });
    };
    return (
        <motion.div
            onMouseMove={handleMouse}
            onMouseLeave={() => setPosition({ x: 0, y: 0 })}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
        >
            {children}
        </motion.div>
    );
};

const TiltWrapper = ({ children, className = "" }) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const handleMouse = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = ((clientX - (left + width / 2)) / (width / 2)) * 3; // Subtle tilt for large panel
        const y = ((clientY - (top + height / 2)) / (height / 2)) * -3;
        setTilt({ x, y });
    };
    return (
        <motion.div
            onMouseMove={handleMouse}
            onMouseLeave={() => setTilt({ x: 0, y: 0 })}
            animate={{ rotateX: tilt.y, rotateY: tilt.x }}
            transition={{ type: "spring", stiffness: 100, damping: 10 }}
            style={{ perspective: 1000, transformStyle: 'preserve-3d', willChange: 'transform' }}
            className={className}
        >
            {children}
        </motion.div>
    );
};

const StaggeredText = ({ text, className = "" }) => {
    if (!text) return null;
    const letters = text.split("");
    return (
        <div className={className}>
            {letters.map((letter, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 15 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.012, duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
                    className="inline-block"
                >
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </div>
    );
};

export default function Login() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    // Detailed error state
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        if (!identifier.trim()) {
            newErrors.identifier = "Username is required";
            isValid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (!passwordRegex.test(password)) {
            newErrors.password = "Invalid Credentials Format";
            isValid = false;
        }

        setErrors(newErrors);
        return isValid;
    };

    const handleLogin = async () => {
        setGeneralError("");
        if (!validateForm()) return;

        setLoading(true);

        try {
            const { role, isOnboardingCompleted } = await login({ identifier, password });
            const upperRole = role?.toUpperCase() || '';

            if (upperRole === 'USER' || upperRole === 'PREMIUM_USER') {
                if (isOnboardingCompleted) {
                    window.location.href = '/user';
                } else {
                    window.location.href = '/user/onboarding';
                }
            } else if (upperRole === 'TRAINER') {
                window.location.href = '/branch/trainer-dashboard';
            } else if (['ORG_ADMIN', 'OWNER', 'ADMIN', 'SUPER_ADMIN'].includes(upperRole)) {
                window.location.href = '/admin/dashboard';
            } else {
                window.location.href = '/branch/dashboard';
            }
        } catch (err) {
            console.error("Login Error:", err);
            if (err.message && err.message.toLowerCase().includes("credentials")) {
                setGeneralError("Invalid credentials. Please verify your entry.");
            } else if (err.message && err.message.toLowerCase().includes("network")) {
                setGeneralError("Network error. Please check your internet connection.");
            } else {
                setGeneralError(err.message || "An unexpected error occurred. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleIdentifierChange = (e) => {
        setIdentifier(e.target.value);
        if (errors.identifier) setErrors({ ...errors, identifier: "" });
        if (generalError) setGeneralError("");
    };

    const handlePasswordChange = (e) => {
        setPassword(e.target.value);
        if (errors.password) setErrors({ ...errors, password: "" });
        if (generalError) setGeneralError("");
    };

    if (!mounted) return null;

    return (
        <div className="h-screen flex items-center justify-center bg-[#050505] text-white selection:bg-[#ccff33]/30 relative overflow-hidden font-sans">
            {/* 1. LAYER - Full Page Gym Visual Background */}
            <div className="fixed inset-0 z-0 transition-opacity duration-1000">
                <img
                    src="/premium_gym_bg.png"
                    alt="Gym Background"
                    className="w-full h-full object-cover opacity-80 backdrop-grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/80 z-10" />
            </div>

            {/* 2. LAYER - Joyful Background (Animated Gradients) */}
            <div className="fixed inset-0 z-[1] opacity-30">
                <JoyfulBackground />
            </div>

            {/* 3. LAYER - SVG Noise Overlay */}
            <svg className="fixed inset-0 w-full h-full opacity-[0.25] pointer-events-none z-[1000] mix-blend-overlay">
                <filter id="noiseFilter">
                    <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
                </filter>
                <rect width="100%" height="100%" filter="url(#noiseFilter)" />
            </svg>

            {/* 4. LAYER - Global Mouse-Follow Spotlight */}
            <motion.div
                animate={{ x: mousePos.x - 500, y: mousePos.y - 500 }}
                transition={{ type: "spring", stiffness: 40, damping: 25, mass: 0.8 }}
                className="fixed w-[1000px] h-[1000px] bg-gradient-radial from-[#00f5ff]/15 to-transparent blur-[120px] pointer-events-none z-[2]"
            />

            {/* MAIN LOGIN TERMINAL POPUP */}
            <TiltWrapper className="max-w-4xl w-full px-6 z-[100]">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-premium grid lg:grid-cols-12 shadow-[0_0_80px_rgba(0,0,0,0.6)]"
                >
                    {/* Interior Glowing Accents */}
                    <div className="glow-blob glow-teal -top-20 -left-20 opacity-20" />
                    <div className="glow-blob glow-lime -bottom-20 -right-20 opacity-10" />

                    {/* LEFT SECTION - Cinematic Info */}
                    <div className="hidden lg:flex lg:col-span-12 xl:col-span-5 p-10 flex-col justify-center border-r border-white/10 relative overflow-hidden bg-white/[0.02]">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00f5ff]/5 via-transparent to-[#ccff33]/5 opacity-50"></div>

                        <div className="relative z-10">
                            <motion.div
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                                className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 border border-white/20 rounded-full text-[#ccff33] text-[9px] font-black uppercase tracking-[4px] mb-8 shadow-[0_0_15px_rgba(204,255,51,0.1)]"
                            >
                                <span className="w-2 h-2 bg-[#ccff33] rounded-full animate-pulse shadow-[0_0_10px_#ccff33]"></span>
                                Terminal
                            </motion.div>

                            <h2 className="text-3xl xl:text-4xl font-black uppercase tracking-tighter leading-[0.9] mb-6 text-white drop-shadow-2xl">
                                <StaggeredText text="Login to manage your GYM :-" className="line-clamp-3" />
                            </h2>

                            <div className="w-16 h-[2px] bg-gradient-to-r from-[#00f5ff] to-transparent mb-6"></div>

                            <div className="space-y-4">
                                <p className="text-white/70 text-[11px] font-medium leading-relaxed max-w-[240px] border-l-2 border-[#00f5ff]/50 pl-4 shadow-sm">
                                    Verify security credentials to access the Dashboard Terminal.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT SECTION - Stealth Form */}
                    <div className="lg:col-span-12 xl:col-span-7 p-10 relative bg-black/20 backdrop-blur-sm">
                        <div className="relative z-10 space-y-6">
                            {/* Mobile Logo/Title */}
                            <div className="xl:hidden pb-4 text-center">
                                <h1 className="text-2xl font-black uppercase tracking-[5px] text-[#ccff33]">GYMbross</h1>
                                <p className="text-[10px] text-white/30 uppercase tracking-[2px] mt-1">Terminal Login</p>
                            </div>

                            {generalError && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    className="p-4 bg-red-500/20 border border-red-500/50 text-white text-[10px] font-black uppercase tracking-[1.5px] rounded-xl flex items-center gap-3 backdrop-blur-2xl"
                                >
                                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                                    {generalError}
                                </motion.div>
                            )}

                            {/* USERNAME */}
                            <div className="space-y-2 group">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#00f5ff] transition-colors">Identifier</label>
                                </div>
                                <div className={`relative transition-all duration-300 rounded-2xl ${errors.identifier ? "ring-2 ring-red-500/50" : "group-focus-within:ring-2 group-focus-within:ring-[#00f5ff]/50"}`}>
                                    <input
                                        type="text"
                                        value={identifier}
                                        onChange={handleIdentifierChange}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-[12px] font-bold tracking-wide outline-none focus:bg-white/[0.15] transition-all placeholder:text-white/30 shadow-2xl text-white"
                                        placeholder="Username / Email"
                                    />
                                </div>
                                {errors.identifier && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[9px] font-black ml-4 block uppercase tracking-wider">{errors.identifier}</motion.span>
                                )}
                            </div>

                            {/* PASSWORD */}
                            <div className="space-y-2 group">
                                <div className="flex justify-between items-center px-2">
                                    <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#00f5ff] transition-colors">Password Key</label>
                                    <Link href="/auth/forgot-password" title="Forget password?" className="text-[9px] font-black uppercase tracking-[1.5px] text-[#00f5ff] hover:text-white transition-colors italic underline decoration-white/20 hover:decoration-white">Lost?</Link>
                                </div>
                                <div className={`relative transition-all duration-300 rounded-2xl ${errors.password ? "ring-2 ring-red-500/50" : "group-focus-within:ring-2 group-focus-within:ring-[#00f5ff]/50"}`}>
                                    <input
                                        type={showPass ? "text" : "password"}
                                        value={password}
                                        onChange={handlePasswordChange}
                                        onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                                        className="w-full bg-white/10 border border-white/20 rounded-2xl px-6 py-4 text-[12px] font-bold tracking-wide outline-none focus:bg-white/[0.15] transition-all shadow-2xl text-white placeholder:text-white/30"
                                        placeholder="••••••••"
                                    />
                                    <button
                                        type="button"
                                        className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition-colors"
                                        onClick={() => setShowPass(!showPass)}
                                    >
                                        {showPass ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                                    </button>
                                </div>
                                {errors.password && (
                                    <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-red-400 text-[9px] font-black ml-4 block uppercase tracking-wider">{errors.password}</motion.span>
                                )}
                            </div>

                            {/* CTA */}
                            <div className="pt-6">
                                <MagneticWrapper strength={0.3}>
                                    <button
                                        onClick={handleLogin}
                                        disabled={loading}
                                        className="w-full group relative overflow-hidden rounded-2xl bg-white/5 border border-[#ccff33]/30 hover:border-[#ccff33]/70 transition-all duration-700 shadow-xl active:scale-95 hover:scale-[1.02] hover:shadow-[0_0_50px_rgba(204,255,51,0.25)]"
                                    >
                                        {/* 1. LAYER - Infinite Shimmer (Default) */}
                                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ccff33]/15 to-transparent animate-shimmer-infinite"></div>

                                        {/* 2. LAYER - Hover Highlight Fill */}
                                        <div className="absolute inset-0 bg-[#ccff33]/0 group-hover:bg-[#ccff33]/20 transition-colors duration-700"></div>

                                        {/* Core Button Surface */}
                                        <div className="py-4.5 flex items-center justify-center gap-3 transition-all duration-500 backdrop-blur-md relative z-10">
                                            <span className="text-[11px] font-black uppercase tracking-[4px] italic text-[#ccff33] drop-shadow-[0_0_8px_rgba(204,255,51,0.4)]">
                                                {loading ? "DECRYPTING..." : "ACCESS DASHBOARD"}
                                            </span>
                                            {!loading && (
                                                <motion.div
                                                    animate={{ x: [0, 5, 0] }}
                                                    transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                                                    className="text-[#ccff33]"
                                                >
                                                    <FaArrowRight size={10} />
                                                </motion.div>
                                            )}
                                        </div>

                                        {/* 3. LAYER - Glowing Bottom Bar (Default) */}
                                        <div className="absolute bottom-0 left-0 w-full h-[2.5px] bg-gradient-to-r from-transparent via-[#ccff33] to-transparent shadow-[0_0_20px_#ccff33] opacity-80 group-hover:opacity-100 group-hover:h-[3.5px] transition-all duration-500"></div>
                                    </button>
                                </MagneticWrapper>
                            </div>

                            <div className="pt-4 text-center">
                                <Link
                                    href="/auth/register/organization"
                                    className="text-[10px] font-black uppercase tracking-[3px] text-white/50 hover:text-[#ccff33] transition-colors italic group"
                                >
                                    New Registration? <span className="inline-block group-hover:translate-x-1 transition-transform">→</span>
                                </Link>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </TiltWrapper>

            {/* Visual Branding Accents */}
            <div className="fixed top-6 left-8 z-[100] pointer-events-none">
                <div className="flex items-baseline gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ccff33]/30"></span>
                    <h1 className="text-sm font-black uppercase tracking-[1px] text-[#ccff33] opacity-50 italic drop-shadow-[0_0_10px_rgba(204,255,51,0.3)]">GYMbross</h1>
                </div>
            </div>

            {/* Bottom Credit */}
            <div className="fixed bottom-8 w-full text-center z-[100] pointer-events-none">
                <div className="text-[8px] font-black uppercase tracking-[15px] text-white/5">
                    GYM BLUEPRINT &copy; 2026
                </div>
            </div>
        </div>
    );
}
