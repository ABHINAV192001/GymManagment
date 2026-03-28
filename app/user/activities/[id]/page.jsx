"use client";
import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api/client';
import { WORKOUT_API_BASE_URL } from '@/lib/api/config';
import { getCookie } from '@/lib/cookie';
import { FiClock, FiActivity, FiCalendar, FiUser, FiCheckCircle, FiPlay } from 'react-icons/fi';
import { FaFire, FaDumbbell } from 'react-icons/fa';
import Link from 'next/link';

export default function ActivityWorkoutPage({ params }) {
    const id = React.use(params).id;

    const [activity, setActivity] = useState(null);
    const [loading, setLoading] = useState(true);
    const [linkedWorkout, setLinkedWorkout] = useState(null);

    useEffect(() => {
        const fetchActivity = async () => {
            try {
                // 1. Fetch Activity Details
                const data = await apiGet(`/api/activities/${id}`, {}, { baseUrl: WORKOUT_API_BASE_URL });
                if (data) {
                    setActivity(data);

                    // 2. If Linked Workout Exists, Fetch it
                    if (data.linkedWorkoutId) {
                        const wData = await apiGet(`/api/user/workout/${data.linkedWorkoutId}`, {}, { baseUrl: WORKOUT_API_BASE_URL });
                        if (wData) {
                            setLinkedWorkout(wData);
                        }
                    }
                }
            } catch (error) {
                // Suppress 404 errors from console to avoid Next.js overlay if possible, or just log warn
                if (error.status === 404) {
                    console.warn("Activity not found (404)");
                    setActivity(null);
                } else {
                    console.error("Error fetching activity:", error);
                }
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchActivity();
    }, [id]);

    if (loading) return <div className="loading">Loading Activity Details...</div>;

    if (!activity) return (
        <div className="error-container" style={{ padding: '60px', textAlign: 'center', color: 'white' }}>
            <h2 className="text-2xl font-bold mb-4">Activity Not Found</h2>
            <p className="mb-6 text-slate-400">The activity you are looking for does not exist or has been removed.</p>
            <Link href="/user/activities" style={{ textDecoration: 'none' }}>
                <button style={{ padding: '12px 24px', background: '#10b981', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 'bold', cursor: 'pointer' }}>
                    Back to Activities
                </button>
            </Link>
        </div>
    );

    return (
        <div className="page-container">
            {/* Hero Section */}
            <div className="hero-section" style={{ background: activity.gradient || 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                <div className="hero-content">
                    <h1 className="hero-title">{activity.title}</h1>
                    <div className="stats-bar">
                        <div className="stat-item">
                            <FiClock size={20} />
                            <span>{activity.time}</span>
                        </div>
                        <div className="stat-item">
                            <FaFire size={20} />
                            <span>{activity.calories}</span>
                        </div>
                    </div>
                </div>
                <div className="hero-image">
                    <img src={activity.image || '/zumba.png'} alt={activity.title} />
                </div>
            </div>

            <div className="content-grid">
                {/* Left Column: About & key info */}
                <div className="main-content">
                    <section className="section-card">
                        <h2 className="section-title">About This Class</h2>
                        <p className="description">{activity.description}</p>
                    </section>

                    {/* Class Breakdown (Exercises) */}
                    {linkedWorkout && linkedWorkout.exercises && (
                        <section className="section-card">
                            <h2 className="section-title"><FaDumbbell /> Class Breakdown ({linkedWorkout.exercises.length} Exercises)</h2>
                            <div className="exercise-list">
                                {linkedWorkout.exercises.map((ex, idx) => (
                                    <div key={idx} className="exercise-item">
                                        <div className="ex-img">
                                            {/* Use generic activity icon if video url is placeholder, or specific image logic */}
                                            <FiActivity size={24} />
                                        </div>
                                        <div className="ex-info">
                                            <h4>{ex.exerciseName}</h4>
                                            <p>{ex.reps > 0 ? `${ex.reps} Reps` : `${ex.time} Sec`}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    )}


                    <section className="section-card">
                        <h2 className="section-title">Benefits</h2>
                        <div className="benefits-grid">
                            {activity.benefits && activity.benefits.map((benefit, index) => (
                                <div key={index} className="benefit-item">
                                    <FiCheckCircle className="check-icon" />
                                    <span>{benefit}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Right Column: Schedule & Instructor */}
                <div className="sidebar">
                    {/* Start Button */}
                    {activity.linkedWorkoutId ? (
                        <Link href={`/user/workout/start?id=${activity.linkedWorkoutId}`} style={{ textDecoration: 'none' }}>
                            <button className="book-btn start-btn">
                                <FiPlay size={24} style={{ marginRight: '10px' }} />
                                Start Class Now
                            </button>
                        </Link>
                    ) : (
                        <button className="book-btn">Book This Class</button>
                    )}


                    <section className="section-card schedule-card">
                        <h2 className="section-title"><FiCalendar /> Class Schedule</h2>
                        <ul className="schedule-list">
                            {activity.schedule && activity.schedule.map((slot, index) => (
                                <li key={index} className="schedule-item">
                                    {slot}
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="section-card instructor-card">
                        <h2 className="section-title"><FiUser /> Instructor</h2>
                        <div className="instructor-info">
                            <div className="instructor-img">
                                <img src={activity.instructorImage || '/trainer1.png'} alt="Instructor" />
                            </div>
                            <div className="instructor-text">
                                <h3>{activity.instructorName}</h3>
                                <p>{activity.instructorRole}</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>

            <style jsx>{`
        /* Import Poppins */
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

        .page-container {
            padding: 40px;
            max-width: 1400px;
            margin: 0 auto;
            font-family: "Poppins", sans-serif;
            color: var(--text);
        }

        .loading, .error {
            text-align: center;
            color: white;
            padding: 40px;
            font-size: 1.2rem;
        }

        /* Hero */
        .hero-section {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-radius: 30px;
            padding: 60px;
            margin-bottom: 40px;
            position: relative;
            overflow: hidden;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }

        .hero-content {
            z-index: 2;
            flex: 1;
        }

        .hero-title {
            font-size: 4rem;
            font-weight: 800;
            color: white;
            margin-bottom: 20px;
            text-shadow: 0 4px 10px rgba(0,0,0,0.3);
        }

        .stats-bar {
            display: flex;
            gap: 30px;
        }

        .stat-item {
            display: flex;
            align-items: center;
            gap: 10px;
            background: rgba(255,255,255,0.2);
            backdrop-filter: blur(10px);
            padding: 10px 20px;
            border-radius: 50px;
            color: white;
            font-weight: 600;
            font-size: 1.1rem;
        }

        .hero-image {
            flex: 0 0 400px;
            z-index: 2;
            animation: float 4s ease-in-out infinite;
        }

        .hero-image img {
            width: 100%;
            filter: drop-shadow(0 10px 30px rgba(0,0,0,0.4));
        }

        @keyframes float {
            0% { transform: translateY(0); }
            50% { transform: translateY(-15px); }
            100% { transform: translateY(0); }
        }

        /* Content Grid */
        .content-grid {
            display: grid;
            grid-template-columns: 2fr 1fr;
            gap: 40px;
        }

        @media (max-width: 1000px) {
            .content-grid {
                grid-template-columns: 1fr;
            }
            .hero-section {
                flex-direction: column-reverse; /* Image on top on mobile? Or bottom. Let's stack. */
                text-align: center;
                gap: 40px;
            }
            .stats-bar {
                justify-content: center;
            }
            .hero-image {
                flex: none;
                width: 80%;
            }
        }

        /* Cards */
        .section-card {
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(12px);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 24px;
            padding: 30px;
            margin-bottom: 30px;
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
        }

        .section-title {
            font-size: 1.5rem;
            margin-bottom: 20px;
            color: var(--text);
            display: flex;
            align-items: center;
            gap: 10px;
        }

        .description {
            font-size: 1.1rem;
            line-height: 1.8;
            color: var(--text-secondary);
        }

        /* Benefits */
        .benefits-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
        }

        .benefit-item {
            display: flex;
            align-items: center;
            gap: 12px;
            background: rgba(255,255,255,0.05);
            padding: 15px;
            border-radius: 12px;
            font-weight: 500;
            color: var(--text);
            border: 1px solid rgba(255,255,255,0.05);
        }

        .check-icon {
            color: #10b981;
            flex-shrink: 0;
            font-size: 1.2rem;
        }

        /* Exercise List */
        .exercise-list {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
            gap: 15px;
            max-height: 400px;
            overflow-y: auto;
            padding-right: 10px;
        }
        
        /* Scrollbar styling for exercise list */
        .exercise-list::-webkit-scrollbar {
            width: 6px;
        }
        .exercise-list::-webkit-scrollbar-track {
            background: rgba(255,255,255,0.05);
        }
        .exercise-list::-webkit-scrollbar-thumb {
            background: rgba(255,255,255,0.2);
            border-radius: 3px;
        }

        .exercise-item {
            display: flex;
            align-items: center;
            gap: 15px;
            background: rgba(255,255,255,0.05);
            padding: 10px;
            border-radius: 12px;
            transition: background 0.3s;
        }

        .exercise-item:hover {
            background: rgba(255,255,255,0.1);
        }

        .ex-img {
            width: 40px;
            height: 40px;
            border-radius: 50%;
            background: rgba(255,255,255,0.1);
            display: flex;
            align-items: center;
            justify-content: center;
            color: var(--primary);
        }

        .ex-info h4 {
            font-size: 1rem;
            margin: 0;
            color: var(--text);
        }

        .ex-info p {
            font-size: 0.85rem;
            margin: 0;
            color: var(--text-secondary);
        }

        /* Schedule */
        .schedule-list {
            list-style: none;
            padding: 0;
        }

        .schedule-item {
            padding: 15px;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            color: var(--text);
            font-weight: 500;
        }
        .schedule-item:last-child {
            border-bottom: none;
        }

        /* Instructor */
        .instructor-info {
            display: flex;
            align-items: center;
            gap: 20px;
        }

        .instructor-img {
            width: 80px;
            height: 80px;
            border-radius: 50%;
            overflow: hidden;
            border: 2px solid #10b981;
        }
        
        .instructor-img img {
            width: 100%;
            height: 100%;
            object-fit: cover;
        }

        .instructor-text h3 {
            font-size: 1.2rem;
            color: var(--text);
            margin: 0 0 5px 0;
        }

        .instructor-text p {
            color: var(--text-secondary);
            margin: 0;
            font-size: 0.95rem;
        }

        /* CTA */
        .book-btn {
            width: 100%;
            padding: 18px;
            background: #10b981;
            color: white;
            border: none;
            border-radius: 16px;
            font-size: 1.1rem;
            font-weight: 700;
            cursor: pointer;
            transition: all 0.3s;
            box-shadow: 0 4px 6px rgba(16, 185, 129, 0.4);
            margin-bottom: 30px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .start-btn {
             background: linear-gradient(135deg, #10b981, #059669);
             box-shadow: 0 4px 15px rgba(16, 185, 129, 0.5);
             animation: pulse 2s infinite;
        }
        
        @keyframes pulse {
            0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7); }
            70% { box-shadow: 0 0 0 10px rgba(16, 185, 129, 0); }
            100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
        }

        .book-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 10px 20px rgba(16, 185, 129, 0.6);
        }
            `}</style>
        </div>
    );
}
