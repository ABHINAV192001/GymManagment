'use client';

import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaDumbbell, FaUsers, FaVideo, FaPlay, FaRunning,
    FaBicycle, FaHeartbeat, FaArrowRight, FaSearch,
    FaBell, FaCheckCircle, FaCalendarAlt, FaQuoteLeft, FaStar
} from 'react-icons/fa';
import { useState, useEffect, useRef } from 'react';
import JoyfulBackground from '@/app/components/JoyfulBackground.jsx';

// Reusable Components synchronized with Login/Register System
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

const TiltWrapper = ({ children, className = "" }) => {
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const handleMouse = (e) => {
        const { clientX, clientY, currentTarget } = e;
        const { left, top, width, height } = currentTarget.getBoundingClientRect();
        const x = ((clientX - (left + width / 2)) / (width / 2)) * 2;
        const y = ((clientY - (top + height / 2)) / (height / 2)) * -2;
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

export default function LandingPage() {
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    if (!mounted) return null;

    const navLinks = [
        { name: 'Home', href: '#' },
        { name: 'Features', href: '#features' },
        { name: 'Pricing', href: '#pricing' },
        { name: 'Contact', href: '#' },
    ];

    const stats = [
        { label: 'Active', value: '8', icon: FaCalendarAlt, color: '#ccff33' },
        { label: 'Done', value: '12', icon: FaCheckCircle, color: '#00f5ff' },
        { label: 'Next', value: '14', icon: FaBell, color: '#ff9d00' },
    ];

    const programs = [
        { title: 'Private Sessions', icon: FaDumbbell, color: '#ccff33', desc: 'One-on-one or group dynamic sessions tailored to your precise metabolic needs.' },
        { title: 'Group Training', icon: FaUsers, color: '#00f5ff', desc: 'High-energy group dynamics designed for community growth and shared results.' },
        { title: 'Hybrid Coaching', icon: FaVideo, color: '#ff9d00', desc: 'Elite remote coaching combined with high-precision virtual tracking.' }
    ];

    const testimonials = [
        { name: 'John Doe', role: 'Elite Member', text: 'I love the community and the workouts are amazing!', rating: 5 },
        { name: 'Sarah J.', role: 'Pro Athlete', text: "I've never felt better! The trainers are top notch.", rating: 5 },
        { name: 'Michael R.', role: 'Transformation', text: "Best gym I've ever been to. Highly recommended.", rating: 5 }
    ];

    return (
        <div className="h-screen flex items-center justify-center selection:bg-[#00f5ff]/30 text-white relative overflow-hidden font-sans bg-[#050505]">

            {/* --- GLOBAL ATMOSPHERIC STACK (SYNCHRONIZED WITH LOGIN) --- */}
            {/* 1. LAYER - Full Page Gym Visual Background */}
            <div className="fixed inset-0 z-0 transition-opacity duration-1000">
                <img
                    src="/pro_gym_bg.png"
                    alt="Gym Background"
                    className="w-full h-full object-cover opacity-80 backdrop-grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/80 z-10" />
            </div>

            {/* 2. LAYER - Joyful Background (Animated Gradients) */}
            <div className="fixed inset-0 z-[1] opacity-30">
                <JoyfulBackground />
            </div>

            {/* 3. LAYER - SVG Noise Overlay (Top Layer Cover) */}
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

            {/* 5. LAYER - Outer Lighting Blobs (Synchronized with Login) */}
            <div className="fixed top-0 left-0 w-1/3 h-1/3 bg-[#ccff33]/20 blur-[120px] rounded-full -translate-x-1/2 -translate-y-1/2 z-[3] animate-pulse" />
            <div className="fixed bottom-0 right-0 w-1/3 h-1/3 bg-[#00f5ff]/20 blur-[120px] rounded-full translate-x-1/2 translate-y-1/2 z-[3]" />

            {/* --- MAIN SYSTEM TERMINAL (FULL CONTENT RESTORATION) --- */}
            <div className="relative z-[100] w-full h-screen p-0 flex items-center justify-center">
                <TiltWrapper className="w-full h-full">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="glass-premium w-full h-full flex flex-col relative overflow-hidden shadow-none border-none !rounded-[20px]"
                    >
                        {/* Interior Scrolling Accent */}
                        <div className="glow-blob glow-teal -top-40 -left-40 opacity-20" />
                        <div className="glow-blob glow-lime -bottom-40 -right-40 opacity-10" />

                        {/* NAVBAR (Inside Terminal Header) */}
                        <div className={`sticky top-0 z-[100] w-full flex items-center justify-between px-10 py-5 border-b border-white/10 bg-black/40 backdrop-blur-md transition-all ${isScrolled ? 'py-4 !bg-black/60' : ''}`}>
                            <div className="flex items-center gap-10">
                                <div className="text-lg font-black italic tracking-tighter uppercase text-white">Gym</div>
                                <div className="hidden md:flex gap-8 text-xs font-bold uppercase tracking-widest text-white/50">
                                    {navLinks.map((link, i) => (
                                        <Link key={i} href={link.href} className="hover:text-white transition-colors py-1.5">{link.name}</Link>
                                    ))}
                                </div>
                            </div>
                            <div className="flex items-center gap-6">
                                <div className="hidden sm:flex items-center gap-3 pl-4 border-l border-white/10">
                                    <Link href="/auth/login" className="text-xs font-black uppercase tracking-widest hover:text-blue-400 transition-colors">Login</Link>
                                </div>
                                <div className="w-8 h-8 rounded-full overflow-hidden border border-white/20">
                                    <img src="https://i.pravatar.cc/150?u=antigravity" alt="User" />
                                </div>
                            </div>
                        </div>

                        {/* INTERNALLY SCROLLING CONTENT (FULL 653 LINES RESTORED) */}
                        <div
                            className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar"
                            onScroll={(e) => setIsScrolled(e.target.scrollTop > 20)}
                        >
                            {/* Hero Section */}
                            <header className="relative min-h-[90vh] flex items-center px-10 md:px-20">
                                <div className="max-w-7xl mx-auto w-full grid lg:grid-cols-12 gap-12 items-center">
                                    <motion.div
                                        initial={{ opacity: 0, x: -50 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        transition={{ duration: 0.8 }}
                                        className="lg:col-span-7 space-y-10 relative z-10"
                                    >
                                        <div className="inline-flex items-center gap-3 px-6 py-3 glass-premium !rounded-full !bg-[#ccff33]/10 border-[#ccff33]/30 text-[#ccff33] text-[11px] font-black uppercase tracking-[4px] shadow-lg shadow-[#ccff33]/5">
                                            <span className="w-2.5 h-2.5 bg-[#ccff33] rounded-full animate-pulse shadow-[0_0_10px_#ccff33]"></span>
                                            Live Fitness Intelligence
                                        </div>

                                        <div className="space-y-6">
                                            <h1 className="text-xl md:text-[3.5rem] font-black leading-[0.9] tracking-tighter uppercase drop-shadow-2xl">
                                                <StaggeredText text="TRANSFORM YOUR BODY" className="block text-white" />
                                                <motion.span
                                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                    style={{
                                                        backgroundSize: "300% auto",
                                                        backgroundImage: "linear-gradient(to right, #ccff33, #00f5ff, #ff9d00, #ccff33)",
                                                        WebkitBackgroundClip: "text",
                                                        WebkitTextFillColor: "transparent"
                                                    }}
                                                    className="drop-shadow-sm inline-block"
                                                >
                                                    <StaggeredText text="TRANSFORM YOUR LIFE" />
                                                </motion.span>
                                            </h1>

                                            <motion.p
                                                initial={{ opacity: 0, x: -20 }}
                                                whileInView={{ opacity: 1, x: 0 }}
                                                className="text-white/40 text-xl max-w-xl leading-relaxed font-semibold tracking-tight border-l-2 border-[#00f5ff]/20 pl-8 py-2"
                                            >
                                                Join the most elite fitness community and unlock your full potential with personal training, group classes, and more.
                                            </motion.p>
                                        </div>

                                        <div className="flex flex-wrap gap-4 pt-4 w-full max-w-sm">
                                            <Link href="/auth/register/organization" className="w-full">
                                                <MagneticWrapper strength={0.2}>
                                                    <motion.div
                                                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                                        transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                                                        style={{
                                                            backgroundSize: "200% auto",
                                                            backgroundImage: "linear-gradient(to right, rgba(204,255,51,0.05), rgba(0,245,255,0.08), rgba(255,157,0,0.05), rgba(204,255,51,0.05))",
                                                        }}
                                                        className="glass-premium !bg-transparent !border-white/10 w-full py-5 font-bold uppercase italic tracking-[2px] text-base text-center hover:!border-[#ccff33]/40 hover:scale-[1.02] active:scale-95 transition-all shadow-2xl relative overflow-hidden group !rounded-[20px]"
                                                    >
                                                        <span className="relative z-10">Join Now</span>
                                                        <div className="absolute inset-x-0 bottom-0 h-[1.5px] bg-gradient-to-r from-transparent via-[#00f5ff]/30 to-transparent"></div>
                                                    </motion.div>
                                                </MagneticWrapper>
                                            </Link>
                                        </div>
                                    </motion.div>

                                    {/* Right: Bento-Style Hero Stats */}
                                    <div className="lg:col-span-5 relative hidden lg:grid grid-cols-2 gap-4 h-fit">
                                        <motion.div
                                            initial={{ scale: 0.8, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            className="glass-premium p-6 col-span-2 border-white/20 shadow-2xl relative overflow-hidden group bg-black/40 !rounded-[20px]"
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                            <div className="flex justify-between items-center mb-6">
                                                <h3 className="text-base font-black tracking-tight uppercase">Intelligence</h3>
                                                <div className="text-[10px] text-white/40 font-bold italic tracking-wider">Active Monitoring</div>
                                            </div>
                                            <div className="flex gap-1 h-2 mb-6 bg-white/5 rounded-full overflow-hidden p-0.5">
                                                <motion.div animate={{ width: "25%" }} className="bg-[#ccff33] rounded-full shadow-[0_0_10px_#ccff33]"></motion.div>
                                                <motion.div animate={{ width: "35%" }} className="bg-[#00f5ff] rounded-full shadow-[0_0_10px_#00f5ff]"></motion.div>
                                                <motion.div animate={{ width: "40%" }} className="bg-[#ff9d00] rounded-full shadow-[0_0_10px_#ff9d00]"></motion.div>
                                            </div>
                                            <div className="grid grid-cols-3 gap-3">
                                                {stats.map((s, idx) => (
                                                    <div key={idx} className="text-center p-3 !rounded-[15px] bg-white/[0.03] border border-white/5 group/stat hover:bg-white/[0.06] transition-all">
                                                        <div className="w-8 h-8 mx-auto rounded-xl flex items-center justify-center mb-2 text-sm transition-transform group-hover/stat:scale-110" style={{ backgroundColor: `${s.color}15`, color: s.color }}>
                                                            <s.icon />
                                                        </div>
                                                        <div className="text-lg font-black">{s.value}</div>
                                                        <div className="text-[8px] uppercase font-bold text-white/20 tracking-widest">{s.label}</div>
                                                    </div>
                                                ))}
                                            </div>
                                        </motion.div>

                                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.2 }} className="glass-premium p-6 border-white/20 aspect-square flex flex-col justify-between group bg-black/40 !rounded-[20px]">
                                            <div className="w-10 h-10 rounded-full bg-[#00f5ff]/10 flex items-center justify-center text-[#00f5ff] text-xl group-hover:scale-110 transition-transform"><FaRunning /></div>
                                            <div>
                                                <div className="text-2xl font-black text-white">94.2k</div>
                                                <div className="text-[9px] uppercase font-bold text-white/30 tracking-widest">Total Steps</div>
                                            </div>
                                        </motion.div>

                                        <motion.div initial={{ x: 20, opacity: 0 }} animate={{ x: 0, opacity: 1 }} transition={{ delay: 0.3 }} className="glass-premium p-6 border-white/20 aspect-square flex flex-col justify-between group bg-black/40 !rounded-[20px]">
                                            <div className="w-10 h-10 rounded-full bg-[#ccff33]/10 flex items-center justify-center text-[#ccff33] text-xl group-hover:scale-110 transition-transform"><FaHeartbeat /></div>
                                            <div>
                                                <div className="text-2xl font-black text-white">72bpm</div>
                                                <div className="text-[9px] uppercase font-bold text-white/30 tracking-widest">Resting Heart</div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </header>

                            {/* Transform Section (Bento Grid) */}
                            <section id="features" className="py-32 px-10 md:px-20 relative">
                                <div className="max-w-7xl mx-auto">
                                    <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
                                        <motion.div whileInView={{ opacity: 1, x: 0 }} initial={{ opacity: 0, x: -30 }} viewport={{ once: true }}>
                                            <h2 className="text-xl md:text-[3rem] font-black uppercase tracking-tighter mb-4 flex flex-wrap gap-x-4">
                                                <StaggeredText text="Transform Your" />
                                                <motion.span
                                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                    style={{
                                                        backgroundSize: "300% auto",
                                                        backgroundImage: "linear-gradient(to right, #ccff33, #00f5ff, #ff9d00, #ccff33)",
                                                        WebkitBackgroundClip: "text",
                                                        WebkitTextFillColor: "transparent"
                                                    }}
                                                    className="drop-shadow-sm inline-block"
                                                >
                                                    <StaggeredText text="BODY AND LIFE" />
                                                </motion.span>
                                            </h2>
                                            <p className="text-white/30 font-bold uppercase tracking-[4px] text-xs">Precision Built Sessions</p>
                                        </motion.div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                                        <motion.div
                                            whileInView={{ opacity: 1, scale: 1 }}
                                            initial={{ opacity: 0, scale: 0.95 }}
                                            viewport={{ once: true }}
                                            className="md:col-span-2 glass-premium !bg-black/40 p-12 border-white/20 relative overflow-hidden group flex flex-col justify-center min-h-[400px] !rounded-[20px]"
                                        >
                                            <div className="relative z-10">
                                                <div className="w-16 h-16 rounded-2xl bg-[#00f5ff]/10 border border-[#00f5ff]/20 flex items-center justify-center text-[#00f5ff] text-3xl mb-8"><FaDumbbell /></div>
                                                <h3 className="text-4xl font-black uppercase mb-6 tracking-tighter text-white">Private<br />Coaching</h3>
                                                <p className="text-white/40 font-semibold mb-10 max-w-sm">One-on-one sessions tailored to your precise metabolic needs with elite guidance.</p>
                                                <div className="flex items-center gap-3 text-[10px] font-black tracking-[3px] uppercase text-white/40 group-hover:text-white transition-all cursor-pointer">
                                                    Start Journey <FaArrowRight />
                                                </div>
                                            </div>
                                            <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-bl from-[#00f5ff]/5 to-transparent -z-0"></div>
                                        </motion.div>

                                        {programs.slice(1).map((item, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                initial={{ opacity: 0, y: 20 }}
                                                viewport={{ once: true }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="glass-premium !bg-black/40 p-10 border-white/10 flex flex-col justify-between group hover:!border-[#00f5ff]/30 transition-all !rounded-[20px]"
                                            >
                                                <div>
                                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl mb-6 shadow-2xl transition-all group-hover:scale-110" style={{ backgroundColor: `${item.color}15`, color: item.color, border: `1px solid ${item.color}30` }}>
                                                        <item.icon />
                                                    </div>
                                                    <h3 className="text-xl font-black uppercase mb-4 tracking-tight text-white">{item.title}</h3>
                                                    <p className="text-white/30 text-xs font-semibold leading-relaxed mb-8">{item.desc}</p>
                                                </div>
                                                <div className="text-[9px] font-black tracking-[2px] uppercase text-white/20 group-hover:text-white cursor-pointer transition-colors">Learn More</div>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Lifestyle & Experience Section */}
                            <section className="py-32 px-10 md:px-20 relative">
                                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                                    <motion.div
                                        whileInView={{ opacity: 1, x: 0 }}
                                        initial={{ opacity: 0, x: -50 }}
                                        viewport={{ once: true }}
                                        className="glass-premium !bg-black/40 p-4 relative aspect-video group overflow-hidden border-white/20 !rounded-[20px]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-tr from-[#00f5ff]/20 to-transparent z-10 group-hover:bg-[#00f5ff]/10 transition-all"></div>
                                        <img
                                            src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1470&auto=format&fit=crop"
                                            className="w-full h-full object-cover rounded-[1.5rem] group-hover:scale-105 transition-transform duration-1000"
                                            alt="Fitness Lifestyle"
                                        />
                                        <div className="absolute inset-0 z-20 flex items-center justify-center">
                                            <div className="w-20 h-20 glass-premium !rounded-full !bg-white/10 flex items-center justify-center text-[#ff9d00] text-3xl hover:scale-110 hover:!bg-[#ccff33] hover:text-[#0b0b0b] transition-all cursor-pointer shadow-2xl">
                                                <FaPlay className="ml-1" />
                                            </div>
                                        </div>
                                    </motion.div>

                                    <div className="space-y-12">
                                        <div className="space-y-4">
                                            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter leading-[0.9] flex flex-wrap gap-x-4 text-white">
                                                <StaggeredText text="Experience" />
                                                <motion.span
                                                    animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                                    transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                    style={{
                                                        backgroundSize: "300% auto",
                                                        backgroundImage: "linear-gradient(to right, #ccff33, #00f5ff, #ff9d00, #ccff33)",
                                                        WebkitBackgroundClip: "text",
                                                        WebkitTextFillColor: "transparent"
                                                    }}
                                                    className="inline-block"
                                                >
                                                    <StaggeredText text="THE VIBE" />
                                                </motion.span>
                                            </h2>
                                            <p className="text-white/40 text-base font-semibold leading-relaxed border-l-2 border-[#ccff33]/30 pl-8">
                                                Join us for a session and see why everyone is obsessed with our community.
                                            </p>
                                        </div>

                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="glass-premium !bg-white/[0.03] !border-white/10 p-8 text-center group hover:!border-[#00f5ff]/30 transition-all !rounded-[20px]">
                                                <div className="text-4xl font-black mb-1 text-[#00f5ff]">500+</div>
                                                <div className="text-[10px] uppercase font-bold text-white/20 tracking-[3px]">Active Members</div>
                                            </div>
                                            <div className="glass-premium !bg-white/[0.03] !border-white/10 p-8 text-center group hover:!border-[#ccff33]/30 transition-all !rounded-[20px]">
                                                <div className="text-4xl font-black mb-1 text-[#ccff33]">24/7</div>
                                                <div className="text-[10px] uppercase font-bold text-white/20 tracking-[3px]">Global Support</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Testimonials Master Section */}
                            <section className="py-24 px-10 md:px-20 relative overflow-hidden">
                                <div className="max-w-7xl mx-auto">
                                    <motion.div
                                        initial={{ opacity: 0, y: 30 }}
                                        whileInView={{ opacity: 1, y: 0 }}
                                        viewport={{ once: true }}
                                        className="glass-premium !bg-black/40 rounded-[3rem] p-10 md:p-16 relative overflow-hidden shadow-2xl border-white/20 !rounded-[30px]"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent pointer-events-none"></div>
                                        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-[#00f5ff]/5 blur-[150px] rounded-full -translate-y-1/2 translate-x-1/2 opacity-30"></div>

                                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-16 gap-6 relative z-10">
                                            <div className="space-y-2">
                                                <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tighter text-white">
                                                    Real &nbsp;
                                                    <motion.span
                                                        animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                        style={{
                                                            backgroundSize: "300% auto",
                                                            backgroundImage: "linear-gradient(to right, #ccff33, #00f5ff, #ff9d00, #ccff33)",
                                                            WebkitBackgroundClip: "text",
                                                            WebkitTextFillColor: "transparent"
                                                        }}
                                                        className="inline-block"
                                                    >
                                                        PEOPLE
                                                    </motion.span>
                                                </h2>
                                                <p className="text-white/20 font-bold uppercase tracking-[4px] text-[10px]">Transformational Stories</p>
                                            </div>

                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 glass-premium !rounded-full !bg-white/5 !border-white/20 flex items-center justify-center text-white/60 hover:!bg-white/10 cursor-pointer !rounded-full">
                                                        <FaArrowRight className="rotate-180 text-[10px]" />
                                                    </div>
                                                    <span className="text-[11px] font-black uppercase tracking-[3px] text-white/40">Latest</span>
                                                    <div className="w-10 h-10 glass-premium !rounded-full !bg-white/5 !border-white/20 flex items-center justify-center text-white/60 hover:!bg-white/10 cursor-pointer !rounded-full">
                                                        <FaArrowRight className="text-[10px]" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
                                            {testimonials.map((t, idx) => (
                                                <motion.div
                                                    key={idx}
                                                    whileHover={{ y: -8 }}
                                                    className="glass-premium !bg-white/[0.05] !border-white/10 p-10 !rounded-[25px] relative group transition-all"
                                                >
                                                    <div className="flex items-center justify-between mb-8">
                                                        <div className="text-[10px] font-mono tracking-widest text-white/40">0{idx + 1}.BLUEPRINT</div>
                                                        <div className="flex gap-1">
                                                            {[...Array(t.rating)].map((_, i) => <FaStar key={i} className="text-[#ccff33] text-[8px]" />)}
                                                        </div>
                                                    </div>
                                                    <p className="text-lg font-bold leading-relaxed mb-10 text-white italic">"{t.text}"</p>
                                                    <div className="flex items-center gap-4 pt-8 border-t border-white/5">
                                                        <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white text-base font-black italic">
                                                            {t.name.charAt(0)}
                                                        </div>
                                                        <div>
                                                            <div className="font-black uppercase tracking-tight text-sm text-white">{t.name}</div>
                                                            <div className="text-[9px] font-black text-white/20 uppercase tracking-[2px]">Member</div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </div>
                                    </motion.div>
                                </div>
                            </section>

                            {/* Pricing Section */}
                            <section id="pricing" className="py-32 px-10 md:px-20 relative">
                                <div className="max-w-7xl mx-auto relative z-10">
                                    <div className="text-center mb-24 space-y-6">
                                        <h2 className="text-4xl md:text-6xl font-black uppercase tracking-tighter leading-none flex flex-wrap justify-center gap-x-6 text-white">
                                            <StaggeredText text="Elite" />
                                            <motion.span
                                                animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                                style={{
                                                    backgroundSize: "300% auto",
                                                    backgroundImage: "linear-gradient(to right, #ccff33, #00f5ff, #ff9d00, #ccff33)",
                                                    WebkitBackgroundClip: "text",
                                                    WebkitTextFillColor: "transparent"
                                                }}
                                                className="inline-block"
                                            >
                                                <StaggeredText text="ACCESS" />
                                            </motion.span>
                                        </h2>
                                        <p className="text-white/20 font-bold uppercase tracking-[10px] text-[10px]">Unlock Your Blueprint</p>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                        {[
                                            { name: 'Beginner', price: '$80', sub: '/ MONTH', bp: 'BP-01', color: '#ccff33', feat: ['Standard Dashboard', 'Community Access', 'Tracking Tools', 'Email Support'] },
                                            { name: 'Gold Elite', price: '$700', sub: '/ YEAR', bp: 'BP-02', color: '#00f5ff', highlight: true, feat: ['Advanced AI Nutrition', 'Live Metabolic Tracking', 'Glass Module Priority', 'Elite Community Pack'] },
                                            { name: 'Modern Pro', price: '$300', sub: '/ MONTH', bp: 'BP-03', color: '#ff9d00', feat: ['Pro Equipment Access', 'Advanced Analytics', '1-on-1 Strategy', 'Workshop Priority'] }
                                        ].map((plan, idx) => (
                                            <motion.div
                                                key={idx}
                                                whileHover={{ y: -10 }}
                                                className={`glass-premium !bg-black/40 !border-white/10 p-12 flex flex-col relative transition-all !rounded-[20px] ${plan.highlight ? 'z-20 border-[#00f5ff]/30' : 'opacity-90'}`}
                                            >
                                                <div className="text-[10px] font-black uppercase tracking-[4px] text-white/20 mb-10 italic">{plan.bp} VERSION</div>
                                                <h3 className="text-3xl font-black uppercase mb-2 tracking-tight text-white">{plan.name}</h3>
                                                <div className="text-5xl font-black mb-14 text-white">
                                                    {plan.price} <span className="text-sm font-bold text-white/20">{plan.sub}</span>
                                                </div>
                                                <ul className="space-y-6 mb-14 flex-1">
                                                    {plan.feat.map((t, i) => (
                                                        <li key={i} className="flex items-center gap-4 text-[13px] font-bold tracking-tight text-white/50">
                                                            <div className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: plan.color }}></div> {t}
                                                        </li>
                                                    ))}
                                                </ul>
                                                <button className="glass-premium !bg-white/5 !border-white/10 w-full py-5 font-bold uppercase tracking-[2px] text-xs text-center hover:!bg-[#ccff33]/10 hover:text-[#ccff33] transition-all !rounded-[20px]">
                                                    Initialize Plan
                                                </button>
                                            </motion.div>
                                        ))}
                                    </div>
                                </div>
                            </section>

                            {/* Global CTA Section */}
                            <section className="py-24 px-10 md:px-20 mb-20">
                                <div className="max-w-7xl mx-auto">
                                    <motion.div
                                        whileHover={{ scale: 0.99 }}
                                        className="glass-premium !bg-black/40 p-12 md:p-32 relative overflow-hidden group border-white/20 !rounded-[40px] text-center"
                                    >
                                        <div className="absolute inset-0 bg-gradient-to-br from-[#00f5ff]/10 via-transparent to-[#ccff33]/5 z-0 opacity-40"></div>
                                        <div className="relative z-10 flex flex-col items-center">
                                            <h2 className="text-[10vw] md:text-[200px] font-black italic uppercase leading-[0.7] tracking-tighter opacity-10 group-hover:opacity-20 transition-all select-none">BEYOND</h2>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <p className="text-white/40 font-bold uppercase tracking-[15px] text-[10px] md:text-xs mb-10">Ready to evolve?</p>
                                                <Link href="/auth/register/organization" className="w-full max-w-sm">
                                                    <MagneticWrapper strength={0.25}>
                                                        <div className="glass-premium !bg-[#ccff33]/10 border border-[#ccff33]/40 w-full py-6 font-bold uppercase tracking-[4px] text-lg text-center text-[#ccff33] hover:!bg-[#ccff33]/20 transition-all !rounded-full shadow-[0_0_40px_rgba(204,255,51,0.2)]">
                                                            Join Now
                                                        </div>
                                                    </MagneticWrapper>
                                                </Link>
                                            </div>
                                        </div>
                                    </motion.div>
                                </div>
                            </section>

                            <footer className="py-12 text-center opacity-20 border-t border-white/5">
                                <div className="text-[8px] font-black uppercase tracking-[20px] text-white">GYM PROTOCOL &copy; 2026</div>
                            </footer>
                        </div>
                    </motion.div>
                </TiltWrapper>
            </div>

            {/* High Level Branding (Floating) */}
            <div className="fixed bottom-10 left-10 pointer-events-none z-[1001] opacity-60 flex items-center gap-3">
                <div className="w-10 h-[1px] bg-[#ccff33]"></div>
                <div className="text-[9px] font-black uppercase tracking-[4px] text-[#ccff33] italic">System Active v2.0</div>
            </div>
        </div>
    );
}
