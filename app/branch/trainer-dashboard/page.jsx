"use client";

import { useState, useEffect } from 'react';
import { FaUsers, FaDumbbell, FaCalendarCheck, FaClipboardList, FaBell, FaCheckCircle, FaTimesCircle, FaStar, FaMedal, FaTrash, FaPlus } from 'react-icons/fa';
import { getProfile } from '@/lib/api/user';
import { getUsers } from '@/lib/api/branch';
import { getNotifications } from '@/lib/api/chat';
import { getSessions } from '@/lib/api/sessions';
import { assignDietPlan, assignWorkoutPlan, getAllWorkouts } from '@/lib/api/trainer';
import Modal from '@/app/components/Modal';

export default function TrainerDashboard() {
    const [profile, setProfile] = useState(null);
    const [assignedMembers, setAssignedMembers] = useState([]);
    const [recentAlerts, setRecentAlerts] = useState([]);
    const [upcomingSession, setUpcomingSession] = useState(null);
    const [selectedMember, setSelectedMember] = useState(null);
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [availableWorkouts, setAvailableWorkouts] = useState([]);

    // Diet Plan State
    const [dietEntries, setDietEntries] = useState([{ foodName: '', description: '', timingFood: 'Breakfast' }]);

    // Workout Plan State
    const [workoutPlan, setWorkoutPlan] = useState({
        mondayWorkoutId: '', tuesdayWorkoutId: '', wednesdayWorkoutId: '',
        thursdayWorkoutId: '', fridayWorkoutId: '', saturdayWorkoutId: '', sundayWorkoutId: ''
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [prof, allUsers, allSessions] = await Promise.all([
                    getProfile(),
                    getUsers(),
                    getSessions()
                ]);
                setProfile(prof);
                // Filter users where this trainer is assigned
                const assigned = allUsers.filter(u => u.trainerId === prof.id || u.trainerName === prof.name);
                setAssignedMembers(assigned);

                const notifs = await getNotifications(prof.username);
                setRecentAlerts(notifs.filter(n => n.type === 'SESSION').slice(0, 5));

                if (allSessions && allSessions.length > 0) {
                    setUpcomingSession(allSessions[0]);
                }

                const workouts = await getAllWorkouts();
                setAvailableWorkouts(workouts || []);
            } catch (err) {
                console.error("Trainer dashboard fetch failed", err);
            }
        };
        fetchData();
    }, []);

    const handleSaveDietPlan = async () => {
        try {
            await assignDietPlan(selectedMember.id, dietEntries);
            setIsDietModalOpen(false);
            alert("Diet plan assigned successfully!");
        } catch (err) {
            console.error("Failed to assign diet plan", err);
            alert("Failed to assign diet plan.");
        }
    };

    const handleSaveWorkoutPlan = async () => {
        try {
            await assignWorkoutPlan(selectedMember.id, workoutPlan);
            setIsWorkoutModalOpen(false);
            alert("Workout plan assigned successfully!");
        } catch (err) {
            console.error("Failed to assign workout plan", err);
            alert("Failed to assign workout plan.");
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-4xl font-extrabold tracking-tight">Coach <span className="text-[var(--primary)]">{profile?.name || 'Trainer'}</span></h1>
                    <p className="text-slate-400 mt-1 flex items-center gap-2">
                        <FaCheckCircle className="text-[var(--primary)]" /> Active Session • {new Date().toLocaleDateString()}
                    </p>
                </div>
                <div className="flex gap-4">
                    <div className="bg-slate-900/50 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Training Score</p>
                            <p className="text-xl font-black text-white">{profile?.averageRating?.toFixed(1) || '0.0'}/5.0</p>
                        </div>
                        <div className="w-10 h-10 bg-yellow-400/20 text-yellow-400 rounded-full flex items-center justify-center text-xl">
                            <FaStar />
                        </div>
                    </div>
                    <div className="bg-slate-900/50 border border-white/10 px-6 py-3 rounded-2xl flex items-center gap-4">
                        <div className="text-right">
                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Experience</p>
                            <p className="text-xl font-black text-white">{profile?.experience || 0} Years</p>
                        </div>
                        <div className="w-10 h-10 bg-indigo-500/20 text-indigo-400 rounded-full flex items-center justify-center text-xl">
                            <FaMedal />
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Col: Assigned Members */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-black flex items-center gap-2">
                            <FaUsers className="text-[var(--primary)]" /> My Members <span className="text-xs bg-slate-800 px-2 py-0.5 rounded-full text-slate-400">{assignedMembers.length}</span>
                        </h2>
                        <button className="text-xs font-bold text-[var(--primary)] hover:underline">View All</button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {assignedMembers.length > 0 ? assignedMembers.map(member => (
                            <div key={member.id} className="glass-card p-5 hover:border-[var(--primary)]/30 transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full overflow-hidden bg-slate-800 border-2 border-white/5 group-hover:border-[var(--primary)]/50 transition-colors">
                                        <img src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.name}`} alt={member.name} />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-bold truncate">{member.name}</h4>
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">{member.plan || 'Standard Member'}</p>
                                    </div>
                                    {member.role === 'PREMIUM_USER' && <FaStar className="text-yellow-500 text-sm" title="Prime Member" />}
                                </div>
                                <div className="mt-4 pt-4 border-t border-white/5 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={() => { setSelectedMember(member); setIsDietModalOpen(true); }}
                                        className="bg-slate-800 hover:bg-slate-700 text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                                        <FaClipboardList /> Diet Plan
                                    </button>
                                    <button
                                        onClick={() => { setSelectedMember(member); setIsWorkoutModalOpen(true); }}
                                        className="bg-[var(--primary)] text-black text-[10px] font-bold py-2 rounded-lg transition-colors flex items-center justify-center gap-1">
                                        <FaDumbbell /> Workout
                                    </button>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-2 p-12 text-center border-2 border-dashed border-white/5 rounded-2xl text-slate-500">
                                No members assigned to you yet.
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Col: Alerts & Polls */}
                <div className="space-y-6">
                    <h2 className="text-xl font-black flex items-center gap-2">
                        <FaBell className="text-[var(--primary)]" /> Session Alerts
                    </h2>
                    <div className="space-y-3">
                        {recentAlerts.length > 0 ? recentAlerts.map(alert => (
                            <div key={alert.id} className="bg-slate-900/40 border border-white/5 p-4 rounded-xl hover:bg-slate-900/60 transition group cursor-pointer">
                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                                        <FaCalendarCheck />
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-bold group-hover:text-[var(--primary)] transition-colors">{alert.content}</p>
                                        <p className="text-[10px] text-slate-500 mt-1">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="p-8 text-center bg-slate-900/40 border border-dashed border-white/5 rounded-xl text-slate-500 text-sm">
                                No new session alerts
                            </div>
                        )}
                    </div>

                    <div className="glass-card p-6 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border-indigo-500/20">
                        <h3 className="font-black text-lg mb-4 flex items-center gap-2">
                            <FaCalendarCheck className="text-indigo-400" /> Upcoming Class
                        </h3>
                        <div className="space-y-4">
                            <div className="flex justify-between items-center text-xs">
                                <span className="text-slate-400 font-bold uppercase tracking-widest">{upcomingSession?.type || 'No Session Scheduled'}</span>
                                <span className="text-indigo-400 font-bold">{upcomingSession?.time || '---'}</span>
                            </div>
                            <div className="flex items-center -space-x-3">
                                {[1, 2, 3, 4, 5].map(i => (
                                    <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-900 overflow-hidden ring-1 ring-white/5 shadow-xl">
                                        <img src={`https://i.pravatar.cc/100?u=${i}`} alt="Attendee" />
                                    </div>
                                ))}
                                <div className="w-8 h-8 rounded-full bg-slate-800 border-2 border-slate-900 flex items-center justify-center text-[10px] font-bold text-slate-400 ring-1 ring-white/5">
                                    +{upcomingSession?.inCount || 0}
                                </div>
                            </div>
                            <button
                                disabled={!upcomingSession}
                                className={`w-full ${upcomingSession ? 'bg-indigo-500 hover:bg-indigo-600' : 'bg-slate-700 cursor-not-allowed'} font-black py-3 rounded-xl transition shadow-lg shadow-indigo-500/20`}
                            >
                                {upcomingSession ? 'Start Session' : 'No Active Session'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Diet Plan Modal */}
            <Modal isOpen={isDietModalOpen} onClose={() => setIsDietModalOpen(false)} title={`Assign Diet Plan to ${selectedMember?.name}`}>
                <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                    {dietEntries.map((entry, index) => (
                        <div key={index} className="p-4 bg-white/5 rounded-xl border border-white/10 space-y-3 relative">
                            {dietEntries.length > 1 && (
                                <button
                                    onClick={() => setDietEntries(prev => prev.filter((_, i) => i !== index))}
                                    className="absolute top-2 right-2 text-red-500 hover:text-red-400">
                                    <FaTrash size={12} />
                                </button>
                            )}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Food Item</label>
                                    <input
                                        type="text"
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-sm"
                                        placeholder="e.g. Oatmeal"
                                        value={entry.foodName}
                                        onChange={(e) => {
                                            const newEntries = [...dietEntries];
                                            newEntries[index].foodName = e.target.value;
                                            setDietEntries(newEntries);
                                        }}
                                    />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[10px] font-bold text-slate-500 uppercase">Timing</label>
                                    <select
                                        className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-sm"
                                        value={entry.timingFood}
                                        onChange={(e) => {
                                            const newEntries = [...dietEntries];
                                            newEntries[index].timingFood = e.target.value;
                                            setDietEntries(newEntries);
                                        }}
                                    >
                                        <option>Breakfast</option>
                                        <option>Snack 1</option>
                                        <option>Lunch</option>
                                        <option>Snack 2</option>
                                        <option>Dinner</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <label className="text-[10px] font-bold text-slate-500 uppercase">Description/Portion</label>
                                <input
                                    type="text"
                                    className="w-full bg-slate-900 border border-white/10 rounded-lg p-2 text-sm"
                                    placeholder="e.g. 1 bowl with 10g almonds"
                                    value={entry.description}
                                    onChange={(e) => {
                                        const newEntries = [...dietEntries];
                                        newEntries[index].description = e.target.value;
                                        setDietEntries(newEntries);
                                    }}
                                />
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setDietEntries([...dietEntries, { foodName: '', description: '', timingFood: 'Snack 1' }])}
                        className="w-full py-2 border-2 border-dashed border-white/10 rounded-xl text-slate-500 hover:text-[var(--primary)] hover:border-[var(--primary)]/50 transition-all flex items-center justify-center gap-2 text-xs font-bold">
                        <FaPlus size={10} /> Add Food Item
                    </button>
                    <button
                        onClick={handleSaveDietPlan}
                        className="w-full bg-[var(--primary)] text-black font-black py-4 rounded-xl mt-4">
                        Save Diet Plan
                    </button>
                </div>
            </Modal>

            {/* Workout Plan Modal */}
            <Modal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} title={`Assign Weekly Workout to ${selectedMember?.name}`}>
                <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-2">
                    {['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'].map(day => (
                        <div key={day} className="flex items-center gap-4 bg-white/5 p-3 rounded-xl border border-white/5">
                            <span className="w-24 text-xs font-black uppercase text-slate-400">{day}</span>
                            <select
                                className="flex-1 bg-slate-900 border border-white/10 rounded-lg p-2 text-sm"
                                value={workoutPlan[`${day}WorkoutId`]}
                                onChange={(e) => setWorkoutPlan({ ...workoutPlan, [`${day}WorkoutId`]: e.target.value })}
                            >
                                <option value="">Rest Day</option>
                                {availableWorkouts.map(w => (
                                    <option key={w.id} value={w.id}>{w.title}</option>
                                ))}
                            </select>
                        </div>
                    ))}
                    <button
                        onClick={handleSaveWorkoutPlan}
                        className="w-full bg-[var(--primary)] text-black font-black py-4 rounded-xl mt-4">
                        Save Weekly Routine
                    </button>
                </div>
            </Modal>

            <style jsx>{`
                .glass-card {
                    background: rgba(255, 255, 255, 0.03);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 20px;
                }
            `}</style>
        </div>
    );
}
