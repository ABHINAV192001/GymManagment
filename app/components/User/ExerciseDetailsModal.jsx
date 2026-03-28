"use client";
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiCheckCircle, FiInfo, FiActivity, FiZap } from 'react-icons/fi';

export default function ExerciseDetailsModal({ exercise, isOpen, onClose }) {
    if (!exercise) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto modal-container"
                    >
                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors z-20 text-white/50 hover:text-white"
                        >
                            <FiX size={20} />
                        </button>

                        {/* Left Side: Exercise Visual */}
                        <div className="flex-1 min-w-[300px] flex items-center justify-center bg-black/20 rounded-2xl p-6 img-box">
                            <motion.img
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                src={exercise.image}
                                alt={exercise.name}
                                className="max-w-full max-h-[300px] object-contain drop-shadow-2xl"
                            />
                        </div>

                        {/* Right Side: Exercise Info */}
                        <div className="flex-[1.5] w-full flex flex-col gap-6">
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2 leading-tight">
                                    {exercise.name}
                                </h2>
                                <span className="inline-flex items-center text-xs font-semibold px-3 py-1 rounded-full bg-amber-500/10 text-amber-500 border border-amber-500/20">
                                    {exercise.equipment}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-white/30 uppercase tracking-[0.1em] mb-1">Sets</span>
                                    <span className="text-xl font-bold text-white">{exercise.sets || '3-4'}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-white/30 uppercase tracking-[0.1em] mb-1">Reps</span>
                                    <span className="text-xl font-bold text-white">{exercise.reps || '8-12'}</span>
                                </div>
                                <div className="p-4 rounded-2xl bg-white/5 border border-white/5 text-center flex flex-col items-center justify-center">
                                    <span className="text-[10px] text-white/30 uppercase tracking-[0.1em] mb-1">Type</span>
                                    <span className="text-sm font-bold text-white leading-tight">{exercise.mechanics || 'Compound'}</span>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <h4 className="text-sm font-semibold text-white/80 mb-2 uppercase tracking-wider">Instructions</h4>
                                    <div className="space-y-3">
                                        {exercise.instructions?.map((step, idx) => (
                                            <div key={idx} className="flex gap-4 p-3 rounded-xl bg-white/[0.03] border border-white/5 text-sm text-white/60 leading-relaxed">
                                                <span className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-lg bg-amber-500/10 text-amber-500 text-xs font-bold">
                                                    {idx + 1}
                                                </span>
                                                <p>{step}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <style jsx>{`
                        .modal-container {
                            -webkit-backdrop-filter: blur(16px);
                            backdrop-filter: blur(16px);
                            background: #1e293b66;
                            border: 1px solid #ffffff14;
                            border-radius: 24px;
                            align-items: stretch;
                            gap: 30px;
                            padding: 24px;
                            transition: transform .2s, box-shadow .2s;
                            display: flex;
                            box-shadow: 0 8px 32px #0003;
                            flex-direction: row;
                        }

                        @media (max-width: 768px) {
                            .modal-container {
                                flex-direction: column;
                                height: auto;
                                overflow-y: auto;
                            }
                            .img-box {
                                min-width: 100%;
                            }
                        }

                        .img-box {
                            background: rgba(0, 0, 0, 0.2);
                        }
                    `}</style>
                </div>
            )}
        </AnimatePresence>
    );
}
