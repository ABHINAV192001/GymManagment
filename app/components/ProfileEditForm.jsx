"use client";

import { useState, useEffect } from "react";
import { getProfile, updateProfile } from "@/lib/api/user";
import { useRouter } from "next/navigation";
import { FaUser, FaIdCard, FaEnvelope, FaVenusMars, FaBirthdayCake, FaWhatsapp, FaPhone, FaDumbbell, FaCalendarAlt, FaHistory, FaMapMarkerAlt, FaRulerVertical, FaWeight, FaHeartbeat, FaNotesMedical, FaFileMedical, FaInstagram } from "react-icons/fa";

const SectionHeader = ({ icon: Icon, title }) => (
    <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-200 text-gray-800">
        {Icon && <Icon className="text-[var(--primary)] text-xl" />}
        <h3 className="text-lg font-bold uppercase tracking-wide">{title}</h3>
    </div>
);

const InputField = ({ label, name, type = "text", value, onChange, disabled = false, options = null, prefix = null }) => (
    <div className="form-group mb-4">
        <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">{label}</label>
        <div className={`flex items-center border rounded-lg overflow-hidden transition-all duration-200 ${disabled ? 'bg-gray-100 border-gray-200' : 'bg-white border-gray-300 focus-within:ring-2 focus-within:ring-[var(--primary)] focus-within:border-transparent'}`}>
            {prefix && <div className="bg-gray-50 px-3 py-2 border-r border-gray-200 text-gray-500">{prefix}</div>}
            {options ? (
                <select
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    className="w-full p-2.5 bg-transparent outline-none text-gray-700 font-medium"
                >
                    <option value="">Select {label}</option>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value || ""}
                    onChange={onChange}
                    disabled={disabled}
                    className={`w-full p-2.5 bg-transparent outline-none text-gray-700 font-medium ${disabled ? 'cursor-not-allowed text-gray-500' : ''}`}
                />
            )}
        </div>
    </div>
);

