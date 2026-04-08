"use client";

import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerOrganization, APIError, verifyOTP, resendOTP } from "@/lib/api";
import {
    FaDumbbell, FaRunning, FaHeartbeat, FaBicycle, FaUsers,
    FaVideo, FaMedal, FaStopwatch, FaEye, FaEyeSlash,
    FaArrowRight, FaPlus, FaTimes, FaShieldAlt
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import JoyfulBackground from "@/app/components/JoyfulBackground.jsx";

// --- Shared Helper Components ---

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

const StaggeredText = ({ text, className = "" }) => {
    if (!text) return null;
    const letters = text.split("");
    return (
        <div className={className}>
            {letters.map((letter, i) => (
                <motion.span
                    key={i}
                    initial={{ opacity: 0, y: 10 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.015, duration: 0.3, ease: [0.2, 0.65, 0.3, 0.9] }}
                    className="inline-block"
                >
                    {letter === " " ? "\u00A0" : letter}
                </motion.span>
            ))}
        </div>
    );
};

// --- Logic Helpers ---

function pad4(n) {
    return String(n).padStart(4, "0");
}

function generateBranchCode(index) {
    return pad4(index);
}

const isValidEmail = (email) => /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);

const isValidPassword = (password) => /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);

const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength;
};

const PasswordStrengthMeter = ({ password }) => {
    const strength = getPasswordStrength(password);
    const width = (strength / 5) * 100;
    let color = "rgba(255, 255, 255, 0.1)";
    if (strength > 0) color = "#ef4444"; // red
    if (strength >= 3) color = "#f97316"; // orange
    if (strength === 5) color = "#ccff33"; // Lime

    return (
        <div className="w-full mt-2 space-y-1.5">
            <div className="h-[3px] w-full bg-white/5 rounded-full overflow-hidden">
                <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${width}%` }}
                    className="h-full transition-colors"
                    style={{ backgroundColor: color }}
                />
            </div>
            <div className="text-[8px] font-black uppercase tracking-widest text-right" style={{ color: color }}>
                {strength < 3 ? "Vulnerability Detected" : strength < 5 ? "Secured" : "Fortified"}
            </div>
        </div>
    );
};

export default function Register() {
    const router = useRouter();

    // Org Info
    const [orgName, setOrgName] = useState("");
    const [orgEmailOwner, setOrgEmailOwner] = useState("");
    const [orgNumber, setOrgNumber] = useState("");
    const [orgPassword, setOrgPassword] = useState("");
    const [confOrgPassword, setConfOrgPassword] = useState("");
    const [showOrgPass, setShowOrgPass] = useState(false);
    const [showConfOrgPass, setShowConfOrgPass] = useState(false);

    // Branch State
    const [branches, setBranches] = useState([
        { id: Date.now(), code: "0001", name: "", adminEmail: "", password: "", confirmPassword: "" }
    ]);
    const [activeBranchIndex, setActiveBranchIndex] = useState(0);
    const [branchShowPass, setBranchShowPass] = useState(false);

    // Errors State
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    // OTP State
    const [showOtpModal, setShowOtpModal] = useState(false);
    const [otp, setOtp] = useState("");
    const [otpError, setOtpError] = useState("");
    const [otpResendLoading, setOtpResendLoading] = useState(false);
    const [registeredOrgId, setRegisteredOrgId] = useState(null);

    // Submission
    const [submitted, setSubmitted] = useState(false);
    const [loading, setLoading] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

    useEffect(() => {
        setMounted(true);
        const handleMouseMove = (e) => setMousePos({ x: e.clientX, y: e.clientY });
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // --- Original Logic (Preserved 100%) ---

    const validate = () => {
        let newErrors = {};
        let isValid = true;
        let firstInvalidBranchIndex = -1;

        if (!orgName.trim()) { newErrors.orgName = "Organization Name is required"; isValid = false; }
        if (!isValidEmail(orgEmailOwner)) { newErrors.orgEmailOwner = "Enter a valid email address"; isValid = false; }
        if (orgNumber.length !== 10) { newErrors.orgNumber = "Contact number must be exactly 10 digits"; isValid = false; }
        if (!isValidPassword(orgPassword)) { newErrors.orgPassword = "Password must be at least 8 chars with 1 upper, 1 lower, 1 number, 1 special char"; isValid = false; }
        if (orgPassword !== confOrgPassword) { newErrors.confOrgPassword = "Passwords do not match"; isValid = false; }

        branches.forEach((b, i) => {
            if (!b.name.trim()) { newErrors[`branch_${i}_name`] = "Branch Name is required"; isValid = false; if (firstInvalidBranchIndex === -1) firstInvalidBranchIndex = i; }
            if (!isValidEmail(b.adminEmail)) { newErrors[`branch_${i}_adminEmail`] = "Enter a valid email address"; isValid = false; if (firstInvalidBranchIndex === -1) firstInvalidBranchIndex = i; }
            if (!isValidPassword(b.password)) { newErrors[`branch_${i}_password`] = "Password is too weak"; isValid = false; if (firstInvalidBranchIndex === -1) firstInvalidBranchIndex = i; }
            if (b.password !== b.confirmPassword) { newErrors[`branch_${i}_confirmPassword`] = "Passwords do not match"; isValid = false; if (firstInvalidBranchIndex === -1) firstInvalidBranchIndex = i; }
        });

        setErrors(newErrors);
        if (!isValid && firstInvalidBranchIndex !== -1) { setActiveBranchIndex(firstInvalidBranchIndex); }
        return isValid;
    };

    const activeBranch = branches[activeBranchIndex] || {};

    const updateActiveBranch = (field, value) => {
        const updatedBranches = [...branches];
        if (updatedBranches[activeBranchIndex]) {
            updatedBranches[activeBranchIndex] = { ...updatedBranches[activeBranchIndex], [field]: value };
            setBranches(updatedBranches);
            if (errors[`branch_${activeBranchIndex}_${field}`]) {
                setErrors(prev => { const newErrs = { ...prev }; delete newErrs[`branch_${activeBranchIndex}_${field}`]; return newErrs; });
            }
        }
    };

    const addBranchTab = () => {
        const newBranch = { id: Date.now(), code: generateBranchCode(branches.length + 1), name: "", adminEmail: "", password: "", confirmPassword: "" };
        setBranches([...branches, newBranch]);
        setActiveBranchIndex(branches.length);
    };

    const removeBranch = (e, index) => {
        e.stopPropagation();
        if (branches.length <= 1) { return; }
        const updatedBranches = branches.filter((_, i) => i !== index);
        setBranches(updatedBranches);
        if (activeBranchIndex >= updatedBranches.length) { setActiveBranchIndex(updatedBranches.length - 1); }
    };

    const handleFieldChange = (setter, fieldName, value) => {
        setter(value);
        if (errors[fieldName]) { setErrors(prev => { const newErrs = { ...prev }; delete newErrs[fieldName]; return newErrs; }); }
        setGeneralError("");
    };

    const handleRegister = async () => {
        setGeneralError("");
        if (!validate()) { setGeneralError("Verification sequence failed. Please check all data packets."); return; }
        setLoading(true);
        const payload = {
            name: orgName, ownerEmail: orgEmailOwner, phone: orgNumber, password: orgPassword,
            branches: branches.map(b => ({ name: b.name, adminEmail: b.adminEmail, password: b.password }))
        };
        try {
            const response = await registerOrganization(payload);
            setSubmitted(true);
            setRegisteredOrgId(response.organizationId);
            setShowOtpModal(true);
        } catch (err) {
            console.error("Registration Error:", err);
            if (err instanceof APIError) {
                if (err.status === 400 && err.errors && err.errors.length > 0) {
                    setGeneralError(err.errors.map(e => `${e.message}`).join(', '));
                } else { setGeneralError(err.message || "Registration failed. Please try again."); }
            } else { setGeneralError("Unexpected uplink error. Please try again."); }
        } finally { setLoading(false); }
    };

    const branchHasError = (index) => Object.keys(errors).some(key => key.startsWith(`branch_${index}_`));

    const handleVerifyOtp = async () => {
        setOtpError("");
        if (!otp || otp.length < 6) { setOtpError("Invalid sequence."); return; }
        setLoading(true);
        try {
            await verifyOTP({ organizationId: registeredOrgId, otpCode: otp });
            router.push('/auth/login');
        } catch (err) { setOtpError(err.message || "Decryption failed."); } finally { setLoading(false); }
    };

    const handleResendOtp = async () => {
        setOtpError("");
        setOtpResendLoading(true);
        try { await resendOTP({ organizationId: registeredOrgId }); } catch (err) { setOtpError(err.message || "Failed to resend."); } finally { setOtpResendLoading(false); }
    };

    if (!mounted) return null;

    return (
        <div className="h-screen w-screen flex items-center justify-center bg-[#050505] text-white selection:bg-[#ccff33]/30 relative overflow-hidden font-sans">
            {/* 1. LAYER - Background Visuals */}
            <div className="fixed inset-0 z-0">
                <img src="/premium_gym_bg.png" alt="Gym Background" className="w-full h-full object-cover opacity-80 backdrop-grayscale" />
                <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/20 to-black/80 z-10" />
            </div>

            {/* 2. LAYER - Joyful Background */}
            <div className="fixed inset-0 z-[1] opacity-30">
                <JoyfulBackground />
            </div>

            {/* 3. LAYER - SVG Noise */}
            <svg className="fixed inset-0 w-full h-full opacity-[0.25] pointer-events-none z-[1000] mix-blend-overlay">
                <filter id="noiseFilterReg"><feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" /></filter>
                <rect width="100%" height="100%" filter="url(#noiseFilterReg)" />
            </svg>

            {/* 4. LAYER - Spotlight */}
            <motion.div
                animate={{ x: mousePos.x - 500, y: mousePos.y - 500 }}
                transition={{ type: "spring", stiffness: 30, damping: 20 }}
                className="fixed w-[1000px] h-[1000px] bg-gradient-radial from-[#ccff33]/5 to-transparent blur-[120px] pointer-events-none z-[2]"
            />

            {/* 5. LAYER - Background Glow Accents (Matching Login Page) */}
            <div className="fixed -top-[10%] -left-[5%] w-[40%] h-[40%] bg-lime-400/10 blur-[120px] rounded-full pointer-events-none z-[2]" />
            <div className="fixed -bottom-[10%] -right-[5%] w-[40%] h-[40%] bg-teal-400/10 blur-[120px] rounded-full pointer-events-none z-[2]" />

            {/* MAIN CONTAINER */}
            <TiltWrapper className="max-w-6xl w-full px-6 z-[100]">
                <motion.div
                    initial={{ opacity: 0, y: 30, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="glass-premium grid lg:grid-cols-12 shadow-[0_0_80px_rgba(0,0,0,0.6)] overflow-hidden max-h-[92vh]"
                >
                    {/* Interior Glowing Accents (Matching Login Page) */}
                    <div className="glow-blob glow-teal -top-20 -left-20 opacity-20" />
                    <div className="glow-blob glow-lime -bottom-20 -right-20 opacity-10" />
                    {/* Header Bar (Full Width span) */}
                    <div className="lg:col-span-12 border-b border-white/10 p-5 flex flex-col md:flex-row justify-between items-center gap-4 bg-white/[0.02]">
                        <div className="space-y-0.5 text-center md:text-left">
                            <h1 className="text-xl font-black uppercase tracking-[6px] text-[#ccff33]">Setup Your Organization</h1>
                            <p className="text-[8px] font-black uppercase tracking-[3px] text-white/40 italic">Total Branches: {branches.length}</p>
                        </div>
                        <div className="flex gap-2">
                            {branches.map((b, i) => (
                                <div key={b.id} className="px-5 py-2 text-[10px] font-black uppercase tracking-[3px] text-[#ccff33] bg-[#ccff33]/10 rounded-full border border-[#ccff33]/20">
                                    {b.name || `Branch ${b.code}`}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Main Content Sections */}
                    {/* LEFT: Org Details (Matching Login Page Cinematic Info style) */}
                    <div className="lg:col-span-5 p-7 border-r border-white/10 space-y-6 bg-white/[0.04] relative overflow-y-auto scrollbar-hide">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-[#00f5ff]/5 via-transparent to-[#ccff33]/5 opacity-50 pointer-events-none"></div>
                        <div className="relative z-10 space-y-5">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="w-10 h-[1px] bg-[#00f5ff]/50"></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[4px] text-white/60 italic">Organization Details</h3>
                                </div>
                                <div className="space-y-4">
                                    {/* ORG NAME */}
                                    <div className="space-y-1.5 group">
                                        <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#ccff33] transition-colors ml-2">Organization Name</label>
                                        <div className={`relative ${errors.orgName ? "ring-1 ring-red-500/50" : ""}`}>
                                            <input
                                                type="text"
                                                value={orgName}
                                                onChange={(e) => handleFieldChange(setOrgName, "orgName", e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 focus:border-[#00f5ff]/50 rounded-xl px-5 py-2.5 text-[11px] font-bold outline-none transition-all placeholder:text-white/10 text-white"
                                                placeholder=" "
                                            />
                                        </div>
                                        {errors.orgName && <span className="text-red-400 text-[8px] font-black uppercase tracking-wider ml-4">{errors.orgName}</span>}
                                    </div>

                                    {/* OWNER EMAIL */}
                                    <div className="space-y-1.5 group">
                                        <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#ccff33] transition-colors ml-2">Owner Email</label>
                                        <input
                                            type="email"
                                            value={orgEmailOwner}
                                            onChange={(e) => handleFieldChange(setOrgEmailOwner, "orgEmailOwner", e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 focus:border-[#00f5ff]/50 rounded-xl px-5 py-2.5 text-[11px] font-bold outline-none transition-all text-white"
                                            placeholder=" "
                                        />
                                        {errors.orgEmailOwner && <span className="text-red-400 text-[8px] font-black uppercase tracking-wider ml-4">{errors.orgEmailOwner}</span>}
                                    </div>

                                    {/* PHONE */}
                                    <div className="space-y-1.5 group">
                                        <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#ccff33] transition-colors ml-2">Contact Number (10-digit)</label>
                                        <input
                                            type="text"
                                            value={orgNumber}
                                            onChange={(e) => { const val = e.target.value.replace(/\D/g, '').slice(0, 10); handleFieldChange(setOrgNumber, "orgNumber", val); }}
                                            className="w-full bg-white/10 border border-white/20 focus:border-[#00f5ff]/50 rounded-xl px-5 py-2.5 text-[11px] font-bold outline-none transition-all text-white"
                                            placeholder=" "
                                        />
                                        {errors.orgNumber && <span className="text-red-400 text-[8px] font-black uppercase tracking-wider ml-4">{errors.orgNumber}</span>}
                                    </div>

                                    {/* PASSWORDS */}
                                    <div className="space-y-3 pt-1">
                                        <div className="space-y-1.5 group relative">
                                            <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#ccff33] transition-colors ml-2">Strong Password</label>
                                            <input
                                                type={showOrgPass ? "text" : "password"}
                                                value={orgPassword}
                                                onChange={(e) => handleFieldChange(setOrgPassword, "orgPassword", e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 focus:border-[#00f5ff]/50 rounded-xl px-5 py-2.5 text-[11px] font-bold outline-none transition-all text-white"
                                                placeholder=" "
                                            />
                                            <button onClick={() => setShowOrgPass(!showOrgPass)} className="absolute right-5 top-9 text-white/20 hover:text-[#ccff33]">
                                                {showOrgPass ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                                            </button>
                                            <PasswordStrengthMeter password={orgPassword} />
                                        </div>

                                        <div className="space-y-1.5 group">
                                            <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#ccff33] transition-colors ml-2">Confirm Password</label>
                                            <input
                                                type="password"
                                                value={confOrgPassword}
                                                onChange={(e) => handleFieldChange(setConfOrgPassword, "confOrgPassword", e.target.value)}
                                                className="w-full bg-white/10 border border-white/20 focus:border-[#00f5ff]/50 rounded-xl px-5 py-2.5 text-[11px] font-bold outline-none transition-all text-white"
                                                placeholder=" "
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Branch Management (Matching Login Page Stealth Form style) */}
                    <div className="lg:col-span-7 p-7 relative flex flex-col bg-black/40 backdrop-blur-md overflow-y-auto scrollbar-hide">
                        <div className="relative z-10 flex flex-col min-h-0">
                            {/* Branch Tabs */}
                            <div className="flex gap-2 mb-6 overflow-x-auto pb-3 scrollbar-hide">
                                {branches.map((b, i) => (
                                    <button
                                        key={b.id}
                                        onClick={() => setActiveBranchIndex(i)}
                                        className={`group relative flex items-center gap-2 px-3 py-2 rounded-lg border transition-all duration-500 whitespace-nowrap ${activeBranchIndex === i
                                            ? "bg-[#ccff33]/10 border-[#ccff33]/30 text-[#ccff33]"
                                            : "bg-white/5 border-white/5 text-white/40 hover:bg-white/10 hover:border-white/10"
                                            }`}
                                    >
                                        <span className={`text-[8px] font-black uppercase tracking-widest ${activeBranchIndex === i ? "opacity-100" : "opacity-40"}`}>
                                            {b.name || `Branch ${b.code}`}
                                        </span>
                                        {branchHasError(i) && <div className="w-1 h-1 bg-red-500 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,0.5)]"></div>}
                                    </button>
                                ))}
                                <button
                                    onClick={addBranchTab}
                                    className="px-3 py-2 rounded-lg border border-dashed border-white/20 text-white/30 hover:border-[#ccff33]/50 hover:text-[#ccff33] transition-all flex items-center gap-2"
                                >
                                    <FaPlus size={8} />
                                    <span className="text-[8px] font-black uppercase tracking-[2px]">+ Add Branch</span>
                                </button>
                            </div>

                            {/* Active Branch Content */}
                            <div className="flex-1 space-y-4">
                                <div className="flex items-center gap-4 mb-1">
                                    <div className="w-8 h-[1px] bg-[#00f5ff]/40"></div>
                                    <h3 className="text-[10px] font-black uppercase tracking-[4px] text-[#00f5ff] italic">Branch Details ({activeBranch.code})</h3>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 group">
                                        <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#00f5ff] transition-colors ml-2">Branch Name</label>
                                        <input
                                            type="text"
                                            value={activeBranch.name}
                                            onChange={(e) => updateActiveBranch("name", e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 focus:border-[#00f5ff]/50 rounded-xl px-5 py-2.5 text-[11px] font-bold outline-none transition-all text-white"
                                            placeholder=" "
                                        />
                                    </div>
                                    <div className="space-y-1.5 group">
                                        <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#ccff33] transition-colors ml-2">Admin Email</label>
                                        <input
                                            type="email"
                                            value={activeBranch.adminEmail}
                                            onChange={(e) => updateActiveBranch("adminEmail", e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 focus:border-[#00f5ff]/50 rounded-xl px-5 py-2.5 text-[11px] font-bold outline-none transition-all text-white"
                                            placeholder=" "
                                        />
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-2 gap-4">
                                    <div className="space-y-1.5 group relative">
                                        <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#00f5ff] transition-colors ml-2">Branch Password</label>
                                        <input
                                            type={branchShowPass ? "text" : "password"}
                                            value={activeBranch.password}
                                            onChange={(e) => updateActiveBranch("password", e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 focus:border-[#00f5ff]/50 rounded-xl px-5 py-2.5 text-[11px] font-bold outline-none transition-all text-white"
                                            placeholder=" "
                                        />
                                        <button onClick={() => setBranchShowPass(!branchShowPass)} className="absolute right-5 top-9 text-white/20 hover:text-[#00f5ff]">
                                            {branchShowPass ? <FaEyeSlash size={12} /> : <FaEye size={12} />}
                                        </button>
                                    </div>
                                    <div className="space-y-1.5 group">
                                        <label className="text-[9px] font-black uppercase tracking-[3px] text-white/60 group-focus-within:text-[#00f5ff] transition-colors ml-2">Confirm Branch Password</label>
                                        <input
                                            type="password"
                                            value={activeBranch.confirmPassword}
                                            onChange={(e) => updateActiveBranch("confirmPassword", e.target.value)}
                                            className="w-full bg-white/10 border border-white/20 focus:border-[#00f5ff]/50 rounded-xl px-5 py-2.5 text-[11px] font-bold outline-none transition-all text-white"
                                            placeholder=" "
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="mt-auto pt-7 border-t border-white/10">
                            {generalError && (
                                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 bg-red-500/20 border border-red-500/40 text-white text-[10px] font-black uppercase tracking-widest rounded-xl flex items-center gap-3">
                                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                                    {generalError}
                                </motion.div>
                            )}

                            <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                <div className="flex flex-col items-center sm:items-start">
                                    <Link href="/auth/login" className="text-[10px] font-black uppercase tracking-[3px] text-white/30 hover:text-[#ccff33] transition-colors italic">Already have an account? Login</Link>
                                </div>

                                <div className="w-full sm:w-auto">
                                    <MagneticWrapper strength={0.2}>
                                        <button
                                            onClick={handleRegister}
                                            disabled={loading}
                                            className="group relative overflow-hidden px-16 py-4 rounded-full bg-white/5 border border-white/10 hover:border-[#ccff33]/60 transition-all duration-700 shadow-xl active:scale-95 hover:scale-[1.02] hover:shadow-[0_0_60px_rgba(204,255,51,0.25)]"
                                        >
                                            {/* 1. LAYER - Infinite Shimmer */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#ccff33]/10 to-transparent animate-shimmer-infinite"></div>

                                            {/* 2. LAYER - Hover Liquid Fill */}
                                            <div className="absolute inset-0 bg-[#ccff33]/0 group-hover:bg-[#ccff33]/15 transition-colors duration-700"></div>

                                            <div className="relative z-10 flex items-center gap-4">
                                                <span className="text-[10px] font-black uppercase tracking-[4px] italic text-[#ccff33] drop-shadow-[0_0_8px_rgba(204,255,51,0.4)]">
                                                    {loading ? "TRANSMITTING..." : "REGISTER ORGANIZATION"}
                                                </span>
                                                {!loading && (
                                                    <motion.div
                                                        animate={{ x: [0, 4, 0] }}
                                                        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                                                        className="text-[#ccff33]"
                                                    >
                                                        <FaArrowRight size={12} />
                                                    </motion.div>
                                                )}
                                            </div>

                                            {/* 3. LAYER - Refractive Bottom Border (Always Visible) */}
                                            <div className="absolute bottom-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#00f5ff]/0 via-[#ccff33] to-[#00f5ff]/0 shadow-[0_0_20px_#ccff33] opacity-50 group-hover:opacity-100 group-hover:h-[3px] transition-all duration-700"></div>
                                        </button>
                                    </MagneticWrapper>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </TiltWrapper>

            {/* OTP MODAL */}
            <AnimatePresence>
                {showOtpModal && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[200] flex items-center justify-center p-6 bg-black/60 backdrop-blur-2xl"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                            className="max-w-md w-full glass-premium p-10 border border-[#ccff33]/30 shadow-[0_0_50px_rgba(204,255,51,0.2)]"
                        >
                            <div className="text-center space-y-2 mb-8">
                                <div className="inline-flex p-3 rounded-2xl bg-[#ccff33]/10 border border-[#ccff33]/20 text-[#ccff33] mb-4">
                                    <FaShieldAlt size={24} />
                                </div>
                                <h1 className="text-xl font-black uppercase tracking-[6px] text-white">Verification</h1>
                                <p className="text-[9px] font-black uppercase tracking-[2px] text-white/40">Sequence transmitted to {orgEmailOwner}</p>
                            </div>

                            <div className="space-y-6">
                                <div className="space-y-4">
                                    <input
                                        type="text" maxLength="6"
                                        placeholder="000000"
                                        value={otp}
                                        onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '')); setOtpError(""); }}
                                        className="w-full bg-white/5 border border-white/10 focus:border-[#ccff33]/50 rounded-2xl py-6 text-center text-3xl font-black tracking-[15px] outline-none transition-all placeholder:text-white/5"
                                    />
                                    {otpError && <div className="text-red-500 text-[9px] font-black uppercase tracking-widest text-center">{otpError}</div>}
                                </div>

                                <button
                                    onClick={handleVerifyOtp} disabled={loading}
                                    className="w-full py-4.5 bg-white/10 hover:bg-[#ccff33]/10 border border-white/20 hover:border-[#ccff33]/50 rounded-2xl text-[11px] font-black uppercase tracking-[4px] italic transition-all"
                                >
                                    {loading ? "Verifying..." : "Verify & Login"}
                                </button>

                                <div className="text-center pt-2">
                                    <button
                                        onClick={handleResendOtp} disabled={otpResendLoading}
                                        className="text-[9px] font-black uppercase tracking-[2px] text-white/20 hover:text-[#ccff33] transition-colors"
                                    >
                                        {otpResendLoading ? "Sending..." : "Resend OTP"}
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Visual Accents */}
            <div className="fixed top-6 left-8 z-[100] pointer-events-none">
                <div className="flex items-baseline gap-1">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#ccff33]/30"></span>
                    <h1 className="text-sm font-black uppercase tracking-[1px] text-[#ccff33] opacity-50 italic drop-shadow-[0_0_10px_rgba(204,255,51,0.3)]">GYMbross</h1>
                </div>
            </div>
            <div className="fixed bottom-8 w-full text-center z-[100] pointer-events-none">
                <div className="text-[8px] font-black uppercase tracking-[15px] text-white/5">PROTOCOL &copy; 2026</div>
            </div>
        </div>
    );
}
