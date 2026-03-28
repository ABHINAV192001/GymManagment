"use client";
import React, { useState, useEffect } from 'react';
import BodyAnatomy from '@/components/BodyAnatomy';
import { motion } from 'framer-motion';
import ExerciseDetailsModal from '@/app/components/User/ExerciseDetailsModal';

export default function ExercisesPage() {
    const [selectedMuscle, setSelectedMuscle] = useState('Chest');
    const [searchTerm, setSearchTerm] = useState('');
    const [exercisesDB, setExercisesDB] = useState({});
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [activeExercise, setActiveExercise] = useState(null);

    const openDetails = (ex) => {
        setActiveExercise(ex);
        setIsModalOpen(true);
    };

    useEffect(() => {
        const loadExercises = async () => {
            try {
                const response = await fetch('/data/exercises.json');
                const data = await response.json();
                setExercisesDB(data);
            } catch (error) {
                console.error("Error loading exercises:", error);
            } finally {
                setLoading(false);
            }
        };
        loadExercises();
    }, []);

    // Filter exercises based on selected muscle AND search term
    const getFilteredExercises = () => {
        if (!exercisesDB || Object.keys(exercisesDB).length === 0) return [];

        let pool = [];
        if (searchTerm.trim() !== '') {
            // If searching, search across ALL categories
            Object.values(exercisesDB).forEach(categoryExercises => {
                pool = [...pool, ...categoryExercises];
            });
        } else {
            // Otherwise just use current category
            pool = exercisesDB[selectedMuscle] || [];
        }

        return pool.filter(ex =>
            ex.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (ex.equipment && ex.equipment.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    };

    const currentExercises = getFilteredExercises();

    return (
        <div className="min-h-screen page-container pb-10 pt-5 transition-colors duration-300">
            {/* Header / Search Section */}
            <div className="py-6 px-4 md:px-8 mb-8 sticky top-0 z-20 shadow-sm mx-auto max-w-7xl rounded-xl mt-4 transition-colors duration-300 header-card">
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                    <h1 className="text-2xl font-bold bg-gradient-to-r from-amber-500 to-orange-600 bg-clip-text text-transparent">
                        Exercise Library
                    </h1>
                    <div className="w-full md:max-w-md">
                        <input
                            type="text"
                            placeholder="Search exercises..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full px-4 py-2 rounded-full border focus:ring-2 focus:ring-amber-200 outline-none transition-all search-input"
                        />
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto px-4 md:px-8 flex flex-col lg:flex-row gap-8 items-start">

                {/* Left: Body Map */}
                <div className="lg:w-1/3 w-full flex flex-col items-center">
                    <div className="w-full flex justify-center mb-6 sticky top-24">
                        <BodyAnatomy
                            selectedMuscle={selectedMuscle}
                            onSelect={setSelectedMuscle}
                        />
                    </div>

                    {/* Additional Categories Buttons */}
                    <div className="flex flex-wrap gap-2 justify-center w-full max-w-sm mt-4">
                        <button
                            onClick={() => setSelectedMuscle('Cardio')}
                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${selectedMuscle === 'Cardio'
                                ? 'bg-amber-500 text-white shadow-md'
                                : 'card-bg border-color text-secondary hover-bg'
                                }`}
                        >
                            ❤️ Cardio
                        </button>
                    </div>
                </div>

                {/* Right: Exercises Grid */}
                <div className="lg:w-2/3 w-full">
                    <div className="mb-6 flex items-center justify-between">
                        <h2 className="text-2xl font-bold flex items-center transition-colors section-header">
                            <span className="w-2 h-8 bg-amber-500 rounded-full mr-3"></span>
                            {searchTerm ? `Results for "${searchTerm}"` : `${selectedMuscle} Exercises`}
                            <span className="ml-3 text-sm font-normal px-2 py-1 rounded-full badge">
                                {currentExercises.length} results
                            </span>
                        </h2>
                    </div>

                    <motion.div
                        layout
                        className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6"
                    >
                        {currentExercises.length > 0 ? (
                            currentExercises.map(ex => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    key={ex.id}
                                    onClick={() => openDetails(ex)}
                                    className="rounded-2xl shadow-sm border overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 group exercise-card cursor-pointer"
                                >
                                    <div className="relative aspect-[4/3] p-6 flex items-center justify-center border-b img-container">
                                        <img
                                            src={ex.image}
                                            alt={ex.name}
                                            className="max-w-full max-h-full object-contain mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500"
                                        />
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="bg-white/90 dark:bg-neutral-900/90 p-2 rounded-full shadow-sm text-amber-500 hover:bg-amber-500 hover:text-white transition-colors">
                                                Add +
                                            </button>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors card-title">
                                            {ex.name}
                                        </h3>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className="text-xs font-medium px-2 py-1 rounded-md equip-badge">
                                                {ex.equipment || 'Equipment needed'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        ) : (
                            <div className="col-span-full py-20 text-center rounded-2xl border border-dashed transition-colors empty-state">
                                {loading ? (
                                    <div className="animate-pulse">Loading exercises...</div>
                                ) : (
                                    <>
                                        <span className="text-4xl mb-4 block">🏋️‍♂️</span>
                                        <p className="text-lg">No exercises found {searchTerm ? `for "${searchTerm}"` : `for ${selectedMuscle}`} yet.</p>
                                        <p className="text-sm mt-2 help-text">Try {searchTerm ? "searching for something else" : "selecting another muscle group"}.</p>
                                    </>
                                )}
                            </div>
                        )}
                    </motion.div>
                </div>
            </main>

            <ExerciseDetailsModal
                exercise={activeExercise}
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
            />

            <style jsx>{`
                .page-container {
                    /* background removed for glass effect */
                    color: var(--text);
                }
                
                .header-card {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .search-input {
                    background: rgba(255, 255, 255, 0.05);
                    border-color: rgba(255, 255, 255, 0.1);
                    color: var(--text);
                }
                .search-input:focus {
                    border-color: #f59e0b; /* Amber 500 */
                }

                .card-bg { background-color: var(--bg-darker); }
                .border-color { border-color: var(--border-color); }
                .text-secondary { color: var(--text-secondary); }
                .hover-bg:hover { background-color: var(--bg-dark); }

                .section-header { color: var(--text); }

                .badge {
                    background: var(--bg-darker);
                    color: var(--text-secondary);
                }

                .exercise-card {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(12px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                }

                .img-container {
                    background: rgba(255, 255, 255, 0.02);
                    border-color: rgba(255, 255, 255, 0.05);
                }

                .card-title {
                    color: var(--text);
                }

                .equip-badge {
                    background: var(--bg-dark);
                    color: var(--text-secondary);
                }

                .empty-state {
                     background: var(--bg-darker);
                     border-color: var(--border-color);
                }
                .empty-state p { color: var(--text-secondary); }
                .empty-state span { color: var(--text); }
                .help-text { color: var(--text-secondary); opacity: 0.7; }

            `}</style>
        </div>
    );
}
