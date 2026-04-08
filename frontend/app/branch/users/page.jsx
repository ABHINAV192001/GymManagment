
"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import DataTable from "@/app/components/DataTable";
import Modal from "@/app/components/Modal";
import { getUsers, createUser, updateUser, deleteUser, getStaff } from "@/lib/api/branch";
import { getProfile } from "@/lib/api/user";
import { useRouter, useSearchParams } from 'next/navigation';
import { resendInvite } from "@/lib/api/auth";
import { FaUserPlus, FaLink, FaPaperPlane, FaDumbbell, FaUtensils, FaCrown, FaCheckCircle, FaBell, FaClock, FaSearch, FaPlus, FaTrash } from "react-icons/fa";
import { updateWeeklyWorkoutPlan, assignDietPlan } from "@/lib/api/workout";
import JoyfulBackground from '@/app/components/JoyfulBackground';
import { MagneticWrapper, TiltWrapper, StaggeredText } from '@/app/components/PremiumUI';
import { BRANCH_ADMIN_NAV_LINKS, TRAINER_NAV_LINKS } from '@/constants/navigation';



export default function UsersPage() {
    const [users, setUsers] = useState([]);
    const [trainers, setTrainers] = useState([]); // Store trainers list
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentUser, setCurrentUser] = useState(null); // For edit mode
    const [adminProfile, setAdminProfile] = useState(null);
    const searchParams = useSearchParams(); // Added
    const router = useRouter();
    const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
    const [planModalUser, setPlanModalUser] = useState(null);
    const [planType, setPlanType] = useState('WORKOUT'); // WORKOUT or DIET
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const isTrainer = adminProfile?.role === 'TRAINER';


    // Deep Linking: Check for userId in URL
    useEffect(() => {
        const targetUserId = searchParams.get('userId');
        if (targetUserId && users.length > 0) {
            // Try to find by ID (number) or userCode (string)
            const user = users.find(u => u.id === parseInt(targetUserId) || u.userCode === targetUserId);
            if (user) {
                handleEdit(user); // Use the existing handleEdit function
                // Clear the param from the URL
                router.replace('/branch/users', { scroll: false });
            }
        }
    }, [searchParams, users, router]); // Added router to dependencies

    // Form States
    const [hasTrainer, setHasTrainer] = useState(false);
    const [planDuration, setPlanDuration] = useState("");
    const [planFree, setPlanFree] = useState("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        role: "USER",
        phone: "",
        amountPaid: 0,
        plan: "1 Month", // Default
        dob: "",
        trainerName: "", // For storing selected trainer name
        trainerCode: "" // For storing selected trainer code
    });

    // Fetch Users
    // Fetch Users & Trainers
    const fetchData = async () => {
        setLoading(true);
        try {
            const [usersData, staffData, profileData] = await Promise.all([
                getUsers(),
                getStaff(),
                getProfile()
            ]);

            console.log("Fetched Users:", usersData);
            setAdminProfile(profileData);

            if (Array.isArray(usersData) && usersData.length > 0) {
                const firstUser = usersData[0];
                if (!firstUser.id && !firstUser.userCode) {
                    console.error("CRITICAL: Backend returning old data format (missing ID/Code). Rebuild required.", Object.keys(firstUser));
                }
            }
            setUsers(Array.isArray(usersData) ? usersData : []);

            // Filter staff for trainers with isPersonalTrainer flag
            // Ensure data structure matches what's returned (StaffTrackingDto has isPersonalTrainer)
            console.log("DEBUG: Raw Staff Data:", staffData);
            const trainersList = (Array.isArray(staffData) ? staffData : [])
                .filter(s => {
                    const isTrainer = s.isPersonalTrainer === true || s.role === 'TRAINER' || s.entityType === 'TRAINER';
                    console.log(`DEBUG: Checking ${s.name}: isPersonalTrainer=${s.isPersonalTrainer}, role=${s.role}, entityType=${s.entityType} => ${isTrainer}`);
                    return isTrainer;
                });
            console.log("DEBUG: Filtered Trainers List:", trainersList);
            setTrainers(trainersList);

        } catch (error) {
            console.error("Failed to fetch data:", error);
            alert("Failed to load data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        fetchData();
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Handlers
    const handleAdd = () => {
        setCurrentUser(null);
        setHasTrainer(false);
        setPlanDuration("");
        setPlanFree("");
        setFormData({
            name: "",
            email: "",
            role: "USER",
            phone: "",
            amountPaid: 0,
            plan: "",
            dob: "",
            trainerName: ""
        });
        setIsModalOpen(true);
    };

    const handleEdit = (user) => {
        setCurrentUser(user);
        // Extract Plan Info if possible (assuming simple string for now, or you might parse it if needed)
        // For simplicity, just setting the plan string. Splitting logic would require strict format enforcement.
        const durationMatch = user.plan ? user.plan.match(/^(\d+) Months/) : null;
        setPlanDuration(durationMatch ? durationMatch[1] : "");
        setPlanFree(""); // Reset or try to parse if format is "X Months (+Y Free)"

        const isPrime = user.role === "PREMIUM_USER";
        setHasTrainer(isPrime);

        setFormData({
            name: user.name || "",
            email: user.email || "",
            role: user.role || "USER",
            phone: user.phone || "",
            amountPaid: user.amountPaid || 0,
            plan: user.plan || "Monthly", // Keep original plan string for reference if parsing fails
            dob: user.dob || "",
            trainerName: user.trainerName || "",
            trainerCode: user.trainerCode || ""
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (user) => {
        if (!user || !user.id) {
            console.error("User object or ID is missing", user);
            alert("Error: Cannot delete user with missing ID.");
            return;
        }
        if (!window.confirm(`Are you sure you want to delete ${user.name || "this user"}?`)) return;

        try {
            await deleteUser(user.id);
            // Optimistic update or refresh
            setUsers(prev => prev.filter(u => u.id !== user.id));
            if (currentUser && currentUser.id === user.id) {
                setIsModalOpen(false);
                setCurrentUser(null);
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete user: " + (error.message || "Unknown error"));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            // Validation
            if (!/^\d{10}$/.test(formData.phone)) {
                alert("Phone number must be exactly 10 digits.");
                return;
            }

            if (hasTrainer && !formData.trainerName) {
                alert("Please select a trainer for the Premium plan.");
                return;
            }

            // Construct Plan String
            let finalPlan = formData.plan;
            if (planDuration) {
                finalPlan = `${planDuration} Months`;
                if (planFree && parseInt(planFree) > 0) {
                    finalPlan += ` (+${planFree} Free)`;
                }
            }

            const payload = {
                ...formData,
                plan: finalPlan,
                role: hasTrainer ? "PREMIUM_USER" : "USER",
                // Trainer Name/Code is already in formData if selected
                // Ensure we don't send trainer data if hasTrainer is false
                trainerName: hasTrainer ? formData.trainerName : null,
                trainerCode: hasTrainer ? formData.trainerCode : null
            };

            if (currentUser) {
                await updateUser(currentUser.id, payload);
            } else {
                await createUser(payload);
            }
            setIsModalOpen(false);
            fetchData();
        } catch (error) {
            console.error("Submit failed:", error);
            alert(`Operation failed: ${error.message || "Unknown error"}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Trainer Selection Special Handling
        if (name === "trainerSelection") {
            const selectedTrainer = trainers.find(t => t.code === value);
            if (selectedTrainer) {
                setFormData(prev => ({
                    ...prev,
                    trainerName: selectedTrainer.name,
                    trainerCode: selectedTrainer.code
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    trainerName: "",
                    trainerCode: ""
                }));
            }
            return;
        }

        // Phone Validation: Only numbers, max 10 digits
        if (name === "phone") {
            if (!/^\d*$/.test(value)) return;
            if (value.length > 10) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
    };

    // Table Columns
    const columns = [
        ...(!isTrainer ? [] : []),
        {
            key: "details",
            label: "Name / Email",
            render: (_, row) => (
                <div className="flex flex-col">
                    <div className="font-black text-[11px] uppercase tracking-tight text-white/90">{row.name}</div>
                    <div className="text-[9px] font-bold text-white/30 uppercase tracking-widest">{row.email}</div>
                </div>
            )
        },
        { key: "role", label: "Role", render: (val) => <span className="text-[10px] font-black uppercase tracking-[2px] text-white/60">{val}</span> },
        { key: "trainerName", label: "Trainer", render: (val) => val ? <span className="text-[10px] font-black uppercase text-[#ccff33]/80">{val}</span> : "-" },
        { key: "plan", label: "Plan", render: (val) => <span className="text-[10px] font-black uppercase text-white/40">{val}</span> },
        {
            key: "amountPaid",
            label: "Paid",
            render: (val) => <span className="text-[11px] font-black text-[#ccff33] tracking-tighter">${val}</span>
        },
        {
            key: "status",
            label: "Status",
            render: (_, row) => (
                <div className="flex flex-col gap-1">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-center ${row.isActive ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 'bg-red-500/10 text-red-500 border border-red-500/20'}`}>
                        {row.isActive ? 'Active' : 'Inactive'}
                    </span>
                    {row.isEmailVerified && (
                        <span className="text-[9px] text-blue-400 font-semibold flex items-center justify-center gap-1">
                            <FaCrown className="text-[8px]" /> Verified
                        </span>
                    )}
                </div>
            )
        },
        ...(isTrainer ? [{
            key: "daysRemaining",
            label: "Days Remaining",
            render: (_, row) => {
                if (!row.startDate || !row.plan) return "-";

                try {
                    const start = new Date(row.startDate);
                    const planMonths = parseInt(row.plan.match(/(\d+) Month/)?.[1] || "1");
                    const expiry = new Date(start);
                    expiry.setMonth(start.getMonth() + planMonths);

                    const now = new Date();
                    const diffTime = expiry - now;
                    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                    return (
                        <span className={`text-[10px] font-black uppercase tracking-widest ${diffDays < 7 ? 'text-red-500' : diffDays < 15 ? 'text-orange-500' : 'text-[#ccff33]'}`}>
                            {diffDays > 0 ? `${diffDays} Days` : "Expired"}
                        </span>
                    );
                } catch (e) {
                    return "-";
                }
            }
        }] : []),
        ...(!isTrainer ? [{
            key: "dob",
            label: "DOB",
            render: (val) => val ? new Date(val).toLocaleDateString() : "-"
        }] : []),
        {
            key: "link",
            label: "Actions",
            render: (_, row) => (
                <div className="flex gap-4 items-center">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(row);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[#00f5ff] hover:bg-[#00f5ff]/20 hover:border-[#00f5ff]/50 transition-all group/btn"
                    >
                        <FaUserPlus size={10} className="group-hover/btn:scale-110" />
                    </button>
                    <button
                        disabled={row.role !== 'PREMIUM_USER'}
                        onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/admin/assign-workout?userId=${row.id}`);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center border transition-all ${row.role === 'PREMIUM_USER' 
                            ? 'bg-[#ccff33]/5 border-[#ccff33]/20 text-[#ccff33] hover:bg-[#ccff33]/20 hover:scale-110 shadow-[0_0_10px_rgba(204,255,51,0.1)]' 
                            : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed opacity-20 filter grayscale'}`}
                        title={row.role === 'PREMIUM_USER' ? "Assign Workout Plan" : "Upgrade to Prime to Assign Plans"}
                    >
                        <FaDumbbell size={10} />
                    </button>
                    <button
                        disabled={row.role !== 'PREMIUM_USER'}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPlanModalUser(row);
                            setPlanType('DIET');
                            setIsPlanModalOpen(true);
                        }}
                        className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all border ${row.role === 'PREMIUM_USER' 
                            ? 'bg-[#ccff33]/5 border-[#ccff33]/20 text-[#ccff33] hover:bg-[#ccff33]/20 hover:scale-110 shadow-[0_0_10px_rgba(204,255,51,0.1)]' 
                            : 'bg-white/5 border-white/10 text-white/20 cursor-not-allowed opacity-20 filter grayscale'}`}
                        title={row.role === 'PREMIUM_USER' ? "Assign Diet Plan" : "Upgrade to Prime to Assign Plans"}
                    >
                        <FaUtensils size={10} />
                    </button>
                    {!isTrainer && (
                        <>
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    if (!adminProfile?.userCode) {
                                        alert("Error: Admin Code not found. Please refresh.");
                                        return;
                                    }
                                    const inviteLink = `${window.location.origin}/auth/register/join?u=${row.userCode}&ref=${adminProfile.userCode}&role=USER`;
                                    navigator.clipboard.writeText(inviteLink).then(() => {
                                        alert(`Invite Link Copied!\n\n${inviteLink}`);
                                    }, (err) => {
                                        alert("Failed to copy link: " + err);
                                    });
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[#00f5ff] hover:bg-[#00f5ff]/20 hover:border-[#00f5ff]/50 transition-all"
                                title="Copy Registration Link"
                            >
                                <FaLink size={10} />
                            </button>
                            <button
                                onClick={async (e) => {
                                    e.stopPropagation();
                                    if (!confirm(`Resend invite email to ${row.name || row.email}?`)) return;
                                    try {
                                        await resendInvite(row.userCode, "USER");
                                        alert("Invite email sent successfully!");
                                    } catch (err) {
                                        console.error(err);
                                        const output = err.response?.data || err.message;
                                        alert("Failed to send invite email: " + (typeof output === 'string' ? output : JSON.stringify(output)));
                                    }
                                }}
                                className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/5 border border-white/10 text-[#ccff33] hover:bg-[#ccff33]/20 hover:border-[#ccff33]/50 transition-all shadow-[0_0_10px_rgba(204,255,51,0.1)]"
                                title="Resend Invite Email"
                            >
                                <FaPaperPlane size={10} />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    const upperRole = adminProfile?.role?.toUpperCase() || '';
    const navLinks = upperRole === 'TRAINER' ? TRAINER_NAV_LINKS : BRANCH_ADMIN_NAV_LINKS;

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 z-[999] selection:bg-[#ccff33]/30 text-white overflow-hidden font-sans bg-[#050505]">
            
            {/* ATMOSPHERIC STACK */}
            <div className="fixed inset-0 z-0">
                <img src="/pro_gym_bg.png" alt="Gym BG" className="w-full h-full object-cover opacity-80 backdrop-grayscale" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/80 z-10" />
            </div>

            <div className="fixed inset-0 z-[1] opacity-30">
                <JoyfulBackground />
            </div>

            <svg className="fixed inset-0 w-full h-full opacity-[0.25] pointer-events-none z-[1000] mix-blend-overlay">
                <filter id="noiseFilter"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" /><rect width="100%" height="100%" filter="url(#noiseFilter)" /></filter>
            </svg>

            <motion.div
                animate={{ x: mousePos.x - 500, y: mousePos.y - 500 }}
                transition={{ type: "spring", stiffness: 40, damping: 25, mass: 0.8 }}
                className="fixed w-[1000px] h-[1000px] bg-gradient-radial from-[#00f5ff]/10 to-transparent blur-[120px] pointer-events-none z-[2]"
            />

            <div className="fixed top-0 left-0 w-1/2 h-1/2 bg-[#00f5ff]/10 blur-[140px] rounded-full -translate-x-1/3 -translate-y-1/3 z-[3]" />
            <div className="fixed bottom-0 right-0 w-1/2 h-1/2 bg-[#ccff33]/10 blur-[140px] rounded-full translate-x-1/3 translate-y-1/3 z-[3] animate-pulse" />

            {/* MAIN SYSTEM TERMINAL */}
            <div className="relative z-[100] w-full h-full p-0">
                <TiltWrapper className="w-full h-full" strength={0.5}>
                    <motion.div
                        initial={{ opacity: 0, scale: 0.98 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        className="glass-premium w-full h-full flex flex-col relative overflow-hidden shadow-none border-none !rounded-[20px]"
                    >
                        {/* NAVBAR */}
                        <div className={`sticky top-0 z-[200] w-full flex items-center justify-between px-10 py-5 border-b border-white/10 bg-black/40 backdrop-blur-md transition-all ${isScrolled ? 'py-4 !bg-black/80' : ''}`}>
                            <div className="flex items-center gap-12">
                                <Link href="/branch/trainer-dashboard" className="text-xl font-black italic tracking-tighter uppercase text-white flex items-center gap-2">
                                    Gym<span className="text-[#ccff33]">Terminal</span>
                                </Link>
                                <div className="hidden lg:flex gap-8 items-center">
                                    {navLinks.map((link, i) => (
                                        <Link key={i} href={link.href} className={`group flex items-center gap-2 text-[10px] font-black uppercase tracking-[2px] transition-all ${router.pathname === link.href ? 'text-[#ccff33]' : 'text-white/50 hover:text-[#ccff33]'}`}>
                                            <span className="text-xs group-hover:scale-110 transition-transform">{link.icon}</span>
                                            {link.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-4 pr-6 border-r border-white/10">
                                    <div className="text-right hidden sm:block">
                                        <div className="text-[9px] font-black uppercase tracking-widest text-white/20">Authorized Control</div>
                                        <div className="text-[10px] font-black text-[#00f5ff]">{adminProfile?.name || 'ADMIN'}</div>
                                    </div>
                                </div>
                                <div className="w-10 h-10 rounded-full border-2 border-[#00f5ff]/30 overflow-hidden hover:border-[#00f5ff] transition-all cursor-pointer p-0.5">
                                    <div className="w-full h-full rounded-full bg-white/5 flex items-center justify-center overflow-hidden">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${adminProfile?.name || 'Admin'}`} alt="Avatar" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* VIEWPORT CONSTRAINED CONTENT */}
                        <div className="flex-1 flex flex-col overflow-hidden px-10 pt-10 relative">
                            
                            <div className="max-w-7xl mx-auto w-full mb-8 shrink-0">
                                <div className="space-y-4">
                                    <div className="inline-flex items-center gap-3 px-4 py-2 glass-premium !rounded-full !bg-[#00f5ff]/5 border-[#00f5ff]/20 text-[#00f5ff] text-[9px] font-black uppercase tracking-[3px]">
                                        <FaCheckCircle className="animate-pulse" /> Personnel Index Ready
                                    </div>
                                    <h1 className="text-4xl md:text-6xl font-black tracking-tighter uppercase drop-shadow-2xl flex items-center gap-4">
                                        <StaggeredText text="User" className="text-white/40" />
                                        <motion.span 
                                            animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
                                            transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                                            style={{ backgroundSize: "300% auto", backgroundImage: "linear-gradient(to right, #00f5ff, #ccff33, #00f5ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}
                                            className="drop-shadow-sm inline-block"
                                        >
                                            <StaggeredText text="Management" />
                                        </motion.span>
                                    </h1>
                                    <p className="text-white/50 font-bold uppercase tracking-[4px] text-xs leading-relaxed max-w-2xl border-l-2 border-[#ccff33]/40 pl-8 italic">
                                        Monitor gym member status, sync subscriptions, and adjust active training profiles in real-time.
                                    </p>
                                </div>
                            </div>

                            <div className="max-w-7xl mx-auto w-full flex-1 overflow-hidden min-h-0 mb-10">
                                <div className="relative group h-full">
                                    <div className="absolute -inset-1 bg-gradient-to-b from-[#00f5ff]/20 to-transparent blur-md opacity-20 group-hover:opacity-40 transition-opacity" />
                                    <div className="relative h-full glass-premium !bg-black/40 !border-t-4 !border-t-[#00f5ff] !border-x-0 !border-b-0 !rounded-[2rem] overflow-hidden shadow-2xl flex flex-col">
                                        <div className="flex-1 overflow-auto custom-scrollbar">
                                            <DataTable
                                                title={<span className="text-[12px] font-black uppercase tracking-[5px] text-white/80">Active Personnel Directory</span>}
                                                columns={columns}
                                                data={users}
                                                isLoading={loading}
                                                onEdit={isTrainer ? null : handleEdit}
                                                onDelete={isTrainer ? null : handleDelete}
                                                onAdd={isTrainer ? null : handleAdd}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="h-20" />
                        </div>
                        
                        <div className="p-8 border-t border-white/10 bg-black/40 backdrop-blur-md flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-3 opacity-30">
                                <div className="w-8 h-[1px] bg-[#00f5ff]"></div>
                                <div className="text-[8px] font-black uppercase tracking-[4px] text-[#00f5ff] italic">Directory Sync Active</div>
                            </div>
                            <div className="text-[7px] font-black uppercase tracking-[10px] text-white/10">TERMINAL SECURITY v4.2</div>
                        </div>
                    </motion.div>
                </TiltWrapper>
            </div>

            {/* --- MODALS (KEEPING LOGIC, UPDATING STYLE) --- */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={<span className="text-[11px] font-black uppercase tracking-[4px] text-white/90">{currentUser ? "Modify Profile" : "Initiate Entry"}</span>}>
                 <form onSubmit={handleSubmit} className="space-y-6 p-1 max-h-[70vh] overflow-y-auto pr-3 custom-scrollbar">
                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Full Designation</label>
                        <input required name="name" value={formData.name} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold uppercase tracking-widest text-white outline-none focus:border-[#00f5ff]/50 transition-all placeholder:text-white/10" placeholder="SURNAME, NAME" />
                    </div>

                    <div className="space-y-2">
                        <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Communication Node (Email)</label>
                        <input required type="email" name="email" value={formData.email} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold tracking-widest text-[#00f5ff] outline-none focus:border-[#00f5ff]/50 transition-all placeholder:text-white/10" placeholder="PROTOCOL@GYM.COM" />
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Signal ID (Phone)</label>
                            <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold text-white outline-none focus:border-[#00f5ff]/50 transition-all" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Origin Date (DOB)</label>
                            <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold text-white outline-none focus:border-[#00f5ff]/50 transition-all [color-scheme:dark]" />
                        </div>
                    </div>

                    <div className="p-6 bg-white/[0.03] rounded-[2rem] border-t-2 border-t-[#ccff33]/40 space-y-4">
                        <div className="flex items-center justify-between">
                            <label className="text-[10px] font-black uppercase tracking-[3px] text-[#ccff33]">Personal Trainer Protocol</label>
                            <div onClick={() => setHasTrainer(!hasTrainer)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-all ${hasTrainer ? "bg-[#ccff33]" : "bg-white/10"}`}>
                                <div className={`bg-black w-4 h-4 rounded-full shadow-md transform transition-transform duration-300 ${hasTrainer ? "translate-x-6" : ""}`} />
                            </div>
                        </div>
                        {hasTrainer && (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-4 duration-300">
                                <label className="text-[9px] font-black text-white/20 uppercase tracking-[3px]">Active Staff Selector</label>
                                <select name="trainerSelection" value={formData.trainerCode || ""} onChange={handleChange} className="w-full bg-black/40 border border-white/10 rounded-xl p-4 text-[11px] font-bold uppercase text-[#ccff33] outline-none">
                                    <option value="" className="bg-slate-900 italic">-- SELECT TRAINER CODE --</option>
                                    {trainers.map(t => <option key={t.id} value={t.code} className="bg-slate-900">{t.name} ({t.customerNames?.length || 0})</option>)}
                                </select>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-6 pb-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Cycle (Months)</label>
                            <input required type="number" min="1" value={planDuration} onChange={(e) => setPlanDuration(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-black text-white outline-none focus:border-[#ccff33]/50" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Bonus Phase</label>
                            <input type="number" min="0" value={planFree} onChange={(e) => setPlanFree(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-black text-[#ccff33] outline-none" />
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-white/5">
                        <button type="button" onClick={() => setIsModalOpen(false)} className="flex-1 py-4 text-[10px] font-black tracking-[4px] uppercase text-white/30 hover:text-white transition-colors">Abort</button>
                        <button type="submit" className="flex-[2] py-4 bg-[#00f5ff] text-black text-[10px] font-black tracking-[4px] uppercase rounded-xl shadow-[0_0_20px_rgba(0,245,255,0.3)] hover:scale-105 active:scale-95 transition-all">
                            {currentUser ? "Commit Modification" : "Confirm Entry"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Plan Assignment Modal */}
            <Modal isOpen={isPlanModalOpen} onClose={() => setIsPlanModalOpen(false)} title={<span className="text-[11px] font-black uppercase tracking-[4px] text-white/90">Synchronize Plan Protocol</span>}>
                <div className="space-y-8 p-1">
                    <div className="bg-[#ccff33]/10 border border-[#ccff33]/20 p-6 rounded-[2rem] flex items-center gap-6">
                        <div className="w-12 h-12 rounded-2xl bg-[#ccff33]/20 flex items-center justify-center text-[#ccff33] text-xl shadow-[0_0_15px_#ccff3340]"><FaCrown /></div>
                        <div>
                            <p className="text-[11px] font-black text-[#ccff33] uppercase tracking-[2px]">Prime Status Verified</p>
                            <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest mt-1">Personnel eligible for high-fidelity routine assignment.</p>
                        </div>
                    </div>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Protocol Template</label>
                            <select className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold uppercase text-white outline-none">
                                <option value="" className="bg-slate-900">-- SELECT BLUEPRINT --</option>
                                {planType === 'WORKOUT' ? (
                                    <>
                                        <option value="1" className="bg-slate-900">Weight Loss Alpha</option>
                                        <option value="2" className="bg-slate-900">Muscle Gain Pro</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="1" className="bg-slate-900">Low Carb Keto</option>
                                        <option value="2" className="bg-slate-900">High Protein Bulk</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black text-white/30 uppercase tracking-[3px]">Internal Directives</label>
                            <textarea rows="4" className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-[11px] font-bold text-white outline-none focus:border-[#00f5ff]/50 transition-all placeholder:text-white/10" placeholder="Enter special protocol details..."></textarea>
                        </div>
                    </div>

                    <div className="flex gap-4 pt-6 border-t border-white/5">
                        <button onClick={() => setIsPlanModalOpen(false)} className="px-8 py-4 text-[10px] font-black uppercase tracking-[3px] text-white/30">Back</button>
                        <button onClick={() => { alert(`${planType} protocol assigned.`); setIsPlanModalOpen(false); }} className="flex-1 py-4 bg-[#ccff33] text-black text-[10px] font-black tracking-[5px] uppercase rounded-xl shadow-[0_0_20px_#ccff3340]">Transmit Protocol</button>
                    </div>
                </div>
            </Modal>

            <style jsx global>{`
                .custom-scrollbar::-webkit-scrollbar { width: 4px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 255, 255, 0.1); border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0, 245, 255, 0.3); }
                .glass-premium {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(40px) saturate(180%);
                    -webkit-backdrop-filter: blur(40px) saturate(180%);
                    border: 1px solid rgba(255, 255, 255, 0.12);
                }
            `}</style>
        </div>
    );
}
