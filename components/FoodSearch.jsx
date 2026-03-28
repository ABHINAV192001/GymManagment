"use client";
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Loader2, Plus, ChevronRight, X } from 'lucide-react';
import { apiGet, apiPost } from '@/lib/api/client';

export default function FoodSearch() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [selectedFood, setSelectedFood] = useState(null);
    const [searching, setSearching] = useState(false);
    const [quantity, setQuantity] = useState(1);
    const [selectedPortion, setSelectedPortion] = useState(null);
    const [logging, setLogging] = useState(false);

    const handleSearch = async (e) => {
        const val = e.target.value;
        setQuery(val);
        if (val.length < 3) {
            setResults([]);
            return;
        }

        setLoading(true);
        setSearching(true);
        try {
            const data = await apiGet('/api/user/food/search', { query: val });
            setResults(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Search failed:", error);
            setResults([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchFoodDetails = async (id) => {
        setLoading(true);
        try {
            const data = await apiGet(`/api/user/food/${id}`);
            setSelectedFood(data);
            setQuantity(1);
            setSelectedPortion(data.portions?.[0] || null);
        } catch (error) {
            console.error("Failed to fetch details:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleLogFood = async () => {
        if (!selectedFood) return;
        setLogging(true);
        try {
            await apiPost('/api/user/food/log', {
                foodId: selectedFood.id,
                portionId: selectedPortion?.id,
                quantity: parseFloat(quantity),
                mealType: 'General', // Could be expanded later
                date: new Date().toISOString().split('T')[0]
            });
            alert('Food logged successfully!');
            setSelectedFood(null);
        } catch (error) {
            console.error("Failed to log food:", error);
            alert('Failed to log food. Please try again.');
        } finally {
            setLogging(false);
        }
    };

    return (
        <div className="w-full flex flex-col gap-6">
            {/* Search Input */}
            <div className="relative group">
                <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                    {loading ? <Loader2 className="w-5 h-5 animate-spin text-amber-500" /> : <Search className="w-5 h-5 text-gray-400 group-hover:text-amber-500 transition-colors" />}
                </div>
                <input
                    type="text"
                    value={query}
                    onChange={handleSearch}
                    placeholder="Search thousands of foods (e.g. Apple, Chicken, Pizza)..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white focus:outline-none focus:border-amber-500/50 focus:bg-white/10 transition-all backdrop-blur-md"
                />
            </div>

            {/* Results Area */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <AnimatePresence>
                    {results.map((food) => (
                        <motion.div
                            key={food.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            onClick={() => fetchFoodDetails(food.id)}
                            className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:border-amber-500/30 cursor-pointer transition-all group backdrop-blur-sm"
                        >
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-bold text-white line-clamp-1">{food.description}</h3>
                                    <p className="text-xs text-gray-400 mt-1 uppercase tracking-wider">{food.foodCategory || 'Standard Reference'}</p>
                                </div>
                                <div className="p-2 rounded-full bg-amber-500/10 text-amber-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </AnimatePresence>
            </div>

            {/* Empty State */}
            {!loading && searching && results.length === 0 && query.length >= 3 && (
                <div className="text-center py-12 text-gray-500">
                    <p>No foods found for "{query}"</p>
                </div>
            )}

            {/* Food Details Modal */}
            <AnimatePresence>
                {selectedFood && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedFood(null)}
                            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative w-full max-w-lg bg-slate-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl"
                        >
                            <div className="p-6 border-b border-white/10 flex justify-between items-center bg-gradient-to-r from-amber-500/10 to-transparent">
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => fetchFoodDetails(selectedFood.id)}
                                        className="p-2 hover:bg-white/10 rounded-full transition-colors group/refresh"
                                        title="Refresh details"
                                    >
                                        <Loader2 className={`w-5 h-5 text-gray-400 group-hover/refresh:text-amber-500 ${loading ? 'animate-spin' : ''}`} />
                                    </button>
                                </div>
                                <button
                                    onClick={() => setSelectedFood(null)}
                                    className="p-2 hover:bg-white/10 rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-8 overflow-y-auto max-h-[70vh]">
                                <div className="mb-10">
                                    <div className="inline-flex items-center px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 mb-4">
                                        <span className="text-[10px] text-amber-500 uppercase font-bold tracking-widest leading-none">Category</span>
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500/40 mx-2.5" />
                                        <span className="text-[10px] text-amber-500 uppercase font-bold tracking-widest leading-none">
                                            {selectedFood.foodCategory || 'Standard Reference'}
                                        </span>
                                    </div>
                                    <h2 className="text-3xl font-black text-white leading-tight tracking-tight">
                                        {selectedFood.description}
                                    </h2>
                                </div>

                                <div className="space-y-8">
                                    <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                        <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest">Nutritional Facts (per 100g)</h3>
                                        {selectedFood.nutrients?.length > 0 && (
                                            <span className="text-[10px] text-gray-500 font-medium">{selectedFood.nutrients.length} total items</span>
                                        )}
                                    </div>

                                    {/* Categorized Nutrients */}
                                    {selectedFood.nutrients?.length > 0 ? (() => {
                                        const categories = {
                                            "Macronutrients": ["Energy", "Protein", "Total lipid (fat)", "Carbohydrate, by difference", "Fiber, total dietary", "Sugars, total including NLEA"],
                                            "Minerals": ["Calcium, Ca", "Iron, Fe", "Magnesium, Mg", "Phosphorus, P", "Potassium, K", "Sodium, Na", "Zinc, Zn", "Copper, Cu", "Manganese, Mn", "Selenium, Se"],
                                            "Vitamins": ["Vitamin C, total ascorbic acid", "Thiamin", "Riboflavin", "Niacin", "Pantothenic acid", "Vitamin B-6", "Folate, total", "Vitamin B-12", "Vitamin A, RAE", "Vitamin E (alpha-tocopherol)", "Vitamin D (D2 + D3)", "Vitamin K (phylloquinone)"]
                                        };

                                        const groupedData = {
                                            "Macros": [],
                                            "Minerals": [],
                                            "Vitamins": [],
                                            "Other": []
                                        };

                                        selectedFood.nutrients?.forEach(n => {
                                            if (categories["Macronutrients"].some(name => n.name.includes(name))) groupedData["Macros"].push(n);
                                            else if (categories["Minerals"].some(name => n.name.includes(name))) groupedData["Minerals"].push(n);
                                            else if (categories["Vitamins"].some(name => n.name.includes(name))) groupedData["Vitamins"].push(n);
                                            else groupedData["Other"].push(n);
                                        });

                                        return Object.entries(groupedData).map(([category, items]) => {
                                            if (items.length === 0) return null;
                                            return (
                                                <div key={category} className="space-y-3">
                                                    <h3 className="text-[10px] font-black text-amber-500 uppercase tracking-[0.2em] mb-4 opacity-80">{category}</h3>
                                                    <div className="grid grid-cols-1 gap-2">
                                                        {items.map((n, i) => (
                                                            <div key={i} className="flex justify-between items-center p-3.5 rounded-2xl bg-white/[0.03] border border-white/[0.05] hover:bg-white/[0.06] transition-all group/item">
                                                                <span className="text-sm text-gray-400 group-hover/item:text-gray-200 transition-colors">{n.name.split(',')[0]}</span>
                                                                <div className="flex items-baseline gap-1">
                                                                    <span className="text-base font-bold text-white tracking-tight">{Math.round(n.amount * 100) / 100}</span>
                                                                    <span className="text-[10px] font-medium text-gray-500 uppercase">{n.unitName}</span>
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            );
                                        });
                                    })() : (
                                        <div className="py-12 px-6 rounded-3xl bg-white/[0.02] border border-dashed border-white/10 text-center">
                                            <p className="text-gray-500 text-sm">Nutritional details are not available for this item yet.</p>
                                            <p className="text-[10px] text-gray-600 mt-2 uppercase tracking-widest">The database import may still be in progress</p>
                                        </div>
                                    )}
                                </div>

                                {selectedFood.portions?.length > 0 && (
                                    <div className="mt-8">
                                        <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4">Select Serving Size</h3>
                                        <div className="flex flex-col gap-2">
                                            {selectedFood.portions.map((p, i) => (
                                                <button
                                                    key={i}
                                                    onClick={() => setSelectedPortion(p)}
                                                    className={`w-full flex justify-between items-center p-4 rounded-2xl border transition-all ${selectedPortion?.id === p.id
                                                        ? 'bg-amber-500/20 border-amber-500 text-white'
                                                        : 'bg-white/5 border-white/10 text-gray-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    <div className="text-left">
                                                        <span className="font-bold block">{p.amount} {p.modifier}</span>
                                                        <span className="text-[10px] uppercase opacity-60">Weight: {p.gramWeight}g</span>
                                                    </div>
                                                    {selectedPortion?.id === p.id && <div className="w-2 h-2 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]" />}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="mt-8 pt-8 border-t border-white/10">
                                    <h3 className="text-sm font-bold text-amber-500 uppercase tracking-widest mb-4">Set Quantity</h3>
                                    <div className="flex items-center gap-4">
                                        <div className="relative flex-1">
                                            <input
                                                type="number"
                                                value={quantity}
                                                onChange={(e) => setQuantity(e.target.value)}
                                                min="0.1"
                                                step="0.1"
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-6 text-white text-xl font-bold focus:outline-none focus:border-amber-500/50 transition-all"
                                            />
                                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 font-bold uppercase text-[10px] tracking-widest pointer-events-none">
                                                Units
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-1">
                                            <button
                                                onClick={() => setQuantity(prev => Math.max(0.1, parseFloat(prev) + 1))}
                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                                            >
                                                <Plus className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => setQuantity(prev => Math.max(0.1, parseFloat(prev) - 1))}
                                                className="p-2 bg-white/5 hover:bg-white/10 rounded-lg text-white"
                                            >
                                                <X className="w-4 h-4 text-red-400" />
                                            </button>
                                        </div>
                                    </div>
                                    <p className="mt-4 text-xs text-gray-500 italic">
                                        Total Weight: {selectedPortion ? (parseFloat(quantity) * selectedPortion.gramWeight).toFixed(1) : (parseFloat(quantity) * 100).toFixed(1)}g
                                    </p>
                                </div>
                            </div>

                            <div className="p-6 bg-white/5 border-t border-white/10">
                                <button
                                    onClick={handleLogFood}
                                    disabled={logging}
                                    className="w-full bg-amber-500 hover:bg-amber-600 disabled:bg-amber-500/50 disabled:cursor-not-allowed text-black font-bold py-4 rounded-2xl flex items-center justify-center gap-2 transition-all transform active:scale-[0.98]"
                                >
                                    {logging ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <Plus className="w-5 h-5" />
                                    )}
                                    {logging ? 'Logging Food...' : 'Add to Daily Log'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
