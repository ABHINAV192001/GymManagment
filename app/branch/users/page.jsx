
"use client";

import { useState, useEffect } from "react";
import DataTable from "@/app/components/DataTable";
import Modal from "@/app/components/Modal";
import { getUsers, createUser, updateUser, deleteUser, getStaff } from "@/lib/api/branch";
import { getProfile } from "@/lib/api/user";
import { useRouter, useSearchParams } from 'next/navigation';
import { resendInvite } from "@/lib/api/auth";
import { FaUserPlus, FaLink, FaPaperPlane, FaDumbbell, FaUtensils, FaCrown } from "react-icons/fa";
import { updateWeeklyWorkoutPlan, assignDietPlan } from "@/lib/api/workout";



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
        fetchData();
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
                <div>
                    <div className="font-bold text-gray-900">{row.name}</div>
                    <div className="text-sm text-gray-500">{row.email}</div>
                </div>
            )
        },
        { key: "role", label: "Role" },
        { key: "trainerName", label: "Trainer", render: (val) => val || "-" },
        { key: "plan", label: "Plan" },
        {
            key: "amountPaid",
            label: "Paid",
            render: (val) => <span className="text-green-400 font-mono">${val}</span>
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
                        <span className={`font-bold ${diffDays < 7 ? 'text-red-500' : diffDays < 15 ? 'text-orange-500' : 'text-lime-500'}`}>
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
                <div className="flex gap-2">
                    <button
                        disabled={row.role !== 'PREMIUM_USER'}
                        onClick={(e) => {
                            e.stopPropagation();
                            // Redirect to the full assignment page with user pre-selected
                            router.push(`/admin/assign-workout?userId=${row.id}`);
                        }}
                        className={`p-2 rounded-full transition ${row.role === 'PREMIUM_USER' ? 'text-lime-500 hover:bg-lime-50' : 'text-gray-600 cursor-not-allowed grayscale'}`}
                        title={row.role === 'PREMIUM_USER' ? "Assign Workout Plan" : "Upgrade to Prime to Assign Plans"}
                    >
                        <FaDumbbell />
                    </button>
                    <button
                        disabled={row.role !== 'PREMIUM_USER'}
                        onClick={(e) => {
                            e.stopPropagation();
                            setPlanModalUser(row);
                            setPlanType('DIET');
                            setIsPlanModalOpen(true);
                        }}
                        className={`p-2 rounded-full transition ${row.role === 'PREMIUM_USER' ? 'text-orange-500 hover:bg-orange-50' : 'text-gray-600 cursor-not-allowed grayscale'}`}
                        title={row.role === 'PREMIUM_USER' ? "Assign Diet Plan" : "Upgrade to Prime to Assign Plans"}
                    >
                        <FaUtensils />
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
                                className="text-blue-500 hover:text-blue-700 p-2 rounded-full hover:bg-blue-50 transition"
                                title="Copy Registration Link"
                            >
                                <FaLink />
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
                                className="text-green-500 hover:text-green-700 p-2 rounded-full hover:bg-green-50 transition"
                                title="Resend Invite Email"
                            >
                                <FaPaperPlane />
                            </button>
                        </>
                    )}
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-cyan-400 bg-clip-text text-transparent">
                        User Management
                    </h1>
                    <p className="text-gray-400">Manage gym members and their subscriptions.</p>
                </div>
            </div>

            <DataTable
                title="All Members"
                columns={columns}
                data={users}
                isLoading={loading}
                onEdit={isTrainer ? null : handleEdit}
                onDelete={isTrainer ? null : handleDelete}
                onAdd={isTrainer ? null : handleAdd}
            />

            {/* Form Modal */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentUser ? "Edit User" : "Add New User"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm text-gray-400 mb-1">Full Name</label>
                        <input
                            required name="name" value={formData.name} onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                            placeholder="Enter full name"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block text-sm text-gray-400 mb-1">Email</label>
                        <input
                            required type="email" name="email" value={formData.email} onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                            placeholder="user@example.com"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Phone</label>
                            <input
                                name="phone" value={formData.phone} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                                placeholder="10 digits max"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Date of Birth</label>
                            <input
                                type="date" name="dob" value={formData.dob} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="form-group p-4 bg-slate-800/30 rounded-xl border border-white/5">
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-sm font-semibold text-gray-300">Assign Personal Trainer?</label>
                            <div
                                onClick={() => setHasTrainer(!hasTrainer)}
                                className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${hasTrainer ? "bg-[var(--primary)]" : "bg-slate-600"}`}
                            >
                                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${hasTrainer ? "translate-x-6" : ""}`}></div>
                            </div>
                        </div>
                        {hasTrainer && (
                            <div className="mt-3 animate-in fade-in slide-in-from-top-2 duration-200">
                                <label className="block text-sm text-gray-400 mb-1">Select Trainer</label>
                                <select
                                    name="trainerSelection"
                                    value={formData.trainerCode || ""}
                                    onChange={handleChange}
                                    className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none"
                                >
                                    <option value="">-- Choose Trainer --</option>
                                    {trainers.map(t => (
                                        <option key={t.id} value={t.code}>
                                            {t.name} ({t.customerNames?.length || 0} Members)
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-blue-400 mt-2">* User role will be set to PREMIUM_USER</p>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Duration (Months) <span className="text-red-400">*</span></label>
                            <input
                                required type="number" min="1"
                                value={planDuration} onChange={(e) => setPlanDuration(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                                placeholder="e.g. 12"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Free Months (Optional)</label>
                            <input
                                type="number" min="0"
                                value={planFree} onChange={(e) => setPlanFree(e.target.value)}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                                placeholder="e.g. 2"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Amount Paid ($)</label>
                            <input
                                type="number" name="amountPaid" value={formData.amountPaid} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                        <button
                            type="button" onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-[var(--primary)] text-black font-bold hover:bg-[#b8e600] transition shadow-lg hover:shadow-[var(--primary)]/20 transform hover:-translate-y-0.5"
                        >
                            {currentUser ? "Update User" : "Create User"}
                        </button>
                    </div>
                </form>
            </Modal>

            {/* Plan Assignment Modal */}
            <Modal
                isOpen={isPlanModalOpen}
                onClose={() => setIsPlanModalOpen(false)}
                title={`Assign ${planType === 'WORKOUT' ? 'Workout' : 'Diet'} Plan to ${planModalUser?.name}`}
            >
                <div className="space-y-6 p-2">
                    <div className="bg-lime-500/10 border border-lime-500/20 p-4 rounded-xl flex items-center gap-3">
                        <FaCrown className="text-lime-500 text-xl" />
                        <div>
                            <p className="text-sm font-bold text-lime-200">Prime Member Access</p>
                            <p className="text-xs text-lime-400/70">Personalized plan assignment enabled for this user.</p>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm text-gray-400 mb-2">Select {planType === 'WORKOUT' ? 'Workout' : 'Diet'} Template</label>
                            <select className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                                <option value="">-- Choose Template --</option>
                                {planType === 'WORKOUT' ? (
                                    <>
                                        <option value="1">Weight Loss Alpha</option>
                                        <option value="2">Muscle Gain Pro</option>
                                        <option value="3">Strength Fundamentals</option>
                                    </>
                                ) : (
                                    <>
                                        <option value="1">Low Carb Keto</option>
                                        <option value="2">High Protein Bulk</option>
                                        <option value="3">Balanced Maintenance</option>
                                    </>
                                )}
                            </select>
                        </div>

                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Notes / Instructions</label>
                            <textarea
                                rows="3"
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none transition"
                                placeholder="Special instructions for the member..."
                            ></textarea>
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
                        <button
                            onClick={() => setIsPlanModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={async () => {
                                // Real implementation would call updateWeeklyWorkoutPlan or assignDietPlan
                                alert(`${planType} plan assigned successfully!`);
                                setIsPlanModalOpen(false);
                            }}
                            className="px-6 py-2 rounded-lg bg-[var(--primary)] text-black font-bold hover:bg-[#b8e600] transition shadow-lg"
                        >
                            Assign Plan
                        </button>
                    </div>
                </div>
            </Modal>
        </div>
    );
}
