"use client";
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { getDashboardStats, getFoodsByPreference, getLowCalorieRecipes, getAssignedDiet } from '@/lib/api/user';
import RecipeDetailsModal from '@/app/components/User/RecipeDetailsModal';
import {
  Loader2,
  Database,
  Heart,
  HeartOff,
  Droplets,
  Leaf,
  WheatOff,
  Flame,
  Sprout,
  Activity,
  Check
} from 'lucide-react';
import FoodSearch from '@/components/FoodSearch';
import { apiPost } from '@/lib/api/client';

// Enhanced Dietary Preferences with Icons and Colors
const DIETARY_PREFERENCES = [
  { label: "Low Cholesterol", icon: Heart, color: "text-green-500", bg: "bg-green-500/10" },
  { label: "High Cholesterol", icon: HeartOff, color: "text-red-500", bg: "bg-red-500/10" },
  { label: "High Sodium", icon: Activity, color: "text-amber-500", bg: "bg-amber-500/10" },
  { label: "Low Sodium", icon: Droplets, color: "text-blue-500", bg: "bg-blue-500/10" },
  { label: "High Fiber", icon: Leaf, color: "text-emerald-500", bg: "bg-emerald-500/10" },
  { label: "Gluten Free", icon: WheatOff, color: "text-orange-500", bg: "bg-orange-500/10" },
  { label: "Keto Friendly", icon: Flame, color: "text-orange-600", bg: "bg-orange-600/10" },
  { label: "Vegan Options", icon: Sprout, color: "text-lime-500", bg: "bg-lime-500/10" }
];



const FoodCard = ({ item, onClick }) => (
  <motion.div
    whileHover={{ scale: 1.05, y: -5 }}
    onClick={() => onClick && onClick(item)}
    className="min-w-[160px] h-[200px] rounded-2xl p-4 flex flex-col gap-3 shadow-md border cursor-pointer hover:shadow-xl transition-all duration-300 food-card"
  >
    {/* Image Placeholder */}
    <div className="w-full h-[100px] rounded-xl animate-pulse flex items-center justify-center text-2xl border border-transparent img-placeholder">🥗</div>

    <div className="flex flex-col gap-1">
      <span className="text-amber-500 font-bold text-sm">
        {item.calories ? `${Math.round(item.calories)} Kcal` : '0 Kcal'}
      </span>
      <span className="text-sm font-semibold leading-tight card-name line-clamp-2">
        {item.description || item.name}
      </span>
    </div>
  </motion.div>
);

