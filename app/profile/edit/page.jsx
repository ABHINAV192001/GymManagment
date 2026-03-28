"use client";

import React, { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/lib/api/user";
import Navbar from "@/app/components/Navbar";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/Avatar";
import Button from "@/components/ui/Button";
import { CircleUser, Copy, Save, X, Camera } from "lucide-react";
import { Toaster, toast } from "sonner";

export default function ProfileEditPage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const router = useRouter();

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            const data = await getProfile();
            setProfile(data);
        } catch (err) {
            console.error("Profile load error:", err);
            if (err.response && (err.response.status === 401 || err.response.status === 403)) {
                router.push("/auth/login");
                return;
            }
            toast.error("Failed to load profile.");
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type } = e.target;

        let finalValue = value;
        if (type === "number") {
            if (name === "age") {
                finalValue = value === "" ? null : parseInt(value, 10);
            } else {
                finalValue = value === "" ? null : Number(value);
            }
        }

        setProfile(prev => ({ ...prev, [name]: finalValue }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            await updateProfile(profile);
            toast.success("Profile updated successfully!");
            setTimeout(() => router.push("/user/profile"), 1000);
        } catch (err) {
            toast.error(err.message || "Failed to update profile");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-600 font-medium">Loading...</div>;

    const userLinks = [
        { name: "Home", href: "/user", icon: "🏠" },
        { name: "Workouts", href: "/user/workout", icon: "💪" },
        { name: "Activities", href: "/user/activities", icon: "🏃" },
        { name: "Explore", href: "/user/explore", icon: "🔍" },
        { name: "Exercises", href: "/user/exercises", icon: "🏋️" },
        { name: "Diet", href: "/user/diet", icon: "🥗" },
    ];

    return (
        <div className="bg-gray-50 min-h-screen pb-16 font-sans text-gray-900">
            <Navbar links={userLinks} profileLink="/user/profile" />

            <div className="max-w-6xl mx-auto px-4 md:px-6 mt-10">
                <form onSubmit={handleSubmit}>
                    {/* Header Section (Editable) */}
                    <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm mb-6">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
                            {/* Avatar */}
                            <div className="relative group shrink-0">
                                <Avatar className="h-28 w-28 border-2 border-blue-100 ring-4 ring-blue-50/50">
                                    <AvatarImage src={null} alt={profile?.name} />
                                    <AvatarFallback className="bg-blue-50 flex items-center justify-center">
                                        <CircleUser className="h-20 w-20 text-blue-300" />
                                    </AvatarFallback>
                                </Avatar>
                                <button type="button" className="absolute bottom-0 right-0 bg-white p-2 rounded-full border border-gray-200 shadow-sm text-gray-400 hover:text-blue-600">
                                    <Camera size={16} />
                                </button>
                            </div>

                            {/* User Info Fields */}
                            <div className="flex-1 space-y-4 w-full">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Full Name</label>
                                        <input
                                            name="name"
                                            value={profile?.name || ""}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                                            placeholder="John Doe"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Email</label>
                                        <input
                                            name="email"
                                            value={profile?.email || ""}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                                            placeholder="john@example.com"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Phone Number</label>
                                        <input
                                            name="phone"
                                            value={profile?.phone || ""}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                                            placeholder="+1 234 567 8900"
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Username (Fixed)</label>
                                        <input
                                            value={profile?.username || ""}
                                            disabled
                                            className="w-full bg-gray-100 border border-gray-200 rounded-lg p-2 text-gray-500 cursor-not-allowed"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col gap-3 w-full md:w-auto self-center md:self-start">
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    className="w-full md:w-40 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-100"
                                >
                                    <Save size={18} />
                                    {saving ? "Saving..." : "Save Changes"}
                                </Button>
                                <Button
                                    type="button"
                                    onClick={() => router.back()}
                                    className="w-full md:w-40 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 font-bold py-2.5 px-6 rounded-lg flex items-center justify-center gap-2 transition-all"
                                >
                                    <X size={18} />
                                    Cancel
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col lg:flex-row gap-6">
                        {/* Biometrics Section (Editable) */}
                        <div className="w-full lg:w-2/3">
                            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm h-full">
                                <h2 className="mb-4 text-xl font-bold text-gray-900">Biometrics & Goals</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Height (cm)</label>
                                            <input
                                                type="number"
                                                name="height"
                                                value={profile?.height || ""}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Weight (kg)</label>
                                            <input
                                                type="number"
                                                name="weight"
                                                step="0.1"
                                                value={profile?.weight || ""}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Goal</label>
                                            <select
                                                name="goal"
                                                value={profile?.goal || ""}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                                            >
                                                <option value="Muscle Gain">Muscle Gain</option>
                                                <option value="Fat Loss">Fat Loss</option>
                                                <option value="Maintenance">Maintenance</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Activity Level</label>
                                            <select
                                                name="activityLevel"
                                                value={profile?.activityLevel || ""}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                                            >
                                                <option value="sedentary">Sedentary</option>
                                                <option value="light">Lightly Active</option>
                                                <option value="moderate">Moderately Active</option>
                                                <option value="active">Active</option>
                                                <option value="very_active">Very Active</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Age</label>
                                            <input
                                                type="number"
                                                name="age"
                                                value={profile?.age || ""}
                                                onChange={handleChange}
                                                className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                                            />
                                        </div>
                                    </div>

                                    {/* Total Calories Display (Dynamic if we wanted, but keeping it consistent with view) */}
                                    <div className="bg-blue-50 rounded-xl p-6 border border-blue-100 flex flex-col justify-center">
                                        <p className="font-semibold text-blue-900">Calculated Calories:</p>
                                        <p className="text-4xl font-black text-blue-600 mt-2">{profile?.dailyCalorieTarget || 2500}</p>
                                        <p className="text-xs text-blue-800/70 mt-3 leading-relaxed">
                                            (Target will update after you save your biometrics)
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Other Details (Read Only as requested) */}
                        <div className="w-full lg:w-1/3">
                            <div className="border border-gray-200 rounded-xl p-6 bg-white shadow-sm h-full opacity-80">
                                <h2 className="mb-1 text-xl font-bold text-gray-900">Other Details</h2>
                                <p className="text-sm text-gray-400 mb-6">(Note: this user can't edit)</p>
                                <div className="space-y-4">
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-900">Trainer:</span> {profile?.trainerName || "N/A"}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-900">Joined:</span> {profile?.startDate || "N/A"}
                                    </p>
                                    <div className="space-y-1">
                                        <label className="text-xs font-bold text-gray-500 uppercase tracking-tight">Workout Plan</label>
                                        <select
                                            name="plan"
                                            value={profile?.plan || ""}
                                            onChange={handleChange}
                                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-gray-900 focus:ring-2 focus:ring-blue-100 outline-none"
                                        >
                                            <option value="">Select a Plan</option>
                                            <option value="Push Pull Legs">Push Pull Legs</option>
                                            <option value="Bro Split">Bro Split</option>
                                            <option value="Upper Lower">Upper Lower</option>
                                            <option value="Full Body">Full Body</option>
                                            <option value="Cardio Focused">Cardio Focused</option>
                                        </select>
                                    </div>
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-900">Shift:</span> {profile?.shiftTimings || "General"}
                                    </p>
                                    <p className="text-gray-600">
                                        <span className="font-semibold text-gray-900">Ending Date:</span> {profile?.endDate || "N/A"}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
            <Toaster position="top-right" richColors />
        </div>
    );
}
