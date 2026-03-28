"use client";

import { useState, useEffect, useMemo } from "react";
import { FiX, FiSearch, FiPlus, FiCheck } from "react-icons/fi";
import { apiGet, apiPost } from "@/lib/api";

// Helper to debounce search
const useDebounce = (value, delay) => {
    const [debouncedValue, setDebouncedValue] = useState(value);
    useEffect(() => {
        const handler = setTimeout(() => setDebouncedValue(value), delay);
        return () => clearTimeout(handler);
    }, [value, delay]);
    return debouncedValue;
};

export default function AddCaloriesModal({ isOpen, onClose, onFoodAdded }) {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);
    const [searchResults, setSearchResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [loadError, setLoadError] = useState(false);

    // Details View State
    const [selectedFood, setSelectedFood] = useState(null);
    const [portions, setPortions] = useState([]);
    const [selectedPortionId, setSelectedPortionId] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loadingDetails, setLoadingDetails] = useState(false);

    // Reset when closed
    useEffect(() => {
        if (!isOpen) {
            setSearchTerm("");
            setSearchResults([]);
            setSelectedFood(null);
            setPortions([]);
            setSelectedPortionId(null);
            setQuantity(1);
        }
    }, [isOpen]);

    // Search Effect
    useEffect(() => {
        if (debouncedSearchTerm.length > 2) {
            searchFoods(debouncedSearchTerm);
        } else if (debouncedSearchTerm.length === 0 && isOpen) {
            fetchInitialList();
        }
    }, [debouncedSearchTerm]);

    // Initial Load
    useEffect(() => {
        if (isOpen && searchTerm.length === 0) {
            fetchInitialList();
        }
    }, [isOpen]);

    const fetchInitialList = async () => {
        setIsLoading(true);
        try {
            console.log("AddCaloriesModal: Fetching initial food list...");
            const data = await apiGet('/api/user/food/list', { page: 0, size: 20 });
            setSearchResults(data);
        } catch (error) {
            console.error("Failed to fetch initial list", error);
            setLoadError(true);
        } finally {
            setIsLoading(false);
        }
    };

    const searchFoods = async (query) => {
        setIsLoading(true);
        try {
            console.log(`AddCaloriesModal: Searching for '${query}'`);
            const data = await apiPost('/api/user/food/search', { query });
            setSearchResults(data);
        } catch (error) {
            console.error("Search failed", error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleSelectFood = async (foodId) => {
        setLoadingDetails(true);
        try {
            const food = await apiGet(`/api/user/food/${foodId}`);
            setSelectedFood(food);
            setPortions(food.portions || []);

            // Default to 100g if available, or first portion
            const gramPortion = food.portions?.find(p => p.measureUnit === "g" && p.amount === 100);
            if (gramPortion) {
                setSelectedPortionId(gramPortion.id);
            } else if (food.portions?.length > 0) {
                setSelectedPortionId(food.portions[0].id);
            }

            setQuantity(1);
        } catch (error) {
            console.error("Fetch details failed", error);
        } finally {
            setLoadingDetails(false);
        }
    };

    // Calculate Totals
    const nutrients = useMemo(() => {
        if (!selectedFood) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

        let portion = portions.find(p => p.id === Number(selectedPortionId));
        if (!portion && portions.length > 0) portion = portions[0];

        if (!portion) return { calories: 0, protein: 0, carbs: 0, fat: 0 };

        const gramWeight = portion.gramWeight || 0;
        const multiplier = (gramWeight / 100.0) * quantity;

        const getNutrientVal = (namePattern) => {
            const n = selectedFood.nutrients?.find(n => n.name.toLowerCase().includes(namePattern.toLowerCase()));
            return n ? n.amount : 0;
        };

        const calories100g = getNutrientVal("Energy");
        const protein100g = getNutrientVal("Protein");
        const carbs100g = getNutrientVal("Carbohydrate");
        const fat100g = getNutrientVal("fat");

        return {
            calories: Math.round(calories100g * multiplier),
            protein: (protein100g * multiplier).toFixed(1),
            carbs: (carbs100g * multiplier).toFixed(1),
            fat: (fat100g * multiplier).toFixed(1)
        };
    }, [selectedFood, selectedPortionId, quantity, portions]);

    const handleAddToDiary = async () => {
        if (!selectedFood) return;

        setLoadingDetails(true);
        try {
            await apiPost('/api/user/food/log', {
                foodId: selectedFood.id,
                portionId: selectedPortionId,
                quantity: quantity,
                date: new Date().toISOString().split('T')[0],
                mealType: "Snack"
            });

            onClose();
            if (onFoodAdded) onFoodAdded();
        } catch (error) {
            console.error("Failed to log food", error);
            alert("Failed to add food. Please try again.");
        } finally {
            setLoadingDetails(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
            <div className="bg-white dark:bg-neutral-900 w-full max-w-6xl rounded-3xl shadow-2xl border border-gray-200 dark:border-neutral-800 overflow-hidden flex flex-col md:flex-row h-[700px] max-h-[95vh]">

                {/* LEFT COLUMN: Search & List */}
                <div className="w-full md:w-5/12 border-r border-gray-200 dark:border-neutral-800 flex flex-col p-6 bg-slate-50 dark:bg-neutral-900/50">
                    <h3 className="text-2xl font-black mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-emerald-400">Search Food Items</h3>

                    <div className="relative mb-6" suppressHydrationWarning>
                        <FiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg" />
                        <input
                            type="text"
                            placeholder="Type food name..."
                            className="w-full pl-12 pr-4 py-4 rounded-2xl bg-white dark:bg-neutral-800 text-gray-900 dark:text-white border-2 border-transparent focus:border-green-500 focus:ring-0 outline-none transition-all shadow-sm focus:shadow-green-100 dark:focus:shadow-none placeholder-gray-400 font-medium"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            autoFocus
                        />
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
                        {isLoading && <div className="text-center text-gray-500 py-8 animate-pulse">Searching...</div>}

                        {!isLoading && searchResults.map(item => {
                            const isSelected = selectedFood?.id === item.id;
                            return (
                                <div
                                    key={item.id}
                                    onClick={() => handleSelectFood(item.id)}
                                    className={`p-4 rounded-xl cursor-pointer transition-all border-l-4 group flex justify-between items-center ${isSelected
                                        ? 'bg-white dark:bg-neutral-800 border-green-500 shadow-md transform scale-[1.01]'
                                        : 'bg-white/50 dark:bg-neutral-800/30 border-transparent hover:bg-green-50 dark:hover:bg-green-900/20 hover:border-green-400 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex flex-col">
                                        <div className={`font-bold transition-colors ${isSelected ? 'text-green-700 dark:text-green-400' : 'text-gray-700 dark:text-gray-300'}`}>{item.description}</div>
                                        <div className="text-xs text-gray-400 font-medium">{item.foodCategory}</div>
                                    </div>
                                    {isSelected && <FiCheck className="text-green-500 text-xl" suppressHydrationWarning />}
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* RIGHT COLUMN: Details */}
                <div className="w-full md:w-7/12 flex flex-col p-8 relative bg-white dark:bg-neutral-900">
                    <button
                        onClick={onClose}
                        className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-500 dark:bg-neutral-800 dark:hover:text-red-400 transition-all z-10"
                        suppressHydrationWarning
                    >
                        <FiX size={24} />
                    </button>

                    {selectedFood ? (
                        <div className="flex flex-col h-full animate-fadeIn">
                            {/* Header Info */}
                            <div className="mb-8 pr-12">
                                <div className="inline-block px-3 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-xs font-bold uppercase tracking-wider mb-2">
                                    Selected Item
                                </div>
                                <h2 className="text-3xl font-black text-gray-800 dark:text-white leading-tight mb-2">
                                    {selectedFood.description}
                                </h2>
                                <div className="text-lg text-gray-500 font-medium">
                                    Total Energy: <span className="text-green-600 dark:text-green-400 font-bold">{nutrients.calories} kcal</span>
                                </div>
                            </div>

                            {/* Macros Grid */}
                            <div className="grid grid-cols-4 gap-4 mb-10">
                                {/* Calories */}
                                <div className="bg-orange-50 dark:bg-orange-900/10 p-4 rounded-2xl border border-orange-100 dark:border-orange-900/30 flex flex-col items-center">
                                    <span className="text-xs font-bold text-orange-500 uppercase tracking-widest mb-1">Cals</span>
                                    <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{nutrients.calories}</span>
                                </div>
                                {/* Protein */}
                                <div className="bg-blue-50 dark:bg-blue-900/10 p-4 rounded-2xl border border-blue-100 dark:border-blue-900/30 flex flex-col items-center">
                                    <span className="text-xs font-bold text-blue-500 uppercase tracking-widest mb-1">Prot</span>
                                    <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{nutrients.protein}<span className="text-sm font-normal text-blue-400">g</span></span>
                                </div>
                                {/* Carbs */}
                                <div className="bg-green-50 dark:bg-green-900/10 p-4 rounded-2xl border border-green-100 dark:border-green-900/30 flex flex-col items-center">
                                    <span className="text-xs font-bold text-green-500 uppercase tracking-widest mb-1">Carbs</span>
                                    <span className="text-2xl font-black text-green-600 dark:text-green-400">{nutrients.carbs}<span className="text-sm font-normal text-green-400">g</span></span>
                                </div>
                                {/* Fat */}
                                <div className="bg-yellow-50 dark:bg-yellow-900/10 p-4 rounded-2xl border border-yellow-100 dark:border-yellow-900/30 flex flex-col items-center">
                                    <span className="text-xs font-bold text-yellow-600 uppercase tracking-widest mb-1">Fat</span>
                                    <span className="text-2xl font-black text-yellow-700 dark:text-yellow-400">{nutrients.fat}<span className="text-sm font-normal text-yellow-500">g</span></span>
                                </div>
                            </div>

                            {/* Description Placeholder */}
                            <div className="flex-1 mb-6 p-6 rounded-2xl bg-gray-50 dark:bg-neutral-800/50 border border-gray-100 dark:border-neutral-800">
                                <p className="text-gray-500 dark:text-gray-400 leading-relaxed italic">
                                    More nutritional details like vitamins, fiber, iron, and sodium will appear here...
                                </p>
                            </div>

                            {/* Bottom Controls */}
                            <div className="mt-auto bg-gray-50 dark:bg-neutral-800 p-5 rounded-3xl flex items-end gap-6 w-full border border-gray-100 dark:border-neutral-700/50">
                                <div className="flex-1 relative">
                                    <label className="block text-xs font-bold text-gray-400 uppercase mb-2 ml-1">Serving Size</label>
                                    <div className="relative bg-white dark:bg-neutral-900 rounded-xl overflow-hidden border border-gray-200 dark:border-neutral-700 hover:border-green-400 transition-colors">
                                        <select
                                            className="w-full text-lg font-bold bg-transparent border-none outline-none py-3 px-4 appearance-none cursor-pointer text-gray-800 dark:text-gray-200"
                                            value={selectedPortionId || ""}
                                            onChange={(e) => {
                                                setSelectedPortionId(Number(e.target.value));
                                                setQuantity(1);
                                            }}
                                        >
                                            {portions.map(p => (
                                                <option key={p.id} value={p.id} className="bg-white dark:bg-neutral-900 text-gray-800 dark:text-gray-200">
                                                    {p.amount} {p.measureUnit} {p.modifier ? `(${p.modifier})` : ''} ({p.gramWeight}g)
                                                </option>
                                            ))}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
                                    </div>
                                </div>

                                <div className="flex flex-col items-center">
                                    <label className="text-xs font-bold text-gray-400 uppercase mb-2">Quantity</label>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setQuantity(q => Math.max(0.25, q - 0.25))}
                                            className="w-10 h-10 flex items-center justify-center text-xl font-bold bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 hover:border-green-500 hover:text-green-500 rounded-xl transition-all shadow-sm"
                                        >
                                            -
                                        </button>
                                        <div className="w-16 h-10 flex items-center justify-center text-xl font-black bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 rounded-xl shadow-inner text-gray-800 dark:text-white">
                                            {quantity}
                                        </div>
                                        <button
                                            onClick={() => setQuantity(q => q + 0.25)}
                                            className="w-10 h-10 flex items-center justify-center text-xl font-bold bg-white dark:bg-neutral-900 border border-gray-200 dark:border-neutral-700 hover:border-green-500 hover:text-green-500 rounded-xl transition-all shadow-sm"
                                        >
                                            +
                                        </button>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleAddToDiary}
                                className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-lg py-4 rounded-2xl hover:shadow-lg hover:shadow-green-500/30 transform hover:-translate-y-1 transition-all active:scale-[0.99]"
                            >
                                Add {nutrients.calories} kcal to Diary
                            </button>

                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-gray-300 dark:text-gray-700">
                            <div className="w-32 h-32 bg-gray-100 dark:bg-neutral-800 rounded-full flex items-center justify-center mb-6 animate-pulse">
                                <span className="text-6xl">🥗</span>
                            </div>
                            <p className="text-2xl font-bold text-gray-400 dark:text-gray-600">Select a food to view details</p>
                        </div>
                    )}
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 5px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background-color: rgba(16, 185, 129, 0.2);
                    border-radius: 20px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background-color: rgba(16, 185, 129, 0.5);
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                .animate-fadeIn {
                    animation: fadeIn 0.3s ease-out forwards;
                }
            `}</style>
        </div>
    );
}
