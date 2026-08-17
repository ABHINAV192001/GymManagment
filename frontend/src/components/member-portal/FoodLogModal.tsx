import React, { useState, useEffect, useMemo } from 'react';
import {
  Utensils,
  X,
  Search,
  Check,
  Loader2,
  Calendar,
  Flame,
  PieChart as PieIcon,
  Sparkles,
  Droplets,
  Clock,
  ChevronRight,
  Plus,
  Minus,
  Apple,
  Coffee,
  Sun,
  Moon,
  Cookie,
  Layers,
  Info,
  Trash2,
  Eye,
  ListChecks,
  History
} from 'lucide-react';
import { searchFoodsList, getAllFoodsList, filterFoodsList } from '../../lib/api/user';

// Preset standard portion options with their equivalent weight in grams
export interface ServingUnitOption {
  id: string;
  label: string;
  unitName: string;
  grams: number;
  isGrams: boolean;
  description: string;
}

export const SERVING_UNITS: ServingUnitOption[] = [
  { id: 'grams', label: 'Grams (g)', unitName: 'g', grams: 1, isGrams: true, description: 'Direct exact weight in grams' },
  { id: 'cup', label: '1 Cup (240g)', unitName: 'cup', grams: 240, isGrams: false, description: 'Standard measuring cup' },
  { id: 'tbsp', label: '1 Tablespoon (15g)', unitName: 'tbsp', grams: 15, isGrams: false, description: 'Standard tablespoon' },
  { id: 'tsp', label: '1 Teaspoon (5g)', unitName: 'tsp', grams: 5, isGrams: false, description: 'Small tea spoon' },
  { id: 'small_bowl', label: 'Small Bowl (150g)', unitName: 'bowl', grams: 150, isGrams: false, description: 'Side portion bowl' },
  { id: 'medium_bowl', label: 'Medium Bowl (250g)', unitName: 'bowl', grams: 250, isGrams: false, description: 'Regular main meal bowl' },
  { id: 'large_bowl', label: 'Large Bowl (400g)', unitName: 'bowl', grams: 400, isGrams: false, description: 'Athlete / bulk serving' },
  { id: 'piece', label: '1 Whole / Piece (120g)', unitName: 'item', grams: 120, isGrams: false, description: 'Average single fruit or item' },
];

export interface FoodItemRecord {
  id: string | number;
  foodName?: string;
  name?: string;
  category?: string;
  foodCategory?: string;
  calories: number;
  protein: number;
  carbohydrates?: number;
  carbs?: number;
  fat: number;
  fiber?: number;
  magnesium?: number;
  calcium?: number;
  sodium?: number;
  potassium?: number;
  vitaminC?: number;
  isRecipe?: boolean;
}

// Rich fallback food catalog to guarantee instant offline search response
export const DEFAULT_FOOD_CATALOG: FoodItemRecord[] = [
  {
    id: '00000000-0000-0000-0000-000000000015',
    foodName: 'Fresh Red Delicious Apple',
    category: 'Fruits',
    calories: 52,
    protein: 0.3,
    carbohydrates: 13.8,
    fat: 0.2,
    fiber: 2.4,
    potassium: 107,
    vitaminC: 4.6,
    calcium: 6,
    magnesium: 5
  },
  {
    id: '00000000-0000-0000-0000-000000000001',
    foodName: 'Grilled Skinless Chicken Breast',
    category: 'Poultry & Meat',
    calories: 165,
    protein: 31.0,
    carbohydrates: 0.0,
    fat: 3.6,
    fiber: 0.0,
    sodium: 74,
    potassium: 256,
    magnesium: 29
  },
  {
    id: '00000000-0000-0000-0000-000000000002',
    foodName: 'Plain Greek Yogurt (0% Fat)',
    category: 'Dairy & Eggs',
    calories: 59,
    protein: 10.0,
    carbohydrates: 3.6,
    fat: 0.4,
    fiber: 0.0,
    calcium: 110,
    potassium: 141
  },
  {
    id: '00000000-0000-0000-0000-000000000003',
    foodName: 'Rolled Whole Oats',
    category: 'Grains & Cereals',
    calories: 389,
    protein: 16.9,
    carbohydrates: 66.3,
    fat: 6.9,
    fiber: 10.6,
    magnesium: 177,
    potassium: 429
  },
  {
    id: '00000000-0000-0000-0000-000000000004',
    foodName: 'Boiled Whole Large Egg',
    category: 'Dairy & Eggs',
    calories: 155,
    protein: 12.6,
    carbohydrates: 1.1,
    fat: 10.6,
    fiber: 0.0,
    sodium: 124,
    calcium: 50
  },
  {
    id: '00000000-0000-0000-0000-000000000005',
    foodName: 'Pan-Seared Atlantic Salmon Fillet',
    category: 'Seafood',
    calories: 208,
    protein: 20.4,
    carbohydrates: 0.0,
    fat: 13.4,
    fiber: 0.0,
    potassium: 363,
    magnesium: 27
  },
  {
    id: '00000000-0000-0000-0000-000000000006',
    foodName: 'Steamed Brown Rice (Cooked)',
    category: 'Grains & Cereals',
    calories: 123,
    protein: 2.7,
    carbohydrates: 25.6,
    fat: 1.0,
    fiber: 1.8,
    magnesium: 43,
    potassium: 86
  },
  {
    id: '00000000-0000-0000-0000-000000000007',
    foodName: 'Whey Protein Isolate 90%',
    category: 'Supplements',
    calories: 370,
    protein: 85.0,
    carbohydrates: 2.0,
    fat: 1.5,
    fiber: 0.0,
    calcium: 450,
    potassium: 420
  },
  {
    id: '00000000-0000-0000-0000-000000000008',
    foodName: 'Baked Sweet Potato (Skin on)',
    category: 'Vegetables',
    calories: 90,
    protein: 2.0,
    carbohydrates: 20.7,
    fat: 0.2,
    fiber: 3.3,
    potassium: 475,
    vitaminC: 19.6
  },
  {
    id: '00000000-0000-0000-0000-000000000009',
    foodName: 'Raw Whole California Almonds',
    category: 'Nuts & Seeds',
    calories: 579,
    protein: 21.2,
    carbohydrates: 21.6,
    fat: 49.9,
    fiber: 12.5,
    magnesium: 270,
    calcium: 269
  },
  {
    id: '00000000-0000-0000-0000-000000000010',
    foodName: 'Fresh Ripe Cavendish Banana',
    category: 'Fruits',
    calories: 89,
    protein: 1.1,
    carbohydrates: 22.8,
    fat: 0.3,
    fiber: 2.6,
    potassium: 358,
    vitaminC: 8.7
  },
  {
    id: '00000000-0000-0000-0000-000000000011',
    foodName: 'Firm Organic Tofu',
    category: 'Plant Protein',
    calories: 144,
    protein: 17.3,
    carbohydrates: 2.8,
    fat: 8.7,
    fiber: 2.3,
    calcium: 683,
    magnesium: 58
  },
  {
    id: '00000000-0000-0000-0000-000000000012',
    foodName: 'Lean Beef Sirloin Steak (Cooked)',
    category: 'Poultry & Meat',
    calories: 244,
    protein: 30.1,
    carbohydrates: 0.0,
    fat: 12.7,
    fiber: 0.0,
    potassium: 355,
    magnesium: 25
  },
  {
    id: '00000000-0000-0000-0000-000000000013',
    foodName: 'Fresh Hass Avocado',
    category: 'Fruits',
    calories: 160,
    protein: 2.0,
    carbohydrates: 8.5,
    fat: 14.7,
    fiber: 6.7,
    potassium: 485,
    magnesium: 29
  },
  {
    id: '00000000-0000-0000-0000-000000000014',
    foodName: 'Fresh Baby Spinach Leaves',
    category: 'Vegetables',
    calories: 23,
    protein: 2.9,
    carbohydrates: 3.6,
    fat: 0.4,
    fiber: 2.2,
    magnesium: 79,
    calcium: 99,
    potassium: 558
  }
];

