"use client";
import React, { useEffect, useState } from 'react';
import { apiGet } from '@/lib/api/client';
import { WORKOUT_API_BASE_URL } from '@/lib/api/config';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function ExploreWorkouts() {
    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Initial fallback data matching user's exact names and styling from the screenshot
    const requestedCategories = [
        { id: 'hyp', title: "hypertrophy workout", time: "1 Hr", calories: "800 cal", image: "/hypertrophy.png" },
        { id: 'wom', title: "womens-workout", time: "1 Hr", calories: "600 cal", image: "/womens_workout.png" },
        { id: 'los', title: "lose-weight", time: "1 Hr", calories: "700 cal", image: "/weight_loss.png" },
        { id: 'def', title: "definition", time: "1 Hr", calories: "500 cal", image: "/definition.png" },
        { id: 'hom', title: "home-workout", time: "1 Hr", calories: "400 cal", image: "/home_workout.png" },
        { id: 'str', title: "strength Training", time: "1 Hr", calories: "600 cal", image: "/hypertrophy.png" },
    ];

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const data = await apiGet('/api/activities', { category: 'PROGRAM' }, { baseUrl: WORKOUT_API_BASE_URL });
                if (data && data.length > 0) {
                    // We found data in DB! Let's use it.
                    setActivities(data);
                } else {
                    // Use fallback if DB is empty
                    setActivities(requestedCategories);
                }
                setError(null);
            } catch (error) {
                console.error("Failed to fetch activities", error);
                setActivities(requestedCategories);
            } finally {
                setLoading(false);
            }
        };

        fetchActivities();
    }, []);

    if (loading) {
        return (
            <div className="page-container flex items-center justify-center min-vh-100">
                <div className="text-2xl font-bold animate-pulse text-white/50">Waking up the Gym...</div>
            </div>
        );
    }

    return (
        <div className="explore-container">
            <style jsx>{`
                .explore-container {
                    padding: 40px 20px;
                    max-width: 1300px;
                    margin: 0 auto;
                    font-family: 'Outfit', sans-serif;
                }
                
                .header-wrapper {
                    margin-bottom: 50px;
                    display: flex;
                    justify-content: flex-start;
                }

                .select-activities-box {
                    background: rgba(30, 41, 59, 0.4);
                    backdrop-filter: blur(16px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 12px 35px;
                    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                }

                .select-activities-box h2 {
                    margin: 0;
                    font-size: 1.4rem;
                    font-weight: 500;
                    color: #fff;
                    letter-spacing: 0.5px;
                }

                .activities-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 35px;
                }

                @media (max-width: 1024px) {
                    .activities-grid {
                        grid-template-columns: repeat(2, 1fr);
                        gap: 25px;
                    }
                }

                @media (max-width: 640px) {
                    .activities-grid {
                        grid-template-columns: 1fr;
                    }
                    .header-wrapper {
                        justify-content: center;
                    }
                }

                .activity-card {
                    background: rgba(30, 41, 59, 0.5);
                    backdrop-filter: blur(20px);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 32px;
                    padding: 24px;
                    transition: all 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    cursor: pointer;
                    display: flex;
                    flex-direction: column;
                    gap: 22px;
                    box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
                    position: relative;
                    overflow: hidden;
                }

                .activity-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: linear-gradient(225deg, rgba(255,255,255,0.05) 0%, transparent 100%);
                    pointer-events: none;
                }

                .activity-card:hover {
                    transform: translateY(-10px) scale(1.02);
                    border-color: #10b981;
                    box-shadow: 0 25px 50px rgba(0, 0, 0, 0.5);
                    background: rgba(30, 41, 59, 0.7);
                }

                .image-container {
                    width: 100%;
                    aspect-ratio: 1.6;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    border-radius: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    overflow: hidden;
                    position: relative;
                }

                .image-container img {
                    width: 70%;
                    height: 70%;
                    object-fit: contain;
                    transition: all 0.6s ease;
                    filter: drop-shadow(0 15px 25px rgba(0,0,0,0.4));
                }

                .activity-card:hover .image-container img {
                    transform: scale(1.15) rotate(3deg);
                    filter: drop-shadow(0 20px 30px rgba(16, 185, 129, 0.3));
                }

                .info-section {
                    display: flex;
                    flex-direction: column;
                    gap: 10px;
                }

                .info-section h3 {
                    margin: 0;
                    font-size: 1.4rem;
                    font-weight: 700;
                    color: white;
                    margin-bottom: 2px;
                    letter-spacing: -0.5px;
                }

                .stat-row {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 1rem;
                    color: rgba(255, 255, 255, 0.5);
                    font-weight: 400;
                }

                .stat-row span {
                    color: rgba(255, 255, 255, 0.9);
                    font-weight: 600;
                }

                .start-journey {
                    margin-top: 5px;
                    display: flex;
                    align-items: center;
                    gap: 5px;
                    color: #10b981;
                    font-weight: 600;
                    font-size: 0.9rem;
                    opacity: 0;
                    transform: translateX(-10px);
                    transition: all 0.3s ease;
                }

                .activity-card:hover .start-journey {
                    opacity: 1;
                    transform: translateX(0);
                }
            `}</style>

            <div className="header-wrapper">
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="select-activities-box"
                >
                    <h2>Select Your activities</h2>
                </motion.div>
            </div>

            <div className="activities-grid">
                {activities.map((activity, index) => (
                    <motion.div
                        key={activity.id || index}
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1, duration: 0.5 }}
                    >
                        <Link href={`/user/activities/${activity.id}`} style={{ textDecoration: 'none' }}>
                            <div className="activity-card">
                                <div className="image-container">
                                    <img src={activity.image} alt={activity.title} />
                                </div>
                                <div className="info-section">
                                    <h3>{activity.title}</h3>
                                    <div className="stat-row">
                                        Time :- <span>{activity.time}</span>
                                    </div>
                                    <div className="stat-row">
                                        Calories :- <span>{activity.calories}</span>
                                    </div>
                                    <div className="start-journey">
                                        Launch Program →
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
