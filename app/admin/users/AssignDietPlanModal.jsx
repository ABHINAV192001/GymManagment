"use client";
import React, { useState } from 'react';
import Modal from '@/app/components/Modal';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Plus, ChevronRight, Check, Filter } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api/client';
import { getFoodsByPreference } from '@/lib/api/user';
import { toast } from 'react-hot-toast';

const DIETARY_PREFERENCES = [
    { label: "Low Cholesterol" },
    { label: "High Cholesterol" },
    { label: "High Sodium" },
    { label: "Low Sodium" },
    { label: "High Fiber" },
    { label: "Gluten Free" },
    { label: "Keto Friendly" },
    { label: "Vegan Options" }
];

export default function AssignDietPlanModal({ isOpen, onClose, user }) {
    const [step, setStep] = useState(1); // 1: Search, 2: Details
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [selectedPreference, setSelectedPreference] = useState("");

    // Step 2 form state
    const [timing, setTiming] = useState('Breakfast');
    const [notes, setNotes] = useState('');
    const [quantity, setQuantity] = useState(1);
    const [selectedPortion, setSelectedPortion] = useState(null);
    const [selectedFile, setSelectedFile] = useState(null);
    const [assigning, setAssigning] = useState(false);

    // Reset state when modal closes
    React.useEffect(() => {
        if (!isOpen) {
            setStep(1);
            setQuery('');
            setResults([]);
            setSelectedFood(null);
            setSelectedPreference("");
            setNotes('');
            setQuantity(1);
            setSelectedPortion(null);
            setSelectedFile(null);
        }
    }, [isOpen]);

    // ... existing search handlers ...

    const handleFileChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            if (file.type !== 'application/pdf') {
                toast.error("Only PDF files are allowed");
                return;
            }
            setSelectedFile(file);
        }
    };

    const handleAssign = async () => {
        setAssigning(true);
        try {
            let portionText = "";
            let totalWeight = 0;

            if (selectedPortion) {
                portionText = `${quantity} x ${selectedPortion.amount} ${selectedPortion.modifier}`;
                totalWeight = quantity * selectedPortion.gramWeight;
            } else {
                portionText = `${quantity} Units`;
                totalWeight = quantity * 100; // Fallback
            }

            const dietPlanData = {
                foodName: selectedFood.description,
                timingFood: timing,
                description: `${notes} (${portionText}, ~${totalWeight.toFixed(0)}g)`.trim(),
                user: { id: user.id }
            };

            const formData = new FormData();
            formData.append('dietPlan', new Blob([JSON.stringify(dietPlanData)], { type: 'application/json' }));

            if (selectedFile) {
                formData.append('file', selectedFile);
            }

            // Using raw fetch here since client helper might not support multipart auto-detection perfectly or arguments structure
            // But apiPost usually expects JSON. Let's use apiPost with existing client if it supports FormData.
            // Client.js likely sets Content-Type to application/json automatically. 
            // We need to bypass that. Let's assume we need to use fetch directly for now or update client.js.
            // I will use fetch directly for this specific call to be safe.

            const token = localStorage.getItem('token');
            const res = await fetch(`http://localhost:8080/api/diet/assign?userId=${user.id}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                    // Do NOT set Content-Type here, let browser set it with boundary
                },
                body: formData
            });

            if (!res.ok) throw new Error("Failed to assign");

            toast.success(`Assigned ${selectedFood.description} to ${user.name}`);
            onClose();
        } catch (error) {
            console.error("Assign failed:", error);
            toast.error("Failed to assign diet plan");
        } finally {
            setAssigning(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title={`Assign Diet to ${user?.name}`}
        >
            <div className="min-h-[400px] flex flex-col">
                {step === 1 ? (
                    // ... existing step 1 ...
                    <div className="space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-500 group-focus-within:text-amber-500" />
                            <input
                                autoFocus
                                type="text"
                                value={query}
                                onChange={handleSearch}
                                placeholder="Search food to assign..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500 focus:ring-1 focus:ring-amber-500 transition-all"
                            />
                        </div>

                        {/* Filter Dropdown */}
                        <div>
                            <select
                                value={selectedPreference}
                                onChange={handleFilterChange}
                                className="w-full bg-slate-800 border border-slate-700 rounded-xl py-3 px-4 text-gray-300 focus:outline-none focus:border-amber-500 transition-all"
                            >
                                <option value="">-- Or Select Dietary Category --</option>
                                {DIETARY_PREFERENCES.map((p, i) => (
                                    <option key={i} value={p.label}>{p.label}</option>
                                ))}
                            </select>
                        </div>

                        <div className="h-[300px] overflow-y-auto pr-2 space-y-2">
                            {loading && <div className="text-center py-4"><Loader2 className="w-6 h-6 animate-spin text-amber-500 mx-auto" /></div>}

                            {!loading && results.length === 0 && query.length >= 3 && (
                                <div className="text-center py-10 text-gray-500">No foods found.</div>
                            )}

                            {results.map((food) => (
                                <div
                                    key={food.id}
                                    onClick={() => selectFood(food.id)}
                                    className="p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 border border-slate-700 hover:border-amber-500/50 cursor-pointer transition-all flex justify-between items-center group"
                                >
                                    <div className="flex-1">
                                        <h4 className="font-medium text-gray-200 group-hover:text-amber-400 transition-colors">{food.description}</h4>
                                        <span className="text-xs text-gray-500 uppercase">{food.foodCategory}</span>
                                    </div>
                                    <ChevronRight className="w-4 h-4 text-gray-600 group-hover:text-amber-500" />
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        <div className="bg-amber-500/10 border border-amber-500/20 p-4 rounded-xl">
                            <h3 className="font-bold text-amber-500 text-lg line-clamp-1">{selectedFood?.description}</h3>
                            <p className="text-xs text-amber-500/70 uppercase tracking-wider mt-1">Selected Item</p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Meal Timing</label>
                                <select
                                    value={timing}
                                    onChange={(e) => setTiming(e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                                >
                                    {['Breakfast', 'Lunch', 'Dinner', 'Snack', 'Pre-Workout', 'Post-Workout'].map(t => (
                                        <option key={t} value={t}>{t}</option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Quantity</label>
                                <div className="flex items-center gap-2">
                                    <input
                                        type="number"
                                        min="0.1"
                                        step="0.1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(e.target.value)}
                                        className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none"
                                    />
                                </div>
                            </div>
                        </div>

                        {selectedFood?.portions?.length > 0 && (
                            <div>
                                <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Serving Size</label>
                                <div className="flex flex-wrap gap-2">
                                    {selectedFood.portions.map(p => (
                                        <button
                                            key={p.id}
                                            onClick={() => setSelectedPortion(p)}
                                            className={`px-3 py-1.5 rounded-lg text-sm border transition-all ${selectedPortion?.id === p.id ? 'bg-amber-500 text-black border-amber-500 font-bold' : 'bg-slate-800 text-gray-400 border-slate-700'}`}
                                        >
                                            {p.amount} {p.modifier} ({p.gramWeight}g)
                                        </button>
                                    ))}
                                </div>
                            </div>
                        )}

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Notes / Instructions</label>
                            <textarea
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="E.g. Eat with 200ml water..."
                                className="w-full bg-slate-800 border border-slate-700 rounded-lg p-3 text-white focus:border-amber-500 outline-none min-h-[80px]"
                            />
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 block">Attachment (PDF)</label>
                            <input
                                type="file"
                                accept="application/pdf"
                                onChange={handleFileChange}
                                className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-amber-500 file:text-black hover:file:bg-amber-400 cursor-pointer"
                            />
                            {selectedFile && <p className="text-xs text-green-500 mt-1">Selected: {selectedFile.name}</p>}
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                onClick={() => setStep(1)}
                                className="flex-1 py-3 rounded-xl border border-slate-700 text-gray-400 hover:text-white hover:bg-slate-800 transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={handleAssign}
                                disabled={assigning}
                                className="flex-[2] py-3 rounded-xl bg-amber-500 text-black font-bold hover:bg-amber-400 transition flex items-center justify-center gap-2"
                            >
                                {assigning ? <Loader2 className="animate-spin w-5 h-5" /> : <Check className="w-5 h-5" />}
                                Assign Plan
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </Modal>
    );
}
