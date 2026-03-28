"use client";

import { useState } from "react";
import Link from "next/link";
import "./login.css";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [submitted, setSubmitted] = useState(false);
    const [showPass, setShowPass] = useState(false);

    const isUsernameValid = username.trim().length > 6;
    const isPasswordValid = password.trim().length > 8;

    const canLogin = isUsernameValid && isPasswordValid;

    const handleLogin = () => {
        setSubmitted(true);
        if (!canLogin) return;

        alert("Logged in! (simulation)");
    };

    return (
        <div className="login-wrapper">
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

                    {/* USERNAME */}
                    <div className={`float-box ${submitted && !isUsernameValid ? "error-input" : ""}`}>
                        <input
                            type="text"
                            placeholder=" "
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                        />
                        <label>Username / Email</label>
                    </div>

                    {submitted && !isUsernameValid && (
                        <p className="error-text">Must be at least 7 characters.</p>
                    )}

                    {/* PASSWORD */}
                    <div className={`float-box ${submitted && !isPasswordValid ? "error-input" : ""}`}>
                        <input
                            type={showPass ? "text" : "password"}
                            placeholder=" "
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                        />
                        <label>Password</label>

                        <span
                            className="eye-btn"
                            onClick={() => setShowPass(!showPass)}
                            style={{
                                position: "absolute",
                                right: "14px",
                                top: "50%",
                                transform: "translateY(-50%)",
                                cursor: "pointer",
                                fontSize: "18px",
                            }}
                        >
                            {showPass ? "🙈" : "👁️"}
                        </span>
                    </div>

                    {submitted && !isPasswordValid && (
                        <p className="error-text">Password must be at least 9 characters.</p>
                    )}

                    {/* FORGOT PASSWORD */}
                    <div className="login-links">
                        <Link href="#">Forget password?</Link>
                    </div>

                    {/* LOGIN BUTTON */}
                    <button
                        className={`login-btn ${canLogin ? "active" : ""}`}
                        onClick={handleLogin}
                    >
                        Login To Your Account
                    </button>

                    {/* CREATE ACCOUNT */}
                    <div className="create-account">
                        <Link href="/components/register">Create new account</Link>
                    </div>

                </div>
            </div>
        </div>
    );
}
