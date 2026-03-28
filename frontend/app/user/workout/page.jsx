"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { FiClock, FiActivity, FiFilter, FiList } from "react-icons/fi";
import { FaFire } from "react-icons/fa";

import { getCookie } from "@/lib/cookie";

export default function WorkoutSelectionPage() {
  const [selectedType, setSelectedType] = useState("ppl");
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Load saved selection on mount
  useEffect(() => {
    const savedType = localStorage.getItem("selectedWorkoutType");
    if (savedType) {
      setSelectedType(savedType);
    }
  }, []);

  // Save selection whenever it changes
  useEffect(() => {
    localStorage.setItem("selectedWorkoutType", selectedType);
  }, [selectedType]);

  useEffect(() => {
    setLoading(true);
    const token = getCookie('authToken');
    fetch(`http://localhost:8083/api/user/workout?category=${selectedType}`, {
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
        setWorkouts(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch workouts", err);
        setLoading(false);
      });
  }, [selectedType]);

  return (
    <div className="page-container">
      {/* Ambient Background Animation */}
      {/* Ambient Background removed (handled by layout) */}

      {/* Header Section */}
      <div className="top-nav">
        <h1 className="page-title">Select Your Workout</h1>
        <div className="nav-actions">
          <select
            className="filter-dropdown"
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
          >
            <option value="" disabled>Select workout type</option>
            <option value="ppl">Push Pull Legs (Recommended)</option>
            <option value="single_muscle">Single Muscle Per Day</option>
            <option value="full_body">Single Day - Full Body</option>
          </select>
          <Link href="/user/workout/library">
            <button className="browse-btn">Browse Library</button>
          </Link>
        </div>
      </div>

      {/* Workout List */}
      <div className="workout-list">
        {loading ? (
          <div className="status-message">Loading Workouts...</div>
        ) : workouts.length === 0 ? (
          <div className="status-message">No workouts found for this category.</div>
        ) : (
          workouts.map((workout) => (
            <div key={workout.id} className="workout-card">

              {/* Left: Image Placeholder */}
              <div className="card-image">
                <img src={workout.image || "/push_day.png"} alt={workout.title} style={{ width: '80%', height: 'auto', objectFit: 'contain' }} />
              </div>

              {/* Middle: Details */}
              <div className="card-details">
                <h2 className="workout-title">{workout.title}</h2>
                <div className="stats-grid">
                  <div className="stat-row">
                    <span className="stat-label">Total Workout :-</span>
                    <span className="stat-val">{workout.totalExercises} numbers of the workout</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Select workout :-</span>
                    <span className="stat-val">{workout.selectedExercises || 0}</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Calories Burn :-</span>
                    <span className="stat-val">{workout.calories} cal</span>
                  </div>
                  <div className="stat-row">
                    <span className="stat-label">Time will take :-</span>
                    <span className="stat-val">{workout.duration}</span>
                  </div>
                </div>
              </div>

              {/* Right: Action Button */}
              <div className="card-action">
                <Link href={`/user/workout/start?id=${workout.id}`}>
                  <button className="start-btn">Select Workout And Start</button>
                </Link>
              </div>

            </div>
          )))}
      </div>

      <style jsx>{`
        .page-container {
          padding: 20px 40px;
          max-width: 1400px; /* Use more width for the list view */
          margin: 0 auto;
          color: var(--text);
          position: relative;
        }

        /* Background Animations */


        /* Top Nav */
        .top-nav {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 40px;
          border-bottom: 1px solid var(--border-color);
          padding-bottom: 20px;
          position: relative;
          z-index: 1;
        }

        .page-title {
           font-size: 1.8rem;
           font-weight: 700;
           color: var(--text);
        }

        .nav-actions {
           display: flex;
           gap: 20px;
           align-items: center;
        }

        .filter-dropdown {
           padding: 10px 20px;
           border: 1px solid rgba(255, 255, 255, 0.1);
           border-radius: 8px;
           color: var(--text-secondary);
           font-weight: 500;
           cursor: pointer;
           background: rgba(30, 41, 59, 0.6);
           backdrop-filter: blur(8px);
        }
        
        .filter-dropdown option {
           background-color: #1e293b;
           color: white;
        }

        .browse-btn {
           padding: 10px 24px;
           background: #111827;
           color: #fff;
           border-radius: 8px;
           font-weight: 600;
           border: none;
           cursor: pointer;
           transition: all 0.2s;
        }
        .browse-btn:hover {
           background: #000;
           transform: translateY(-1px);
        }

        /* Workout List */
        .workout-list {
           display: flex;
           flex-direction: column;
           gap: 24px;
           position: relative;
           z-index: 1;
        }

        .status-message {
           color: white;
           text-align: center;
           padding: 60px 20px;
           font-size: 1.2rem;
           font-weight: 500;
           opacity: 0.8;
        }

        .workout-card {
           display: flex;
           align-items: stretch;
           background: rgba(30, 41, 59, 0.4);
           backdrop-filter: blur(16px);
           border: 1px solid rgba(255, 255, 255, 0.08);
           border-radius: 24px;
           padding: 24px;
           gap: 30px;
           box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
           transition: transform 0.2s, box-shadow 0.2s;
        }
        
        /* Wireframe style: Bold borders are characteristic. */
        .workout-card:hover {
           transform: translateY(-4px);
           box-shadow: 0 12px 20px -5px rgba(0, 0, 0, 0.1);
           border-color: #10b981;
        }

        /* Looping float animation */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
          100% { transform: translateY(0px); }
        }

        /* Left Image Container */
        .card-image {
           flex: 0 0 180px;
           background: rgba(255, 255, 255, 0.03);
           border: 2px solid #10b981; /* Green Border */
           border-radius: 20px;
           display: flex;
           align-items: center;
           justify-content: center;
           overflow: hidden;
           position: relative;
        }
        
        /* The image inside will float on hover */
        .workout-card:hover .card-image img {
           animation: float 3s ease-in-out infinite;
        }

        .card-image span {
           color: #10b981; /* Fallback text color */
        }

        /* Middle Details */
        .card-details {
           flex: 1;
           display: flex;
           flex-direction: column;
           justify-content: center;
        }

        .workout-title {
           font-size: 1.4rem;
           font-weight: 700;
           color: var(--text);
           margin-bottom: 16px;
        }

        .stats-grid {
           display: grid;
           gap: 8px;
        }

        .stat-row {
           display: flex;
           align-items: baseline;
           gap: 10px;
           font-size: 1rem;
        }

        .stat-label {
           color: var(--text-secondary);
           font-weight: 600;
           min-width: 140px;
        }

        .stat-val {
           color: var(--text);
           font-weight: 600;
        }

        /* Right Action */
        .card-action {
           display: flex;
           align-items: center;
           justify-content: center;
           padding-left: 20px;
           border-left: 1px solid var(--border-color);
        }

        .start-btn {
           padding: 16px 24px;
           background: rgba(255, 255, 255, 0.05);
           border: 2px solid #10b981; /* Green Border */
           border-radius: 12px;
           color: #10b981;
           font-weight: 700;
           font-size: 1rem;
           cursor: pointer;
           transition: all 0.3s;
           white-space: nowrap;
           box-shadow: 0 4px 6px -1px rgba(16, 185, 129, 0.1);
        }

        .start-btn:hover {
           background: #10b981;
           color: #fff;
           box-shadow: 0 10px 15px -3px rgba(16, 185, 129, 0.3);
           transform: translateY(-2px);
        }

        /* Responsive */
        @media (max-width: 900px) {
           .workout-card {
              flex-direction: column;
              align-items: flex-start;
              gap: 20px;
           }
           .card-image {
              width: 100%;
              height: 200px;
              flex: none;
           }
           .card-action {
              width: 100%;
              padding-left: 0;
              border-left: none;
              border-top: 1px solid var(--border-color);
              padding-top: 20px;
           }
           .start-btn {
              width: 100%;
           }
        }
      `}</style>
    </div>
  );
}
