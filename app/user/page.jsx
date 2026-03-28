"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  FaWalking,
  FaTint,
  FaStar,
} from "react-icons/fa";
import {
  FiClipboard,
  FiEdit2,
  FiZap,
  FiActivity,
  FiPlusSquare,
  FiBook,
  FiPieChart,
  FiArrowDown,
  FiArrowUp,
  FiCalendar
} from "react-icons/fi";
import { useTheme } from "../../context/ThemeContext";
import AddCaloriesModal from "../components/User/AddCaloriesModal";
import AddWaterModal from "../components/User/AddWaterModal";
import DailyLogModal from "../components/User/DailyLogModal";
import { rateTrainer } from "@/lib/api/trainer";
import { getProfile } from "@/lib/api/user";

export default function UserDashboard() {
  const { theme } = useTheme();
  const [loading, setLoading] = useState(true);

  // Initialize with empty string to avoid SSR/Client mismatch
  const [selectedDate, setSelectedDate] = useState("");
  const [showCaloriesModal, setShowCaloriesModal] = useState(false);
  const [showWaterModal, setShowWaterModal] = useState(false);
  const [showDailyLogModal, setShowDailyLogModal] = useState(false);
  const [userProfile, setUserProfile] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [comment, setComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  useEffect(() => {
    // Set today's date only on the client
    const todayStr = new Date().toISOString().split('T')[0];
    setSelectedDate(todayStr);
  }, []);

  const [data, setData] = useState({
    calories: { current: 0, target: 2000 },
    macros: {
      carbs: { current: 0, target: 200 },
      protein: { current: 0, target: 150 },
      fat: { current: 0, target: 70 },
    },
    activity: {
      steps: { current: 0, target: 10000, unit: 'kcal' },
      water: { current: 0.00, target: 3.0, unit: 'liter' }
    },
    today: {
      date: "",
      workoutDay: "",
      workoutPlan: ""
    }
  });

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const getCookie = (name) => {
        const value = `; ${document.cookie}`;
        const parts = value.split(`; ${name}=`);
        if (parts.length === 2) return parts.pop().split(';').shift();
      };

      const token = getCookie('authToken') || getCookie('jwt') || getCookie('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }

      // 1. Fetch User Dashboard Stats (User Info, Calories, Macros)
      const res = await fetch(`http://localhost:8080/api/user/dashboard?date=${selectedDate}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      let dashboardData = {
        calories: { current: 0, target: 2000 },
        macros: { carbs: { current: 0, target: 200 }, protein: { current: 0, target: 150 }, fat: { current: 0, target: 70 } },
        activity: { steps: { current: 0, target: 10000, unit: 'kcal' }, water: { current: 0.00, target: 3.0, unit: 'liter' } },
        today: { date: "", workoutDay: "", workoutPlan: "" }
      };

      if (res.ok) {
        dashboardData = await res.json();
      }

      // 2. Fetch Weekly Plan and Override "Today's Workout"
      const userStr = localStorage.getItem('user');
      if (userStr) {
        const user = JSON.parse(userStr);
        try {
          // Fetch weekly plan from Workout Service (8083)
          const weeklyRes = await fetch(`http://localhost:8083/api/workout/user-plan/${user.id}/weekly`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          if (weeklyRes.ok) {
            const weeklyPlan = await weeklyRes.json();
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const currentDayName = days[new Date(selectedDate).getDay()];
            const workoutId = weeklyPlan[`${currentDayName.toLowerCase()}WorkoutId`];

            if (workoutId) {
              // Fetch workout title
              const workoutInfoRes = await fetch(`http://localhost:8083/api/user/workout/${workoutId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
              });
              if (workoutInfoRes.ok) {
                const workoutInfo = await workoutInfoRes.json();
                dashboardData.today.workoutDay = currentDayName;
                dashboardData.today.workoutPlan = workoutInfo.title;
              }
            } else {
              dashboardData.today.workoutDay = currentDayName;
              dashboardData.today.workoutPlan = "🧘 Rest Day";
            }
          }
        } catch (err) {
          console.error("Error fetching weekly plan integration:", err);
        }
      }

      setData(dashboardData);
    } catch (error) {
      console.error("Error fetching dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const prof = await getProfile();
      setUserProfile(prof);
    } catch (err) {
      console.error("Failed to fetch profile", err);
    }
  };

  const handleRateTrainer = async () => {
    if (!userProfile?.trainerId) return;
    if (rating === 0) {
      alert("Please select a rating.");
      return;
    }
    setIsSubmittingRating(true);
    try {
      await rateTrainer(userProfile.trainerId, rating, comment);
      alert("Thank you for your feedback!");
      setRating(0);
      setComment("");
    } catch (err) {
      console.error("Failed to submit rating", err);
      alert("Failed to submit rating.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  useEffect(() => {
    if (selectedDate) {
      fetchDashboardData();
      fetchProfile();
    }
  }, [selectedDate]);

  // Circular Progress Component
  const CircularProgress = ({ value, max, size = 180, strokeWidth = 15 }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const progress = Math.min(value / max, 1);
    const dashoffset = circumference - progress * circumference;

    return (
      <div className="relative flex items-center justify-center" style={{ width: size, height: size }} suppressHydrationWarning>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="var(--bg-darker)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
          />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="#ccff33" // Bright Lime
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={dashoffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 0.5s ease' }}
            suppressHydrationWarning
          />
        </svg>
        <div className="absolute text-center flex flex-col items-center">
          <span className="text-3xl font-extrabold leading-none" style={{ color: "var(--text)" }} suppressHydrationWarning>{value}/{max}</span>
          <span className="text-sm font-medium mt-1" style={{ color: "var(--text-secondary)" }} suppressHydrationWarning>kcal</span>
        </div>
      </div>
    );
  };

  const MacroBar = ({ label, current, max, color }) => (
    <div className="mb-4">
      <div className="flex justify-between text-sm font-bold mb-1">
        <span style={{ color: color }} suppressHydrationWarning>{current}/{max} grams</span>
      </div>
      <div className="h-1.5 w-full bg-gray-100 dark:bg-neutral-800 rounded-full overflow-hidden mb-1">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${(current / max) * 100}%`, backgroundColor: color }}
          suppressHydrationWarning
        ></div>
      </div>
      <div className="text-xs font-medium capitalize" style={{ color: "var(--text-secondary)" }} suppressHydrationWarning>{label}</div>
    </div>
  );

  return (
    <div className="dashboard-container">

      {/* LEFT COLUMN */}
      <div className="left-column">

        {/* Progress Card */}
        <div
          onClick={() => setShowDailyLogModal(true)}
          className="card progress-card cursor-pointer hover:shadow-lg transition-all"
        >
          <div className="flex justify-between items-center mb-6">
            <h2 className="card-title mb-0">Today's Progress</h2>
            {/* Date Picker Input */}
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              onClick={(e) => e.stopPropagation()}
              className="date-picker-input"
            />
          </div>

          <div className="progress-content">
            {loading ? (
              <div className="w-full h-[180px] flex items-center justify-center text-sm text-gray-400">Updating...</div>
            ) : (
              <>
                <div className="circle-wrapper">
                  <CircularProgress
                    value={data.calories.current}
                    max={data.calories.target}
                    strokeWidth={18}
                  />
                </div>

                <div className="macros-list">
                  <MacroBar label="Carbs" current={data.macros.carbs.current} max={data.macros.carbs.target} color="#ff9999" />
                  <MacroBar label="Protein" current={data.macros.protein.current} max={data.macros.protein.target} color="#80b3ff" />
                  <MacroBar label="Fat" current={data.macros.fat.current} max={data.macros.fat.target} color="#ffcc80" />
                </div>
              </>
            )}
          </div>

          <div className="divider"></div>

          {/* Bottom Row: Steps & Water */}
          <div className="activity-row">
            <div className="activity-item">
              <FaWalking className="text-green-500 text-2xl" suppressHydrationWarning />
              <div className="ml-3">
                <span className="block text-xl font-bold" style={{ color: "var(--text)" }} suppressHydrationWarning>{data.activity.steps.current}/{data.activity.steps.target}</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }} suppressHydrationWarning>steps</span>
              </div>
            </div>
            <div className="activity-item">
              <FaTint className="text-blue-500 text-2xl" suppressHydrationWarning />
              <div className="ml-3">
                <span className="block text-xl font-bold" style={{ color: "var(--text)" }} suppressHydrationWarning>{data.activity.water.current.toFixed(2)}/{data.activity.water.target}</span>
                <span className="text-xs font-medium" style={{ color: "var(--text-secondary)" }} suppressHydrationWarning>liter</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions Card */}
        <div className="card quick-actions-card">
          <div className="card-header">
            <h3 className="card-title" style={{ color: "var(--text)" }} suppressHydrationWarning>Quick Actions</h3>
          </div>
          <div className="quick-grid">
            <Link href="/user/diet" className="quick-btn">
              <FiClipboard className="q-icon text-green-500" suppressHydrationWarning />
              <span>Diet Summary</span>
            </Link>
            <Link href="/user/profile" className="quick-btn">
              <FiEdit2 className="q-icon text-blue-500" suppressHydrationWarning />
              <span>Edit Goals</span>
            </Link>
            <Link href="/user/plans" className="quick-btn">
              <FiZap className="q-icon text-yellow-500" suppressHydrationWarning />
              <span>Instant Plans</span>
            </Link>
            <Link href="/user/workout" className="quick-btn">
              <FiActivity className="q-icon text-purple-500" suppressHydrationWarning />
              <span>Pro Workouts</span>
            </Link>
            <Link href="/user/recipe/create" className="quick-btn">
              <FiPlusSquare className="q-icon text-orange-500" suppressHydrationWarning />
              <span>Create Recipe</span>
            </Link>
            <Link href="/user/recipes" className="quick-btn position-relative">
              <FiBook className="q-icon text-teal-500" suppressHydrationWarning />
              <span>My Recipes</span>
              <span className="badge-new">New</span>
            </Link>
            <Link href="/user/planner" className="quick-btn">
              <FiCalendar className="q-icon text-pink-500" suppressHydrationWarning />
              <span>Weekly Planner</span>
            </Link>
          </div>
        </div>

      </div>

      {/* RIGHT COLUMN */}
      <div className="right-column">

        {/* Header Bar */}
        <div className="card header-bar">
          <div className="header-item">
            <span className="label">Date :- </span>
            <span className="val">{data.today.date}</span>
          </div>
          <div className="header-item">
            <span className="label">Workout day :- </span>
            <span className="val">{data.today.workoutDay}</span>
          </div>

        </div>

        {/* Action Cards Row */}
        <div className="actions-row">
          <Link href="/user/workout/library" className="card action-card">
            <span className="action-text">Create a Workout Plan +</span>
          </Link>
          <Link href="/user/workout" className="card action-card">
            <span className="action-text">Start Workout</span>
          </Link>
        </div>

        {/* Nutrition Card */}
        <div className="card nutrition-card">
          <h3 className="card-title">Nutrition</h3>
          <div className="nutrition-grid">
            <Link href="/user/diet/create" className="nutri-btn">
              <div className="icon-box bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400">
                <FiPieChart size={24} suppressHydrationWarning />
              </div>
              <span>Create Diet</span>
            </Link>
            <Link href="/user/recipes/low-carb" className="nutri-btn">
              <div className="icon-box bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
                <FiArrowDown size={24} suppressHydrationWarning />
              </div>
              <span>Low Carb Recipes</span>
            </Link>
            <Link href="/user/recipes/high-protein" className="nutri-btn">
              <div className="icon-box bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <FiArrowUp size={24} suppressHydrationWarning />
              </div>
              <span>High Protein Recipes</span>
            </Link>
          </div>
        </div>

        {/* Intake Actions Row */}
        <div className="actions-row">
          <div onClick={() => setShowCaloriesModal(true)} className="card action-card cursor-pointer">
            <span className="action-text flex flex-col items-center gap-2">
              <FiPlusSquare className="text-3xl text-green-500" suppressHydrationWarning />
              Add Calories
            </span>
          </div>
          <div onClick={() => setShowWaterModal(true)} className="card action-card cursor-pointer">
            <span className="action-text flex flex-col items-center gap-2">
              <FaTint className="text-3xl text-blue-500" suppressHydrationWarning />
              Add Water Intake
            </span>
          </div>
        </div>

        {/* Trainer Rating Card */}
        {userProfile?.trainerName && (
          <div className="card rating-card">
            <h3 className="card-title" style={{ marginBottom: '15px' }}>Rate Your Trainer: <span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{userProfile.trainerName}</span></h3>
            <div className="flex flex-col gap-4">
              <div className="flex justify-center gap-3">
                {[...Array(5)].map((_, index) => {
                  const ratingValue = index + 1;
                  return (
                    <button
                      type="button"
                      key={index}
                      className={`text-4xl transition-all duration-200 transform hover:scale-110 ${(hover || rating) >= ratingValue ? "text-yellow-400 drop-shadow-[0_0_8px_rgba(250,204,21,0.4)]" : "text-gray-700 hover:text-gray-500"}`}
                      onClick={() => setRating(ratingValue)}
                      onMouseEnter={() => setHover(ratingValue)}
                      onMouseLeave={() => setHover(0)}
                    >
                      <FaStar suppressHydrationWarning />
                    </button>
                  );
                })}
              </div>
              <textarea
                className="w-full bg-slate-900/60 border border-white/5 rounded-2xl p-4 text-sm text-white outline-none focus:border-[var(--primary)]/50 focus:ring-1 focus:ring-[var(--primary)]/30 transition-all resize-none shadow-inner"
                rows="3"
                placeholder="How was your session today? (Optional)"
                value={comment}
                onChange={(e) => setComment(e.target.value)}
              ></textarea>
              <button
                onClick={handleRateTrainer}
                disabled={isSubmittingRating || rating === 0}
                className={`w-full py-4 rounded-2xl font-black text-sm uppercase tracking-widest shadow-lg shadow-[var(--primary)]/10 transition-all active:scale-95 ${isSubmittingRating || rating === 0 ? "bg-slate-800 text-slate-600 cursor-not-allowed" : "bg-[var(--primary)] text-black hover:brightness-110"}`}
              >
                {isSubmittingRating ? "Submitting..." : "Submit Trainer Rating"}
              </button>
            </div>
          </div>
        )}

      </div>

      <AddCaloriesModal
        isOpen={showCaloriesModal}
        onClose={() => setShowCaloriesModal(false)}
        onFoodAdded={fetchDashboardData}
      />

      <AddWaterModal
        isOpen={showWaterModal}
        onClose={() => setShowWaterModal(false)}
        onAdd={fetchDashboardData}
      />

      <DailyLogModal
        isOpen={showDailyLogModal}
        onClose={() => {
          setShowDailyLogModal(false);
          // Refresh dashboard data when closing in case items were deleted
          fetchDashboardData();
        }}
        date={selectedDate}
      />

      <style jsx>{`
        .dashboard-container {
          display: grid;
          grid-template-columns: 380px 1fr;
          gap: 30px;
          padding: 20px 0;
          max-width: 1200px;
          margin: 0 auto;
        }

        /* Responsive */
        @media (max-width: 900px) {
          .dashboard-container {
            grid-template-columns: 1fr;
          }
        }

        .left-column, .right-column {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .card {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border-radius: 30px; 
          padding: 30px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          border: 1px solid rgba(255, 255, 255, 0.08);
        }
        
        /* Date Picker Styling */
        .date-picker-input {
            background: var(--bg-darker);
            color: var(--text);
            border: 1px solid var(--border-color);
            padding: 8px 12px;
            border-radius: 8px;
            font-family: inherit;
            cursor: pointer;
            outline: none;
        }
        .date-picker-input::-webkit-calendar-picker-indicator {
            filter: invert(0.5); /* Adjust icon color roughly */
        }
        .dark .date-picker-input::-webkit-calendar-picker-indicator {
             filter: invert(1);
        }

        .card-title {
          font-size: 1.1rem;
          color: var(--text-secondary);
          margin-bottom: 25px;
          font-weight: 500;
        }

        .progress-content {
          display: flex;
          gap: 25px;
          align-items: center;
          margin-bottom: 25px;
        }
        .circle-wrapper {
          flex-shrink: 0;
        }
        .macros-list {
          flex-grow: 1;
        }

        .divider {
          height: 1px;
          background-image: linear-gradient(to right, #ccc 33%, rgba(255,255,255,0) 0%);
          background-position: bottom;
          background-size: 6px 1px;
          background-repeat: repeat-x;
          opacity: 0.3;
          margin: 20px 0;
        }

        .activity-row {
          display: flex;
          justify-content: space-between;
          padding: 0 10px;
        }
        .activity-item {
          display: flex;
          align-items: center;
        }

        /* Quick Actions */
        .quick-actions-card {
           padding: 0;
           border-radius: 24px;
           background: rgba(30, 41, 59, 0.4);
           backdrop-filter: blur(12px);
           box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
           overflow: hidden;
           border: 1px solid rgba(255, 255, 255, 0.08);
        }

        .card-header {
           padding: 25px 30px 20px 30px;
           border-bottom: 1px solid var(--border-color);
        }
        
        .quick-actions-card .card-title {
          font-size: 1.1rem;
          color: var(--text); 
          font-weight: 600;
          margin: 0;
        }

        .quick-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 16px;
          padding: 25px 30px;
        }
        
        .quick-btn {
          padding: 20px;
          display: flex;
          flex-direction: row;
          align-items: center;
          gap: 16px;
          text-decoration: none;
          transition: all 0.2s ease;
          position: relative;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 16px;
          box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.02);
        }
        
        .quick-btn:hover {
          transform: translateY(-3px);
          border-color: rgba(255, 255, 255, 0.2);
          background-color: rgba(255, 255, 255, 0.08); 
        }
        
        .q-icon {
          font-size: 1.4rem;
          transition: transform 0.2s ease;
          color: #6b7280;
        }
        .quick-btn:hover .q-icon {
           transform: scale(1.1);
           color: #059669;
        }

        .quick-btn span {
          font-size: 0.95rem;
          font-weight: 600;
          color: var(--text-secondary);
        }
        .quick-btn:hover span {
          color: #059669;
        }

        .badge-new {
          position: absolute;
          top: -8px; 
          right: -8px;
          background: #10b981;
          color: #fff;
          font-size: 0.6rem;
          padding: 4px 8px;
          border-radius: 999px;
          font-weight: 700;
        }

        /* Right Column */
        .header-bar {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 25px 40px;
          border: 1px solid var(--border-color);
          white-space: nowrap; 
          flex-wrap: nowrap;
        }

        .header-item .label {
          color: var(--text);
          font-size: 1.1rem;
          font-weight: 600;
        }
        .header-item .val {
          margin-left: 10px;
          font-weight: 400;
          color: var(--text-secondary);
        }

        .actions-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 24px;
        }

        .action-card {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          text-decoration: none;
          border: 1px solid rgba(255, 255, 255, 0.08);
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          transition: all 0.2s ease;
          position: relative;
          overflow: hidden;
          border-radius: 24px;
        }
        
        .action-card:hover {
          transform: translateY(-5px);
          border-color: #ecfdf5;
        }
        
        .action-card:hover .action-text {
          color: #059669;
        }
        
        .action-text {
          font-size: 1.3rem;
          font-weight: 600;
          color: var(--text);
          transition: color 0.2s ease;
        }

        .banner-card {
          height: 180px;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 2px solid var(--border-color);
          background: var(--bg-dark);
        }
        .banner-text {
          font-size: 1.2rem;
          color: var(--text-secondary);
        }

        /* Nutrition */
        .nutrition-card {
           padding: 25px 30px;
        }
        
        .nutrition-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }

        .nutri-btn {
           display: flex;
           flex-direction: column;
           align-items: center;
           text-align: center;
           text-decoration: none;
           padding: 20px 10px;
           background: rgba(255, 255, 255, 0.03);
           border: 1px solid rgba(255, 255, 255, 0.05);
           border-radius: 20px;
           transition: all 0.2s ease;
        }

        .nutri-btn:hover {
           transform: translateY(-3px);
           border-color: #ecfdf5;
        }

        .icon-box {
           width: 50px;
           height: 50px;
           border-radius: 16px;
           display: flex;
           align-items: center;
           justify-content: center;
           margin-bottom: 12px;
           transition: all 0.2s ease;
        }
        
        .nutri-btn span {
           font-size: 0.9rem;
           font-weight: 600;
           color: var(--text-secondary);
           line-height: 1.3;
        }
        .nutri-btn:hover span {
           color: var(--text);
        }`}
      </style>
    </div>
  );
}
