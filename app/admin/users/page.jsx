"use client";

import { useState, useEffect } from "react";
import DataTable from "@/app/components/DataTable";
import Modal from "@/app/components/Modal";
import { getAdminUsers, createAdminUser, updateAdminUser, deleteAdminUser, getAdminStaff } from "@/lib/api/admin";
import { getProfile } from "@/lib/api/user";
import { useRouter, useSearchParams } from 'next/navigation';
import { resendInvite } from "@/lib/api/auth";
import { FaUserPlus, FaLink, FaPaperPlane, FaDumbbell, FaUtensils, FaCrown, FaEdit, FaTrash } from "react-icons/fa";
import { toast } from "react-hot-toast";
import AssignDietPlanModal from "./AssignDietPlanModal";

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [trainers, setTrainers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [adminProfile, setAdminProfile] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Plan Assignment State
  const [isPlanModalOpen, setIsPlanModalOpen] = useState(false);
  const [planModalUser, setPlanModalUser] = useState(null);
  const [planType, setPlanType] = useState('WORKOUT'); // WORKOUT or DIET

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
    plan: "1 Month",
    dob: "",
    trainerName: "",
    trainerCode: ""
  });

  // Fetch Data
  const fetchData = async () => {
    setLoading(true);
    try {
      const [usersData, staffData, profileData] = await Promise.all([
        getAdminUsers(),
        getAdminStaff(),
        getProfile()
      ]);

      setAdminProfile(profileData);
      setUsers(Array.isArray(usersData) ? usersData : []);

      // Filter for trainers
      const trainersList = (Array.isArray(staffData) ? staffData : [])
        .filter(s => s.role === 'TRAINER' || s.entityType === 'TRAINER');
      setTrainers(trainersList);

    } catch (error) {
      console.error("Failed to fetch data:", error);
      toast.error("Failed to load data.");
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
      trainerName: "",
      trainerCode: ""
    });
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setCurrentUser(user);
    const durationMatch = user.plan ? user.plan.match(/^(\d+) Months/) : null;
    setPlanDuration(durationMatch ? durationMatch[1] : "");
    setPlanFree("");

    const isPrime = user.role === "PREMIUM_USER";
    setHasTrainer(isPrime);

    setFormData({
      name: user.name || "",
      email: user.email || "",
      role: user.role || "USER",
      phone: user.phone || "",
      amountPaid: user.amountPaid || 0,
      plan: user.plan || "Monthly",
      dob: user.dob || "",
      trainerName: user.trainerName || "",
      trainerCode: user.trainerCode || ""
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    if (!user || !user.id) return;
    if (!window.confirm(`Are you sure you want to delete ${user.name}?`)) return;

    try {
      await deleteAdminUser(user.id);
      toast.success("User deleted successfully");
      setUsers(prev => prev.filter(u => u.id !== user.id));
    } catch (error) {
      console.error("Delete failed:", error);
      toast.error("Failed to delete user");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (!/^\d{10}$/.test(formData.phone)) {
        toast.error("Phone number must be exactly 10 digits.");
        return;
      }

      if (hasTrainer && !formData.trainerName) {
        toast.error("Please select a trainer for the Premium plan.");
        return;
      }

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
        trainerName: hasTrainer ? formData.trainerName : null,
        trainerCode: hasTrainer ? formData.trainerCode : null
      };

      if (currentUser) {
        await updateAdminUser(currentUser.id, payload);
        toast.success("User updated successfully");
      } else {
        await createAdminUser(payload);
        toast.success("User created successfully");
      }
      setIsModalOpen(false);
      fetchData();
    } catch (error) {
      console.error("Submit failed:", error);
      toast.error(`Operation failed: ${error.message || "Unknown error"}`);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "trainerSelection") {
      const selectedTrainer = trainers.find(t => t.code === value);
      if (selectedTrainer) {
        setFormData(prev => ({
          ...prev,
          trainerName: selectedTrainer.name,
          trainerCode: selectedTrainer.code
        }));
      } else {
        setFormData(prev => ({ ...prev, trainerName: "", trainerCode: "" }));
      }
      return;
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Columns
  const columns = [
    {
      key: "details",
      label: "Name / Email",
      render: (_, row) => (
        <div>
          <div className="font-bold text-gray-200">{row.name}</div>
          <div className="text-sm text-gray-400">{row.email}</div>
        </div>
      )
    },
    { key: "role", label: "Role" },
    { key: "trainerName", label: "Trainer", render: (val) => val || "-" },
    { key: "plan", label: "Plan" },
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
    {
      key: "actions",
      label: "Actions",
      render: (_, row) => (
        <div className="flex gap-2">
          {/* Assign Workout */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/admin/assign-workout?userId=${row.id}`);
            }}
            className="p-2 rounded-full text-lime-500 hover:bg-lime-500/10 transition"
            title="Assign Workout Plan"
          >
            <FaDumbbell />
          </button>

          {/* Assign Diet */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setPlanModalUser(row);
              setPlanType('DIET');
              setIsPlanModalOpen(true);
            }}
            className="p-2 rounded-full text-orange-500 hover:bg-orange-500/10 transition"
            title="Assign Diet Plan"
          >
            <FaUtensils />
          </button>

          {/* Resend Invite */}
          <button
            onClick={async (e) => {
              e.stopPropagation();
              if (!window.confirm(`Resend invite to ${row.name}?`)) return;
              try {
                await resendInvite(row.userCode, "USER");
                toast.success("Invite sent!");
              } catch (err) {
                toast.error("Failed to send invite");
              }
            }}
            className="p-2 rounded-full text-blue-500 hover:bg-blue-500/10 transition"
            title="Resend Invite"
          >
            <FaPaperPlane />
          </button>

          {/* Copy Link */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              if (!adminProfile?.userCode) {
                toast.error("Admin Code not found.");
                return;
              }
              const inviteLink = `${window.location.origin}/auth/register/join?u=${row.userCode}&ref=${adminProfile.userCode}&role=USER`;
              navigator.clipboard.writeText(inviteLink);
              toast.success("Invite Link Copied!");
            }}
            className="p-2 rounded-full text-cyan-400 hover:bg-cyan-400/10 transition"
            title="Copy Register Link"
          >
            <FaLink />
          </button>

          {/* Delete */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(row);
            }}
            className="p-2 rounded-full text-red-500 hover:bg-red-500/10 transition"
            title="Delete User"
          >
            <FaTrash />
          </button>
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
          <p className="text-gray-400">Manage all gym members.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleAdd}
            className="flex items-center gap-2 bg-[var(--primary)] text-black px-4 py-2 rounded-lg hover:bg-[#b8e600] font-bold transition shadow-lg shadow-[var(--primary)]/20"
          >
            <FaUserPlus />
            Add Member
          </button>
        </div>
      </div>

      <DataTable
        title="All Members"
        columns={columns}
        data={users}
        isLoading={loading}
        onAdd={handleAdd}
        onEdit={handleEdit}
      />

      {/* User Edit/Add Modal */}
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
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none"
              placeholder="Full Name"
            />
          </div>
          <div className="form-group">
            <label className="block text-sm text-gray-400 mb-1">Email</label>
            <input
              required type="email" name="email" value={formData.email} onChange={handleChange}
              className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none"
              placeholder="Email"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Phone</label>
              <input name="phone" value={formData.phone} onChange={handleChange} className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none" />
            </div>
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">DOB</label>
              <input type="date" name="dob" value={formData.dob} onChange={handleChange} className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none" />
            </div>
          </div>

          {/* Trainer Selection */}
          <div className="form-group p-4 bg-slate-800/30 rounded-xl border border-white/5">
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-gray-300">Assign Personal Trainer?</label>
              <div onClick={() => setHasTrainer(!hasTrainer)} className={`w-12 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${hasTrainer ? "bg-[var(--primary)]" : "bg-slate-600"}`}>
                <div className={`bg-white w-4 h-4 rounded-full shadow-md transform duration-300 ease-in-out ${hasTrainer ? "translate-x-6" : ""}`}></div>
              </div>
            </div>
            {hasTrainer && (
              <div className="mt-3">
                <label className="block text-sm text-gray-400 mb-1">Select Trainer</label>
                <select name="trainerSelection" value={formData.trainerCode || ""} onChange={handleChange} className="w-full bg-slate-800 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none">
                  <option value="">-- Choose Trainer --</option>
                  {trainers.map(t => <option key={t.id} value={t.code}>{t.name}</option>)}
                </select>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Duration (Months)</label>
              <input required type="number" min="1" value={planDuration} onChange={(e) => setPlanDuration(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none" />
            </div>
            <div className="form-group">
              <label className="block text-sm text-gray-400 mb-1">Free Months</label>
              <input type="number" min="0" value={planFree} onChange={(e) => setPlanFree(e.target.value)} className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] outline-none" />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
            <button type="button" onClick={() => setIsModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition">Cancel</button>
            <button type="submit" className="px-6 py-2 rounded-lg bg-[var(--primary)] text-black font-bold hover:bg-[#b8e600] transition shadow-lg">{currentUser ? "Update" : "Create"}</button>
          </div>
        </form>
      </Modal>

      {/* Diet / Plan Modal */}
      {isPlanModalOpen && planType === 'DIET' ? (
        <AssignDietPlanModal
          isOpen={isPlanModalOpen}
          onClose={() => setIsPlanModalOpen(false)}
          user={planModalUser}
        />
      ) : (
        /* Original Placeholder for Workout or fallback */
        <Modal
          isOpen={isPlanModalOpen && planType === 'WORKOUT'} // Only show if workout
          onClose={() => setIsPlanModalOpen(false)}
          title={`Assign Workout Plan to ${planModalUser?.name}`}
        >
          <div className="space-y-6 p-2">
            <p className="text-gray-300">Workout Assignment should be done via the Workout Page.</p>
            <div className="pt-4 flex justify-end gap-3 border-t border-white/5">
              <button onClick={() => setIsPlanModalOpen(false)} className="px-4 py-2 rounded-lg text-gray-400 hover:text-white transition">Close</button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
