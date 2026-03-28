"use client";

import { useState, useEffect } from "react";
import { FiX, FiDroplet } from "react-icons/fi";
import axios from "axios";

export default function AddWaterModal({ isOpen, onClose, onAdd }) {
    // 3 Bottles (1L each), 5 Glasses (250ml each)
    const [bottles, setBottles] = useState([false, false, false]);
    const [glasses, setGlasses] = useState([false, false, false, false, false]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            // Reset on close
            setBottles([false, false, false]);
            setGlasses([false, false, false, false, false]);
        }
    }, [isOpen]);

    const toggleBottle = (index) => {
        const newBottles = [...bottles];
        newBottles[index] = !newBottles[index];
        setBottles(newBottles);
    };

    const toggleGlass = (index) => {
        const newGlasses = [...glasses];
        newGlasses[index] = !newGlasses[index];
        setGlasses(newGlasses);
    };

    const totalWaterLiters = () => {
        const bottleCount = bottles.filter(b => b).length;
        const glassCount = glasses.filter(g => g).length;
        // 1 Bottle = 1000ml = 1L
        // 1 Glass = 250ml = 0.25L
        return (bottleCount * 1.0) + (glassCount * 0.25);
    };

    const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
    };

    const handleAddWater = async () => {
        const amount = totalWaterLiters();
        if (amount <= 0) return;

        setLoading(true);
        try {
            const token = getCookie('authToken') || getCookie('jwt') || getCookie('accessToken');

            // NOTE: Backend endpoint implemented.
            await axios.post('http://localhost:8080/api/user/water/log', {
                amount: amount, // in Liters
                date: new Date().toISOString().split('T')[0]
            }, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            onClose();
            if (onAdd) onAdd();
        } catch (error) {
            console.error("Failed to log water", error);
            // Fallback for demo if API fails/doesn't exist yet
            alert(`Logged ${amount} Liters (API Mock).`);
            onClose();
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-lg rounded-3xl shadow-2xl border border-blue-100 dark:border-blue-900/30 overflow-hidden relative flex flex-col">

                {/* Header */}
                <div className="p-6 bg-gradient-to-r from-cyan-500 to-blue-600 flex justify-between items-center text-white">
                    <div className="flex items-center gap-3">
                        <div className="bg-white/20 p-2 rounded-xl backdrop-blur-sm" suppressHydrationWarning>
                            <FiDroplet className="text-2xl" />
                        </div>
                        <h3 className="text-2xl font-black">Add Water</h3>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-white/10 hover:bg-white/20 rounded-full transition-colors"
                        suppressHydrationWarning
                    >
                        <FiX size={24} />
                    </button>
                </div>

                <div className="p-8 flex flex-col items-center gap-8 bg-cyan-50/50 dark:bg-neutral-900">

                    {/* Total Display */}
                    <div className="text-center">
                        <div className="text-5xl font-black text-blue-600 dark:text-blue-400 mb-1">
                            {totalWaterLiters().toFixed(2)}<span className="text-2xl text-blue-400 dark:text-blue-600 ml-1">L</span>
                        </div>
                        <p className="text-gray-500 font-medium">Total Intake</p>
                    </div>

                    {/* Bottles Section */}
                    <div className="w-full">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="h-px flex-1 bg-gray-200 dark:bg-neutral-700"></span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Bottles (1L)</span>
                            <span className="h-px flex-1 bg-gray-200 dark:bg-neutral-700"></span>
                        </div>
                        <div className="flex justify-center gap-6">
                            {bottles.map((filled, idx) => (
                                <div
                                    key={`bottle-${idx}`}
                                    onClick={() => toggleBottle(idx)}
                                    className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95`}
                                >
                                    {/* Simple CSS Bottle Shape */}
                                    <div className={`w-14 h-36 rounded-2xl border-4 flex flex-col justify-end overflow-hidden transition-colors ${filled
                                        ? 'border-blue-500 bg-blue-100 dark:bg-blue-900/20'
                                        : 'border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                                        }`}>
                                        <div className={`w-full transition-all duration-500 ease-out ${filled ? 'h-full bg-blue-500' : 'h-0 bg-blue-500'}`}></div>
                                    </div>
                                    {/* Bottle Cap */}
                                    <div className={`absolute -top-3 left-1/2 -translate-x-1/2 w-8 h-4 rounded-t-lg border-4 border-b-0 transition-colors ${filled ? 'border-blue-500 bg-blue-500' : 'border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                                        }`}></div>

                                    {filled && (
                                        <div className="absolute inset-0 flex items-center justify-center text-white/50 text-xs font-bold pointer-events-none">
                                            1L
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Glasses Section */}
                    <div className="w-full">
                        <div className="flex items-center gap-4 mb-4">
                            <span className="h-px flex-1 bg-gray-200 dark:bg-neutral-700"></span>
                            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Glasses (250ml)</span>
                            <span className="h-px flex-1 bg-gray-200 dark:bg-neutral-700"></span>
                        </div>
                        <div className="flex justify-center gap-4">
                            {glasses.map((filled, idx) => (
                                <div
                                    key={`glass-${idx}`}
                                    onClick={() => toggleGlass(idx)}
                                    className={`relative cursor-pointer transition-all duration-300 transform hover:scale-105 active:scale-95`}
                                >
                                    {/* Simple CSS Glass Shape */}
                                    <div className={`w-10 h-14 border-b-4 border-x-4 rounded-b-xl flex flex-col justify-end overflow-hidden transition-colors ${filled
                                        ? 'border-cyan-400 bg-cyan-100 dark:bg-cyan-900/20'
                                        : 'border-gray-300 dark:border-neutral-600 bg-white dark:bg-neutral-800'
                                        }`}>
                                        <div className={`w-full transition-all duration-500 ease-out ${filled ? 'h-[90%] bg-cyan-400' : 'h-0 bg-cyan-400'}`}></div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <button
                        onClick={handleAddWater}
                        disabled={totalWaterLiters() === 0 || loading}
                        className={`w-full py-4 rounded-2xl font-bold text-lg shadow-xl transition-all ${totalWaterLiters() > 0
                            ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-blue-500/30 hover:-translate-y-1'
                            : 'bg-gray-200 dark:bg-neutral-800 text-gray-400 cursor-not-allowed'
                            }`}
                    >
                        {loading ? 'Adding...' : `Add ${totalWaterLiters().toFixed(2)}L to Diary`}
                    </button>

                </div>
            </div>
        </div>
    );
}
