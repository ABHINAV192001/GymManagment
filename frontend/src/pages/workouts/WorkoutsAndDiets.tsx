import React, { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Dumbbell, Apple, Plus, Trash, Check, Sparkles, Calculator } from 'lucide-react';
import { Exercise, FoodItem } from '../../types';

export const MOCK_FOODS: FoodItem[] = [
  { id: 'f1', name: 'Oats (100g)', protein: 13, carbs: 68, fats: 7, calories: 389 },
  { id: 'f2', name: 'Chicken Breast (100g)', protein: 31, carbs: 0, fats: 3.6, calories: 165 },
  { id: 'f3', name: 'Boiled Egg (1 large)', protein: 6, carbs: 0.6, fats: 5, calories: 78 },
  { id: 'f4', name: 'Brown Rice (100g cooked)', protein: 2.6, carbs: 23, fats: 0.9, calories: 112 },
  { id: 'f5', name: 'Almonds (30g)', protein: 6, carbs: 6, fats: 14, calories: 164 },
  { id: 'f6', name: 'Whey Protein (1 scoop)', protein: 24, carbs: 3, fats: 1.5, calories: 120 },
  { id: 'f7', name: 'Paneer (100g)', protein: 18, carbs: 1.2, fats: 20, calories: 265 },
];

export const MOCK_EXERCISES: Exercise[] = [
  { id: 'e1', name: 'Barbell Squats', muscleGroup: 'LEGS', mechanics: 'COMPOUND' },
  { id: 'e2', name: 'Bench Press', muscleGroup: 'CHEST', mechanics: 'COMPOUND' },
  { id: 'e3', name: 'Deadlift', muscleGroup: 'BACK', mechanics: 'COMPOUND' },
  { id: 'e4', name: 'Overhead Press', muscleGroup: 'SHOULDERS', mechanics: 'COMPOUND' },
  { id: 'e5', name: 'Bicep Curls', muscleGroup: 'ARMS', mechanics: 'ISOLATION' },
  { id: 'e6', name: 'Tricep Pushdown', muscleGroup: 'ARMS', mechanics: 'ISOLATION' },
  { id: 'e7', name: 'Leg Extension', muscleGroup: 'LEGS', mechanics: 'ISOLATION' },
];

