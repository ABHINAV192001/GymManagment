
"use client";

import { useState, useEffect } from "react";
import DataTable from "@/app/components/DataTable";
import Modal from "@/app/components/Modal";
import { getStaff, createStaff, updateStaff, deleteStaff, updateStaffPaymentStatus, updateTrainerPaymentStatus } from "@/lib/api/branch";
import { getProfile } from "@/lib/api/user";
import { resendInvite } from "@/lib/api/auth";
import { FaPaperPlane, FaLink } from "react-icons/fa";



export default function StaffPage() {
    const [staff, setStaff] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentStaff, setCurrentStaff] = useState(null);
    const [adminProfile, setAdminProfile] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        role: "CLEANER", // Default
        customRole: "",
        salary: 0,
        shiftTimings: "Morning",
        startDate: "",
        experience: 0
    });

    const fetchStaff = async () => {
        setLoading(true);
        try {
            const [staffData, profileData] = await Promise.all([
                getStaff(),
                getProfile()
            ]);
            setStaff(Array.isArray(staffData) ? staffData : []);
            setAdminProfile(profileData);
        } catch (error) {
            console.error("Failed to fetch data:", error);
            // alert("Failed to load staff.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStaff();
    }, []);

    const handleStatusChange = async (row, newStatus) => {
        try {
            if (row.entityType === "TRAINER") {
                await updateTrainerPaymentStatus(row.id, newStatus);
            } else {
                await updateStaffPaymentStatus(row.id, newStatus);
            }
            // Optimistic Update
            setStaff(prev => prev.map(s =>
                s.id === row.id ? { ...s, paymentStatus: newStatus } : s
            ));
        } catch (error) {
            console.error("Failed to update status:", error);
            alert("Failed to update payment status.");
        }
    };

    const handleAdd = () => {
        setCurrentStaff(null);
        setFormData({
            name: "",
            email: "",
            phone: "",
            role: "CLEANER",
            customRole: "",
            salary: 0,
            shiftTimings: "Morning",
            startDate: "",
            experience: 0
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setCurrentStaff(item);
        const isCustomRole = !["TRAINER", "CLEANER", "RECEPTIONIST"].includes(item.role || "");
        setFormData({
            name: item.name || "",
            email: item.email || "",
            phone: item.phone || "",
            role: isCustomRole ? "Create" : (item.role || "CLEANER"),
            customRole: isCustomRole ? item.role : "",
            salary: item.salary || 0,
            shiftTimings: item.shiftTimings || "Morning",
            startDate: item.startDate || "",
            experience: item.experience || 0
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (!item || !item.id) {
            console.error("Staff object or ID is missing", item);
            alert("Error: Cannot delete staff with missing ID.");
            return;
        }
        if (!window.confirm(`Delete staff member ${item.name}?`)) return;
        try {
            await deleteStaff(item.id);
            // Optimistic update
            setStaff(prev => prev.filter(s => s.id !== item.id));
            if (currentStaff && currentStaff.id === item.id) {
                setIsModalOpen(false);
                setCurrentStaff(null);
            }
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete staff.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const finalRole = formData.role === "Create" ? formData.customRole : formData.role;
            const payload = { ...formData, role: finalRole };
            delete payload.customRole; // Cleanup

            if (currentStaff) {
                await updateStaff(currentStaff.id, payload);
            } else {
                await createStaff(payload);
            }
            setIsModalOpen(false);
            fetchStaff();
        } catch (error) {
            console.error("Submit failed:", error);
            alert(`Operation failed: ${error.message}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "phone" && value.length > 10) return; // Max 10 digits
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleCopyLink = (code, role) => {
        if (!adminProfile?.userCode) {
            alert("Error: Admin Code not found. Please refresh.");
            return;
        }
        const userRole = role === 'TRAINER' ? 'TRAINER' : 'STAFF';
        const link = `${window.location.origin}/auth/register/join?u=${code}&ref=${adminProfile.userCode}&role=${userRole}`;
        navigator.clipboard.writeText(link);
        alert(`Invite Link Copied!\n\n${link}`);
    };

    const columns = [
        { key: "code", label: "User Code" }, // Renamed from "Code"
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
        {
            key: "salary",
            label: "Salary",
            render: (val) => <span className="text-emerald-600 font-mono font-bold">${val}</span>
        },
        {
            key: "paid",
            label: "Paid",
            render: (_, row) => (
                <select
                    value={row.paymentStatus || "Pending"}
                    onChange={(e) => handleStatusChange(row, e.target.value)}
                    className={`text-sm font-bold border rounded px-2 py-1 outline-none transition cursor-pointer ${(row.paymentStatus === "Paid")
                        ? "bg-green-100 text-green-700 border-green-300"
                        : "bg-yellow-100 text-yellow-700 border-yellow-300"
                        }`}
                    onClick={(e) => e.stopPropagation()} // Prevent row click
                >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                </select>
            )
        },
        {
            key: "startedDate", // New
            label: "Joining Date",
            render: (val) => val ? new Date(val).toLocaleDateString() : "-"
        },
        {
            key: "link", // Changed to Actions
            label: "Actions",
            render: (_, row) => (
                <div className="flex gap-2">
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            if (!adminProfile?.userCode) {
                                alert("Error: Admin Code not found. Please refresh.");
                                return;
                            }
                            const code = row.staffCode || row.trainerCode || row.code;
                            const userRole = row.role === 'TRAINER' ? 'TRAINER' : 'STAFF';
                            const link = `${window.location.origin}/auth/register/join?u=${code}&ref=${adminProfile.userCode}&role=${userRole}`;
                            navigator.clipboard.writeText(link);
                            alert(`Invite Link Copied!\n\n${link}`);
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

                            const code = row.staffCode || row.trainerCode || row.code;
                            const userRole = row.role === 'TRAINER' ? 'TRAINER' : 'STAFF';

                            try {
                                await resendInvite(code, userRole);
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
                </div>
            )
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-cyan-400 bg-clip-text text-transparent">
                    Staff Management
                </h1>
                <p className="text-gray-400">Manage employees, payrolls, and shifts.</p>
            </div>

            <DataTable
                title="Staff Members"
                columns={columns}
                data={staff}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentStaff ? "Edit Staff" : "Add New Staff"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm text-gray-400 mb-1 font-medium">Full Name</label>
                        <input
                            required name="name" value={formData.name} onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1 font-medium">Email</label>
                            <input
                                required type="email" name="email" value={formData.email} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1 font-medium">Phone</label>
                            <input
                                required type="text" name="phone" value={formData.phone} onChange={handleChange}
                                placeholder="10 digits max"
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1 font-medium">Role</label>
                            <select
                                name="role" value={formData.role} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none transition"
                            >
                                <option value="TRAINER">Trainer</option>
                                <option value="CLEANER">Cleaner</option>
                                <option value="RECEPTIONIST">Receptionist</option>
                                <option value="Create">Create New...</option>
                            </select>
                        </div>
                        {formData.role === "Create" && (
                            <div className="form-group col-span-2">
                                <label className="block text-sm text-gray-400 mb-1 font-medium">Custom Role Name</label>
                                <input
                                    required name="customRole" value={formData.customRole} onChange={handleChange}
                                    placeholder="Enter role name"
                                    className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                                />
                            </div>
                        )}
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1 font-medium">Salary</label>
                            <input
                                type="number" name="salary" value={formData.salary} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1 font-medium">Start Date</label>
                            <input
                                type="date" name="startDate" value={formData.startDate} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition [color-scheme:dark]"
                            />
                        </div>
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1 font-medium">Experience (Yrs)</label>
                            <input
                                type="number" name="experience" value={formData.experience} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="block text-sm text-gray-400 mb-1 font-medium">Shift Timings</label>
                        <select
                            name="shiftTimings" value={formData.shiftTimings} onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none transition"
                        >
                            <option>Morning</option>
                            <option>Evening</option>
                            <option>Night</option>
                        </select>
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
                            {currentStaff ? "Update Staff" : "Add Staff"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
