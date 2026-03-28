"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiClock, FiList, FiTrendingUp, FiInfo } from 'react-icons/fi';
import { GiWeight, GiHealthNormal, GiFat } from 'react-icons/gi';

export default function RecipeDetailsModal({ recipe, isOpen, onClose }) {
    if (!recipe) return null;

    // Helper to format nutrient
    const getNutrient = (name) => {
        const n = recipe.nutrients?.find(nut => nut.name === name);
        return n ? `${n.amount}${n.unitName || ''}` : '0';
    };

    const NutCard = ({ label, value, icon: Icon, colorClass }) => (
        <div className="p-3 rounded-2xl bg-white/5 border border-white/5 flex flex-col items-center">
            <div className={`mb-1 ${colorClass}`}>
                {Icon && <Icon size={14} />}
            </div>
            <span className="text-[10px] text-white/40 uppercase font-bold tracking-wider mb-1 line-clamp-1 text-center">{label}</span>
            <span className="text-sm font-bold text-white">{value}</span>
        </div>
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-slate-900 border border-slate-700 rounded-3xl p-6 shadow-2xl flex flex-col gap-6 scrollbar-hide"
                    >
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
                        >
                            <FiX size={24} />
                        </button>

                        {/* Header */}
                        <div>
                            <span className="inline-block px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 text-xs font-bold mb-3 border border-amber-500/20">
                                {recipe.foodCategory || "Recipe"}
                            </span>
                            <h2 className="text-3xl font-bold text-white leading-tight">
                                {recipe.description}
                            </h2>
                            {recipe.foodAdded && (
                                <p className="text-sm text-amber-500/80 mt-2 font-medium italic">
                                    Base Food: {recipe.foodAdded}
                                </p>
                            )}
                        </div>

                        {/* Flags/Tags */}
                        {recipe.dietaryFlags && recipe.dietaryFlags.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {recipe.dietaryFlags.map((flag, idx) => (
                                    <span key={idx} className="px-2 py-1 rounded-md bg-white/5 border border-white/10 text-xs font-medium text-white/70">
                                        {flag}
                                    </span>
                                ))}
                            </div>
                        )}

                        {/* Main Stats (Calories + Macros) */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <FiTrendingUp className="text-amber-500" /> Nutritional Summary
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                <NutCard label="Calories" value={`${Math.round(recipe.calories || 0)} kcal`} icon={FiClock} colorClass="text-amber-500" />
                                <NutCard label="Protein" value={getNutrient('Protein')} icon={GiWeight} colorClass="text-red-400" />
                                <NutCard label="Carbs" value={getNutrient('Carbohydrates')} icon={FiInfo} colorClass="text-blue-400" />
                                <NutCard label="Fiber" value={getNutrient('Fiber')} icon={FiInfo} colorClass="text-emerald-400" />
                                <NutCard label="Sugar" value={getNutrient('Sugar')} icon={FiInfo} colorClass="text-pink-400" />
                            </div>
                        </div>

                        {/* Fat Profile */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <GiFat className="text-amber-500" /> Lipid Profile
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <NutCard label="Total Fat" value={getNutrient('Fat')} colorClass="text-orange-400" />
                                <NutCard label="Sat. Fat" value={getNutrient('Saturated Fat')} colorClass="text-orange-300" />
                                <NutCard label="Mono Fat" value={getNutrient('Mono Unsaturated Fat')} colorClass="text-orange-200" />
                                <NutCard label="Poly Fat" value={getNutrient('Poly Unsaturated Fat')} colorClass="text-orange-100" />
                            </div>
                        </div>

                        {/* Micronutrients */}
                        <div className="flex flex-col gap-4">
                            <h3 className="text-xs font-bold text-white/40 uppercase tracking-widest flex items-center gap-2">
                                <GiHealthNormal className="text-amber-500" /> Micronutrients
                            </h3>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                <NutCard label="Calcium" value={getNutrient('Calcium')} colorClass="text-blue-300" />
                                <NutCard label="Iron" value={getNutrient('Iron')} colorClass="text-slate-300" />
                                <NutCard label="Sodium" value={getNutrient('Sodium')} colorClass="text-yellow-200" />
                                <NutCard label="Cholesterol" value={getNutrient('Cholesterol')} colorClass="text-purple-300" />
                            </div>
                        </div>

                        {/* Preparation / Ingredients */}
                        <div className="grid md:grid-cols-2 gap-6">
                            {/* Ingredients */}
                            <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5">
                                <h3 className="text-sm font-bold text-white/90 uppercase flex items-center gap-2 mb-4">
                                    <FiList className="text-amber-500" /> Key Ingredients
                                </h3>
                                <p className="text-sm text-white/70 leading-relaxed italic">
                                    {recipe.keyIngredients || "No ingredients listed."}
                                </p>
                            </div>

                            {/* Cooking Details */}
                            <div className="bg-white/[0.02] rounded-2xl p-5 border border-white/5">
                                <h3 className="text-sm font-bold text-white/90 uppercase flex items-center gap-2 mb-4">
                                    <FiClock className="text-amber-500" /> Details
                                </h3>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-white/60">Cooking Time</span>
                                    <span className="text-sm font-bold text-white">{recipe.cookingTime ? `${recipe.cookingTime} mins` : "N/A"}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-white/60">Servings</span>
                                    <span className="text-sm font-bold text-white">1 Serving</span>
                                </div>
                            </div>
                        </div>

                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
