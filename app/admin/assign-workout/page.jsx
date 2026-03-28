"use client";
import React, { useState, useEffect } from 'react';
import BodyAnatomy from '@/components/BodyAnatomy'; // Ensure this path is correct
import { getAdminUsers } from '@/lib/api/admin';
import { getAllExercises, assignWorkoutToUser } from '@/lib/api/workout';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function AssignWorkoutPage() {
    // State
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState('');
    const [selectedMuscle, setSelectedMuscle] = useState('Chest');
    const [exercises, setExercises] = useState([]);
    const [selectedExercises, setSelectedExercises] = useState([]); // List of { exerciseId, sets, reps, time }
    const [selectedDay, setSelectedDay] = useState('Monday');
    const [loading, setLoading] = useState(false);
    const [usersLoading, setUsersLoading] = useState(true);
    const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

    const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

    // Load Users & Handle Query Param
    useEffect(() => {
        const loadUsers = async () => {
            try {
                const data = await getAdminUsers();
                setUsers(data || []);

                // Check URL param after users are loaded
                const paramUserId = searchParams ? searchParams.get('userId') : null;
                if (paramUserId) {
                    // Ensure the type matches (usually string from URL, maybe num in DB)
                    // We'll compare loosely or convert
                    const found = data.find(u => u.id.toString() === paramUserId);
                    if (found) {
                        setSelectedUser(found.id);
                    }
                }
            } catch (error) {
                console.error("Failed to load users", error);
                toast.error("Failed to load users");
            } finally {
                setUsersLoading(false);
            }
        };
        loadUsers();
    }, []);

    // Load Exercises when muscle group changes
    useEffect(() => {
        const loadExercises = async () => {
            try {
                // If muscle is "Cardio", handle specifically if backend supports it, else pass as string
                const data = await getAllExercises(selectedMuscle);
                setExercises(data || []);
            } catch (error) {
                console.error("Failed to load exercises", error);
            }
        };
        if (selectedMuscle) {
            loadExercises();
        }
    }, [selectedMuscle]);

    // Handlers
    const toggleExerciseSelection = (exercise) => {
        if (selectedExercises.find(e => e.exerciseId === exercise.id)) {
            setSelectedExercises(prev => prev.filter(e => e.exerciseId !== exercise.id));
        } else {
            setSelectedExercises(prev => [
                ...prev,
                { exerciseId: exercise.id, name: exercise.name, sets: 3, reps: 10, time: 0 }
            ]);
        }
    };

    const updateExerciseDetails = (id, field, value) => {
        setSelectedExercises(prev => prev.map(ex => {
            if (ex.exerciseId === id) {
                return { ...ex, [field]: value };
            }
            return ex;
        }));
    };

    const handleAssign = async () => {
        if (!selectedUser) return toast.error("Please select a user");
        if (selectedExercises.length === 0) return toast.error("Please select at least one exercise");

        setLoading(true);
        try {
            await assignWorkoutToUser({
                userId: selectedUser,
                day: selectedDay,
                exercises: selectedExercises.map(ex => ({
                    exerciseId: ex.exerciseId,
                    sets: parseInt(ex.sets),
                    reps: parseInt(ex.reps),
                    time: parseInt(ex.time)
                }))
            });
            toast.success(`Workout assigned for ${selectedDay}!`);
            setSelectedExercises([]); // Clear selection after assignment? Maybe keep for bulk assign? Let's clear.
        } catch (error) {
            console.error("Assignment failed", error);
            toast.error("Failed to assign workout");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen p-6 text-white space-y-8 bg-slate-900/50 backdrop-blur-md pb-20">
            <header className="flex flex-col md:flex-row justify-between items-center gap-4">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-amber-400 to-orange-600 bg-clip-text text-transparent">
                    Assign Workout Plan
                </h1>

                {/* User Selector */}
                <div className="w-full md:w-auto">
                    <select
                        value={selectedUser}
                        onChange={(e) => setSelectedUser(e.target.value)}
                        className="w-full md:w-64 bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 focus:ring-2 focus:ring-amber-500 outline-none"
                    >
                        <option value="">Select User</option>
                        {users.map(u => (
                            <option key={u.id} value={u.id}>
                                {u.firstName} {u.lastName} ({u.email})
                            </option>
                        ))}
                    </select>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* LEFT: Filters & Anatomy */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 shadow-xl">
                        <h3 className="text-lg font-semibold mb-4 text-slate-300">Target Muscle</h3>
                        <div className="flex justify-center">
                            <BodyAnatomy
                                selectedMuscle={selectedMuscle}
                                onSelect={setSelectedMuscle}
                            />
                        </div>
                        <div className="flex flex-wrap gap-2 justify-center mt-6">
                            {['Cardio', 'Full Body', 'Stretching'].map(type => (
                                <button
                                    key={type}
                                    onClick={() => setSelectedMuscle(type)}
                                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${selectedMuscle === type
                                        ? 'bg-amber-500 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        }`}
                                >
                                    {type}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* MIDDLE: Exercise Selection */}
                <div className="lg:col-span-5 space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 h-[600px] flex flex-col">
                        <h3 className="text-lg font-semibold mb-4 text-slate-300">
                            Available Exercises ({selectedMuscle})
                        </h3>

                        <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                            {exercises.length === 0 ? (
                                <div className="text-center text-slate-500 py-10">
                                    No exercises found for {selectedMuscle}
                                </div>
                            ) : (
                                exercises.map(ex => {
                                    const isSelected = selectedExercises.some(s => s.exerciseId === ex.id);
                                    return (
                                        <div
                                            key={ex.id}
                                            onClick={() => toggleExerciseSelection(ex)}
                                            className={`p-3 rounded-xl border cursor-pointer transition-all flex items-center gap-4 ${isSelected
                                                ? 'bg-amber-500/10 border-amber-500/50'
                                                : 'bg-slate-700/30 border-slate-700 hover:border-slate-500'
                                                }`}
                                        >
                                            <div className="w-12 h-12 bg-slate-800 rounded-lg flex-shrink-0 overflow-hidden">
                                                {ex.videoUrl ? (
                                                    <img src={ex.videoUrl} alt={ex.name} className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-xs">No Img</div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <h4 className={`font-medium ${isSelected ? 'text-amber-400' : 'text-slate-200'}`}>
                                                    {ex.name}
                                                </h4>
                                                <p className="text-xs text-slate-500 line-clamp-1">{ex.description || 'No description'}</p>
                                            </div>
                                            <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${isSelected ? 'bg-amber-500 border-amber-500' : 'border-slate-500'
                                                }`}>
                                                {isSelected && <span className="text-white text-xs">✓</span>}
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>

                {/* RIGHT: Assignment Config */}
                <div className="lg:col-span-3 space-y-6">
                    <div className="bg-slate-800/50 p-6 rounded-2xl border border-slate-700/50 sticky top-6">
                        <h3 className="text-lg font-semibold mb-4 text-slate-300">Configuration</h3>

                        {/* Day Selector */}
                        <div className="mb-6">
                            <label className="block text-xs font-medium text-slate-400 mb-2">Select Day</label>
                            <div className="grid grid-cols-3 gap-2">
                                {DAYS.map(day => (
                                    <button
                                        key={day}
                                        onClick={() => setSelectedDay(day)}
                                        className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedDay === day
                                            ? 'bg-amber-500 text-white'
                                            : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                            }`}
                                    >
                                        {day.slice(0, 3)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Selected List */}
                        <div className="space-y-4 mb-6 max-h-[400px] overflow-y-auto pr-1">
                            {selectedExercises.length === 0 && (
                                <p className="text-sm text-slate-500 text-center italic">No exercises selected</p>
                            )}
                            {selectedExercises.map((ex, idx) => (
                                <div key={ex.exerciseId} className="bg-slate-900/50 p-3 rounded-xl border border-slate-700 space-y-3">
                                    <div className="flex justify-between items-start">
                                        <span className="text-sm font-medium text-amber-400">{ex.name}</span>
                                        <button
                                            onClick={() => toggleExerciseSelection({ id: ex.exerciseId })}
                                            className="text-slate-500 hover:text-red-400"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-3 gap-2">
                                        <div>
                                            <label className="text-[10px] text-slate-500">Sets</label>
                                            <input
                                                type="number"
                                                value={ex.sets}
                                                onChange={(e) => updateExerciseDetails(ex.exerciseId, 'sets', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500">Reps</label>
                                            <input
                                                type="number"
                                                value={ex.reps}
                                                onChange={(e) => updateExerciseDetails(ex.exerciseId, 'reps', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-amber-500"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-[10px] text-slate-500">Secs</label>
                                            <input
                                                type="number"
                                                value={ex.time}
                                                onChange={(e) => updateExerciseDetails(ex.exerciseId, 'time', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-xs outline-none focus:border-amber-500"
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <button
                            onClick={handleAssign}
                            disabled={loading || !selectedUser || selectedExercises.length === 0}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 text-white font-bold shadow-lg shadow-orange-900/20 hover:shadow-orange-900/40 disabled:opacity-50 disabled:cursor-not-allowed transition-all transform hover:-translate-y-0.5"
                        >
                            {loading ? 'Assigning...' : `Assign to ${selectedDay}`}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
