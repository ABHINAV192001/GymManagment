"use client";



import { useState } from "react"; // Rebuild
import Link from "next/link";
import { login } from "@/lib/api";
import { useRouter } from "next/navigation";
import { FaDumbbell, FaRunning, FaHeartbeat, FaBicycle, FaEye, FaEyeSlash } from "react-icons/fa";
import "@/app/components/login/login.css"; // Import the CSS from its original location

export default function Login() {
    const router = useRouter();
    const [identifier, setIdentifier] = useState("");
    const [password, setPassword] = useState("");
    const [showPass, setShowPass] = useState(false);
    const [loading, setLoading] = useState(false);

    // Detailed error state
    const [errors, setErrors] = useState({});
    const [generalError, setGeneralError] = useState("");

    const validateForm = () => {
        let newErrors = {};
        let isValid = true;

        if (!identifier.trim()) {
            newErrors.identifier = "Username or Email is required";
            isValid = false;
        }

        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
        if (!password) {
            newErrors.password = "Password is required";
            isValid = false;
        } else if (!passwordRegex.test(password)) {
            newErrors.password = "Password must be 8+ chars, 1 upper, 1 lower, 1 number, 1 special char";
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

            if (role === 'USER' || role === 'PREMIUM_USER') {
                if (isOnboardingCompleted) {
                    router.push('/user');
                } else {
                    router.push('/user/onboarding');
                }
            } else if (role === 'TRAINER') {
                router.push('/branch/trainer-dashboard');
            } else if (role === 'ORG_ADMIN' || role === 'OWNER' || role === 'ADMIN' || role === 'SUPER_ADMIN') {
                router.push('/admin/dashboard');
            } else {
                // Default for BRANCH_ADMIN, Receptionist, Staff etc.
                router.push('/branch/dashboard');
            }
        } catch (err) {
            console.error("Login Error:", err);
            // Handle different types of errors
            if (err.message && err.message.toLowerCase().includes("credentials")) {
                setGeneralError("Invalid username or password. Please try again.");
            } else if (err.message && err.message.toLowerCase().includes("network")) {
                setGeneralError("Network error. Please check your internet connection.");
            } else {
                setGeneralError(err.message || "An unexpected error occurred. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    // Clear errors on change
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

    return (
        <>
            {/* Background Slider - Absolute Positioned */}
            <div className="absolute inset-0 z-0 overflow-hidden bg-black">
                {/* Overlay */}
                <div className="absolute inset-0 bg-black/50 z-10"></div>

                {/* Slide Zoom Animation */}
                <div className="absolute inset-0 animate-ken-burns">
                    <img
                        src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=2070&auto=format&fit=crop"
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
                        color: rgba(217, 250, 112, 0.15); /* Light Lime, very transparent */
                        animation: float 6s ease-in-out infinite;
                        z-index: 5;
                    }
                    /* Error Styles */
                    .error-text {
                        color: #ff4d4d;
                        font-size: 13px;
                        margin-top: 5px;
                        margin-left: 2px;
                        display: block;
                        font-weight: 500;
                    }
                    .input-error input {
                        border-color: #ff4d4d !important;
                    }
                    .general-error-box {
                        background: rgba(255, 77, 77, 0.1);
                        border: 1px solid #ff4d4d;
                        color: #ff4d4d;
                        padding: 12px;
                        border-radius: 8px;
                        margin-bottom: 20px;
                        font-size: 14px;
                        text-align: center;
                    }
                `}</style>

                {/* Floating Icons Overlay */}
                <div className="absolute inset-0 z-5 pointer-events-none overflow-hidden">
                    <FaDumbbell className="floating-icon" style={{ top: '10%', left: '10%', fontSize: '60px', animationDelay: '0s' }} />
                    <FaRunning className="floating-icon" style={{ top: '20%', right: '15%', fontSize: '80px', animationDelay: '2s' }} />
                    <FaHeartbeat className="floating-icon" style={{ bottom: '15%', left: '20%', fontSize: '100px', animationDelay: '4s' }} />
                    <FaBicycle className="floating-icon" style={{ bottom: '25%', right: '10%', fontSize: '70px', animationDelay: '1s' }} />
                    <FaDumbbell className="floating-icon" style={{ top: '50%', left: '50%', fontSize: '140px', animationDelay: '3s', opacity: 0.05 }} />
                    <FaRunning className="floating-icon" style={{ top: '80%', left: '5%', fontSize: '50px', animationDelay: '5s' }} />
                </div>

                <div className="login-container">

                    {/* LEFT SECTION */}
                    <div className="login-left">
                        <div className="login-left-title">Login to manage your GYM :-</div>
                        <div className="login-left-line"></div>
                        <div className="login-left-text">
                            Welcome to the Gym Manager Dashboard.
                            Easily track members, subscriptions,
                            trainers, and multi-branch management.
                            Enter your login details to continue.
                        </div>
                    </div>

                    {/* RIGHT SECTION */}
                    <div className="login-right">

                        {generalError && (
                            <div className="general-error-box">
                                {generalError}
                            </div>
                        )}

                        {/* USERNAME */}
                        <div className={`float-box ${errors.identifier ? "input-error" : ""}`}>
                            <input
                                type="text"
                                placeholder=" "
                                value={identifier}
                                onChange={handleIdentifierChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                            <label>Username / Email</label>
                            {errors.identifier && <span className="error-text">{errors.identifier}</span>}
                        </div>

                        {/* PASSWORD */}
                        <div className={`float-box ${errors.password ? "input-error" : ""}`}>
                            <input
                                type={showPass ? "text" : "password"}
                                placeholder=" "
                                value={password}
                                onChange={handlePasswordChange}
                                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                            />
                            <label>Password</label>

                            <span
                                className="eye-btn"
                                onClick={() => setShowPass(!showPass)}
                                style={{
                                    position: "absolute",
                                    right: "14px",
                                    top: errors.password ? "35%" : "50%", /* Adjust position if error text is present */
                                    transform: "translateY(-50%)",
                                    cursor: "pointer",
                                    fontSize: "18px",
                                    color: "#a0a0a0"
                                }}
                            >
                                {showPass ? <FaEyeSlash /> : <FaEye />}
                            </span>
                            {errors.password && <span className="error-text">{errors.password}</span>}
                        </div>

                        <div className="login-links">
                            <Link href="/auth/forgot-password">Forget password?</Link>
                        </div>

                        <button
                            className={`login-btn ${loading ? "loading" : ""}`}
                            onClick={handleLogin}
                            disabled={loading}
                        >
                            {loading ? "Verifying..." : "Login To Your Account"}
                        </button>

                        <div className="create-account">
                            <Link href="/auth/register/organization">Create new account</Link>
                        </div>

                    </div>
                </div>
            </div>
        </>
    );
}
