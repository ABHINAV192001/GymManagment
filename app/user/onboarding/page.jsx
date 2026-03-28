"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { apiPost, API_ENDPOINTS } from "@/lib/api";
import { setCookie } from "@/lib/cookie";
import { FaRulerVertical, FaWeight, FaRunning, FaBullseye, FaUser, FaVenusMars, FaArrowRight, FaBolt, FaDna } from "react-icons/fa";

export default function Onboarding() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    age: "",
    gender: "Male",
    height: "",
    weight: "",
    activityLevel: "Sedentary",
    goal: "Get Fit",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await apiPost(API_ENDPOINTS.USERS.ONBOARDING, formData);
      setCookie('isOnboardingCompleted', 'true', null);
      router.push("/user");
    } catch (error) {
      console.error("Onboarding error:", error);
      alert(`Failed to submit details: ${error.message || "Unknown error"}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden text-white selection:bg-purple-500/30 font-sans">

      {/* --- RGB Gradient Background Loop --- */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        {/* Deep Violet Blob */}
        <div className="absolute top-[-20%] left-[-10%] w-[800px] h-[800px] bg-violet-900/20 rounded-full blur-[120px] animate-pulse"></div>
        {/* Bright Purple Blob */}
        <div className="absolute top-[30%] right-[-10%] w-[600px] h-[600px] bg-purple-700/20 rounded-full blur-[100px] animate-blob"></div>
        {/* Deep Blue/Indigo Blob */}
        <div className="absolute bottom-[-20%] left-[10%] w-[700px] h-[700px] bg-indigo-800/20 rounded-full blur-[120px] animate-blob animation-delay-4000"></div>

        {/* Cyber Grid */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(20,20,40,0.5)_1px,transparent_1px),linear-gradient(90deg,rgba(20,20,40,0.5)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(circle_at_center,black_40%,transparent_100%)] opacity-40"></div>
      </div>

      {/* Main Glass Card */}
      <div className="relative z-10 w-full max-w-5xl p-6">
        <div className="rounded-3xl overflow-hidden flex flex-col md:flex-row animate-content-in">

          {/* Left Side: Visual/Welcome */}
          <div className="md:w-5/12 p-8 md:p-12 flex flex-col justify-between relative overflow-hidden group border-r border-white/5">

            {/* Decorative Elements */}
            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-purple-500 to-transparent opacity-50"></div>

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-violet-500/10 border border-violet-500/20 text-violet-300 text-[10px] font-bold uppercase tracking-[0.2em] mb-8 backdrop-blur-sm shadow-[0_0_15px_-3px_rgba(139,92,246,0.3)]">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse shadow-[0_0_10px_rgba(34,211,238,0.8)]"></span>
                System Initialization
              </div>
              <h1 className="text-4xl md:text-5xl font-black text-white mb-6 leading-tight tracking-tight">
                Profile <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-violet-400 via-fuchsia-400 to-white animate-text-shimmer bg-[size:200%_auto]">Calibration</span>
              </h1>
              <p className="text-indigo-200/60 leading-relaxed text-sm tracking-wide">
                Configure your biometrics. The system requires precise data to generate your optimal training algorithm.
              </p>
            </div>

            <div className="mt-12 relative z-10 space-y-4">
              <div className="group/item flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-cyan-400 group-hover/item:text-cyan-300 group-hover/item:shadow-[0_0_15px_rgba(34,211,238,0.3)] transition-all">
                  <FaDna size={16} />
                </div>
                <div>
                  <p className="text-gray-200 font-bold text-sm tracking-wide">Genetic Baseline</p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">Establishing Metabolic Rate</p>
                </div>
              </div>

              <div className="group/item flex items-center gap-4 p-4 rounded-xl bg-white/5 border border-white/5 hover:border-violet-500/30 hover:bg-violet-500/5 transition-all duration-300">
                <div className="w-10 h-10 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center text-purple-400 group-hover/item:text-purple-300 group-hover/item:shadow-[0_0_15px_rgba(168,85,247,0.3)] transition-all">
                  <FaBolt size={16} />
                </div>
                <div>
                  <p className="text-gray-200 font-bold text-sm tracking-wide">Energy Output</p>
                  <p className="text-[11px] text-gray-500 uppercase tracking-wider">Calculating Work Capacity</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Form */}
          <div className="md:w-7/12 p-8 md:p-12">
            <form onSubmit={handleSubmit} className="space-y-8">

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                {/* Age */}
                <div className="space-y-2 group">
                  <label className="text-[10px] text-indigo-300/50 font-bold uppercase tracking-[0.15em] flex items-center gap-2 group-focus-within:text-cyan-400 transition-colors">
                    Age
                  </label>
                  <div className="relative">
                    <input
                      type="number" name="age" min="10" max="100" required
                      value={formData.age} onChange={handleChange}
                      className="w-full bg-[#0a0a12] border border-white/10 rounded-lg px-4 py-3 pl-10 text-white focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400/50 outline-none transition-all placeholder-white/20 font-mono text-sm shadow-inner"
                      placeholder="YEARS"
                    />
                    <FaUser className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={12} />
                  </div>
                </div>

                {/* Gender */}
                <div className="space-y-2 group">
                  <label className="text-[10px] text-indigo-300/50 font-bold uppercase tracking-[0.15em] flex items-center gap-2 group-focus-within:text-purple-400 transition-colors">
                    Gender
                  </label>
                  <div className="relative">
                    <select
                      name="gender" value={formData.gender} onChange={handleChange}
                      className="w-full bg-[#0a0a12] border border-white/10 rounded-lg px-4 py-3 pl-10 text-white focus:ring-1 focus:ring-purple-400 focus:border-purple-400/50 outline-none transition-all appearance-none cursor-pointer font-mono text-sm shadow-inner"
                    >
                      <option value="Male" className="bg-[#0a0a12]">Male</option>
                      <option value="Female" className="bg-[#0a0a12]">Female</option>
                      <option value="Other" className="bg-[#0a0a12]">Other</option>
                    </select>
                    <FaVenusMars className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-purple-400 transition-colors" size={12} />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[10px]">▼</div>
                  </div>
                </div>

                {/* Height */}
                <div className="space-y-2 group">
                  <label className="text-[10px] text-indigo-300/50 font-bold uppercase tracking-[0.15em] flex items-center gap-2 group-focus-within:text-cyan-400 transition-colors">
                    Height (cm)
                  </label>
                  <div className="relative">
                    <input
                      type="number" name="height" required
                      value={formData.height} onChange={handleChange}
                      className="w-full bg-[#0a0a12] border border-white/10 rounded-lg px-4 py-3 pl-10 text-white focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400/50 outline-none transition-all placeholder-white/20 font-mono text-sm shadow-inner"
                      placeholder="CM"
                    />
                    <FaRulerVertical className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-cyan-400 transition-colors" size={12} />
                  </div>
                </div>

                {/* Weight */}
                <div className="space-y-2 group">
                  <label className="text-[10px] text-indigo-300/50 font-bold uppercase tracking-[0.15em] flex items-center gap-2 group-focus-within:text-violet-400 transition-colors">
                    Weight (kg)
                  </label>
                  <div className="relative">
                    <input
                      type="number" name="weight" required
                      value={formData.weight} onChange={handleChange}
                      className="w-full bg-[#0a0a12] border border-white/10 rounded-lg px-4 py-3 pl-10 text-white focus:ring-1 focus:ring-violet-400 focus:border-violet-400/50 outline-none transition-all placeholder-white/20 font-mono text-sm shadow-inner"
                      placeholder="KG"
                    />
                    <FaWeight className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-violet-400 transition-colors" size={12} />
                  </div>
                </div>

              </div>

              {/* Activity Level */}
              <div className="space-y-2 group">
                <label className="text-[10px] text-indigo-300/50 font-bold uppercase tracking-[0.15em] flex items-center gap-2 group-focus-within:text-cyan-400 transition-colors">
                  Activity Level
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <FaRunning className="text-white/20 group-focus-within:text-cyan-400 transition-colors" size={14} />
                  </div>
                  <select
                    name="activityLevel" value={formData.activityLevel} onChange={handleChange}
                    className="w-full bg-[#0a0a12] border border-white/10 rounded-lg px-4 py-3 pl-10 text-white focus:ring-1 focus:ring-cyan-400 focus:border-cyan-400/50 outline-none transition-all appearance-none cursor-pointer font-mono text-sm shadow-inner"
                  >
                    <option value="Sedentary" className="bg-[#0a0a12]">Sedentary (Desk Job)</option>
                    <option value="Light" className="bg-[#0a0a12]">Lightly Active (1-3 days)</option>
                    <option value="Moderate" className="bg-[#0a0a12]">Moderately Active (3-5 days)</option>
                    <option value="Active" className="bg-[#0a0a12]">Active (6-7 days)</option>
                    <option value="Very Active" className="bg-[#0a0a12]">Very Active (Physical Job)</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-white/20 text-[10px]">▼</div>
                </div>
              </div>

              {/* Goal */}
              <div className="space-y-2">
                <label className="text-[10px] text-indigo-300/50 font-bold uppercase tracking-[0.15em] flex items-center gap-2">
                  Primary Objective
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {['Fat Loss', 'Muscle Gain', 'Maintenance', 'General Fitness'].map((g) => (
                    <button
                      key={g}
                      type="button"
                      onClick={() => setFormData({ ...formData, goal: g })}
                      className={`relative rounded-lg p-3 text-[10px] font-bold uppercase tracking-[0.1em] transition-all border overflow-hidden group ${formData.goal === g
                        ? 'bg-violet-600/20 border-violet-500 text-white shadow-[0_0_20px_-5px_rgba(139,92,246,0.6)]'
                        : 'bg-[#0a0a12] text-gray-500 border-white/5 hover:border-white/20 hover:text-white'
                        }`}
                    >
                      <span className={`relative z-10 transition-colors ${formData.goal === g ? 'text-cyan-200' : ''}`}>{g}</span>
                      {formData.goal === g && (
                        <div className="absolute inset-0 bg-gradient-to-tr from-violet-600/20 to-transparent pointer-events-none"></div>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full relative group overflow-hidden bg-cyan-400 hover:bg-cyan-300 text-black font-black uppercase tracking-[0.2em] text-xs py-4 rounded-lg shadow-[0_0_20px_-5px_rgba(34,211,238,0.6)] hover:shadow-[0_0_30px_-5px_rgba(34,211,238,0.8)] transition-all transform hover:-translate-y-0.5 active:scale-[0.99]"
                >
                  <span className="relative flex items-center justify-center gap-3 z-10">
                    {loading ? "PROCESSING..." : "ACTIVATE DASHBOARD"}
                    {!loading && <FaArrowRight />}
                  </span>
                  <div className="absolute inset-0 bg-white/30 skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700 ease-in-out"></div>
                </button>
              </div>

            </form>
          </div>

        </div>

        {/* Footer info - Future Style */}
        <div className="flex justify-center mt-8 gap-4 opacity-30 text-[10px] uppercase tracking-[0.3em] text-indigo-200 font-mono">
          <span>SECURE // ENCRYPTED</span>
          <span>::</span>
          <span>V.2.0.4</span>
        </div>
      </div>

      <style jsx global>{`
        @keyframes blob {
          0% { transform: translate(0px, 0px) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
          100% { transform: translate(0px, 0px) scale(1); }
        }
        .animate-blob {
          animation: blob 8s infinite;
        }
        .animation-delay-4000 {
          animation-delay: 4s;
        }
        @keyframes content-in {
             from { opacity: 0; transform: translateY(20px); filter: blur(10px); }
             to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }
        .animate-content-in {
            animation: content-in 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
        }
        @keyframes text-shimmer {
          0% { background-position: 0% 50%; }
          100% { background-position: 100% 50%; }
        }
        .animate-text-shimmer {
          animation: text-shimmer 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