export default function ProfileEditForm() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
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
            let msg = "Failed to load profile.";
            if (err.status) msg += ` Status: ${err.status}`;
            if (err.message) msg += ` Message: ${err.message}`;
            if (err.data && err.data.message) msg += ` Server: ${err.data.message}`;
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setProfile(prev => {
            const updated = {
                ...prev,
                [name]: type === 'checkbox' ? checked : value
            };

            // Auto-calculate BMI
            if (name === 'height' || name === 'weight') {
                const h = name === 'height' ? value : prev.height;
                const w = name === 'weight' ? value : prev.weight;
                if (h && w) {
                    const heightInMeters = h / 100;
                    updated.bmi = (w / (heightInMeters * heightInMeters)).toFixed(2);
                }
            }

            // Auto-calculate Age
            if (name === 'dob') {
                const birthDate = new Date(value);
                const today = new Date();
                let age = today.getFullYear() - birthDate.getFullYear();
                const m = today.getMonth() - birthDate.getMonth();
                if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
                updated.age = age;
            }

            return updated;
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);
        try {
            await updateProfile(profile);
            setSuccess("Profile updated successfully!");
        } catch (err) {
            setError(err.message || "Failed to update profile");
        }
    };

    if (loading) return <div className="p-12 text-center text-gray-500 font-semibold animate-pulse">Loading profile data...</div>;
    if (!profile) return <div className="p-8 text-red-500 bg-red-50 border border-red-200 rounded">{error}</div>;

    const isAdminOrOrg = ['ADMIN', 'ORG_ADMIN', 'BRANCH_ADMIN', 'OWNER'].includes(profile.role);

    const calculateCompletion = () => {
        if (!profile) return 0;
        let fields = [];

        if (isAdminOrOrg) {
            // Basic fields for Admin/Org
            fields = ['name', 'email', 'phone', 'userCode', 'role'];
        } else {
            // Detailed fields for Members
            fields = [
                'name', 'email', 'phone', 'userCode', 'role',
                'dob', 'gender', 'height', 'weight',
                'fitnessLevel', 'workoutExperience',
                'preferredWorkoutType', 'workoutTiming', 'workoutDays',
                'state', 'city'
            ];
        }

        const filled = fields.filter(field => {
            const val = profile[field];
            return val !== null && val !== undefined && val !== '';
        });

        return Math.round((filled.length / fields.length) * 100);
    };

    // Components moved outside to prevent re-rendering/focus loss




    return (
        <div className="max-w-5xl mx-auto p-6 animate-fade-in-up">

            {/* 1. Header Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-8 flex flex-col md:flex-row items-center gap-8 border-l-8 border-[var(--primary)] text-center md:text-left">
                <div className="relative">
                    <div className="w-32 h-32 rounded-full border-4 border-gray-100 shadow-inner bg-gray-200 flex items-center justify-center overflow-hidden">
                        {/* Placeholder for Photo */}
                        <FaUser className="text-5xl text-gray-400" />
                    </div>
                    <div className="absolute bottom-0 right-0 bg-[var(--primary)] text-white text-xs font-bold px-2 py-1 rounded-full border-2 border-white shadow-sm">
                        {profile.age ? `${profile.age} Yrs` : 'N/A'}
                    </div>
                </div>
                <div className="flex-1">
                    <h1 className="text-3xl font-extrabold text-gray-900 mb-1">{profile.name}</h1>
                    <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2 mb-3">
                        <FaIdCard className="text-gray-400" /> ID: <span className="text-gray-700">{profile.userCode || "N/A"}</span>
                    </p>
                    <div className="flex flex-wrap gap-2 justify-center md:justify-start">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${profile.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                            {profile.isActive ? 'Active Member' : 'Inactive'}
                        </span>
                        <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-wider">
                            {profile.fitnessLevel || 'Beginner'}
                        </span>
                    </div>
                </div>
                <div className="hidden md:block text-right">
                    <div className="text-sm text-gray-400 font-semibold uppercase mb-1">Completion</div>
                    <div className="text-3xl font-black text-[var(--primary)]">{calculateCompletion()}%</div>
                </div>
            </div>

            {error && <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg border border-red-200 flex items-center gap-2 shadow-sm font-medium"><FaNotesMedical /> {error}</div>}
            {success && <div className="mb-6 p-4 bg-green-50 text-green-700 rounded-lg border border-green-200 flex items-center gap-2 shadow-sm font-medium"><FaHeartbeat /> {success}</div>}

            <form onSubmit={handleSubmit} className="space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 2. Personal Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <SectionHeader icon={FaUser} title="Personal Details" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Full Name" name="name" value={profile.name} onChange={handleChange} />
                            <InputField label="Gender" name="gender" value={profile.gender} onChange={handleChange} options={["Male", "Female", "Other"]} />
                            <InputField label="Date of Birth" name="dob" type="date" value={profile.dob} onChange={handleChange} />
                            <InputField label="Age" name="age" value={profile.age} onChange={handleChange} disabled />
                            <InputField label="Email" name="email" value={profile.email} onChange={handleChange} prefix={<FaEnvelope />} />
                            <InputField label="Phone" name="phone" value={profile.phone} onChange={handleChange} prefix={<FaPhone />} />
                            <InputField label="WhatsApp" name="whatsappNumber" value={profile.whatsappNumber} onChange={handleChange} prefix={<FaWhatsapp />} />
                        </div>
                    </div>

                    {/* 3. Membership Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <SectionHeader icon={FaIdCard} title="Membership Details" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Plan Name" name="plan" value={profile.plan} onChange={handleChange} disabled />
                            <InputField label="Status" name="membershipStatus" value={profile.isActive ? "Active" : "Inactive"} disabled />
                            <InputField label="Start Date" name="startDate" type="date" value={profile.startDate} onChange={handleChange} disabled />
                            <InputField label="End Date" name="endDate" type="date" value={profile.endDate} onChange={handleChange} disabled />
                            <InputField label="Trainer Assigned" name="hasTrainer" value={profile.hasTrainer ? "Yes" : "No"} disabled />
                            <InputField label="Trainer Name" name="trainerName" value={profile.trainerName} onChange={handleChange} disabled />
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* 4. Fitness Background */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <SectionHeader icon={FaDumbbell} title="Fitness Background" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="Fitness Level" name="fitnessLevel" value={profile.fitnessLevel} onChange={handleChange} options={["Beginner", "Intermediate", "Advanced", "Pro"]} />
                            <InputField label="Experience" name="workoutExperience" value={profile.workoutExperience} onChange={handleChange} options={["Fresher", "0-6 Months", "6-12 Months", "1+ Years", "5+ Years"]} />
                            <InputField label="Career Gap (Months)" name="careerGap" type="number" value={profile.careerGap} onChange={handleChange} />
                            <InputField label="Previous Gym?" name="hasPreviousGymExperience" value={profile.hasPreviousGymExperience ? "Yes" : "No"} onChange={e => handleChange({ target: { name: 'hasPreviousGymExperience', value: e.target.value === 'Yes' } })} options={["Yes", "No"]} />
                        </div>
                    </div>

                    {/* 5. Location Details */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <SectionHeader icon={FaMapMarkerAlt} title="Location Details" />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <InputField label="State" name="state" value={profile.state} onChange={handleChange} />
                            <InputField label="City" name="city" value={profile.city} onChange={handleChange} />
                            <InputField label="Area Type" name="areaType" value={profile.areaType} onChange={handleChange} options={["Urban", "Semi-Urban", "Rural"]} />
                            <InputField label="Preferred Location" name="preferredLocation" value={profile.preferredLocation} onChange={handleChange} />
                        </div>
                    </div>
                </div>

                {/* 6. Health & Body Metrics */}
                {!isAdminOrOrg && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <SectionHeader icon={FaHeartbeat} title="Health & Body Metrics" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Height (cm)" name="height" type="number" value={profile.height} onChange={handleChange} prefix={<FaRulerVertical />} />
                            <InputField label="Weight (kg)" name="weight" type="number" value={profile.weight} onChange={handleChange} prefix={<FaWeight />} />
                            <InputField label="BMI" name="bmi" value={profile.bmi} onChange={handleChange} disabled />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                            <div className="form-group">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Medical Conditions</label>
                                <textarea name="medicalConditions" value={profile.medicalConditions || ""} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm" rows="2"></textarea>
                            </div>
                            <div className="form-group">
                                <label className="block text-xs font-bold text-gray-500 uppercase mb-1 tracking-wider">Notes / Remarks</label>
                                <textarea name="notes" value={profile.notes || ""} onChange={handleChange} className="w-full p-3 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-[var(--primary)] text-sm" rows="2"></textarea>
                            </div>
                        </div>
                    </div>
                )}

                {/* 7. Preferences */}
                {!isAdminOrOrg && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <SectionHeader icon={FaCalendarAlt} title="Workout Preferences" />
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <InputField label="Preferred Type" name="preferredWorkoutType" value={profile.preferredWorkoutType} onChange={handleChange} options={["Strength", "Cardio", "CrossFit", "Yoga", "Zumba"]} />
                            <InputField label="Timing" name="workoutTiming" value={profile.workoutTiming} onChange={handleChange} options={["Morning", "Afternoon", "Evening", "Night"]} />
                            <InputField label="Preferred Days" name="workoutDays" value={profile.workoutDays} onChange={handleChange} />
                        </div>
                    </div>
                )}

                {/* 8. Attendance & Activity Links */}
                {!isAdminOrOrg && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <SectionHeader icon={FaHistory} title="Attendance & Activity History" />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 cursor-pointer hover:bg-blue-100 transition" onClick={() => alert("Viewing Attendance History (Mock)")}>
                                <h4 className="font-bold text-blue-800 text-sm">Attendance History</h4>
                                <p className="text-xs text-blue-600 mt-1">View Logs &rarr;</p>
                            </div>
                            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100 cursor-pointer hover:bg-purple-100 transition" onClick={() => alert("Viewing Subscription History (Mock)")}>
                                <h4 className="font-bold text-purple-800 text-sm">Subscription History</h4>
                                <p className="text-xs text-purple-600 mt-1">View Plans &rarr;</p>
                            </div>
                            <div className="p-4 bg-orange-50 rounded-xl border border-orange-100 cursor-pointer hover:bg-orange-100 transition">
                                <h4 className="font-bold text-orange-800 text-sm">Referral Details</h4>
                                <p className="text-xs text-orange-600 mt-1">Coming Soon</p>
                            </div>
                            <div className="p-4 bg-teal-50 rounded-xl border border-teal-100 cursor-pointer hover:bg-teal-100 transition">
                                <h4 className="font-bold text-teal-800 text-sm">Certificates</h4>
                                <p className="text-xs text-teal-600 mt-1">Download</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* 9. Social & Docs */}
                {!isAdminOrOrg && (
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <SectionHeader icon={FaInstagram} title="Social & Verification" />
                        <div className="grid grid-cols-1 gap-4">
                            <InputField label="Instagram Profile URL" name="instagramProfile" value={profile.instagramProfile} onChange={handleChange} prefix="@" />
                        </div>
                    </div>
                )}

                {/* 11. Admin Controls */}
                <div className="bg-red-50 p-6 rounded-2xl border border-red-100">
                    <SectionHeader icon={FaFileMedical} title="Admin Controls (Staff Only)" />
                    <div className="flex flex-wrap gap-4">
                        {!isAdminOrOrg && (
                            <button
                                type="button"
                                onClick={async () => {
                                    try {
                                        // Use api/user/status endpoint (imported dynamically if needed, or pass prop)
                                        // For now, assuming import or simple fetch
                                        const { toggleUserStatus } = require("@/lib/api/user");
                                        await toggleUserStatus(!profile.isActive);
                                        setProfile(p => ({ ...p, isActive: !p.isActive }));
                                        setSuccess(`Membership ${!profile.isActive ? 'Resumed' : 'Frozen'} Successfully`);
                                    } catch (e) {
                                        setError("Failed to change status");
                                    }
                                }}
                                className={`px-4 py-2 rounded-lg font-bold text-white transition shadow-md ${profile.isActive ? 'bg-red-500 hover:bg-red-600' : 'bg-green-500 hover:bg-green-600'}`}
                            >
                                {profile.isActive ? 'Freeze Membership' : 'Resume Membership'}
                            </button>
                        )}
                        <button type="button" className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 font-bold hover:bg-gray-300">
                            Reset Password
                        </button>
                        {!isAdminOrOrg && (
                            <button type="button" className="px-4 py-2 rounded-lg bg-orange-200 text-orange-800 font-bold hover:bg-orange-300">
                                Extend Validity
                            </button>
                        )}
                    </div>
                </div>

                {/* 11. Admin/Save Controls */}
                <div className="flex justify-end gap-4 border-t border-gray-200 pt-8">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-bold hover:bg-gray-200 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="px-8 py-3 rounded-xl bg-[var(--primary)] text-black font-bold hover:bg-[#b8e600] transition shadow-lg shadow-[var(--primary)]/30 transform hover:-translate-y-1"
                    >
                        Save Profile
                    </button>
                </div>

            </form>
        </div>
    );
}