export const WorkoutsAndDiets: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ triggerAnnouncement: (msg: string) => void }>();
  // Workout Builder state
  const [workoutName, setWorkoutName] = useState('My Muscle Growth Routine');
  const [workoutExercises, setWorkoutExercises] = useState<{ exerciseId: string; sets: number; reps: string }[]>([
    { exerciseId: 'ex-1', sets: 4, reps: '10' },
    { exerciseId: 'ex-3', sets: 4, reps: '12' },
  ]);
  const [selectedExToAdd, setSelectedExToAdd] = useState('ex-2');
  const [addSets, setAddSets] = useState('4');
  const [addReps, setAddReps] = useState('8-12');

  // Diet / Macro Calculator state
  const [dietName, setDietName] = useState('My High-Protein Cutting Meal');
  const [dietFoods, setDietFoods] = useState<{ foodId: string; quantityG: number }[]>([
    { foodId: 'fd-1', quantityG: 200 }, // 200g chicken
    { foodId: 'fd-2', quantityG: 150 }, // 150g rice
  ]);
  const [selectedFoodToAdd, setSelectedFoodToAdd] = useState('fd-5'); // whey
  const [addGrams, setAddGrams] = useState('30');

  // Calculate total macros from current diet list
  const calculateTotalMacros = () => {
    let calories = 0;
    let protein = 0;
    let carbs = 0;
    let fat = 0;

    dietFoods.forEach((item) => {
      const food = MOCK_FOODS.find(f => f.id === item.foodId);
      if (!food) return;

      const factor = item.quantityG / 100;
      calories += food.caloriesPer100g * factor;
      protein += food.proteinPer100g * factor;
      carbs += food.carbsPer100g * factor;
      fat += food.fatPer100g * factor;
    });

    return {
      calories: Math.round(calories),
      protein: Math.round(protein),
      carbs: Math.round(carbs),
      fat: Math.round(fat),
    };
  };

  const handleAddExercise = (e: React.FormEvent) => {
    e.preventDefault();
    setWorkoutExercises([
      ...workoutExercises,
      { exerciseId: selectedExToAdd, sets: Number(addSets), reps: addReps }
    ]);
    const name = MOCK_EXERCISES.find(ex => ex.id === selectedExToAdd)?.name || 'Exercise';
    triggerAnnouncement(`Added ${name} to your custom split draft.`);
  };

  const handleAddFood = (e: React.FormEvent) => {
    e.preventDefault();
    setDietFoods([
      ...dietFoods,
      { foodId: selectedFoodToAdd, quantityG: Number(addGrams) }
    ]);
    const name = MOCK_FOODS.find(f => f.id === selectedFoodToAdd)?.name || 'Food';
    triggerAnnouncement(`Added ${addGrams}g of ${name} to macro meal draft.`);
  };

  const macros = calculateTotalMacros();

  return (
    <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
      {/* Block 1: Workout split builder */}
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Dumbbell className="w-5 h-5 text-blue-500" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Hypertrophy Split Builder</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Routine Name</label>
              <input
                type="text"
                value={workoutName}
                onChange={(e) => setWorkoutName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>

            {/* List draft exercises */}
            <div className="space-y-2">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase">Custom exercises split</span>
              <div className="space-y-2">
                {workoutExercises.map((we, i) => {
                  const ex = MOCK_EXERCISES.find(e => e.id === we.exerciseId);
                  return (
                    <div key={i} className="p-3 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 flex justify-between items-center text-xs">
                      <div>
                        <h4 className="font-bold text-zinc-900 dark:text-zinc-100">{ex?.name}</h4>
                        <p className="text-[10px] text-zinc-400 mt-0.5">Target: {ex?.muscleGroup} | Gear: {ex?.equipment}</p>
                      </div>
                      <div className="text-right">
                        <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{we.sets} sets x {we.reps} reps</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>

        {/* Add exercise sub-form */}
        <form onSubmit={handleAddExercise} className="mt-6 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3 text-xs">
          <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"><Plus className="w-4 h-4 text-blue-500" /> Insert Workout Exercise</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-1">
              <label className="block text-[10px] text-zinc-400 mb-1">Sets</label>
              <input
                type="number"
                value={addSets}
                onChange={(e) => setAddSets(e.target.value)}
                className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 text-center font-mono"
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] text-zinc-400 mb-1">Reps</label>
              <input
                type="text"
                value={addReps}
                onChange={(e) => setAddReps(e.target.value)}
                className="w-full px-2 py-1 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 text-center font-mono"
              />
            </div>
            <div className="col-span-1 flex items-end">
              <button type="submit" className="w-full py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-md">
                Add
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 mb-1">Select Movement</label>
            <select
              value={selectedExToAdd}
              onChange={(e) => setSelectedExToAdd(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 font-bold"
            >
              {MOCK_EXERCISES.map(ex => (
                <option key={ex.id} value={ex.id}>{ex.name} ({ex.muscleGroup})</option>
              ))}
            </select>
          </div>
        </form>
      </div>

      {/* Block 2: Live Macro Diet Planner */}
      <div className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex flex-col justify-between">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Apple className="w-5 h-5 text-emerald-500" />
            <h3 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Dynamic Nutrition Macro Meter</h3>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-[10px] font-bold text-zinc-400 uppercase mb-1">Meal Title</label>
              <input
                type="text"
                value={dietName}
                onChange={(e) => setDietName(e.target.value)}
                className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 text-xs"
              />
            </div>

            {/* Food items current list */}
            <div className="space-y-2 text-xs">
              <span className="block text-[10px] font-bold text-zinc-400 uppercase">Selected Plate Foods</span>
              <div className="space-y-1.5">
                {dietFoods.map((df, i) => {
                  const food = MOCK_FOODS.find(f => f.id === df.foodId);
                  return (
                    <div key={i} className="flex justify-between items-center py-1.5 border-b border-zinc-100 dark:border-zinc-900">
                      <div>
                        <span className="font-bold text-zinc-800 dark:text-zinc-200">{food?.name}</span>
                        <span className="text-[10px] text-zinc-400 ml-1">({df.quantityG}g portion)</span>
                      </div>
                      <span className="font-mono text-zinc-500">
                        P: {Math.round((food?.proteinPer100g || 0) * (df.quantityG / 100))}g | C: {Math.round((food?.carbsPer100g || 0) * (df.quantityG / 100))}g
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Realtime calculated target meter */}
            <div className="p-4 rounded-xl bg-emerald-50/50 dark:bg-emerald-950/15 border border-emerald-100 dark:border-emerald-900/30">
              <div className="flex justify-between items-center mb-3">
                <span className="font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-1">
                  <Calculator className="w-4 h-4" /> Live Macro Calculators
                </span>
                <span className="font-mono font-extrabold text-sm text-emerald-900 dark:text-emerald-400">{macros.calories} kcal</span>
              </div>
              <div className="grid grid-cols-3 gap-2 text-center text-[10px] font-mono font-bold text-zinc-500">
                <div className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                  <span className="block text-emerald-600 dark:text-emerald-400">{macros.protein}g</span>
                  <span className="text-[9px]">Protein</span>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                  <span className="block text-blue-600 dark:text-blue-400">{macros.carbs}g</span>
                  <span className="text-[9px]">Carbs</span>
                </div>
                <div className="p-2 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded">
                  <span className="block text-amber-600 dark:text-amber-400">{macros.fat}g</span>
                  <span className="text-[9px]">Fat</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Add food item selector */}
        <form onSubmit={handleAddFood} className="mt-6 p-4 rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-3 text-xs">
          <h4 className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"><Plus className="w-4 h-4 text-emerald-500" /> Insert Food Item Portion</h4>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2">
              <label className="block text-[10px] text-zinc-400 mb-1 font-semibold">Grams / Weight Portions</label>
              <input
                type="number"
                required
                value={addGrams}
                onChange={(e) => setAddGrams(e.target.value)}
                className="w-full px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 font-mono"
              />
            </div>
            <div className="col-span-1 flex items-end">
              <button type="submit" className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-md shadow">
                Add Portions
              </button>
            </div>
          </div>
          <div>
            <label className="block text-[10px] text-zinc-400 mb-1 font-semibold">Select Raw Material</label>
            <select
              value={selectedFoodToAdd}
              onChange={(e) => setSelectedFoodToAdd(e.target.value)}
              className="w-full px-2.5 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 rounded-md text-zinc-900 dark:text-zinc-100 font-bold"
            >
              {MOCK_FOODS.map(f => (
                <option key={f.id} value={f.id}>{f.name}</option>
              ))}
            </select>
          </div>
        </form>
      </div>
    </div>
  );
};
