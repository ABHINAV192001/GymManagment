"use client";

import { useState, useEffect } from "react";
import { FiCalendar, FiSave, FiCheckCircle, FiChevronRight, FiActivity } from "react-icons/fi";
import { useTheme } from "../../../context/ThemeContext";
import { apiGet, apiRequest, WORKOUT_API_BASE_URL } from "../../../lib/api/client";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

export default function WeeklyPlanner() {
    const { theme } = useTheme();
    const [workouts, setWorkouts] = useState([]);
    const [weeklyPlan, setWeeklyPlan] = useState({
        mondayWorkoutId: null,
        tuesdayWorkoutId: null,
        wednesdayWorkoutId: null,
        thursdayWorkoutId: null,
        fridayWorkoutId: null,
        saturdayWorkoutId: null,
        sundayWorkoutId: null,
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState(null);

    const getUserId = () => {
        const userStr = localStorage.getItem('user');
        if (userStr) {
            const user = JSON.parse(userStr);
            return user.id;
        }
        return null;
    };

    const fetchWorkouts = async () => {
        try {
            const res = await apiGet(`${WORKOUT_API_BASE_URL}/api/user/workout/all`);
            setWorkouts(res || []);
        } catch (error) {
            console.error("Error fetching workouts:", error);
        }
    };

    const fetchWeeklyPlan = async () => {
        const userId = getUserId();
        if (!userId) return;
        try {
            const res = await apiGet(`${WORKOUT_API_BASE_URL}/api/workout/user-plan/${userId}/weekly`);
            if (res) {
                setWeeklyPlan(res);
            }
        } catch (error) {
            console.error("Error fetching weekly plan:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchWorkouts();
        fetchWeeklyPlan();
    }, []);

    const handleWorkoutChange = (day, workoutId) => {
        const dayKey = `${day.toLowerCase()}WorkoutId`;
        setWeeklyPlan(prev => ({
            ...prev,
            [dayKey]: workoutId === "rest" ? null : parseInt(workoutId)
        }));
    };

    const savePlan = async () => {
        const userId = getUserId();
        if (!userId) return;
        setSaving(true);
        try {
            await apiRequest(`${WORKOUT_API_BASE_URL}/api/workout/user-plan/${userId}/weekly`, "POST", weeklyPlan);
            setNotification("Weekly plan saved successfully!");
            setTimeout(() => setNotification(null), 3000);
        } catch (error) {
            console.error("Error saving plan:", error);
            setNotification("Failed to save plan. Please try again.");
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="loading-container">Loading your planner...</div>;
    }

    return (
        <div className="planner-page">
            <div className="planner-header">
                <div className="header-info">
                    <FiCalendar className="header-icon" />
                    <div>
                        <h1>Weekly Workout Planner</h1>
                        <p>Design your perfect 7-day routine. Assign your favorite workouts or keep it as a rest day.</p>
                    </div>
                </div>
                <button
                    className={`save-btn ${saving ? 'loading' : ''}`}
                    onClick={savePlan}
                    disabled={saving}
                >
                    {saving ? "Saving..." : <><FiSave /> Save Schedule</>}
                </button>
            </div>

            {notification && (
                <div className={`notification ${notification.includes('failed') ? 'error' : 'success'}`}>
                    <FiCheckCircle /> {notification}
                </div>
            )}

            <div className="days-grid">
                {DAYS.map((day) => {
                    const dayKey = `${day.toLowerCase()}WorkoutId`;
                    const currentId = weeklyPlan[dayKey];
                    const currentWorkout = workouts.find(w => w.id === currentId);

                    return (
                        <div key={day} className={`day-card glass-panel ${currentId ? 'has-workout' : 'rest-day'}`}>
                            <div className="day-name">{day}</div>
                            <div className="day-content">
                                <div className="workout-selector">
                                    <label>Select Workout</label>
                                    <select
                                        value={currentId || "rest"}
                                        onChange={(e) => handleWorkoutChange(day, e.target.value)}
                                        className="styled-select"
                                    >
                                        <option value="rest">🧘 Rest Day</option>
                                        {workouts.map(w => (
                                            <option key={w.id} value={w.id}>
                                                🔥 {w.title}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {currentWorkout && (
                                    <div className="workout-preview animate-fade-in">
                                        <div className="preview-tag">{currentWorkout.category}</div>
                                        <div className="preview-details">
                                            <span><FiActivity /> {currentWorkout.calories} kcal</span>
                                            <span>⏱️ {currentWorkout.duration}</span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>

            <style jsx>{`
                .planner-page {
                    padding: 40px;
                    max-width: 1400px;
                    margin: 0 auto;
                }

                .planner-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 40px;
                }

                .header-info {
                    display: flex;
                    align-items: center;
                    gap: 20px;
                }

                .header-icon {
                    font-size: 3rem;
                    color: #ccff33;
                }

                h1 {
                    font-size: 2.5rem;
                    font-weight: 800;
                    margin: 0;
                    color: var(--text);
                }

                p {
                    color: var(--text-secondary);
                    margin: 5px 0 0 0;
                }

                .save-btn {
                    background: #ccff33;
                    color: black;
                    padding: 15px 30px;
                    border-radius: 15px;
                    font-weight: 700;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    border: none;
                    cursor: pointer;
                    transition: all 0.3s ease;
                    box-shadow: 0 10px 20px rgba(204, 255, 51, 0.2);
                }

                .save-btn:hover {
                    transform: translateY(-3px);
                    box-shadow: 0 15px 30px rgba(204, 255, 51, 0.3);
                }

                .save-btn.loading {
                    opacity: 0.7;
                    cursor: wait;
                }

                .notification {
                    padding: 15px 25px;
                    border-radius: 12px;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    font-weight: 600;
                    animation: slideDown 0.4s ease-out;
                }

                .success {
                    background: rgba(16, 185, 129, 0.1);
                    color: #10b981;
                    border: 1px solid rgba(16, 185, 129, 0.2);
                }

                .error {
                    background: rgba(239, 68, 68, 0.1);
                    color: #ef4444;
                    border: 1px solid rgba(239, 68, 68, 0.2);
                }

                .days-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
                    gap: 25px;
                }

                .day-card {
                    padding: 30px;
                    border-radius: 25px;
                    transition: all 0.3s ease;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }

                .day-card:hover {
                    transform: scale(1.02);
                    border-color: rgba(204, 255, 51, 0.3);
                }

                .day-name {
                    font-size: 1.5rem;
                    font-weight: 800;
                    margin-bottom: 20px;
                    color: var(--text);
                }

                .workout-selector label {
                    display: block;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: var(--text-secondary);
                    margin-bottom: 8px;
                    text-transform: uppercase;
                    letter-spacing: 1px;
                }

                .styled-select {
                    width: 100%;
                    padding: 12px 15px;
                    background: rgba(0, 0, 0, 0.2);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    color: var(--text);
                    font-weight: 600;
                    cursor: pointer;
                    outline: none;
                    transition: border-color 0.2s;
                }

                .styled-select:focus {
                    border-color: #ccff33;
                }

                .workout-preview {
                    margin-top: 25px;
                    padding-top: 20px;
                    border-top: 1px dotted rgba(255, 255, 255, 0.1);
                }

                .preview-tag {
                    display: inline-block;
                    padding: 4px 10px;
                    background: rgba(204, 255, 51, 0.1);
                    color: #ccff33;
                    border-radius: 8px;
                    font-size: 0.7rem;
                    font-weight: 700;
                    text-transform: uppercase;
                    margin-bottom: 12px;
                }

                .preview-details {
                    display: flex;
                    gap: 20px;
                    font-size: 0.9rem;
                    color: var(--text-secondary);
                    font-weight: 500;
                }

                .rest-day {
                    opacity: 0.8;
                }

                .has-workout {
                    background: linear-gradient(145deg, rgba(204, 255, 51, 0.05), rgba(30, 41, 59, 0.4)) !important;
                }

                @keyframes slideDown {
                    from { transform: translateY(-20px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }

                .animate-fade-in {
                    animation: fadeIn 0.3s ease-in;
                }

                @keyframes fadeIn {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }

                .loading-container {
                    height: 80vh;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.5rem;
                    font-weight: 700;
                    color: var(--text-secondary);
                }
            `}</style>
        </div>
    );
}