export type ModalTab = 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner' | 'Fasting' | 'Water';

export interface LoggedFoodPayload {
  foodId: string | number;
  foodName: string;
  quantity: number;
  mealType: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  servingUnit?: string;
  customGrams?: number;
  date?: string;
}

export interface FoodLogEntry {
  id: string;
  foodName: string;
  mealType: string;
  portionName?: string;
  customGrams?: number;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  time?: string;
}

export interface FoodLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogFoodItem: (payload: LoggedFoodPayload) => Promise<void>;
  onOpenWaterModal: () => void;
  initialMealType?: ModalTab;
  currentWaterLiters?: number;
  targetWaterLiters?: number;
  isLogging?: boolean;
  foodLogs?: FoodLogEntry[];
  onDeleteFoodLog?: (id: string, foodName: string) => void;
}

export const FoodLogModal: React.FC<FoodLogModalProps> = ({
  isOpen,
  onClose,
  onLogFoodItem,
  onOpenWaterModal,
  initialMealType = 'Breakfast',
  currentWaterLiters = 0,
  targetWaterLiters = 3.5,
  isLogging = false,
  foodLogs = [],
  onDeleteFoodLog
}) => {
  // Navigation & Category Tab state
  const [activeTab, setActiveTab] = useState<ModalTab>(initialMealType || 'Breakfast');
  const [modalViewMode, setModalViewMode] = useState<'log' | 'eaten'>('log');
  const [eatenMealFilter, setEatenMealFilter] = useState<'All' | 'Breakfast' | 'Lunch' | 'Snacks' | 'Dinner'>('All');
  
  // Date state: defaults to today (YYYY-MM-DD)
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);
  const [logDate, setLogDate] = useState<string>(todayStr);

  // Sync initialMealType & reset date to today when opened
  useEffect(() => {
    if (isOpen) {
      if (initialMealType) setActiveTab(initialMealType);
      setLogDate(new Date().toISOString().split('T')[0]);
    }
  }, [isOpen, initialMealType]);

  // Filtered eaten food logs
  const filteredEatenLogs = useMemo(() => {
    if (!foodLogs || foodLogs.length === 0) return [];
    if (eatenMealFilter === 'All') return foodLogs;
    return foodLogs.filter(f => (f.mealType || '').toLowerCase() === eatenMealFilter.toLowerCase());
  }, [foodLogs, eatenMealFilter]);

  // Total eaten calories & macros across selected filter
  const totalEatenCalories = useMemo(() => {
    return filteredEatenLogs.reduce((sum, item) => sum + (item.calories || 0), 0);
  }, [filteredEatenLogs]);

  const totalEatenProtein = useMemo(() => {
    return parseFloat(filteredEatenLogs.reduce((sum, item) => sum + (item.protein || 0), 0).toFixed(1));
  }, [filteredEatenLogs]);

  const totalEatenCarbs = useMemo(() => {
    return parseFloat(filteredEatenLogs.reduce((sum, item) => sum + (item.carbs || 0), 0).toFixed(1));
  }, [filteredEatenLogs]);

  const totalEatenFat = useMemo(() => {
    return parseFloat(filteredEatenLogs.reduce((sum, item) => sum + (item.fat || 0), 0).toFixed(1));
  }, [filteredEatenLogs]);

  // Count of items eaten for the currently active tab
  const currentTabEatenItems = useMemo(() => {
    if (!foodLogs) return [];
    return foodLogs.filter(f => (f.mealType || '').toLowerCase() === activeTab.toLowerCase());
  }, [foodLogs, activeTab]);

  const currentTabEatenCalories = useMemo(() => {
    return currentTabEatenItems.reduce((sum, item) => sum + (item.calories || 0), 0);
  }, [currentTabEatenItems]);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [availableFoods, setAvailableFoods] = useState<FoodItemRecord[]>(DEFAULT_FOOD_CATALOG);
  const [isSearching, setIsSearching] = useState<boolean>(false);

  // Food Selection & Serving Scale state
  const [selectedFood, setSelectedFood] = useState<FoodItemRecord | null>(DEFAULT_FOOD_CATALOG[0]);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('grams');
  const [enteredQuantity, setEnteredQuantity] = useState<string>('100');

  // Fasting tab state
  const [fastingProtocol, setFastingProtocol] = useState<'16_8' | '18_6' | '20_4' | '24_0'>('16_8');
  const [isFastingActive, setIsFastingActive] = useState<boolean>(true);
  const [fastingHoursElapsed, setFastingHoursElapsed] = useState<number>(14.5);

  // Load foods from backend API
  const loadFoods = async (query?: string, category?: string) => {
    setIsSearching(true);
    try {
      const activeCategory = category !== undefined ? category : selectedCategoryFilter;
      const catParam = activeCategory && activeCategory !== 'All' ? activeCategory : undefined;
      const cleanQuery = query !== undefined ? query.trim() : searchQuery.trim();

      const res = await filterFoodsList({
        query: cleanQuery || undefined,
        name: cleanQuery || undefined,
        category: catParam,
        size: 50
      });
      const list = res?.data || res || [];
      if (Array.isArray(list) && list.length > 0) {
        const normalized = list.map((item: any) => ({
          ...item,
          foodName: item.foodName || item.description || item.name || 'Food Item',
          category: item.foodCategory || item.category || 'General',
          carbohydrates: item.carbohydrates ?? item.carbs ?? 0,
        }));
        setAvailableFoods(normalized);
        if (!selectedFood && normalized.length > 0) {
          setSelectedFood(normalized[0]);
        }
        return;
      }
      
      // Fallback local filter
      if (cleanQuery) {
        const q = cleanQuery.toLowerCase();
        const filtered = DEFAULT_FOOD_CATALOG.filter(f =>
          (f.foodName || f.name || '').toLowerCase().includes(q) ||
          (f.category || '').toLowerCase().includes(q)
        );
        setAvailableFoods(filtered);
      } else {
        setAvailableFoods(DEFAULT_FOOD_CATALOG);
      }
    } catch (err) {
      console.warn('Using local food database fallback', err);
      setAvailableFoods(DEFAULT_FOOD_CATALOG);
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFoods();
      if (!selectedFood && DEFAULT_FOOD_CATALOG.length > 0) {
        setSelectedFood(DEFAULT_FOOD_CATALOG[0]);
      }
    }
  }, [isOpen]);

  // Selected Unit metadata
  const currentServingUnit = useMemo(() => {
    return SERVING_UNITS.find(u => u.id === selectedUnitId) || SERVING_UNITS[0];
  }, [selectedUnitId]);

  // Unit Change handler (switches between direct grams and standard portion units smoothly)
  const handleUnitChange = (newUnitId: string) => {
    const nextUnit = SERVING_UNITS.find(u => u.id === newUnitId) || SERVING_UNITS[0];
    setSelectedUnitId(newUnitId);
    if (nextUnit.isGrams) {
      // Switching to grams: prefill with current calculated weight or default 100
      const currentG = totalGrams > 0 ? totalGrams : 100;
      setEnteredQuantity(String(Math.round(currentG)));
    } else {
      // Switching to standard portion (cup, tbsp, bowl): default to 1
      setEnteredQuantity('1');
    }
  };

  // Calculated total weight in grams (unrestricted: e.g. 65g, 69g, 75g, 79g, 295g, 395g)
  const totalGrams = useMemo(() => {
    const num = parseFloat(enteredQuantity);
    if (isNaN(num) || num <= 0) return 0;
    if (currentServingUnit.isGrams) {
      return parseFloat(num.toFixed(1));
    }
    return parseFloat((num * currentServingUnit.grams).toFixed(1));
  }, [currentServingUnit, enteredQuantity]);

  // Dynamic scaled nutritional breakdown based on grams (base database values are per 100g)
  const scaledNutrients = useMemo(() => {
    if (!selectedFood || totalGrams <= 0) {
      return {
        calories: 0,
        protein: 0,
        carbs: 0,
        fat: 0,
        fiber: 0,
        sodium: 0,
        potassium: 0,
        calcium: 0,
        magnesium: 0
      };
    }

    const scaleFactor = totalGrams / 100;
    const carbsVal = selectedFood.carbohydrates ?? selectedFood.carbs ?? 0;
    const proteinVal = selectedFood.protein ?? 0;
    const fatVal = selectedFood.fat ?? 0;
    const fiberVal = selectedFood.fiber ?? 0;
    const caloriesVal = selectedFood.calories ?? (proteinVal * 4 + carbsVal * 4 + fatVal * 9);

    return {
      calories: Math.round(caloriesVal * scaleFactor),
      protein: parseFloat((proteinVal * scaleFactor).toFixed(1)),
      carbs: parseFloat((carbsVal * scaleFactor).toFixed(1)),
      fat: parseFloat((fatVal * scaleFactor).toFixed(1)),
      fiber: parseFloat((fiberVal * scaleFactor).toFixed(1)),
      sodium: Math.round((selectedFood.sodium ?? 0) * scaleFactor),
      potassium: Math.round((selectedFood.potassium ?? 0) * scaleFactor),
      calcium: Math.round((selectedFood.calcium ?? 0) * scaleFactor),
      magnesium: Math.round((selectedFood.magnesium ?? 0) * scaleFactor)
    };
  }, [selectedFood, totalGrams]);

  // Macro calorie percentages for Pie / Donut Chart
  const macroPercentages = useMemo(() => {
    const proteinKcal = scaledNutrients.protein * 4;
    const carbsKcal = scaledNutrients.carbs * 4;
    const fatKcal = scaledNutrients.fat * 9;
    const totalMacroKcal = proteinKcal + carbsKcal + fatKcal;

    if (totalMacroKcal <= 0) {
      return { proteinPct: 33, carbsPct: 33, fatPct: 34, totalMacroKcal: 0 };
    }

    return {
      proteinPct: Math.round((proteinKcal / totalMacroKcal) * 100),
      carbsPct: Math.round((carbsKcal / totalMacroKcal) * 100),
      fatPct: Math.round((fatKcal / totalMacroKcal) * 100),
      totalMacroKcal: Math.round(totalMacroKcal)
    };
  }, [scaledNutrients]);

  // Filtered food list by search and category
  const filteredFoods = useMemo(() => {
    return availableFoods.filter(item => {
      const name = (item.foodName || item.name || '').toLowerCase();
      const cat = (item.category || item.foodCategory || '').toLowerCase();
      const matchesSearch = !searchQuery || name.includes(searchQuery.toLowerCase()) || cat.includes(searchQuery.toLowerCase());

      if (!matchesSearch) return false;

      if (selectedCategoryFilter === 'All') return true;
      if (selectedCategoryFilter === 'High Protein') return (item.protein || 0) >= 15;
      if (selectedCategoryFilter === 'Low Carb') return (item.carbohydrates || item.carbs || 0) <= 5;
      if (selectedCategoryFilter === 'Keto') return (item.fat || 0) >= 10 && (item.carbohydrates || item.carbs || 0) <= 5;
      if (selectedCategoryFilter === 'Vegetarian') return !cat.includes('meat') && !cat.includes('poultry') && !cat.includes('seafood');
      if (selectedCategoryFilter === 'Recipes') return Boolean(item.isRecipe || cat.includes('recipe'));

      return true;
    });
  }, [availableFoods, searchQuery, selectedCategoryFilter]);

  if (!isOpen) return null;

  const handleLogFood = async () => {
    if (!selectedFood) return;
    const mealCategory = activeTab; // Breakfast, Lunch, Snacks, Dinner
    const quantityServings = totalGrams > 0 ? parseFloat((totalGrams / 100).toFixed(4)) : 1.0;
    const foodName = selectedFood.foodName || selectedFood.name || (selectedFood as any)?.title || 'Food Item';
    const dateStr = logDate || new Date().toISOString().split('T')[0];

    await onLogFoodItem({
      foodId: selectedFood.id,
      foodName: foodName,
      quantity: quantityServings,
      mealType: mealCategory,
      calories: scaledNutrients.calories,
      protein: scaledNutrients.protein,
      carbs: scaledNutrients.carbs,
      fat: scaledNutrients.fat,
      fiber: scaledNutrients.fiber,
      servingUnit: currentServingUnit.isGrams ? `${totalGrams}g` : `${enteredQuantity} ${currentServingUnit.label}`,
      customGrams: totalGrams,
      date: dateStr
    });
  };

  const getTabIcon = (tab: ModalTab) => {
    switch (tab) {
      case 'Breakfast': return <Coffee className="w-4 h-4" />;
      case 'Lunch': return <Sun className="w-4 h-4" />;
      case 'Snacks': return <Cookie className="w-4 h-4" />;
      case 'Dinner': return <Moon className="w-4 h-4" />;
      case 'Fasting': return <Clock className="w-4 h-4" />;
      case 'Water': return <Droplets className="w-4 h-4 text-cyan-400" />;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-3 sm:p-5 animate-in fade-in duration-200"
      onClick={onClose}
    >
      {/* Rectangular / A4 Landscape Container (zero overall scrollbar) */}
      <div
        className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl shadow-2xl max-w-5xl w-full overflow-hidden flex flex-col justify-between"
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: '92vh' }}
      >
        {/* ── TOP NAVIGATION HEADER & CATEGORY TABS ───────────────────────── */}
        <div className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-950/60 p-4 sm:px-6">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-inner">
                <Utensils className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  Log Food & Daily Nutrition
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">
                  Select meal category, portion size, and track live macro splits with precision.
                </p>
              </div>
            </div>

            {/* Mode Switcher + Date Chips */}
            <div className="flex items-center gap-2 flex-wrap">
              
              {/* [ ➕ Log Food ] vs [ 🍽️ Eaten Foods (N) ] Mode Switcher */}
              <div className="flex items-center p-1 bg-zinc-200/80 dark:bg-zinc-800/90 rounded-2xl border border-zinc-300 dark:border-zinc-700/80 text-xs font-bold shadow-inner">
                <button
                  type="button"
                  onClick={() => setModalViewMode('log')}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    modalViewMode === 'log'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-extrabold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Log Food</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setModalViewMode('eaten');
                    if (['Breakfast', 'Lunch', 'Snacks', 'Dinner'].includes(activeTab)) {
                      setEatenMealFilter(activeTab as any);
                    } else {
                      setEatenMealFilter('All');
                    }
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
                    modalViewMode === 'eaten'
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 font-extrabold'
                      : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100'
                  }`}
                >
                  <Utensils className="w-3.5 h-3.5" />
                  <span>Eaten Foods</span>
                  {foodLogs && foodLogs.length > 0 && (
                    <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-black ${
                      modalViewMode === 'eaten'
                        ? 'bg-white text-emerald-700'
                        : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      {foodLogs.length}
                    </span>
                  )}
                </button>
              </div>

              {/* Interactive Date Picker Section (Defaults to Today) */}
              <div className="flex items-center gap-1.5 bg-zinc-100 dark:bg-zinc-800/80 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-700/60 text-xs font-semibold shadow-inner">
                <Calendar className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <input
                  type="date"
                  value={logDate}
                  onChange={(e) => setLogDate(e.target.value)}
                  max={todayStr}
                  className="bg-transparent text-zinc-800 dark:text-zinc-200 text-xs font-bold font-mono focus:outline-none cursor-pointer"
                  title="Select specific date for food logging"
                />
                {logDate === todayStr ? (
                  <span className="text-[10px] bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 px-1.5 py-0.5 rounded font-bold">
                    Today
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setLogDate(todayStr)}
                    className="text-[10px] text-zinc-500 hover:text-emerald-600 dark:hover:text-emerald-400 underline font-medium"
                    title="Reset to Today"
                  >
                    Reset
                  </button>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-xl text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* 6 TOP CATEGORY TABS (When in 'log' mode) */}
          {modalViewMode === 'log' && (
            <div className="flex items-center justify-between gap-2 mt-4 overflow-x-auto pb-1 scrollbar-none">
              <div className="flex items-center gap-1.5 sm:gap-2">
                {(['Breakfast', 'Lunch', 'Snacks', 'Dinner', 'Fasting', 'Water'] as ModalTab[]).map(tab => {
                  const isActive = activeTab === tab;
                  const tabCount = foodLogs ? foodLogs.filter(f => (f.mealType || '').toLowerCase() === tab.toLowerCase()).length : 0;
                  return (
                    <button
                      key={tab}
                      type="button"
                      onClick={() => setActiveTab(tab)}
                      className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
                        isActive
                          ? tab === 'Water'
                            ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/25 ring-2 ring-cyan-400/40'
                            : tab === 'Fasting'
                            ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/25 ring-2 ring-purple-400/40'
                            : 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/25 ring-2 ring-emerald-400/40'
                          : 'bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60'
                      }`}
                    >
                      {getTabIcon(tab)}
                      <span>{tab}</span>
                      {tabCount > 0 && (
                        <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                          isActive ? 'bg-white/20 text-white' : 'bg-emerald-500/20 text-emerald-600 dark:text-emerald-400'
                        }`}>
                          {tabCount}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Quick Eaten Shortcut pill */}
              {currentTabEatenItems.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setModalViewMode('eaten');
                    setEatenMealFilter(activeTab as any);
                  }}
                  className="hidden md:flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-xl border border-emerald-500/30 shrink-0"
                >
                  <Eye className="w-3.5 h-3.5" />
                  <span>View {activeTab} Eaten ({currentTabEatenItems.length})</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* ── VIEW EATEN FOODS COMPONENT IN POPUP ─────────────────────────── */}
        {modalViewMode === 'eaten' && (
          <div className="p-4 sm:p-6 space-y-4 flex-1 overflow-y-auto">
            
            {/* Sub-Header with Meal Category Filter Chips */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-200 dark:border-zinc-800 pb-3">
              <div>
                <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                  <Utensils className="w-4 h-4 text-emerald-500" />
                  Today's Eaten Food Log
                </h4>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Review the exact foods, grams, calories, and macronutrients you have eaten today.
                </p>
              </div>

              {/* Meal Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
                {(['All', 'Breakfast', 'Lunch', 'Snacks', 'Dinner'] as const).map(cat => {
                  const isSel = eatenMealFilter === cat;
                  const catCount = cat === 'All'
                    ? (foodLogs?.length || 0)
                    : (foodLogs?.filter(f => (f.mealType || '').toLowerCase() === cat.toLowerCase()).length || 0);

                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setEatenMealFilter(cat)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all shrink-0 flex items-center gap-1.5 ${
                        isSel
                          ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/25'
                          : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      <span>{cat}</span>
                      <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                        isSel ? 'bg-white/20 text-white' : 'bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300'
                      }`}>
                        {catCount}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Eaten Items Grid / List */}
            {filteredEatenLogs.length === 0 ? (
              <div className="py-12 px-6 text-center flex flex-col items-center justify-center space-y-3 bg-zinc-50 dark:bg-zinc-950/40 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800">
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-inner">
                  <Apple className="w-7 h-7" />
                </div>
                <div className="space-y-1">
                  <h5 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">
                    No foods eaten yet {eatenMealFilter !== 'All' ? `for ${eatenMealFilter}` : 'today'}
                  </h5>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    Search and log foods from our database to track live calories & macros.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setModalViewMode('log');
                    if (eatenMealFilter !== 'All') {
                      setActiveTab(eatenMealFilter as ModalTab);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5 mt-1"
                >
                  <Plus className="w-4 h-4" /> Log Food to {eatenMealFilter !== 'All' ? eatenMealFilter : activeTab}
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
                {filteredEatenLogs.map((item) => {
                  const mealLower = (item.mealType || '').toLowerCase();
                  let badgeTheme = 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30';
                  if (mealLower === 'lunch') badgeTheme = 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400 border-cyan-500/30';
                  if (mealLower === 'snacks') badgeTheme = 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30';
                  if (mealLower === 'dinner') badgeTheme = 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30';

                  return (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800/80 hover:border-zinc-300 dark:hover:border-zinc-700 shadow-sm transition flex flex-col justify-between space-y-2 group"
                    >
                      {/* Top Item Row */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border uppercase tracking-wider ${badgeTheme}`}>
                              {item.mealType || 'Meal'}
                            </span>
                            <span className="text-[11px] font-mono text-zinc-400">
                              {item.time || 'Logged Today'}
                            </span>
                          </div>
                          <h4 className="text-xs sm:text-sm font-extrabold text-zinc-900 dark:text-zinc-100 mt-1 truncate" title={item.foodName}>
                            {item.foodName}
                          </h4>
                          <p className="text-[11px] font-mono text-zinc-500 dark:text-zinc-400 mt-0.5">
                            Portion: <strong className="text-zinc-700 dark:text-zinc-300">{item.portionName || `${item.customGrams || 100}g`}</strong>
                          </p>
                        </div>

                        <div className="flex flex-col items-end gap-1">
                          <span className="text-sm font-black font-mono text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/50 border border-orange-500/20 px-2 py-0.5 rounded-lg">
                            {item.calories} kcal
                          </span>
                          {onDeleteFoodLog && (
                            <button
                              type="button"
                              onClick={() => onDeleteFoodLog(item.id, item.foodName)}
                              className="p-1 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40 transition opacity-80 group-hover:opacity-100"
                              title="Delete food entry"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Bottom Macro Breakdown Pills */}
                      <div className="pt-2 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between text-[10px] font-mono">
                        <div className="flex items-center gap-2 font-bold">
                          <span className="text-emerald-600 dark:text-emerald-400">P: {item.protein}g</span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="text-cyan-600 dark:text-cyan-400">C: {item.carbs}g</span>
                          <span className="text-zinc-300 dark:text-zinc-700">•</span>
                          <span className="text-amber-600 dark:text-amber-400">F: {item.fat}g</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Eaten Summary Footer */}
            <div className="p-4 rounded-2xl bg-zinc-100/80 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2.5 font-mono flex-wrap">
                <Flame className="w-4 h-4 text-orange-500" />
                <span className="text-zinc-600 dark:text-zinc-400 font-sans">
                  {eatenMealFilter === 'All' ? 'Total Eaten Today:' : `Total ${eatenMealFilter} Eaten:`}
                </span>
                <strong className="text-zinc-900 dark:text-zinc-100 font-black text-sm">{totalEatenCalories} kcal</strong>
                <span className="text-zinc-400">({filteredEatenLogs.length} items)</span>
                <span className="text-zinc-300 dark:text-zinc-700">|</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">P: {totalEatenProtein}g</span>
                <span className="text-cyan-600 dark:text-cyan-400 font-bold">C: {totalEatenCarbs}g</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">F: {totalEatenFat}g</span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setModalViewMode('log');
                    if (eatenMealFilter !== 'All') {
                      setActiveTab(eatenMealFilter as ModalTab);
                    }
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold transition shadow-md shadow-emerald-600/20 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Log More Food</span>
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 font-semibold transition"
                >
                  Close
                </button>
              </div>
            </div>

          </div>
        )}

        {/* ── TAB CONTENT: WATER TAB VIEW ──────────────────────────────────── */}
        {modalViewMode === 'log' && activeTab === 'Water' && (
          <div className="p-8 flex flex-col items-center justify-center text-center space-y-6 flex-1">
            <div className="w-20 h-20 rounded-3xl bg-cyan-500/10 border-2 border-cyan-500/30 flex items-center justify-center text-cyan-400 shadow-xl shadow-cyan-500/10">
              <Droplets className="w-10 h-10 animate-bounce" />
            </div>

            <div className="max-w-md space-y-2">
              <h4 className="text-xl font-black text-zinc-900 dark:text-zinc-100">
                Hydration & Electrolyte Hub
              </h4>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                Log today's water intake using our interactive 1.0L Bottles, 250ml Glasses, and 1-tap quick presets.
              </p>
            </div>

            {/* Current Water Intake Status */}
            <div className="w-full max-w-sm p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/30 flex items-center justify-between">
              <div className="text-left">
                <span className="text-[10px] font-extrabold uppercase text-cyan-600 dark:text-cyan-400 tracking-wider block">
                  Today's Hydration Total
                </span>
                <span className="text-2xl font-black text-cyan-900 dark:text-zinc-100 font-mono">
                  {currentWaterLiters.toFixed(2)} <span className="text-sm text-zinc-500">/ {targetWaterLiters} Liters</span>
                </span>
              </div>
              <div className="text-right">
                <span className="text-xs font-bold text-cyan-600 dark:text-cyan-300 font-mono">
                  {Math.min(100, Math.round((currentWaterLiters / (targetWaterLiters || 3.5)) * 100))}%
                </span>
                <span className="text-[10px] text-zinc-400 block">Goal Achieved</span>
              </div>
            </div>

            {/* Direct Switch to Water Modal Button */}
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenWaterModal();
              }}
              className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-cyan-600 via-sky-500 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-extrabold text-sm shadow-xl shadow-cyan-500/25 transition flex items-center gap-2"
            >
              <Droplets className="w-4 h-4" /> Open Water & Hydration Tracker
            </button>
          </div>
        )}

        {/* ── TAB CONTENT: FASTING TAB VIEW ────────────────────────────────── */}
        {modalViewMode === 'log' && activeTab === 'Fasting' && (
          <div className="p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center flex-1">
            <div className="md:col-span-6 flex flex-col items-center justify-center text-center p-6 rounded-2xl bg-purple-50 dark:bg-purple-950/20 border border-purple-200 dark:border-purple-500/20">
              <div className="relative w-44 h-44 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90" viewBox="0 0 160 160">
                  <circle cx="80" cy="80" r="65" fill="none" className="stroke-zinc-200 dark:stroke-zinc-800" strokeWidth="10" />
                  <circle
                    cx="80" cy="80" r="65"
                    fill="none"
                    className="stroke-purple-500 transition-all duration-700 ease-out"
                    strokeWidth="10"
                    strokeDasharray={408}
                    strokeDashoffset={408 - (408 * (fastingHoursElapsed / 16))}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <Clock className="w-5 h-5 text-purple-400 mb-1 animate-pulse" />
                  <span className="text-2xl font-black text-zinc-900 dark:text-zinc-100 font-mono">
                    {fastingHoursElapsed}h
                  </span>
                  <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold uppercase">
                    Fasting Elapsed
                  </span>
                </div>
              </div>
              <span className="mt-3 text-xs font-bold text-zinc-700 dark:text-zinc-300">
                16:8 Intermittent Fasting Window
              </span>
            </div>

            <div className="md:col-span-6 space-y-4">
              <h4 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Intermittent Fasting Protocol
              </h4>
              <div className="grid grid-cols-2 gap-2.5">
                {[
                  { id: '16_8', name: '16:8 LeanGains', desc: '16h Fast • 8h Eating' },
                  { id: '18_6', name: '18:6 Fat Burn', desc: '18h Fast • 6h Eating' },
                  { id: '20_4', name: '20:4 Warrior', desc: '20h Fast • 4h Eating' },
                  { id: '24_0', name: '24h OMAD', desc: 'One Meal A Day' },
                ].map(proto => (
                  <button
                    key={proto.id}
                    type="button"
                    onClick={() => setFastingProtocol(proto.id as any)}
                    className={`p-3 rounded-xl border text-left transition ${
                      fastingProtocol === proto.id
                        ? 'bg-purple-50 dark:bg-purple-950/40 border-purple-500/50 text-purple-700 dark:text-purple-300 ring-1 ring-purple-400/40'
                        : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800'
                    }`}
                  >
                    <span className="text-xs font-bold block">{proto.name}</span>
                    <span className="text-[10px] text-zinc-400">{proto.desc}</span>
                  </button>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                <Info className="w-4 h-4 text-purple-400 shrink-0" />
                <span>Autophagy & fat oxidation typically peak after 14+ hours of continuous water-only fasting.</span>
              </div>

              <button
                type="button"
                onClick={() => setIsFastingActive(!isFastingActive)}
                className="w-full py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs shadow-lg shadow-purple-600/20 transition flex items-center justify-center gap-2"
              >
                {isFastingActive ? 'Complete Fast & Open Eating Window' : 'Start New Fasting Window'}
              </button>
            </div>
          </div>
        )}

        {/* ── TAB CONTENT: MEAL MODES (Breakfast / Lunch / Snacks / Dinner) ── */}
        {modalViewMode === 'log' && activeTab !== 'Water' && activeTab !== 'Fasting' && (
          <div className="p-4 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-5 items-stretch overflow-hidden">
            
            {/* ─────────────────────────────────────────────────────────────── */}
            {/* LEFT COLUMN: Food Search, Filters & Catalog List                */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-3 overflow-hidden">
              
              {/* Eaten Summary Banner for Current Meal */}
              {currentTabEatenItems.length > 0 && (
                <div
                  onClick={() => {
                    setModalViewMode('eaten');
                    setEatenMealFilter(activeTab as any);
                  }}
                  className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/30 flex items-center justify-between text-xs cursor-pointer hover:bg-emerald-100/70 dark:hover:bg-emerald-950/60 transition shadow-sm"
                >
                  <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-[11px]">
                    <Utensils className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                    <span>Eaten in {activeTab}: <strong>{currentTabEatenItems.length} item(s)</strong> ({currentTabEatenCalories} kcal)</span>
                  </div>
                  <span className="text-[11px] font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5 hover:underline">
                    View Eaten <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              )}

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    loadFoods(e.target.value);
                  }}
                  placeholder={`Search ${activeTab} items (Chicken, Rice, Eggs, Oats)...`}
                  className="w-full bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl py-2.5 pl-9 pr-4 text-zinc-900 dark:text-zinc-100 text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      loadFoods('');
                    }}
                    className="absolute right-3 top-2.5 text-zinc-400 hover:text-zinc-600 text-xs"
                  >
                    ×
                  </button>
                )}
              </div>

              {/* Quick Filter Chips */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-[11px]">
                {['All', 'High Protein', 'Low Carb', 'Keto', 'Vegetarian', 'Recipes'].map(filter => (
                  <button
                    key={filter}
                    type="button"
                    onClick={() => setSelectedCategoryFilter(filter)}
                    className={`px-2.5 py-1 rounded-lg font-semibold transition shrink-0 ${
                      selectedCategoryFilter === filter
                        ? 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                        : 'bg-zinc-100 dark:bg-zinc-950 text-zinc-500 dark:text-zinc-400 hover:text-zinc-800 border border-transparent'
                    }`}
                  >
                    {filter}
                  </button>
                ))}
              </div>

              {/* Food Catalog List (Scrollable Sub-window) */}
              <div className="h-64 sm:h-72 overflow-y-auto space-y-2 pr-1 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-2 bg-zinc-50/50 dark:bg-zinc-950/60">
                {isSearching ? (
                  <div className="h-full flex items-center justify-center gap-2 text-xs text-zinc-400">
                    <Loader2 className="w-4 h-4 animate-spin text-emerald-400" /> Searching database...
                  </div>
                ) : filteredFoods.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center p-4 text-center text-xs text-zinc-400">
                    <span>No food items found matching "{searchQuery}".</span>
                    <span className="text-[10px] mt-1 text-zinc-500">Try searching for chicken, oats, rice, eggs, etc.</span>
                  </div>
                ) : (
                  filteredFoods.map((item) => {
                    const isSelected = selectedFood?.id === item.id;
                    const c = item.carbohydrates ?? item.carbs ?? 0;
                    const p = item.protein ?? 0;
                    const f = item.fat ?? 0;

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedFood(item)}
                        className={`p-2.5 rounded-xl border text-xs cursor-pointer flex justify-between items-center transition group ${
                          isSelected
                            ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-500/70 shadow-sm ring-1 ring-emerald-500/30'
                            : 'bg-white dark:bg-zinc-900/80 border-zinc-200 dark:border-zinc-800/80 hover:border-emerald-500/40 hover:bg-zinc-50 dark:hover:bg-zinc-900'
                        }`}
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-zinc-900 dark:text-zinc-100">
                              {item.foodName || item.name || (item as any).food_name || (item as any).title || 'Nutritious Food Item'}
                            </span>
                            <span className="text-[9px] font-mono font-medium px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                              {item.category || item.foodCategory || (item as any).food_category || 'Food'}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] font-mono text-zinc-500 dark:text-zinc-400">
                            <span className="font-bold text-zinc-800 dark:text-zinc-200">{item.calories} kcal/100g</span>
                            <span>•</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-semibold">P: {p}g</span>
                            <span>•</span>
                            <span className="text-cyan-600 dark:text-cyan-400 font-semibold">C: {c}g</span>
                            <span>•</span>
                            <span className="text-amber-600 dark:text-amber-400 font-semibold">F: {f}g</span>
                          </div>
                        </div>

                        {isSelected ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 shadow">
                            <Check className="w-3.5 h-3.5" />
                          </div>
                        ) : (
                          <ChevronRight className="w-4 h-4 text-zinc-400 opacity-0 group-hover:opacity-100 transition shrink-0" />
                        )}
                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* ─────────────────────────────────────────────────────────────── */}
            {/* RIGHT COLUMN: Serving Unit Scaler, Live Macros & Donut Chart    */}
            {/* ─────────────────────────────────────────────────────────────── */}
            <div className="md:col-span-6 flex flex-col justify-between space-y-3 bg-zinc-50/50 dark:bg-zinc-950/40 border border-zinc-200 dark:border-zinc-800/80 rounded-2xl p-4">
              
              {/* Selected Food Header Banner */}
              <div className="border-b border-zinc-200 dark:border-zinc-800/80 pb-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                      Selected for {activeTab}
                    </span>
                    <h4 className="text-sm font-extrabold text-zinc-900 dark:text-zinc-100 line-clamp-1">
                      {selectedFood?.foodName || selectedFood?.name || (selectedFood as any)?.food_name || (selectedFood as any)?.title || 'Select a Food Item'}
                    </h4>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-mono font-black text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2.5 py-1 rounded-xl border border-emerald-500/30 shadow-xs">
                      Weight: {totalGrams}g
                    </span>
                  </div>
                </div>
              </div>

              {/* Portion Unit Selector & Direct Numeric Input Field (No restrictive +/- buttons) */}
              <div className="space-y-2">
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-end">
                  {/* Serving Unit Dropdown */}
                  <div className="sm:col-span-6">
                    <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400 mb-1">
                      Serving Unit
                    </label>
                    <select
                      value={selectedUnitId}
                      onChange={(e) => handleUnitChange(e.target.value)}
                      className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 text-zinc-900 dark:text-zinc-100 text-xs font-semibold focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/30"
                    >
                      {SERVING_UNITS.map((unit) => (
                        <option key={unit.id} value={unit.id}>
                          {unit.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Direct Numeric Input Text Field */}
                  <div className="sm:col-span-6">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-[11px] font-bold text-zinc-500 dark:text-zinc-400">
                        {currentServingUnit.isGrams ? 'Exact Grams (g)' : 'Quantity / Servings'}
                      </label>
                      {!currentServingUnit.isGrams && totalGrams > 0 && (
                        <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400">
                          = {totalGrams}g
                        </span>
                      )}
                    </div>
                    <div className="relative flex items-center">
                      <input
                        type="number"
                        step="any"
                        min="0.1"
                        value={enteredQuantity}
                        onChange={(e) => setEnteredQuantity(e.target.value)}
                        placeholder={currentServingUnit.isGrams ? "e.g. 65, 75, 295, 395" : "e.g. 1.5"}
                        className="w-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl px-3 py-2 pr-12 text-zinc-900 dark:text-zinc-100 text-xs font-bold font-mono focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <span className="absolute right-3 text-[11px] font-mono font-bold text-zinc-400 pointer-events-none">
                        {currentServingUnit.isGrams ? 'g' : currentServingUnit.unitName}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Quick Selection Numeric Chips */}
                <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5 scrollbar-none text-[10px] font-mono">
                  <span className="text-zinc-400 text-[10px] shrink-0 font-sans">Quick:</span>
                  {currentServingUnit.isGrams
                    ? [50, 65, 75, 100, 150, 200, 295, 395].map((g) => (
                        <button
                          key={g}
                          type="button"
                          onClick={() => setEnteredQuantity(String(g))}
                          className={`px-2 py-0.5 rounded-lg border transition shrink-0 ${
                            enteredQuantity === String(g)
                              ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500/40'
                          }`}
                        >
                          {g}g
                        </button>
                      ))
                    : [0.5, 1, 1.5, 2, 2.5, 3].map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setEnteredQuantity(String(s))}
                          className={`px-2 py-0.5 rounded-lg border transition shrink-0 ${
                            enteredQuantity === String(s)
                              ? 'bg-emerald-500 text-white border-emerald-500 font-bold'
                              : 'bg-white dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 hover:border-emerald-500/40'
                          }`}
                        >
                          {s} {currentServingUnit.unitName}
                        </button>
                      ))}
                </div>
              </div>

              {/* Live Scaled Nutrition HUD + Macro Donut Graph */}
              <div className="p-3 rounded-2xl bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 grid grid-cols-12 gap-3 items-center">
                
                {/* Scaled Macro Spec Numbers (Left 7 Cols) */}
                <div className="col-span-7 space-y-1.5">
                  <div className="flex items-baseline justify-between border-b border-zinc-100 dark:border-zinc-800/80 pb-1">
                    <span className="text-[11px] font-bold text-zinc-500 dark:text-zinc-400">Total Calories:</span>
                    <span className="text-base font-black text-orange-500 dark:text-orange-400 font-mono">
                      {scaledNutrients.calories} kcal
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[10px] font-mono">
                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-500/20 text-center">
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold block">Protein</span>
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{scaledNutrients.protein}g</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-950/40 border border-cyan-200 dark:border-cyan-500/20 text-center">
                      <span className="text-cyan-600 dark:text-cyan-400 font-bold block">Carbs</span>
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{scaledNutrients.carbs}g</span>
                    </div>
                    <div className="p-1.5 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-500/20 text-center">
                      <span className="text-amber-600 dark:text-amber-400 font-bold block">Fats</span>
                      <span className="font-extrabold text-zinc-800 dark:text-zinc-200">{scaledNutrients.fat}g</span>
                    </div>
                  </div>

                  {scaledNutrients.fiber > 0 && (
                    <div className="flex justify-between text-[10px] text-zinc-400 font-mono px-0.5">
                      <span>Fiber: {scaledNutrients.fiber}g</span>
                      <span>Total: {totalGrams}g</span>
                    </div>
                  )}
                </div>

                {/* Macro Pie / Donut SVG Chart (Right 5 Cols) */}
                <div className="col-span-5 flex flex-col items-center justify-center">
                  <div className="relative w-20 h-20 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Protein Arc (Emerald) */}
                      <circle
                        cx="50" cy="50" r="38"
                        fill="none"
                        className="stroke-emerald-500"
                        strokeWidth="10"
                        strokeDasharray={238.7}
                        strokeDashoffset={238.7 - (238.7 * macroPercentages.proteinPct) / 100}
                      />
                      {/* Carbs Arc (Cyan) */}
                      <circle
                        cx="50" cy="50" r="38"
                        fill="none"
                        className="stroke-cyan-500"
                        strokeWidth="10"
                        strokeDasharray={238.7}
                        strokeDashoffset={238.7 - (238.7 * macroPercentages.carbsPct) / 100}
                        style={{
                          transform: `rotate(${(macroPercentages.proteinPct / 100) * 360}deg)`,
                          transformOrigin: '50% 50%'
                        }}
                      />
                      {/* Fat Arc (Amber) */}
                      <circle
                        cx="50" cy="50" r="38"
                        fill="none"
                        className="stroke-amber-500"
                        strokeWidth="10"
                        strokeDasharray={238.7}
                        strokeDashoffset={238.7 - (238.7 * macroPercentages.fatPct) / 100}
                        style={{
                          transform: `rotate(${((macroPercentages.proteinPct + macroPercentages.carbsPct) / 100) * 360}deg)`,
                          transformOrigin: '50% 50%'
                        }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <PieIcon className="w-3 h-3 text-emerald-400" />
                      <span className="text-[9px] font-black font-mono text-zinc-900 dark:text-zinc-100">
                        {scaledNutrients.calories}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 mt-1 text-[8px] font-mono font-bold">
                    <span className="text-emerald-500">P:{macroPercentages.proteinPct}%</span>
                    <span className="text-cyan-500">C:{macroPercentages.carbsPct}%</span>
                    <span className="text-amber-500">F:{macroPercentages.fatPct}%</span>
                  </div>
                </div>

              </div>

              {/* Action Buttons: Log Food */}
              <div className="flex items-center gap-2.5 pt-1">
                <button
                  type="button"
                  onClick={onClose}
                  className="w-1/3 py-2.5 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-200 font-bold text-xs transition"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={isLogging || !selectedFood}
                  onClick={handleLogFood}
                  className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-extrabold text-xs shadow-lg shadow-emerald-950/20 hover:shadow-emerald-500/25 transition flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isLogging ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Logging Food to Database...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4" /> Log to {activeTab} ({scaledNutrients.calories} kcal)
                    </>
                  )}
                </button>
              </div>

            </div>

          </div>
        )}

      </div>
    </div>
  );
};
