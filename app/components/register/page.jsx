"use client";

import { useState, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { registerOrganization, APIError, verifyOTP, resendOTP } from "@/lib/api";
import { FaDumbbell, FaRunning, FaHeartbeat, FaBicycle, FaUsers, FaVideo, FaMedal, FaStopwatch, FaEye, FaEyeSlash } from "react-icons/fa";

function pad4(n) {
    return String(n).padStart(4, "0");
}

function generateBranchCode(index) {
    return pad4(index);
}

// Strict Validation Helpers
const isValidEmail = (email) => {
    return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email);
};

const isValidPassword = (password) => {
    // Min 8 chars, 1 upper, 1 lower, 1 number, 1 special char
    return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/.test(password);
};

const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[@$!%*?&]/.test(password)) strength++;
    return strength; // Max 5
};

const PasswordStrengthBar = ({ password }) => {
    const strength = getPasswordStrength(password);
    const width = (strength / 5) * 100;
    let color = "red";
    if (strength >= 3) color = "orange";
    if (strength === 5) color = "#00ff88"; // Green

    return (
        <div className="gm-password-strength">
            <div className="gm-strength-bar" style={{ width: `${width}%`, backgroundColor: color }}></div>
            <div className="gm-strength-text" style={{ color: color }}>
                {strength < 3 ? "Weak" : strength < 5 ? "Medium" : "Strong"}
            </div>
            <style jsx>{`
                .gm-password-strength {
                    margin-top: 5px;
                    margin-bottom: 15px;
                }
                .gm-strength-bar {
                    height: 4px;
                    border-radius: 2px;
                    transition: all 0.3s;
                }
                .gm-strength-text {
                    font-size: 12px;
                    text-align: right;
                    margin-top: 2px;
                }
            `}</style>
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

    // Branch State (Start with 1 empty branch)
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

    // --- Validation Logic ---

    const validate = () => {
        let newErrors = {};
        let isValid = true;
        let firstInvalidBranchIndex = -1;

        // Org Validation
        if (!orgName.trim()) {
            newErrors.orgName = "Organization Name is required";
            isValid = false;
        }
        if (!isValidEmail(orgEmailOwner)) {
            newErrors.orgEmailOwner = "Enter a valid email address";
            isValid = false;
        }
        if (orgNumber.length !== 10) {
            newErrors.orgNumber = "Contact number must be exactly 10 digits";
            isValid = false;
        }
        if (!isValidPassword(orgPassword)) {
            newErrors.orgPassword = "Password must be at least 8 chars with 1 upper, 1 lower, 1 number, 1 special char";
            isValid = false;
        }
        if (orgPassword !== confOrgPassword) {
            newErrors.confOrgPassword = "Passwords do not match";
            isValid = false;
        }

        // Branch Validation
        branches.forEach((b, i) => {
            if (!b.name.trim()) {
                newErrors[`branch_${i}_name`] = "Branch Name is required";
                isValid = false;
                if (firstInvalidBranchIndex === -1) firstInvalidBranchIndex = i;
            }
            if (!isValidEmail(b.adminEmail)) {
                newErrors[`branch_${i}_adminEmail`] = "Enter a valid email address";
                isValid = false;
                if (firstInvalidBranchIndex === -1) firstInvalidBranchIndex = i;
            }
            if (!isValidPassword(b.password)) {
                newErrors[`branch_${i}_password`] = "Password is too weak";
                isValid = false;
                if (firstInvalidBranchIndex === -1) firstInvalidBranchIndex = i;
            }
            if (b.password !== b.confirmPassword) {
                newErrors[`branch_${i}_confirmPassword`] = "Passwords do not match";
                isValid = false;
                if (firstInvalidBranchIndex === -1) firstInvalidBranchIndex = i;
            }
        });

        setErrors(newErrors);

        // Auto-switch to first invalid branch if org details are fine but branch has error
        if (!isValid && firstInvalidBranchIndex !== -1) {
            setActiveBranchIndex(firstInvalidBranchIndex);
        }

        return isValid;
    };

    // --- Branch Logic ---

    const activeBranch = branches[activeBranchIndex] || {};

    const updateActiveBranch = (field, value) => {
        const updatedBranches = [...branches];
        if (updatedBranches[activeBranchIndex]) {
            updatedBranches[activeBranchIndex] = { ...updatedBranches[activeBranchIndex], [field]: value };
            setBranches(updatedBranches);

            // Clear error for this field
            if (errors[`branch_${activeBranchIndex}_${field}`]) {
                setErrors(prev => {
                    const newErrs = { ...prev };
                    delete newErrs[`branch_${activeBranchIndex}_${field}`];
                    return newErrs;
                });
            }
        }
    };

    const addBranchTab = () => {
        const newBranch = {
            id: Date.now(),
            code: generateBranchCode(branches.length + 1),
            name: "",
            adminEmail: "",
            password: "",
            confirmPassword: ""
        };
        setBranches([...branches, newBranch]);
        setActiveBranchIndex(branches.length); // Switch to new tab
    };

    const removeBranch = (e, index) => {
        e.stopPropagation(); // Prevent tab switch
        if (branches.length <= 1) {
            alert("You must have at least one branch.");
            return;
        }
        const updatedBranches = branches.filter((_, i) => i !== index);
        setBranches(updatedBranches);
        // Adjust active index if needed
        if (activeBranchIndex >= updatedBranches.length) {
            setActiveBranchIndex(updatedBranches.length - 1);
        }
    };

    const handleFieldChange = (setter, fieldName, value) => {
        setter(value);
        if (errors[fieldName]) {
            setErrors(prev => {
                const newErrs = { ...prev };
                delete newErrs[fieldName];
                return newErrs;
            });
        }
        setGeneralError("");
    };

    const handleRegister = async () => {
        setGeneralError("");
        if (!validate()) {
            setGeneralError("Please Fill All The Required Fields.");
            return;
        }

        setLoading(true);

        // Prepare Payload
        const payload = {
            name: orgName,
            ownerEmail: orgEmailOwner,
            phone: orgNumber,
            password: orgPassword,
            branches: branches.map(b => ({
                name: b.name,
                adminEmail: b.adminEmail,
                password: b.password
            }))
        };

        try {
            const response = await registerOrganization(payload);
            setSubmitted(true);
            setRegisteredOrgId(response.organizationId);
            setShowOtpModal(true); // Show OTP Modal
        } catch (err) {
            console.error("Registration Error:", err);
            if (err instanceof APIError) {
                if (err.status === 400 && err.errors && err.errors.length > 0) {
                    // Map backend validation errors to fields if possible
                    // For now, just show them in the general box nicely
                    const msg = err.errors.map(e => `${e.field}: ${e.message}`).join(', ');
                    setGeneralError(`Validation Failed: ${msg}`);
                } else if (err.status === 403) {
                    setGeneralError("Access Forbidden. Please check CORS or security settings.");
                } else if (err.message && err.message.includes("unique result")) {
                    setGeneralError("Account conflict detected. This email or phone may already exist multiple times. Please contact support.");
                } else {
                    setGeneralError(err.message || "Registration failed. Please try again.");
                }
            } else {
                setGeneralError("An unexpected error occurred. Please try again.");
            }
        } finally {
            setLoading(false);
        }
    };

    const branchHasError = (index) => {
        return Object.keys(errors).some(key => key.startsWith(`branch_${index}_`));
    };

    // --- OTP Handlers ---

    const handleVerifyOtp = async () => {
        setOtpError("");
        if (!otp || otp.length < 6) {
            setOtpError("Please enter a valid 6-digit OTP.");
            return;
        }

        setLoading(true);
        try {
            await verifyOTP({
                organizationId: registeredOrgId,
                otpCode: otp
            });
            alert("Verification Successful! You can now login.");
            router.push('/auth/login');
        } catch (err) {
            console.error(err);
            setOtpError(err.message || "Invalid OTP. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleResendOtp = async () => {
        setOtpError("");
        setOtpResendLoading(true);
        try {
            await resendOTP({
                organizationId: registeredOrgId
            });
            alert("OTP Resent Successfully!");
        } catch (err) {
            setOtpError(err.message || "Failed to resend OTP.");
        } finally {
            setOtpResendLoading(false);
        }
    };

    return (
        <>
            {/* Background Slider - Absolute Positioned */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 z-10"></div>
                {/* Slide Zoom Animation */}
                <div className="absolute inset-0 animate-ken-burns">
                    <img src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop" className="w-full h-full object-cover" alt="Gym Background" />
                </div>
            </div>

            <div className="gm-register-container relative z-10">
                <style jsx global>{`
                    /* Error Styles */
                    .form-error-msg {
                        color: #ff4d4d;
                        font-size: 12px;
                        margin-top: 4px;
                        display: block;
                        font-weight: 500;
                        text-align: left;
                    }
                    .input-error-border input {
                        border-color: #ff4d4d !important;
                    }
                    .general-error-banner {
                        background: rgba(255, 77, 77, 0.15);
                        border: 1px solid #ff4d4d;
                        color: #ff4d4d;
                        padding: 15px;
                        border-radius: 12px;
                        margin-bottom: 25px;
                        text-align: center;
                        font-weight: 600;
                        backdrop-filter: blur(5px);
                    }
                    .tab-error-indicator {
                        width: 8px;
                        height: 8px;
                        background-color: #ff4d4d;
                        border-radius: 50%;
                        margin-left: 5px;
                    }
                `}</style>

                <div className="gm-register-wrapper">
                    {/* Header */}
                    <div className="gm-header-box">
                        <div>
                            <h1 className="gm-slogan-title">Setup Your Organization</h1>
                            <div className="gm-uniq-code">Total Branches: {branches.length}</div>
                        </div>
                        <div className="gm-header-right">
                            <div className="gm-branch-list">
                                {branches.map((b, i) => (
                                    <div key={b.id} className="gm-branch-pill">
                                        {b.name || `Branch ${b.code}`}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {generalError && (
                        <div className="general-error-banner">
                            {generalError}
                        </div>
                    )}

                    <div className="gm-main-content">
                        {/* Left Panel: Organization Info */}
                        <div className="gm-panel gm-left-panel">
                            <h3 className="gm-section-title">Organization Details</h3>

                            <div className={`float-box ${errors.orgName ? "input-error-border" : ""}`}>
                                <input
                                    type="text"
                                    value={orgName}
                                    onChange={(e) => handleFieldChange(setOrgName, "orgName", e.target.value)}
                                    placeholder=" "
                                />
                                <label>Organization Name</label>
                                {errors.orgName && <span className="form-error-msg">{errors.orgName}</span>}
                            </div>

                            <div className={`float-box ${errors.orgEmailOwner ? "input-error-border" : ""}`}>
                                <input
                                    type="email"
                                    value={orgEmailOwner}
                                    onChange={(e) => handleFieldChange(setOrgEmailOwner, "orgEmailOwner", e.target.value)}
                                    placeholder=" "
                                />
                                <label>Owner Email</label>
                                {errors.orgEmailOwner && <span className="form-error-msg">{errors.orgEmailOwner}</span>}
                            </div>

                            <div className={`float-box ${errors.orgNumber ? "input-error-border" : ""}`}>
                                <input
                                    type="text"
                                    value={orgNumber}
                                    onChange={(e) => {
                                        const val = e.target.value.replace(/\D/g, '').slice(0, 10);
                                        handleFieldChange(setOrgNumber, "orgNumber", val);
                                    }}
                                    placeholder=" "
                                />
                                <label>Contact Number (10-digit)</label>
                                {errors.orgNumber && <span className="form-error-msg">{errors.orgNumber}</span>}
                            </div>

                            <div className={`float-box ${errors.orgPassword ? "input-error-border" : ""}`}>
                                <input
                                    type={showOrgPass ? "text" : "password"}
                                    value={orgPassword}
                                    onChange={(e) => handleFieldChange(setOrgPassword, "orgPassword", e.target.value)}
                                    placeholder=" "
                                />
                                <label>Strong Password</label>
                                <span
                                    onClick={() => setShowOrgPass(!showOrgPass)}
                                    className="gm-show-pass-btn"
                                >
                                    {showOrgPass ? <FaEyeSlash /> : <FaEye />}
                                </span>
                                <PasswordStrengthBar password={orgPassword} />
                                {errors.orgPassword && <span className="form-error-msg">{errors.orgPassword}</span>}
                            </div>

                            <div className={`float-box ${errors.confOrgPassword ? "input-error-border" : ""}`}>
                                <input
                                    type="password"
                                    value={confOrgPassword}
                                    onChange={(e) => handleFieldChange(setConfOrgPassword, "confOrgPassword", e.target.value)}
                                    placeholder=" "
                                />
                                <label>Confirm Password</label>
                                {errors.confOrgPassword && <span className="form-error-msg">{errors.confOrgPassword}</span>}
                            </div>
                        </div>

                        {/* Right Column: Branch Info */}
                        <div className="gm-right-column">
                            <div className="gm-panel gm-branch-card">
                                <div className="gm-tabs">
                                    {branches.map((b, i) => (
                                        <div
                                            key={b.id}
                                            className={`gm-tab ${activeBranchIndex === i ? "active" : ""}`}
                                            onClick={() => setActiveBranchIndex(i)}
                                        >
                                            <span>{b.name || `Branch ${b.code}`}</span>
                                            {branchHasError(i) && <span className="tab-error-indicator" title="Errors in this branch"></span>}
                                            {branches.length > 1 && (
                                                <span className="gm-remove-tab" onClick={(e) => removeBranch(e, i)}>×</span>
                                            )}
                                        </div>
                                    ))}
                                    <button className="gm-add-tab-btn" onClick={addBranchTab}>+ Add Branch</button>
                                </div>

                                <h3 className="gm-section-title">Branch Details ({activeBranch.code})</h3>

                                <div className="gm-grid-2">
                                    <div className={`float-box ${errors[`branch_${activeBranchIndex}_name`] ? "input-error-border" : ""}`}>
                                        <input
                                            type="text"
                                            value={activeBranch.name}
                                            onChange={(e) => updateActiveBranch("name", e.target.value)}
                                            placeholder=" "
                                        />
                                        <label>Branch Name</label>
                                        {errors[`branch_${activeBranchIndex}_name`] && <span className="form-error-msg">{errors[`branch_${activeBranchIndex}_name`]}</span>}
                                    </div>
                                    <div className={`float-box ${errors[`branch_${activeBranchIndex}_adminEmail`] ? "input-error-border" : ""}`}>
                                        <input
                                            type="email"
                                            value={activeBranch.adminEmail}
                                            onChange={(e) => updateActiveBranch("adminEmail", e.target.value)}
                                            placeholder=" "
                                        />
                                        <label>Admin Email</label>
                                        {errors[`branch_${activeBranchIndex}_adminEmail`] && <span className="form-error-msg">{errors[`branch_${activeBranchIndex}_adminEmail`]}</span>}
                                    </div>
                                </div>

                                <div className="gm-grid-2">
                                    <div className={`float-box ${errors[`branch_${activeBranchIndex}_password`] ? "input-error-border" : ""}`}>
                                        <input
                                            type={branchShowPass ? "text" : "password"}
                                            value={activeBranch.password}
                                            onChange={(e) => updateActiveBranch("password", e.target.value)}
                                            placeholder=" "
                                        />
                                        <label>Branch Password</label>
                                        <span
                                            onClick={() => setBranchShowPass(!branchShowPass)}
                                            style={{
                                                position: "absolute",
                                                right: "14px",
                                                top: "27px",
                                                transform: "translateY(-50%)",
                                                color: "#a0a0a0",
                                                cursor: "pointer",
                                                fontSize: "14px",
                                                zIndex: 10
                                            }}
                                        >
                                            {branchShowPass ? <FaEyeSlash /> : <FaEye />}
                                        </span>
                                        <PasswordStrengthBar password={activeBranch.password} />
                                        {errors[`branch_${activeBranchIndex}_password`] && <span className="form-error-msg">{errors[`branch_${activeBranchIndex}_password`]}</span>}
                                    </div>
                                    <div className={`float-box ${errors[`branch_${activeBranchIndex}_confirmPassword`] ? "input-error-border" : ""}`}>
                                        <input
                                            type="password"
                                            value={activeBranch.confirmPassword}
                                            onChange={(e) => updateActiveBranch("confirmPassword", e.target.value)}
                                            placeholder=" "
                                        />
                                        <label>Confirm Branch Password</label>
                                        {errors[`branch_${activeBranchIndex}_confirmPassword`] && <span className="form-error-msg">{errors[`branch_${activeBranchIndex}_confirmPassword`]}</span>}
                                    </div>
                                </div>

                                <div className="gm-register-action">
                                    <button className={`gm-primary-btn full-width ${loading ? "loading" : ""}`} onClick={handleRegister} disabled={loading}>
                                        {loading ? "Registering..." : "Register Organization"}
                                    </button>
                                    <div className="gm-login-link">
                                        Already have an account? <Link href="/auth/login">Login</Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* OTP MODAL */}
                {showOtpModal && (
                    <div className="otp-modal-overlay">
                        <div className="otp-modal">
                            <h2>Verify Your Email</h2>
                            <p>We have sent a verification code to <strong>{orgEmailOwner}</strong></p>

                            {otpError && <div className="otp-error-msg">{otpError}</div>}

                            <div className="otp-input-group">
                                <input
                                    type="text"
                                    maxLength="6"
                                    placeholder="Enter 6-digit OTP"
                                    value={otp}
                                    onChange={(e) => {
                                        setOtp(e.target.value.replace(/\D/g, ''));
                                        setOtpError("");
                                    }}
                                />
                            </div>

                            <button className="gm-primary-btn full-width" onClick={handleVerifyOtp} disabled={loading}>
                                {loading ? "Verifying..." : "Verify & Login"}
                            </button>

                            <div className="resend-link">
                                Didn't receive code?
                                <button onClick={handleResendOtp} disabled={otpResendLoading}>
                                    {otpResendLoading ? "Sending..." : "Resend OTP"}
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                <style jsx global>{`
                    @keyframes ken-burns {
                        0% { transform: scale(1); }
                        100% { transform: scale(1.1); }
                    }
                    .animate-ken-burns {
                        animation: ken-burns 20s ease-in-out infinite alternate;
                    }

                    /* ENHANCED ANIMATIONS */
                    @keyframes float {
                        0%, 100% { transform: translateY(0) rotate(0deg); }
                        50% { transform: translateY(-20px) rotate(10deg); }
                    }
                    @keyframes float-reverse {
                        0%, 100% { transform: translateY(0) rotate(0deg) scale(1); }
                        50% { transform: translateY(20px) rotate(-10deg) scale(1.1); }
                    }
                    @keyframes pulse-glow {
                        0%, 100% { opacity: 0.15; transform: scale(1); }
                        50% { opacity: 0.3; transform: scale(1.2); }
                    }
                    
                    .floating-icon {
                        position: absolute;
                        color: rgba(217, 250, 112, 0.15); /* Light Lime */
                        z-index: 5;
                    }
                    .anim-float { animation: float 6s ease-in-out infinite; }
                    .anim-float-rev { animation: float-reverse 7s ease-in-out infinite; }
                    .anim-pulse { animation: pulse-glow 4s ease-in-out infinite; }

                    /* OTP Modal Styles */
                    .otp-modal-overlay {
                        position: fixed;
                        top: 0;
                        left: 0;
                        width: 100%;
                        height: 100%;
                        background: rgba(0,0,0,0.7);
                        backdrop-filter: blur(8px);
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        z-index: 1000;
                    }
                    .otp-modal {
                        background: #1a1a1a;
                        padding: 30px;
                        border-radius: 20px;
                        border: 1px solid var(--primary);
                        width: 90%;
                        max-width: 400px;
                        text-align: center;
                        color: white;
                        box-shadow: 0 0 20px rgba(217, 250, 112, 0.2);
                    }
                    .otp-modal h2 {
                        margin-bottom: 10px;
                        color: var(--primary);
                    }
                    .otp-modal p {
                        margin-bottom: 20px;
                        color: #ccc;
                        font-size: 14px;
                    }
                    .otp-input-group input {
                        width: 100%;
                        padding: 12px;
                        font-size: 20px;
                        letter-spacing: 5px;
                        text-align: center;
                        border-radius: 10px;
                        border: 1px solid #444;
                        background: #333;
                        color: white;
                        margin-bottom: 20px;
                    }
                    .otp-input-group input:focus {
                        border-color: var(--primary);
                        outline: none;
                    }
                    .otp-error-msg {
                        color: #ff4d4d;
                        background: rgba(255, 77, 77, 0.1);
                        padding: 8px;
                        border-radius: 6px;
                        margin-bottom: 15px;
                        font-size: 13px;
                    }
                    .resend-link {
                        margin-top: 15px;
                        font-size: 13px;
                        color: #aaa;
                    }
                    .resend-link button {
                        background: none;
                        border: none;
                        color: var(--primary);
                        cursor: pointer;
                        font-weight: bold;
                        margin-left: 5px;
                    }
                    .resend-link button:disabled {
                        opacity: 0.5;
                        cursor: not-allowed;
                    }
                `}</style>

                {/* ENHANCED FLOATING ICONS OVERLAY */}
                <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
                    {/* Top Left Cluster */}
                    <FaDumbbell className="floating-icon anim-float" style={{ top: '10%', left: '8%', fontSize: '60px', animationDelay: '0s' }} />
                    <FaUsers className="floating-icon anim-float-rev" style={{ top: '15%', left: '20%', fontSize: '50px', animationDelay: '2s' }} />

                    {/* Top Right Cluster */}
                    <FaRunning className="floating-icon anim-float" style={{ top: '8%', right: '12%', fontSize: '80px', animationDelay: '1s' }} />
                    <FaVideo className="floating-icon anim-pulse" style={{ top: '25%', right: '8%', fontSize: '60px', animationDelay: '3s' }} />

                    {/* Center Area (Subtle) */}
                    <FaHeartbeat className="floating-icon anim-float" style={{ top: '45%', left: '15%', fontSize: '100px', opacity: 0.1, animationDelay: '4s' }} />
                    <FaMedal className="floating-icon anim-float-rev" style={{ top: '55%', right: '18%', fontSize: '90px', opacity: 0.1, animationDelay: '1.5s' }} />

                    {/* Bottom Left Cluster */}
                    <FaBicycle className="floating-icon anim-float" style={{ bottom: '15%', left: '10%', fontSize: '70px', animationDelay: '2s' }} />
                    <FaStopwatch className="floating-icon anim-pulse" style={{ bottom: '25%', left: '25%', fontSize: '50px', animationDelay: '0.5s' }} />

                    {/* Bottom Right Cluster */}
                    <FaDumbbell className="floating-icon anim-float-rev" style={{ bottom: '10%', right: '25%', fontSize: '65px', animationDelay: '3.5s' }} />
                    <FaRunning className="floating-icon anim-float" style={{ bottom: '20%', right: '5%', fontSize: '60px', animationDelay: '5s' }} />
                </div>

                <style jsx>{`
                    .gm-register-container {
                        /* removed background image - handled by ken-burns div */
                        position: relative;
                        padding: 40px 20px;
                        min-height: 100vh;
                        display: flex;
                        justify-content: center;
                    }
                    .gm-register-wrapper {
                        position: relative;
                        z-index: 2;
                        width: 100%;
                        max-width: 1200px;
                    }

                    /* GLASS VARS */
                    .gm-header-box, .gm-panel {
                        background: rgba(255, 255, 255, 0.85); /* Light glass */
                        border: 1px solid rgba(255, 255, 255, 0.5);
                        border-radius: 20px;
                        backdrop-filter: blur(20px);
                        -webkit-backdrop-filter: blur(20px);
                        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
                        padding: 30px;
                    }

                    .gm-header-box {
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-start;
                        margin-bottom: 20px;
                        padding: 20px;
                    }

                    .gm-slogan-title {
                        font-size: 24px;
                        color: var(--text);
                        margin: 0 0 10px 0;
                        font-weight: 700;
                    }
                    .gm-uniq-code {
                        border: 1px solid var(--border-color);
                        padding: 8px 16px;
                        border-radius: 10px;
                        display: inline-block;
                        color: var(--text-secondary);
                        font-size: 14px;
                        background: var(--bg-dark);
                    }

                    .gm-branch-list {
                        display: flex;
                        gap: 10px;
                        overflow-x: auto;
                        padding-bottom: 5px;
                    }
                    .gm-branch-pill {
                        border: 1px solid var(--primary-dark);
                        padding: 6px 12px;
                        border-radius: 8px;
                        color: var(--primary-dark);
                        font-size: 14px;
                        background: rgba(217, 250, 112, 0.2);
                        font-weight: 600;
                        white-space: nowrap;
                    }

                    /* FLOATING LABEL INPUT (FLOAT-BOX) */
                    .float-box {
                        position: relative;
                        margin-bottom: 24px;
                    }
                    
                    .float-box input {
                        width: 100%;
                        padding: 16px 14px;
                        background: var(--bg-dark);
                        border-radius: 12px;
                        border: 1.5px solid var(--border-color);
                        color: var(--text);
                        font-size: 16px;
                        transition: all 0.25s ease;
                    }
                    
                    /* hover glow */
                    .float-box input:hover {
                        border-color: var(--primary-dark);
                    }
                    
                    /* focus glow */
                    .float-box input:focus {
                        border-color: var(--primary-dark);
                        box-shadow: 0 0 12px rgba(217, 250, 112, 0.3);
                        outline: none;
                    }
                    
                    /* HIDE placeholder */
                    .float-box input::placeholder {
                        opacity: 0;
                    }
                    
                    /* LABEL STYLE */
                    .float-box label {
                        position: absolute;
                        left: 14px;
                        top: 17px;
                        font-size: 16px;
                        color: var(--text-secondary);
                        transition: 0.25s;
                        pointer-events: none;
                        font-weight: 500;
                    }
                    
                    /* FLOAT ON TYPING OR FOCUS */
                    .float-box input:focus+label,
                    .float-box input:not(:placeholder-shown)+label {
                        top: -8px;
                        font-size: 12px;
                        color: #4d7c0f; /* Darker Green */
                        background: var(--bg-dark);
                        padding: 0 6px;
                        font-weight: 600;
                        z-index: 5;
                    }

                    /* SHOW PASS BUTTON */
                    .gm-show-pass-btn {
                        position: absolute;
                        right: 14px;
                        top: 27px;
                        transform: translateY(-50%);
                        background: none;
                        border: none;
                        color: var(--text-secondary);
                        cursor: pointer;
                        font-size: 14px;
                        font-weight: 600;
                        z-index: 10;
                    }
                    .gm-show-pass-btn:hover {
                        color: var(--primary-dark);
                    }

                    /* MAIN LAYOUT */
                    .gm-main-content {
                        display: flex;
                        gap: 20px;
                    }
                    .gm-left-panel {
                        width: 350px;
                        display: flex;
                        flex-direction: column;
                    }
                    .gm-right-column {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                        min-width: 0;
                    }
                    .gm-branch-card {
                        flex: 1;
                        display: flex;
                        flex-direction: column;
                    }

                    .gm-section-title {
                        font-size: 18px;
                        margin-bottom: 20px;
                        color: var(--text);
                        border-bottom: 1px solid var(--border-color);
                        padding-bottom: 10px;
                        font-weight: 700;
                    }
                    .gm-grid-2 {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                    }

                    /* TABS */
                    .gm-tabs {
                        display: flex;
                        gap: 10px;
                        border-bottom: 1px solid var(--border-color);
                        padding-bottom: 15px;
                        margin-bottom: 20px;
                        overflow-x: auto;
                    }
                    .gm-tab {
                        padding: 8px 16px;
                        background: var(--bg-darker);
                        border-radius: 8px;
                        cursor: pointer;
                        color: var(--text-secondary);
                        white-space: nowrap;
                        transition: all 0.2s;
                        display: flex;
                        align-items: center;
                        gap: 8px;
                        font-weight: 500;
                        border: 1px solid transparent;
                    }
                    .gm-tab:hover {
                        border-color: var(--primary);
                        color: var(--primary-dark);
                    }
                    .gm-tab.active {
                        background: var(--primary);
                        color: #000;
                        font-weight: bold;
                        box-shadow: 0 4px 12px rgba(217, 250, 112, 0.3);
                    }
                    .gm-remove-tab {
                        font-size: 16px;
                        opacity: 0.5;
                    }
                    .gm-remove-tab:hover {
                        opacity: 1;
                        color: #d32f2f;
                    }
                    .gm-add-tab-btn {
                        padding: 8px 12px;
                        background: transparent;
                        border: 1px dashed var(--text-secondary);
                        color: var(--text-secondary);
                        border-radius: 8px;
                        cursor: pointer;
                        font-size: 14px;
                    }
                    .gm-add-tab-btn:hover {
                        border-color: var(--primary-dark);
                        color: var(--primary-dark);
                        background: rgba(217, 250, 112, 0.1);
                    }

                    /* ACTIONS */
                    .gm-register-action {
                        margin-top: auto;
                        padding-top: 20px;
                        border-top: 1px solid var(--border-color);
                    }
                    .gm-primary-btn {
                        background: var(--primary);
                        color: #000;
                        border: none;
                        padding: 14px 24px;
                        border-radius: 12px;
                        font-weight: bold;
                        cursor: pointer;
                        font-size: 16px;
                        transition: all 0.3s;
                        text-transform: uppercase;
                        letter-spacing: 0.5px;
                    }
                    .gm-primary-btn:hover {
                        background: var(--primary-dark);
                        box-shadow: 0 4px 14px rgba(217, 250, 112, 0.4);
                        transform: translateY(-1px);
                    }
                    .gm-primary-btn.full-width {
                        width: 100%;
                    }
                    .gm-login-link {
                        margin-top: 20px;
                        text-align: center;
                        font-size: 14px;
                        color: var(--text-secondary);
                    }
                    .gm-login-link a {
                        color: var(--primary-dark);
                        text-decoration: none;
                        font-weight: bold;
                    }
                    .gm-login-link a:hover {
                        text-decoration: underline;
                    }

                    @media(max-width: 900px) {
                        .gm-main-content {
                            flex-direction: column;
                        }
                        .gm-left-panel {
                            width: 100%;
                        }
                        .gm-grid-2 {
                            grid-template-columns: 1fr;
                        }
                    }
                `}</style>
            </div >
        </>
    );
}
