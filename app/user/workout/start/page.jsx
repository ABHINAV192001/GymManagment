"use client";

import { useSearchParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { FiPlay, FiPause, FiSquare, FiUsers, FiClock, FiActivity, FiArrowLeft, FiMoreVertical, FiInfo, FiChevronDown, FiChevronUp, FiCheck } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire } from "react-icons/fa";

import { getCookie } from "@/lib/cookie";

export default function WorkoutStartPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const workoutId = searchParams.get("id");

    const [workout, setWorkout] = useState(null);
    const [activeExerciseId, setActiveExerciseId] = useState(null);
    const [timers, setTimers] = useState({});
    const [timerStatus, setTimerStatus] = useState({});
    const [expandedExercise, setExpandedExercise] = useState(null);
    const [showFinishModal, setShowFinishModal] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (!workoutId) return;

        // Fetch workout details from API
        const token = getCookie('authToken');
        fetch(`http://localhost:8083/api/user/workout/${workoutId}`, {
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        })
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch');
                return res.json();
            })
            .then(data => {
                setWorkout(data);

                // Initialize timers
                const initialTimers = {};
                const initialStatus = {};
                if (data.exercises) {
                    data.exercises.forEach(ex => {
                        // ex.id is the WorkoutExercise ID, so unique per list item.
                        initialStatus[ex.id] = 'idle';
                        initialTimers[ex.id] = ex.time;
                    });
                }
                setTimers(initialTimers);
                setTimerStatus(initialStatus);
            })
            .catch(err => {
                console.error("Failed to load workout", err);
            });

    }, [workoutId]);

    useEffect(() => {
        let interval = null;
        if (activeExerciseId && timerStatus[activeExerciseId] === 'running' && workout) {
            const originalExercise = workout.exercises.find(e => e.id === activeExerciseId);
            const isTimed = originalExercise?.time > 0;

            interval = setInterval(() => {
                setTimers(prev => {
                    const currentVal = prev[activeExerciseId];

                    if (isTimed) {
                        // Count Down
                        if (currentVal <= 0) {
                            clearInterval(interval);
                            setTimerStatus(prevStatus => ({ ...prevStatus, [activeExerciseId]: 'completed' }));
                            return prev;
                        }
                        return { ...prev, [activeExerciseId]: currentVal - 1 };
                    } else {
                        // Count Up (Stopwatch)
                        return { ...prev, [activeExerciseId]: currentVal + 1 };
                    }
                });
            }, 1000);
        } else {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [activeExerciseId, timerStatus, workout]);

    const handleStart = (exerciseId) => {
        if (activeExerciseId && activeExerciseId !== exerciseId) {
            setTimerStatus(prev => ({ ...prev, [activeExerciseId]: 'paused' }));
        }
        setActiveExerciseId(exerciseId);
        setTimerStatus(prev => ({ ...prev, [exerciseId]: 'running' }));
    };

    const handlePause = (exerciseId) => {
        setTimerStatus(prev => ({ ...prev, [exerciseId]: 'paused' }));
    };

    const handleStop = (exerciseId) => {
        setTimerStatus(prev => ({ ...prev, [exerciseId]: 'idle' }));
        if (workout) {
            // Find in current workout.exercises
            const originalEx = workout.exercises.find(e => e.id === exerciseId);
            if (originalEx) {
                setTimers(prev => ({ ...prev, [exerciseId]: originalEx.time }));
            }
        }
        setActiveExerciseId(null);
    };

    const handleComplete = (exerciseId) => {
        setTimerStatus(prev => ({ ...prev, [exerciseId]: 'completed' }));
        setActiveExerciseId(null);

        // Rollover Logic
        if (workout) {
            const currentIndex = workout.exercises.findIndex(e => e.id === exerciseId);
            // Check if there is a next exercise
            if (currentIndex !== -1 && currentIndex < workout.exercises.length - 1) {
                const nextExercise = workout.exercises[currentIndex + 1];
                const timeLeft = timers[exerciseId]; // Remaining time

                // Only rollover if it was a timed exercise (allocated time > 0)
                const originalEx = workout.exercises.find(e => e.id === exerciseId);

                if (originalEx?.time > 0 && timeLeft > 0) {
                    setTimers(prev => ({
                        ...prev,
                        [nextExercise.id]: (prev[nextExercise.id] || 0) + timeLeft
                    }));
                }

                // Auto-Scroll and Expand Next
                setTimeout(() => {
                    const el = document.getElementById(`exercise-${nextExercise.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    setExpandedExercise(nextExercise.id);
                }, 100);

            } else {
                // Workout Finished
                setShowFinishModal(true);
            }
        }
    };

    const saveWorkout = async () => {
        setIsSaving(true);
        try {
            const token = getCookie('authToken');
            const duration = parseInt(workout.duration) || 60;
            const calories = parseInt(workout.calories) || 500;

            const res = await fetch('http://localhost:8083/api/user/workout/history', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    workoutId: workout.id,
                    duration: duration * 60,
                    calories: calories
                })
            });

            if (res.ok) {
                router.push('/user');
            } else {
                console.error("Failed to save history");
                setIsSaving(false);
            }
        } catch (err) {
            console.error(err);
            setIsSaving(false);
        }
    };

    const formatTime = (seconds) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s < 10 ? '0' : ''}${s}`;
    };

    if (!workout) return (
        <div className="flex items-center justify-center h-screen bg-gray-900 text-emerald-400 font-bold text-xl animate-pulse">
            Loading your power session...
        </div>
    );

    return (
        <>
            <div className="content-wrapper">

                {/* Header Back Button & Title */}
                <div className="header-nav fade-in-down">
                    <button onClick={() => router.back()} className="back-btn group">
                        <FiArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Back</span>
                    </button>
                    <h1 className="page-title">{workout.title}</h1>
                    <div className="header-actions">
                        <div className="status-badge">
                            <span className="dot"></span> Live Session
                        </div>
                    </div>
                </div>

                {/* Glass Summary Card */}
                <div className="summary-card glass-panel bounce-in">
                    <div className="stat-item">
                        <div className="icon-box purple"><FiActivity /></div>
                        <div>
                            <div className="label">Total Exercises</div>
                            <div className="value">{workout.totalExercises}</div>
                        </div>
                    </div>
                    <div className="divider-v"></div>
                    <div className="stat-item">
                        <div className="icon-box orange"><FaFire /></div>
                        <div>
                            <div className="label">Calories Burn</div>
                            <div className="value">{workout.calories} <span className="unit">kcal</span></div>
                        </div>
                    </div>
                    <div className="divider-v"></div>
                    <div className="stat-item">
                        <div className="icon-box blue"><FiClock /></div>
                        <div>
                            <div className="label">Duration</div>
                            <div className="value">{workout.duration}</div>
                        </div>
                    </div>
                </div>

                {/* Exercise List */}
                <div className="exercise-list">
                    <div className="list-header glass-header">
                        <div className="th th-sr">#</div>
                        <div className="th th-name">Exercise</div>
                        <div className="th th-sets">Sets</div>
                        <div className="th th-reps">Reps</div>
                        <div className="th th-time">Timer</div>
                        <div className="th th-action">Controls</div>
                    </div>

                    {workout.exercises.map((exercise, index) => {
                        const status = timerStatus[exercise.id] || 'idle';
                        const timeLeft = timers[exercise.id] || 0;
                        const isRunning = status === 'running';

                        return (
                            <div key={exercise.id} id={`exercise-${exercise.id}`} className={`exercise-card glass-panel slide-in-right delay-${index}`}>
                                <div className="card-main">
                                    <div className="td td-sr">{index + 1}</div>
                                    <div className="td td-name">
                                        <div className="name-text">{exercise.name}</div>
                                        <div className="desc-text">{exercise.description}</div>
                                    </div>

                                    <div className="meta-group">
                                        <div className="td td-sets">
                                            <span className="mobile-label">Sets</span>
                                            <span className="pill">{exercise.sets}</span>
                                        </div>
                                        <div className="td td-reps">
                                            <span className="mobile-label">Reps</span>
                                            <span className="pill">{exercise.reps}</span>
                                        </div>
                                    </div>

                                    <div className="td td-time">
                                        <div className={`timer-box ${isRunning ? 'pulsing' : ''}`}>
                                            {status === 'idle' ?
                                                <span className="static-time">{exercise.time > 0 ? `${Math.floor(exercise.time / 60)} min` : 'Stopwatch'}</span> :
                                                <span className="live-time">{formatTime(timeLeft)}</span>
                                            }
                                        </div>
                                    </div>

                                    <div className="td td-action">
                                        <button
                                            onClick={() => setExpandedExercise(expandedExercise === exercise.id ? null : exercise.id)}
                                            className="ctrl-btn info"
                                        >
                                            {expandedExercise === exercise.id ? <FiChevronUp /> : <FiInfo />}
                                        </button>
                                        {status === 'running' ? (
                                            <button onClick={() => handlePause(exercise.id)} className="ctrl-btn pause">
                                                <FiPause />
                                            </button>
                                        ) : (
                                            <button onClick={() => handleStart(exercise.id)} className="ctrl-btn start">
                                                <FiPlay />
                                            </button>
                                        )}
                                        <button onClick={() => handleComplete(exercise.id)} className="ctrl-btn complete" title="Complete & Rollover Time">
                                            <FiCheck />
                                        </button>
                                        <button onClick={() => handleStop(exercise.id)} className="ctrl-btn stop" title="Reset">
                                            <FiSquare />
                                        </button>
                                    </div>
                                </div>

                                {/* Expandable Demonstration Section */}
                                <AnimatePresence>
                                    {expandedExercise === exercise.id && exercise.stepOneImage && (
                                        <motion.div
                                            initial={{ height: 0, opacity: 0 }}
                                            animate={{ height: "auto", opacity: 1 }}
                                            exit={{ height: 0, opacity: 0 }}
                                            transition={{ duration: 0.3 }}
                                            className="demo-section"
                                        >
                                            <div className="demo-grid">
                                                <div className="demo-step">
                                                    <div className="step-badge">Step 1</div>
                                                    <div className="demo-img-box">
                                                        <img src={exercise.stepOneImage} alt="Setup" />
                                                    </div>
                                                    <p className="step-desc">{exercise.stepOneDescription}</p>
                                                </div>
                                                <div className="demo-step">
                                                    <div className="step-badge">Step 2</div>
                                                    <div className="demo-img-box">
                                                        <img src={exercise.stepTwoImage} alt="Execution" />
                                                    </div>
                                                    <p className="step-desc">{exercise.stepTwoDescription}</p>
                                                </div>
                                            </div>
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}
                </div>

                {/* Finish Workout Modal */}
                {showFinishModal && (
                    <div className="modal-overlay">
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="finish-modal glass-panel"
                        >
                            <h2 className="finish-title">Workout Correct!</h2>
                            <div className="finish-stats">
                                <div className="stat-row">
                                    <span>Duration</span>
                                    <strong>{workout.duration}</strong>
                                </div>
                                <div className="stat-row">
                                    <span>Calories</span>
                                    <strong>{workout.calories} kcal</strong>
                                </div>
                            </div>
                            <button onClick={saveWorkout} disabled={isSaving} className="finish-btn">
                                {isSaving ? 'Saving...' : 'Save Workout'}
                            </button>
                        </motion.div>
                    </div>
                )}
            </div>

            <style jsx>{`
                /* --- Global Layout --- */
                .content-wrapper {
                    position: relative;
                    z-index: 10;
                    max-width: 1200px;
                    margin: 0 auto;
                    padding: 40px 20px;
                }

                /* --- Header --- */
                .header-nav {
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    margin-bottom: 40px;
                }
                
                .back-btn {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.1);
                    padding: 8px 16px;
                    border-radius: 99px;
                    color: #e2e8f0;
                    cursor: pointer;
                    transition: all 0.2s;
                    backdrop-filter: blur(10px);
                }
                .back-btn:hover { background: rgba(255,255,255,0.2); }

                .page-title {
                    font-size: 2.5rem;
                    font-weight: 800;
                    background: linear-gradient(135deg, #fff 30%, #a5f3fc 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    text-shadow: 0 4px 12px rgba(0,0,0,0.3);
                }

                .status-badge {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    background: rgba(16, 185, 129, 0.2);
                    color: #6ee7b7;
                    padding: 6px 12px;
                    border-radius: 99px;
                    font-size: 0.85rem;
                    font-weight: 600;
                    border: 1px solid rgba(16, 185, 129, 0.3);
                }
                .dot { width: 8px; height: 8px; background: #34d399; border-radius: 50%; animation: pulseDot 2s infinite; }
                @keyframes pulseDot { 0% { opacity: 0.5; box-shadow: 0 0 0 0 rgba(52, 211, 153, 0.4); } 70% { opacity: 1; box-shadow: 0 0 0 6px rgba(52, 211, 153, 0); } 100% { opacity: 0.5; } }

                /* --- Summary Card (Glassmorphism) --- */
                .glass-panel {
                    background: rgba(30, 41, 59, 0.6);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                }

                .summary-card {
                    display: flex;
                    justify-content: space-around;
                    align-items: center;
                    padding: 30px;
                    margin-bottom: 50px;
                    background: linear-gradient(145deg, rgba(255,255,255,0.05) 0%, rgba(255,255,255,0.01) 100%);
                }

                .stat-item {
                    display: flex;
                    align-items: center;
                    gap: 16px;
                }

                .icon-box {
                    width: 50px; height: 50px;
                    border-radius: 16px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                }
                .icon-box.purple { background: rgba(139, 92, 246, 0.2); color: #c4b5fd; box-shadow: 0 0 15px rgba(139, 92, 246, 0.3); }
                .icon-box.orange { background: rgba(249, 115, 22, 0.2); color: #fdba74; box-shadow: 0 0 15px rgba(249, 115, 22, 0.3); }
                .icon-box.blue { background: rgba(59, 130, 246, 0.2); color: #93c5fd; box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }

                .label { font-size: 0.9rem; color: #94a3b8; font-weight: 500; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }
                .value { font-size: 1.5rem; font-weight: 700; color: #fff; }
                .unit { font-size: 0.9rem; color: #64748b; font-weight: 400; }

                .divider-v { width: 1px; height: 50px; background: rgba(255,255,255,0.1); }

                /* --- List Header --- */
                .list-header {
                    display: grid;
                    grid-template-columns: 60px 2fr 100px 100px 140px 180px;
                    padding: 0 30px 15px 30px;
                    margin-bottom: 10px;
                    color: #94a3b8;
                    font-weight: 600;
                    font-size: 0.9rem;
                    text-transform: uppercase;
                    letter-spacing: 0.05em;
                }
                .th { text-align: left; }
                .th-sets, .th-reps, .th-time, .th-action { text-align: center; }

                /* --- Exercise Cards --- */
                .exercise-list { display: flex; flex-direction: column; gap: 20px; }

                .exercise-card {
                    padding: 24px 30px;
                    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                    position: relative;
                    overflow: hidden;
                }
                .exercise-card:hover {
                    transform: translateY(-4px) scale(1.01);
                    background: rgba(30, 41, 59, 0.8);
                    border-color: rgba(255, 255, 255, 0.2);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.25);
                }
                .exercise-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; width: 4px; height: 100%;
                    background: linear-gradient(to bottom, #ec4899, #8b5cf6);
                    opacity: 0;
                    transition: opacity 0.3s;
                }
                .exercise-card:hover::before { opacity: 1; }

                .card-main {
                    display: grid;
                    grid-template-columns: 60px 2fr 100px 100px 140px 180px;
                    align-items: center;
                }

                .td-sr { font-weight: 700; color: #64748b; font-size: 1.1rem; }
                .td-name { padding-right: 20px; }
                .name-text { font-size: 1.2rem; font-weight: 700; color: #fff; margin-bottom: 6px; }
                .desc-text { font-size: 0.9rem; color: #94a3b8; line-height: 1.4; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }

                .meta-group { display: contents; } /* Desktop: use grid columns */
                .pill {
                    display: inline-block;
                    background: rgba(15, 23, 42, 0.6);
                    padding: 6px 16px;
                    border-radius: 12px;
                    font-weight: 600;
                    color: #fff;
                    border: 1px solid rgba(255,255,255,0.05);
                }
                .td-sets, .td-reps { text-align: center; }

                .td-time { display: flex; justify-content: center; }
                .timer-box {
                    background: rgba(0,0,0,0.3);
                    padding: 8px 16px;
                    border-radius: 8px;
                    font-family: 'Courier Prime', monospace;
                    min-width: 100px;
                    text-align: center;
                    border: 1px solid rgba(255,255,255,0.1);
                    transition: all 0.3s;
                }
                .pulsing {
                    background: rgba(16, 185, 129, 0.15);
                    border-color: #10b981;
                    color: #34d399;
                    box-shadow: 0 0 15px rgba(16, 185, 129, 0.2);
                    animation: pulse 1s infinite;
                }
                @keyframes pulse { 0% { opacity: 1; } 50% { opacity: 0.8; } 100% { opacity: 1; } }
                
                .static-time { color: #94a3b8; font-weight: 600; }
                .live-time { font-size: 1.2rem; font-weight: 700; }

                .td-action { display: flex; justify-content: center; gap: 10px; }
                
                .ctrl-btn {
                    border: none;
                    border-radius: 10px;
                    padding: 10px;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0;
                    font-weight: 600;
                    transition: all 0.2s;
                    min-width: 40px;
                }
                .ctrl-btn span { display: none; }
                
                .info { background: rgba(59, 130, 246, 0.2); color: #60a5fa; border: 1px solid rgba(96, 165, 250, 0.3); }
                .info:hover { background: rgba(59, 130, 246, 0.3); border-color: #60a5fa; }

                .start { background: linear-gradient(135deg, #10b981, #059669); color: white; box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3); }
                .start:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(16, 185, 129, 0.4); }
                
                .pause { background: linear-gradient(135deg, #f59e0b, #d97706); color: white; box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3); }
                .pause:hover { transform: translateY(-2px); }
                
                .stop { background: rgba(255,255,255,0.1); color: #ef4444; border: 1px solid rgba(239, 68, 68, 0.3); padding: 10px; }
                .stop:hover { background: rgba(239, 68, 68, 0.1); border-color: #ef4444; }

                .complete { background: linear-gradient(135deg, #3b82f6, #2563eb); color: white; box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3); padding: 10px; }
                .complete:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4); }

                /* --- Demonstration Section --- */
                .demo-section {
                    border-top: 1px solid rgba(255, 255, 255, 0.05);
                    padding: 24px 0 0 0;
                    margin-top: 20px;
                }
                .demo-grid {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 30px;
                }
                .demo-step {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                    background: rgba(0, 0, 0, 0.2);
                    padding: 20px;
                    border-radius: 16px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .step-badge {
                    background: #10b981;
                    color: white;
                    padding: 4px 12px;
                    border-radius: 99px;
                    font-size: 0.75rem;
                    font-weight: 700;
                    width: fit-content;
                    text-transform: uppercase;
                }
                .demo-img-box {
                    width: 100%;
                    aspect-ratio: 1.6;
                    border-radius: 12px;
                    overflow: hidden;
                    background: #0f172a;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }
                .demo-img-box img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                    transition: transform 0.5s ease;
                }
                .demo-img-box:hover img {
                    transform: scale(1.05);
                }
                .step-desc {
                    font-size: 0.95rem;
                    color: #cbd5e1;
                    line-height: 1.6;
                    margin: 0;
                }

                .mobile-label { display: none; }

                /* --- Animations --- */
                .fade-in-down { animation: fadeInDown 0.8s ease-out; }
                .bounce-in { animation: bounceIn 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
                .slide-in-right { animation: slideInRight 0.6s ease-out backwards; }
                
                .delay-0 { animation-delay: 0.1s; }
                .delay-1 { animation-delay: 0.2s; }
                .delay-2 { animation-delay: 0.3s; }
                .delay-3 { animation-delay: 0.4s; }
                .delay-4 { animation-delay: 0.5s; }

                @keyframes fadeInDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes bounceIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
                @keyframes slideInRight { from { opacity: 0; transform: translateX(20px); } to { opacity: 1; transform: translateX(0); } }

                /* --- Responsive --- */
                @media (max-width: 900px) {
                    .list-header { display: none; }
                    
                    .card-main {
                        grid-template-columns: 1fr;
                        gap: 20px;
                    }
                    .td-sr { display: none; }
                    .td-name { padding: 0; text-align: center; }
                    .desc-text { display: none; } /* Hide desc on mobile for stronger focus */
                    
                    .meta-group {
                        display: grid;
                        grid-template-columns: 1fr 1fr;
                        gap: 20px;
                        width: 100%;
                        background: rgba(0,0,0,0.2);
                        padding: 15px;
                        border-radius: 12px;
                    }
                    
                    .td-sets, .td-reps {
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        gap: 8px;
                    }
                    .mobile-label { display: block; font-size: 0.8rem; color: #94a3b8; text-transform: uppercase; }
                    
                    .td-action {
                        width: 100%;
                        justify-content: stretch;
                    }
                    .ctrl-btn { flex: 1; justify-content: center; padding: 14px; }
                    .stop { flex: 0; padding: 14px 20px; }
                    
                    .summary-card { flex-direction: column; gap: 30px; align-items: flex-start; }
                    .stat-item { width: 100%; }
                    .divider-v { width: 100%; height: 1px; }
                }

                /* --- Finish Modal --- */
                .modal-overlay {
                    position: fixed;
                    top: 0; left: 0; width: 100%; height: 100%;
                    background: rgba(0,0,0,0.8);
                    z-index: 100;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    backdrop-filter: blur(5px);
                }
                .finish-modal {
                    width: 90%; max-width: 400px;
                    padding: 40px;
                    text-align: center;
                    background: rgba(30, 41, 59, 0.95);
                    border: 1px solid rgba(59, 130, 246, 0.3);
                    box-shadow: 0 0 50px rgba(59, 130, 246, 0.2);
                }
                .finish-title {
                    font-size: 2rem;
                    font-weight: 800;
                    margin-bottom: 30px;
                    background: linear-gradient(135deg, #fff 0%, #3b82f6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                }
                .finish-stats {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 40px;
                    background: rgba(0,0,0,0.3);
                    padding: 20px;
                    border-radius: 12px;
                }
                .stat-row { display: flex; flex-direction: column; gap: 6px; }
                .stat-row span { color: #94a3b8; font-size: 0.9rem; text-transform: uppercase; }
                .stat-row strong { color: #fff; font-size: 1.4rem; }

                .finish-btn {
                    width: 100%;
                    padding: 16px;
                    background: linear-gradient(135deg, #3b82f6, #2563eb);
                    color: white;
                    border: none;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1.1rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
                }
                .finish-btn:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4); }
                .finish-btn:disabled { opacity: 0.7; cursor: not-allowed; }
            `}</style>
        </>
    );
}
