"use client";
import React, { useState, useEffect } from 'react';
import { apiGet } from '@/lib/api/client';
import { WORKOUT_API_BASE_URL } from '@/lib/api/config';
import { getCookie } from '@/lib/cookie';
import Link from 'next/link';

// Mapping from URL slug to Activity Title (as stored in DB)
const slugToTitle = {
    "hypertrophy": "Hypertrophy Workout",
    "womens-workout": "Women's Workouts",
    "lose-weight": "Lose Weight",
    "definition": "Definition",
    "home-workout": "Home Workout",
    "strength": "Strength Training"
};

export default function ExploreDetailPage({ params }) {
    const unwrappedParams = React.use(params);
    const categorySlug = unwrappedParams.category;
    const infoTitle = decodeURIComponent(categorySlug);

    const dbTitle = slugToTitle[categorySlug];

    const [activities, setActivities] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchActivities = async () => {
            try {
                const data = await apiGet('/api/activities', { category: 'PROGRAM' }, { baseUrl: WORKOUT_API_BASE_URL });
                if (data) {
                    if (dbTitle) {
                        const filtered = data.filter(a => a.title === dbTitle);
                        setActivities(filtered);
                    } else {
                        setActivities([]);
                    }
                }
            } catch (error) {
                console.error("Failed to fetch activities", error);
            } finally {
                setLoading(false);
            }
        };

        if (dbTitle) {
            fetchActivities();
        } else {
            setLoading(false);
        }
    }, [dbTitle]);

    if (loading) return <div style={{ padding: '40px', color: 'white' }}>Loading...</div>;

    return (
        <div className="page-container">
            <div className="header-section">
                <h1 className="page-title">{dbTitle || infoTitle}</h1>
                <p className="subtitle">Curated programs for your goals.</p>
            </div>

            <div className="activities-grid">
                {activities.length > 0 ? (
                    activities.map((activity) => (
                        <Link href={`/user/activities/${activity.id}`} key={activity.id} style={{ textDecoration: 'none' }}>
                            <div className="activity-card">
                                <div className="card-image-container" style={{ background: activity.gradient || 'linear-gradient(135deg, #1e293b, #0f172a)' }}>
                                    <img src={activity.image || '/zumba.png'} alt={activity.title} />
                                </div>

                                <div className="card-details">
                                    <h2>{activity.title}</h2>
                                    <div className="stat-row">
                                        <span className="label">Time :-</span>
                                        <span className="val">{activity.time}</span>
                                    </div>
                                    <div className="stat-row">
                                        <span className="label">Calories :-</span>
                                        <span className="val">{activity.calories}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>
                    ))
                ) : (
                    <div style={{ color: 'white' }}>No programs found for this category.</div>
                )}
            </div>

            <style jsx>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap');

                .page-container {
                  padding: 40px;
                  min-height: 100vh;
                  font-family: "Poppins", sans-serif;
                  color: white; 
                }
                
                .header-section {
                   margin-bottom: 50px;
                   border-bottom: 1px solid rgba(255,255,255,0.1);
                   padding-bottom: 20px;
                }

                .page-title {
                   font-size: 2.5rem;
                   font-weight: 700;
                   margin-bottom: 10px;
                   background: linear-gradient(to right, #ffffff, #a8a8a8);
                   -webkit-background-clip: text;
                   -webkit-text-fill-color: transparent;
                }
                
                .subtitle {
                   color: #a8a8a8;
                   font-size: 1.1rem;
                }

                .activities-grid {
                   display: grid;
                   grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
                   gap: 30px;
                }

                .activity-card {
                   background: rgba(30, 41, 59, 0.4);
                   backdrop-filter: blur(12px);
                   border: 1px solid rgba(255, 255, 255, 0.08);
                   border-radius: 24px;
                   padding: 20px;
                   transition: transform 0.3s, box-shadow 0.3s;
                   display: flex;
                   flex-direction: column;
                   gap: 20px;
                   box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
                   cursor: pointer;
                }

                .activity-card:hover {
                   transform: translateY(-8px);
                   box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
                   border-color: #10b981;
                }

                .card-image-container {
                   width: 100%;
                   height: 200px;
                   border-radius: 20px;
                   display: flex;
                   align-items: center;
                   justify-content: center;
                   overflow: hidden;
                   box-shadow: inset 0 0 20px rgba(0,0,0,0.1);
                }

                .card-image-container img {
                   width: 80%;
                   height: 80%;
                   object-fit: contain;
                   filter: drop-shadow(0 5px 15px rgba(0,0,0,0.2));
                   transition: transform 0.3s;
                }

                .activity-card:hover .card-image-container img {
                   transform: scale(1.1);
                }

                .card-details h2 {
                   font-size: 1.5rem;
                   margin-bottom: 12px;
                   color: white;
                   font-weight: 600;
                }

                .stat-row {
                   display: flex;
                   align-items: center;
                   gap: 10px;
                   margin-bottom: 6px;
                   font-size: 1rem;
                }

                .label {
                   color: #a8a8a8;
                   font-weight: 500;
                }

                .val {
                   color: white;
                   font-weight: 600;
                }
            `}</style>
        </div>
    );
}