const Section = ({ title, items, loading, onItemClick, type = 'scroll' }) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Reset page when items change (e.g. switching preferences)
  useEffect(() => {
    setCurrentPage(1);
  }, [items]);

  // Pagination Logic
  const totalPages = Math.ceil(items.length / itemsPerPage);
  const displayItems = type === 'grid'
    ? items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)
    : items;

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(prev => prev + 1);
  };

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(prev => prev - 1);
  };

  return (
    <div className="w-full flex flex-col gap-4">
      <div className="flex justify-between items-end px-2">
        <div className="flex items-center gap-3">
          <h2 className="text-xl font-bold section-title">{title}</h2>
          {loading && <Loader2 className="w-5 h-5 animate-spin text-amber-500" />}
        </div>
        {/* View All only relevant if we are limiting items, but here we show all in grid or scroll */}
        {type === 'scroll' && <button className="text-amber-600 dark:text-amber-500 text-sm font-medium hover:underline">View All</button>}
      </div>

      {items.length === 0 && !loading ? (
        <div className="w-full py-10 text-center text-gray-400 font-medium italic bg-white/5 rounded-2xl border border-white/5">
          No food items found matching this preference.
        </div>
      ) : (
        <>
          {type === 'grid' ? (
            <div className="flex flex-col gap-6">
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 px-2">
                {displayItems.map((item, i) => (
                  <FoodCard key={i} item={item} onClick={onItemClick} />
                ))}
              </div>

              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center items-center gap-4">
                  <button
                    onClick={handlePrev}
                    disabled={currentPage === 1}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${currentPage === 1 ? 'opacity-50 cursor-not-allowed border-gray-600 text-gray-500' : 'border-amber-500 text-amber-500 hover:bg-amber-500/10'}`}
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-400">
                    Page <span className="text-amber-500 font-bold">{currentPage}</span> of {totalPages}
                  </span>
                  <button
                    onClick={handleNext}
                    disabled={currentPage === totalPages}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all border ${currentPage === totalPages ? 'opacity-50 cursor-not-allowed border-gray-600 text-gray-500' : 'border-amber-500 text-amber-500 hover:bg-amber-500/10'}`}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-6 px-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent">
              {items.map((item, i) => (
                <FoodCard key={i} item={item} onClick={onItemClick} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default function DietPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);
  const [selectedPreference, setSelectedPreference] = useState(null);
  const [preferenceFoods, setPreferenceFoods] = useState([]);
  const [prefLoading, setPrefLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [lowCalRecipes, setLowCalRecipes] = useState([]);
  const [lowCalLoading, setLowCalLoading] = useState(false);
  const [assignedPlan, setAssignedPlan] = useState([]);
  const [planLoading, setPlanLoading] = useState(true);

  const handleRecipeClick = (item) => {
    setSelectedRecipe(item);
    setIsModalOpen(true);
  };

  useEffect(() => {
    setMounted(true);
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch diet stats:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchLowCalRecipes = async () => {
      setLowCalLoading(true);
      try {
        const data = await getLowCalorieRecipes();
        setLowCalRecipes(data);
      } catch (error) {
        console.error("Failed to fetch low-calorie recipes:", {
          message: error.message,
          status: error.status,
          errors: error.errors,
          error: error
        });
      } finally {
        setLowCalLoading(false);
      }
    };

    const fetchAssignedPlan = async () => {
      try {
        const data = await getAssignedDiet();
        setAssignedPlan(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error("Failed to fetch assigned diet:", error);
      } finally {
        setPlanLoading(false);
      }
    };

    fetchStats();
    fetchLowCalRecipes();
    fetchAssignedPlan();
  }, []);

  const handlePreferenceClick = async (pref) => {
    if (selectedPreference === pref.label) {
      setSelectedPreference(null);
      setPreferenceFoods([]);
      return;
    }
    setSelectedPreference(pref.label);
    setPrefLoading(true);
    setPreferenceFoods([]);
    try {
      const data = await getFoodsByPreference(pref.label);
      setPreferenceFoods(data);
    } catch (error) {
      console.error("Failed to fetch preference foods:", error);
    } finally {
      setPrefLoading(false);
    }
  };

  if (!mounted) {
    return null;
  }

  if (loading) {
    return (
      <div className="w-full h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const userStats = {
    height: stats?.biometrics?.height || 180,
    weight: stats?.biometrics?.weight || 75,
    totalCalories: stats?.calories?.target || 2500,
    haveEaten: stats?.calories?.current || 0
  };

  return (
    <div className="w-full min-h-screen p-6 flex flex-col gap-8 pb-20 pt-8 transition-colors duration-300 page-container">

      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold page-title">Diet Plan</h1>
      </div>

      {/* Global Food Search Section */}
      <div className="w-full flex flex-col gap-4">
        <h2 className="text-xl font-bold section-title flex items-center gap-2">
          <Database className="w-6 h-6 text-amber-500" />
          Global Food Database
        </h2>
        <FoodSearch />
        <FoodSearch />
      </div>

      {/* Assigned Diet Plan Section */}
      {assignedPlan.length > 0 && (
        <div className="w-full border border-amber-500/30 bg-amber-500/5 rounded-3xl p-6">
          <h2 className="text-xl font-bold section-title flex items-center gap-2 mb-4">
            <Check className="w-6 h-6 text-amber-500" />
            My Assigned Diet Plan
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {assignedPlan.map((plan) => (
              <div key={plan.id} className="p-4 rounded-xl bg-slate-800/50 border border-amber-500/20 flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-white">{plan.foodName}</h3>
                  <span className="text-xs font-bold uppercase bg-amber-500 text-black px-2 py-1 rounded-md">{plan.timingFood}</span>
                </div>
                <p className="text-sm text-gray-300">{plan.description}</p>
                <span className="text-xs text-gray-500 mt-2">Assigned by Trainer</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 1. Top Stats Card */}
      <div className="w-full border rounded-3xl p-6 flex flex-col md:flex-row gap-6 shadow-lg shadow-gray-200/50 dark:shadow-none transition-all duration-300 stats-card">

        {/* Left: User Stats */}
        <div className="flex-1 flex flex-col justify-center gap-4 pr-6 stats-left">
          <div className="grid grid-cols-2 gap-y-6 gap-x-8">
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-bold label">Height</span>
              <span className="text-xl font-bold font-mono val">{userStats.height} cm</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-bold label">Weight</span>
              <span className="text-xl font-bold font-mono val">{userStats.weight} kg</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-bold label">Total Calories</span>
              <span className="text-xl font-bold font-mono val">{userStats.totalCalories} kcal</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs uppercase tracking-wider font-bold label">Have Eaten</span>
              <span className="text-amber-500 text-xl font-bold font-mono">{userStats.haveEaten} kcal</span>
            </div>
          </div>
        </div>

        {/* Right: Modern Dietary Chips */}
        <div className="flex-[1.5] flex flex-col gap-3">
          <span className="text-xs uppercase tracking-wider font-bold label">Dietary Preferences</span>
          <div className="flex flex-wrap gap-2">
            {DIETARY_PREFERENCES.map((pref, i) => (
              <motion.div
                key={i}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => handlePreferenceClick(pref)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer pref-chip ${pref.bg} ${selectedPreference === pref.label
                  ? "ring-2 ring-amber-500 border-amber-500 shadow-lg shadow-amber-500/20"
                  : "border-transparent"
                  }`}
              >
                <pref.icon className={`w-3.5 h-3.5 ${pref.color}`} />
                <span className="text-xs font-bold whitespace-nowrap">{pref.label}</span>
                {selectedPreference === pref.label && <Check className="w-3 h-3 text-amber-500" />}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Dynamic Preference Results */}
      {selectedPreference && (
        <Section
          title={`Recommended for ${selectedPreference}`}
          items={preferenceFoods}
          loading={prefLoading}
          onItemClick={handleRecipeClick}
          type="grid"
        />
      )}

      {/* 3. Low-Calories Recipes */}
      <Section title="Low-Calories Recipes" items={lowCalRecipes} loading={lowCalLoading} onItemClick={handleRecipeClick} />

      {/* Recipe Modal */}
      <RecipeDetailsModal
        recipe={selectedRecipe}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <style jsx>{`
        .page-container {
          /* background removed to show global layout background */
          color: var(--text);
        }
        
        .page-title, .section-title {
          color: var(--text);
        }

        .stats-card {
          background: rgba(30, 41, 59, 0.4);
          backdrop-filter: blur(12px);
          border-color: rgba(255, 255, 255, 0.08);
        }
        
        .stats-left {
          border-right: 1px solid var(--border-color);
        }
        @media (max-width: 768px) {
           .stats-left { border-right: none; border-bottom: 1px solid var(--border-color); padding-bottom: 20px; padding-right: 0;}
        }

        .label {
          color: var(--text-secondary);
        }
        .val {
          color: var(--text);
        }

        .pref-chip {
           color: var(--text);
           border: 1px solid rgba(255, 255, 255, 0.05);
           box-shadow: 0 2px 4px rgba(0,0,0,0.1);
         }
        .pref-chip:hover {
          border-color: rgba(255, 255, 255, 0.2);
          transform: translateY(-1px);
        }

        .food-card {
            background: rgba(30, 41, 59, 0.4);
            backdrop-filter: blur(12px);
            border-color: rgba(255, 255, 255, 0.08);
         }
        .food-card:hover {
           border-color: #fcd34d;
        }

        .img-placeholder {
           background: rgba(255, 255, 255, 0.03);
           color: var(--text);
        }
        
        .card-name {
           color: var(--text);
        }

      `}</style>
    </div>
  );
}
