"use client";

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    FaUsers, FaDumbbell, FaCalendarCheck, FaClipboardList,
    FaBell, FaCheckCircle, FaStar, FaMedal, FaTrash, FaPlus,
    FaArrowRight, FaClock
} from 'react-icons/fa';

// Shared API and Components
import Link from 'next/link';
import { getProfile } from '@/lib/api/user';
import { getUsers } from '@/lib/api/branch';
import { getNotifications } from '@/lib/api/chat';
import { getSessions } from '@/lib/api/sessions';
import { assignDietPlan, assignWorkoutPlan, getAllWorkouts } from '@/lib/api/trainer';
import Modal from '@/app/components/Modal';
import JoyfulBackground from '@/app/components/JoyfulBackground';
import { MagneticWrapper, TiltWrapper, StaggeredText } from '@/app/components/PremiumUI';
import { BRANCH_ADMIN_NAV_LINKS, TRAINER_NAV_LINKS, ROLES } from '@/constants/navigation';

export default function TrainerDashboard() {
    // --- STATE (UNCHANGED) ---
    const [profile, setProfile] = useState(null);
    const [assignedMembers, setAssignedMembers] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [upcomingSession, setUpcomingSession] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [availableWorkouts, setAvailableWorkouts] = useState([]);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);

    // Diet Plan State (UNCHANGED)
    const [dietEntries, setDietEntries] = useState([{ foodName: '', description: '', timingFood: 'Breakfast' }]);

    // Workout Plan State (UNCHANGED)
    const [workoutPlan, setWorkoutPlan] = useState({
        mondayWorkoutId: '', tuesdayWorkoutId: '', wednesdayWorkoutId: '',
        thursdayWorkoutId: '', fridayWorkoutId: '', saturdayWorkoutId: '', sundayWorkoutId: ''
    });

    // --- LOGIC (UNCHANGED) ---
    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);

        const fetchData = async () => {
            try {
                const [prof, allUsers, allSessions] = await Promise.all([
                    getProfile(),
                    getUsers(),
                    getSessions()
                ]);
                setProfile(prof);
                const assigned = allUsers.filter(u => (u.trainerId === prof.id || u.trainerName === prof.name) && u.role !== 'ORG_ADMIN');
                setAssignedMembers(assigned);

                const notifs = await getNotifications(prof.username);
                setRecentAlerts(notifs.filter(n => n.type === 'SESSION').slice(0, 5));

                if (allSessions && allSessions.length > 0) {
                    setUpcomingSession(allSessions[0]);
                }

                const workouts = await getAllWorkouts();
                setAvailableWorkouts(workouts || []);
            } catch (err) {
                console.error("Trainer dashboard fetch failed", err);
            }
        };
        fetchData();

        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleSaveDietPlan = async () => {
        try {
            await assignDietPlan(selectedMember.id, dietEntries);
            setIsDietModalOpen(false);
            alert("Diet plan assigned successfully!");
        } catch (err) {
            console.error("Failed to assign diet plan", err);
            alert("Failed to assign diet plan.");
        }
    };

    const handleSaveWorkoutPlan = async () => {
        try {
            await assignWorkoutPlan(selectedMember.id, workoutPlan);
            setIsWorkoutModalOpen(false);
            alert("Workout plan assigned successfully!");
        } catch (err) {
            console.error("Failed to assign workout plan", err);
            alert("Failed to assign workout plan.");
        }
    };

    if (!mounted) return null;

    const upperRole = profile?.role?.toUpperCase() || '';
    const navLinks = upperRole === 'TRAINER' ? TRAINER_NAV_LINKS : BRANCH_ADMIN_NAV_LINKS;

    return (
        <div className="fixed inset-0 z-[999] selection:bg-[#ccff33]/30 text-white overflow-hidden font-sans bg-[#050505]">

            {/* --- GLOBAL ATMOSPHERIC STACK --- */}
            {/* 1. LAYER - Full Page Gym Visual Background */}
            <div className="fixed inset-0 z-0 transition-opacity duration-1000">
                <img
                    src="/pro_gym_bg.png"
                    alt="Gym Background"
                    className="w-full h-full object-cover opacity-80 backdrop-grayscale"
                />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/80 z-10" />
            </div>

            {/* 2. LAYER - Joyful Background */}
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

            {/* 5. LAYER - Outer Lighting Blobs (Synchronized with Login Popup accents) */}
            <div className="fixed top-0 left-0 w-1/2 h-1/2 bg-[#00f5ff]/15 blur-[140px] rounded-full -translate-x-1/3 -translate-y-1/3 z-[3]" />
            <div className="fixed bottom-0 right-0 w-1/2 h-1/2 bg-[#ccff33]/15 blur-[140px] rounded-full translate-x-1/3 translate-y-1/3 z-[3] animate-pulse" />

            {/* --- MAIN SYSTEM TERMINAL --- */}
            <div className="relative z-[100] w-full h-full p-0">
                <TiltWrapper className="w-full h-full" strength={0.5}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="glass-premium w-full h-full flex flex-col relative overflow-hidden shadow-none border-none !rounded-[20px]"
                    >
                        {/* Interior Scrolling Accent */}
                        <div className="glow-blob glow-teal -top-40 -left-40 opacity-20" />
                        <div className="glow-blob glow-lime -bottom-40 -right-40 opacity-10" />

                        {/* NAVBAR / HEADER (REBUILT TO MATCH PREVIOUS SYSTEM) */}
                        <div className={`sticky top-0 z-[200] w-full flex items-center justify-between px-10 py-5 border-b border-white/10 bg-black/40 backdrop-blur-md transition-all ${isScrolled ? 'py-4 !bg-black/80' : ''}`}>
                            <div className="flex items-center gap-12">
                                <div className="text-xl font-black italic tracking-tighter uppercase text-white flex items-center gap-2">
                                    Gym<span className="text-[#ccff33]">Terminal</span>
                                </div>
                                <div className="hidden lg:flex gap-8 items-center">
                                    {navLinks.map((link, i) => (
                                        <Link
                                            key={i}
                                            href={link.href}
                                            className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] text-white/50 hover:text-[#ccff33] transition-all"
                                        >
                                            <span className="text-xs group-hover:scale-110 transition-transform">{link.icon}</span>
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-4 pr-6 border-r border-white/10">
                                    <MagneticWrapper strength={0.2}>
                                        <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/40 hover:text-[#ccff33] cursor-pointer transition-colors relative">
                                            <FaBell />
                                            <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-[#ccff33] rounded-full shadow-[0_0_8px_#ccff33] border-2 border-black"></span>
                                        </div>
                                    </MagneticWrapper>
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Active Profile</div>
                                        <div className="text-[10px] font-bold text-white/70">{profile?.name || 'TRAINER'}</div>
                                    </div>
                                </div>
                                <Link href="/branch/profile">
                                    <div className="w-10 h-10 rounded-full border-2 border-[#ccff33]/30 overflow-hidden hover:border-[#ccff33] transition-all cursor-pointer p-0.5">
                                        <div className="w-full h-full rounded-full overflow-hidden bg-white/5">
                                            <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${profile?.name || 'Gym'}`} alt="Profile" />
                                        </div>
                                    </div>
                                </Link>
                            </div>
                        </div>

                        {/* INTERNALLY SCROLLING CONTENT */}
                        <div
                            className="flex-1 overflow-y-auto overflow-x-hidden p-10 custom-scrollbar relative"
                            onScroll={(e) => setIsScrolled(e.target.scrollTop > 20)}
                        >

                            {/* Dashboard Grid Header */}
                            <div className="max-w-7xl mx-auto w-full mb-16">
                                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-10">
                                    <div className="space-y-6">
                                        <div className="inline-flex items-center gap-3 px-4 py-2 glass-premium !rounded-full !bg-[#ccff33]/5 border-[#ccff33]/20 text-[#ccff33] text-[9px] font-black uppercase tracking-[3px]">
                                            <FaCheckCircle className="animate-pulse" /> Active Session
                                        </div>
                                        <h1 className="text-3xl md:text-5xl font-black tracking-tighter uppercase drop-shadow-2xl flex items-center gap-4 flex-wrap">
                                            <StaggeredText text="Coach" className="text-white/60" />
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
                                                <StaggeredText text={profile?.name || 'TRAINER'} />
                                            </motion.span>
                                        </h1>
                                        <p className="text-white/60 font-bold uppercase tracking-[4px] text-xs leading-relaxed max-w-xl border-l-2 border-[#00f5ff]/40 pl-8">
                                            Manage your athletic roster, synchronize routines, and monitor performance in high-fidelity.
                                        </p>
                                    </div>

                                    {/* Bento Quick Stats */}
                                    <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
                                        <motion.div whileHover={{ y: -5 }} className="glass-premium !bg-black/40 p-6 !border-t-4 !border-t-[#ccff33] !border-x-0 !border-b-0 min-w-[200px] group !rounded-[20px] transition-all shadow-[0_-8px_15px_-8px_rgba(204,255,51,0.3)]">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-yellow-400/10 text-yellow-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"><FaStar /></div>
                                                <div className="text-[8px] text-white/50 font-black uppercase tracking-widest">Protocol Score</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black text-white/90">{profile?.averageRating?.toFixed(1) || '0.0'}/5.0</div>
                                                <div className="text-[9px] uppercase font-bold text-[#ccff33]/80 tracking-widest italic border-b border-[#ccff33]/30 pb-1 inline-block">Training Rating</div>
                                            </div>
                                        </motion.div>

                                        <motion.div whileHover={{ y: -5 }} className="glass-premium !bg-black/40 p-6 !border-t-4 !border-t-[#00f5ff] !border-x-0 !border-b-0 min-w-[200px] group !rounded-[20px] transition-all shadow-[0_-8px_15px_-8px_rgba(0,245,255,0.3)]">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center text-xl group-hover:scale-110 transition-transform"><FaMedal /></div>
                                                <div className="text-[8px] text-white/50 font-black uppercase tracking-widest">Service Life</div>
                                            </div>
                                            <div>
                                                <div className="text-2xl font-black text-white/90">{profile?.experience || 0} Years</div>
                                                <div className="text-[9px] uppercase font-bold text-[#00f5ff]/80 tracking-widest italic border-b border-[#00f5ff]/30 pb-1 inline-block">Experience</div>
                                            </div>
                                        </motion.div>
                                    </div>
                                </header>
                            </div>

                            {/* Main Grid Content */}
                            <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-10">

                                {/* Left Section: Members */}
                                <div className="lg:col-span-8 space-y-10">
                                    <div className="flex justify-between items-end px-2">
                                        <div className="space-y-1">
                                            <h2 className="text-3xl font-black uppercase tracking-tighter flex items-center gap-4">
                                                <span className="text-white/50">01.</span> My Members
                                            </h2>
                                            <p className="text-[10px] uppercase font-black tracking-[4px] text-white/60 italic">Active Personnel Database</p>
                                        </div>
                                        <div className="flex items-center gap-6">
                                            <div className="text-center">
                                                <div className="text-xl font-black text-[#ccff33]">{assignedMembers.length}</div>
                                                <div className="text-[7px] font-black uppercase tracking-tighter text-white/50">Total Units</div>
                                            </div>
                                            <Link href="/branch/users" className="text-[9px] font-black text-[#00f5ff] uppercase tracking-[3px] hover:text-white transition-colors">View All</Link>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {assignedMembers.length > 0 ? assignedMembers.map((member, idx) => (
                                            <motion.div
                                                key={member.id}
                                                initial={{ opacity: 0, y: 20 }}
                                                whileInView={{ opacity: 1, y: 0 }}
                                                transition={{ delay: idx * 0.05 }}
                                                viewport={{ once: true }}
                                                className="glass-premium !bg-black/40 p-8 !border-t-4 !border-t-[#ccff33] !border-x-0 !border-b-0 hover:shadow-[0_-5px_15px_-5px_#ccff33] transition-all group !rounded-[25px]"
                                            >
                                                <div className="flex items-center gap-6 mb-8">
                                                    <div className="w-16 h-16 rounded-2xl overflow-hidden bg-white/5 border border-white/10 group-hover:border-[#ccff33]/40 transition-all shadow-xl p-1">
                                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} alt={member.name} className="w-full h-full rounded-xl object-cover" />
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-1">
                                                            <h4 className="text-xl font-black uppercase tracking-tight truncate">{member.name}</h4>
                                                            {member.role === 'PREMIUM_USER' && (
                                                                <div className="w-5 h-5 bg-yellow-400/20 text-yellow-400 rounded-full flex items-center justify-center text-[8px] animate-pulse"><FaStar /></div>
                                                            )}
                                                        </div>
                                                        <p className="text-[9px] text-white/60 font-black uppercase tracking-[3px] italic">{member.plan || 'Standard Member'}</p>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => { setSelectedMember(member); setIsDietModalOpen(true); }}
                                                        className="glass-premium !bg-white/5 !border-white/10 hover:!bg-white/10 py-3 text-[10px] font-black uppercase tracking-[2px] transition-all flex items-center justify-center gap-2 !rounded-xl text-white group/btn"
                                                    >
                                                        <FaClipboardList className="group-hover/btn:text-[#00f5ff] transition-colors" /> Diet Plan
                                                    </button>
                                                    <button
                                                        onClick={() => { setSelectedMember(member); setIsWorkoutModalOpen(true); }}
                                                        className="glass-premium !bg-[#ccff33]/5 !border-[#ccff33]/20 hover:!bg-[#ccff33]/20 py-3 text-[10px] font-black uppercase tracking-[2px] transition-all flex items-center justify-center gap-2 !rounded-xl text-[#ccff33] group/btn"
                                                    >
                                                        <FaDumbbell className="text-[#ccff33]" /> Workout
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )) : (
                                            <div className="col-span-2 p-40 text-center glass-premium !bg-black/40 !border-t-4 !border-t-[#ccff33]/30 !border-solid !border-x-0 !border-b-0 !rounded-[30px] shadow-[0_-10px_30px_-10px_rgba(204,255,51,0.2)]">
                                                <div className="w-16 h-16 mx-auto bg-white/5 rounded-full flex items-center justify-center mb-6 text-white/20"><FaUsers size={30} /></div>
                                                <h3 className="text-sm font-black uppercase text-white/50 tracking-[4px]">No members assigned to you yet.</h3>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Right Section: Alerts & Upcoming */}
                                <div className="lg:col-span-4 space-y-10">
                                    {/* Session Alerts */}
                                    <div className="space-y-6 px-2">
                                        <div className="flex justify-between items-end">
                                            <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                                                <span className="text-white/50">02.</span> Alerts
                                            </h2>
                                            <FaBell className="text-[#ccff33] animate-bounce text-sm" />
                                        </div>

                                        <div className="space-y-4">
                                            {recentAlerts.length > 0 ? recentAlerts.map((alert, idx) => (
                                                <motion.div
                                                    key={alert.id}
                                                    initial={{ opacity: 0, x: 20 }}
                                                    whileInView={{ opacity: 1, x: 0 }}
                                                    transition={{ delay: idx * 0.1 }}
                                                    className="glass-premium !bg-black/40 !border-t-4 !border-t-[#00f5ff]/40 !border-x-0 !border-b-0 p-5 !rounded-2xl hover:!bg-black/60 hover:!border-t-[#00f5ff] transition-all group cursor-pointer shadow-[0_-5px_15px_-5px_rgba(0,245,255,0.2)]"
                                                >
                                                    <div className="flex gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-[#00f5ff]/10 text-[#00f5ff] flex items-center justify-center shrink-0 border border-[#00f5ff]/20">
                                                            <FaCalendarCheck />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <p className="text-[11px] font-bold text-white/80 group-hover:text-[#00f5ff] transition-colors leading-relaxed truncate">{alert.content}</p>
                                                            <div className="flex items-center gap-2 mt-2 opacity-30 group-hover:opacity-60 transition-opacity">
                                                                <FaClock size={8} />
                                                                <span className="text-[8px] font-black uppercase tracking-widest">{new Date(alert.createdAt).toLocaleTimeString()}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            )) : (
                                                <div className="p-10 text-center glass-premium !bg-black/40 !border-t-4 !border-t-[#00f5ff]/30 !border-x-0 !border-b-0 !rounded-2xl shadow-[0_-5px_15px_-5px_rgba(0,245,255,0.2)]">
                                                    <p className="text-[9px] font-black uppercase tracking-[3px] text-white/30 italic">No new session alerts</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Upcoming Class */}
                                    <div className="px-2">
                                        <h2 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3 mb-6">
                                            <span className="text-white/50">03.</span> Schedule
                                        </h2>
                                        <motion.div
                                            whileHover={{ scale: 1.02 }}
                                            className="glass-premium !bg-black/40 !border-t-4 !border-t-[#00f5ff] !border-x-0 !border-b-0 hover:shadow-[0_-5px_15px_-5px_#00f5ff] transition-all p-8 !rounded-[30px] relative overflow-hidden group"
                                        >
                                            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 blur-[50px] rounded-full translate-x-1/2 -translate-y-1/2"></div>

                                            <h3 className="font-black text-2xl uppercase tracking-tighter mb-8 flex items-center gap-3 text-white">
                                                <FaCalendarCheck className="text-indigo-400" /> Upcoming Class
                                            </h3>

                                            <div className="space-y-8">
                                                <div className="flex justify-between items-center">
                                                    <div className="space-y-1">
                                                        <span className="text-[10px] text-white/60 font-black uppercase tracking-widest block">Session Type</span>
                                                        <span className="text-sm font-black text-indigo-300 uppercase italic tracking-wider">{upcomingSession?.type || 'No Session Scheduled'}</span>
                                                    </div>
                                                    <div className="text-right space-y-1">
                                                        <span className="text-[10px] text-white/60 font-black uppercase tracking-widest block">Target Time</span>
                                                        <span className="text-sm font-black text-white italic">{upcomingSession?.time || '---'}</span>
                                                    </div>
                                                </div>

                                                <div className="flex items-center justify-between py-4 border-y border-white/5">
                                                    <span className="text-[9px] font-black uppercase tracking-[4px] text-white/50">Attendees</span>                                                    <div className="flex items-center -space-x-3">
                                                        {[1, 2, 3, 4].map(i => (
                                                            <div key={i} className="w-8 h-8 rounded-full border-2 border-black/40 overflow-hidden ring-1 ring-white/10 shadow-2xl transition hover:-translate-y-1 cursor-pointer">
                                                                <img src={`https://i.pravatar.cc/100?u=${i + 10}`} alt="Attendee" />
                                                            </div>
                                                        ))}
                                                        <div className="w-8 h-8 rounded-full bg-white/5 backdrop-blur-md border border-white/10 flex items-center justify-center text-[10px] font-black text-[#ccff33] ring-1 ring-white/5 shadow-2xl">
                                                            +{upcomingSession?.inCount || 0}
                                                        </div>
                                                    </div>
                                                </div>

                                                <MagneticWrapper strength={0.3}>
                                                    <button
                                                        disabled={!upcomingSession}
                                                        className={`w-full relative overflow-hidden group/btn py-4 rounded-2xl transition-all duration-500 font-black uppercase tracking-[3px] text-[11px] 
                                                        ${upcomingSession ? 'bg-indigo-500/20 border border-indigo-400/50 text-white hover:bg-indigo-500/40 shadow-[0_0_30px_rgba(99,102,241,0.2)]' : 'bg-white/5 border border-white/10 text-white/20 cursor-not-allowed'}`}
                                                    >
                                                        {upcomingSession ? (
                                                            <>
                                                                <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-transparent via-indigo-400 to-transparent"></div>
                                                                <span className="relative z-10">Start Session</span>
                                                            </>
                                                        ) : 'No Active Session'}
                                                    </button>
                                                </MagneticWrapper>
                                            </div>
                                        </motion.div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* HIGH LEVEL BRANDING FOOTER */}
                        <div className="p-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex justify-between items-center">
                            <div className="flex items-center gap-3 opacity-30">
                                <div className="w-8 h-[1px] bg-[#ccff33]"></div>
                                <div className="text-[8px] font-black uppercase tracking-[4px] text-[#ccff33] italic">System Active v2.0</div>
                            </div>
                            <div className="text-[7px] font-black uppercase tracking-[10px] text-white/10">GYM PROTOCOL © 2026</div>
                        </div>
                    </motion.div>
                </TiltWrapper>
            </div>

            {/* --- MODALS (RESTYLED CONTENT) --- */}
            {/* Diet Plan Modal */}
            <Modal isOpen={isDietModalOpen} onClose={() => setIsDietModalOpen(false)} title={`Assign Diet Plan to ${selectedMember?.name}`}>
                <div className="space-y-6 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {dietEntries.map((entry, index) => (
                        <div key={index} className="p-6 bg-white/[0.03] rounded-2xl !border-t-4 !border-t-[#00f5ff]/40 !border-x-0 !border-b-0 space-y-5 relative group/item">
                            {dietEntries.length > 1 && (
                                <button
                                    onClick={() => setDietEntries(prev => prev.filter((_, i) => i !== index))}
                                    className="absolute top-4 right-4 text-white/20 hover:text-red-500 transition-colors">
                                    <FaTrash size={12} />
                                </button>
                            )}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Food Item Identifier</label>
                                    <input
                                        type="text"
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#00f5ff]/50 transition-all text-white"
                                        placeholder="e.g. Oatmeal"
                                        value={entry.foodName}
                                        onChange={(e) => {
                                            const newEntries = [...dietEntries];
                                            newEntries[index].foodName = e.target.value;
                                            setDietEntries(newEntries);
                                        }}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Timing Window</label>
                                    <select
                                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#00f5ff]/50 transition-all text-white appearance-none"
                                        value={entry.timingFood}
                                        onChange={(e) => {
                                            const newEntries = [...dietEntries];
                                            newEntries[index].timingFood = e.target.value;
                                            setDietEntries(newEntries);
                                        }}
                                    >
                                        <option className="bg-slate-900">Breakfast</option>
                                        <option className="bg-slate-900">Snack 1</option>
                                        <option className="bg-slate-900">Lunch</option>
                                        <option className="bg-slate-900">Snack 2</option>
                                        <option className="bg-slate-900">Dinner</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Portion Blueprint</label>
                                <input
                                    type="text"
                                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#00f5ff]/50 transition-all text-white"
                                    placeholder="e.g. 1 bowl with 10g almonds"
                                    value={entry.description}
                                    onChange={(e) => {
                                        const newEntries = [...dietEntries];
                                        newEntries[index].description = e.target.value;
                                        setDietEntries(newEntries);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setDietEntries([...dietEntries, { foodName: '', description: '', timingFood: 'Snack 1' }])}
                        className="w-full py-4 border-2 border-dashed border-white/5 rounded-2xl text-white/20 hover:text-[#ccff33] hover:border-[#ccff33]/30 transition-all flex items-center justify-center gap-3 text-[10px] font-black uppercase tracking-[3px]">
                        <FaPlus size={10} /> Add Next Feed
                    </button>

                    <button
                        onClick={handleSaveDietPlan}
                        className="w-full group relative overflow-hidden py-5 bg-[#ccff33]/10 border border-[#ccff33]/40 rounded-2xl transition-all hover:bg-[#ccff33]/20 mt-4 active:scale-95"
                    >
                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[5px] text-[#ccff33]">Sync Diet Plan</span>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-[#ccff33] shadow-[0_0_20px_#ccff33]"></div>
                    </button>
                </div>
            </Modal>

            {/* Workout Plan Modal */}
            <Modal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} title={`Assign Weekly Workout to ${selectedMember?.name}`}>
                <div className="space-y-4 max-h-[65vh] overflow-y-auto pr-2 custom-scrollbar p-1">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <div key={day} className="flex items-center gap-6 bg-white/[0.03] p-5 rounded-2xl !border-t-4 !border-t-[#ccff33]/40 !border-x-0 !border-b-0 group/day transition-colors hover:bg-white/[0.05] hover:!border-t-[#ccff33]">
                            <span className="w-32 text-[10px] font-black uppercase tracking-[4px] text-white/30 group-hover/day:text-[#00f5ff] transition-colors">{day}</span>
                            <select
                                className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold outline-none focus:border-[#00f5ff]/50 transition-all text-white appearance-none"
                                value={workoutPlan[`${day}WorkoutId`]}
                                onChange={(e) => setWorkoutPlan({ ...workoutPlan, [`${day}WorkoutId`]: e.target.value })}
                            >
                                <option value="" className="bg-slate-900">Rest Cycle</option>
                                {availableWorkouts.map(w => (
                                    <option key={w.id} value={w.id} className="bg-slate-900">{w.title}</option>
                                ))}
                            </select>
                        </div>
                    ))}

                    <button
                        onClick={handleSaveWorkoutPlan}
                        className="w-full group relative overflow-hidden py-5 bg-[#ccff33]/10 border border-[#ccff33]/40 rounded-2xl transition-all hover:bg-[#ccff33]/20 mt-6 active:scale-95"
                    >
                        <span className="relative z-10 text-[11px] font-black uppercase tracking-[5px] text-[#ccff33]">Sync Weekly Routine</span>
                        <div className="absolute inset-x-0 bottom-0 h-1 bg-[#ccff33] shadow-[0_0_20px_#ccff33]"></div>
                    </button>
                </div>
            </Modal>

            {/* Custom Scrollbar Styles */}
            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: rgba(204, 255, 51, 0.3);
                }
                .animate-shimmer-infinite {
                    animation: shimmer 3s linear infinite;
                }
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(40px) saturate(180%);
                    -webkit-backdrop-filter: blur(40px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }
                .glow-blob {
                    position: absolute;
                    width: 600px;
                    height: 600px;
                    filter: blur(120px);
                    border-radius: 100%;
                    z-index: -1;
                    pointer-events: none;
                }
                .glow-teal { background: radial-gradient(circle, #00f5ff20 0%, transparent 70%); }
                .glow-lime { background: radial-gradient(circle, #ccff3315 0%, transparent 70%); }
            `}</style>
        </div>
    );
}
