import React, { useState, useEffect } from 'react';
import {
  Apple,
  Flame,
  Zap,
  Sparkles,
  Utensils,
  Scale,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  X,
  Dumbbell,
  Clock,
  BookOpen,
  ListChecks,
} from 'lucide-react';
import { FoodItem } from '../../types';
import { getFoodsByFilter, PaginatedResult } from '../../lib/api/food';

type RootMode = 'FOODS' | 'RECIPES';
type FoodPreset = 'FOOD_ALL' | 'FOOD_MAGNESIUM' | 'FOOD_HIGH_PROTEIN' | 'FOOD_LOW_CALORIE' | 'FOOD_HIGH_CALORIE';
type RecipePreset = 'RECIPE_ALL' | 'RECIPE_FAT_LOSS' | 'RECIPE_MAGNESIUM' | 'RECIPE_HIGH_PROTEIN' | 'RECIPE_LOW_CALORIE' | 'RECIPE_HIGH_CALORIE';

export const DietDatabase: React.FC = () => {
  const [rootMode, setRootMode] = useState<RootMode>('FOODS');
  const [activeFoodPreset, setActiveFoodPreset] = useState<FoodPreset>('FOOD_ALL');
  const [activeRecipePreset, setActiveRecipePreset] = useState<RecipePreset>('RECIPE_ALL');
  const [foods, setFoods] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(24);
  const [totalPages, setTotalPages] = useState<number>(1);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [hasNext, setHasNext] = useState<boolean>(false);
  const [hasPrev, setHasPrev] = useState<boolean>(false);
  const [selectedFoodModal, setSelectedFoodModal] = useState<FoodItem | null>(null);

  const currentApiPreset = rootMode === 'FOODS' ? activeFoodPreset : activeRecipePreset;

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const result: PaginatedResult<FoodItem> = await getFoodsByFilter(currentApiPreset, page, pageSize);
        setFoods(result.items || []);
        setPage(result.page);
        setTotalPages(result.totalPages);
        setTotalElements(result.totalElements);
        setHasNext(result.hasNext);
        setHasPrev(result.hasPrev);
      } catch (err) {
        console.error('Failed to load foods from backend API:', err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [currentApiPreset, page, pageSize]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSelectedFoodModal(null);
    };
    if (selectedFoodModal) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFoodModal]);

  const handleRootModeChange = (mode: RootMode) => {
    setRootMode(mode);
    setPage(0);
  };

  const handleSubPresetChange = (preset: string) => {
    if (rootMode === 'FOODS') setActiveFoodPreset(preset as FoodPreset);
    else setActiveRecipePreset(preset as RecipePreset);
    setPage(0);
  };

  const fmtVal = (v: number | undefined) => ((v ?? 0) > 0 ? `${v}g` : null);

  const getCalDisplay = (food: FoodItem) => {
    const raw = food.caloriesPer100g ?? 0;
    if (raw > 0) return { val: raw, estimated: false };
    const est = Math.round(
      (food.proteinPer100g ?? 0) * 4 +
      (food.carbsPer100g ?? 0) * 4 +
      (food.fatPer100g ?? 0) * 9
    );
    return est > 0 ? { val: est, estimated: true } : { val: null, estimated: false };
  };

  const hasAnyNutrition = (food: FoodItem) =>
    (food.caloriesPer100g ?? 0) > 0 ||
    (food.proteinPer100g ?? 0) > 0 ||
    (food.carbsPer100g ?? 0) > 0 ||
    (food.fatPer100g ?? 0) > 0;

  const foodButtons = [
    { id: 'FOOD_ALL', label: 'All Foods', icon: Apple, active: 'bg-emerald-600 border-emerald-600', iconCls: '' },
    { id: 'FOOD_MAGNESIUM', label: 'Magnesium-Rich Foods', icon: Zap, active: 'bg-amber-500 border-amber-500', iconCls: 'text-amber-500' },
    { id: 'FOOD_HIGH_PROTEIN', label: 'High Protein Foods', icon: Flame, active: 'bg-cyan-600 border-cyan-600', iconCls: 'text-cyan-600' },
    { id: 'FOOD_LOW_CALORIE', label: 'Low Calorie (<100 kcal)', icon: Scale, active: 'bg-emerald-700 border-emerald-700', iconCls: 'text-emerald-600' },
    { id: 'FOOD_HIGH_CALORIE', label: 'High Calorie (>300 kcal)', icon: Zap, active: 'bg-rose-600 border-rose-600', iconCls: 'text-rose-500' },
  ];

  const recipeButtons = [
    { id: 'RECIPE_ALL', label: 'All Recipes', icon: Utensils, active: 'bg-teal-600 border-teal-600', iconCls: '' },
    { id: 'RECIPE_FAT_LOSS', label: 'Fat Loss Recipes', icon: Flame, active: 'bg-teal-700 border-teal-700', iconCls: 'text-teal-600' },
    { id: 'RECIPE_MAGNESIUM', label: 'Magnesium-Rich Recipes', icon: Zap, active: 'bg-amber-500 border-amber-500', iconCls: 'text-amber-500' },
    { id: 'RECIPE_HIGH_PROTEIN', label: 'High Protein Recipes', icon: Dumbbell, active: 'bg-cyan-600 border-cyan-600', iconCls: 'text-cyan-600' },
    { id: 'RECIPE_LOW_CALORIE', label: 'Low Calorie Recipes (<100 kcal)', icon: Scale, active: 'bg-emerald-700 border-emerald-700', iconCls: 'text-emerald-600' },
    { id: 'RECIPE_HIGH_CALORIE', label: 'High Calorie / Muscle Gain (>300 kcal)', icon: Zap, active: 'bg-rose-600 border-rose-600', iconCls: 'text-rose-500' },
  ];

  const activeButtons = rootMode === 'FOODS' ? foodButtons : recipeButtons;
  const activePreset = rootMode === 'FOODS' ? activeFoodPreset : activeRecipePreset;
  const inactivePillCls = 'bg-slate-50 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-700 border-slate-200 dark:border-zinc-700';

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#09090b] text-slate-900 dark:text-zinc-100 p-3 md:p-5 transition-colors duration-200">
      {/* TOP HEADER */}
      <div className="flex items-center justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg md:text-xl font-black text-slate-900 dark:text-zinc-50 tracking-tight">
              Diet &amp; <span className="text-emerald-600 dark:text-emerald-400">Nutrition</span>
            </h1>
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold border border-emerald-200/60 dark:border-emerald-800/40">
              <Sparkles className="w-2.5 h-2.5 text-emerald-600 dark:text-emerald-400" /> USDA &amp; FooDB Verified
            </span>
          </div>
          <p className="text-slate-500 dark:text-zinc-400 text-xs mt-0.5">
            Structured nutritional profiles for raw foods and prepared recipes.
          </p>
        </div>
      </div>

      {/* FILTER CONTROL PANEL */}
      <div className="bg-white dark:bg-zinc-900 border border-slate-200/80 dark:border-zinc-800 rounded-2xl p-3 mb-4 shadow-xs space-y-2.5">
        {/* ROW 1: PRIMARY MODE SELECTION */}
        <div className="flex items-center gap-1.5 border-b border-slate-100 dark:border-zinc-800 pb-2">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1">Mode:</span>
          <button
            onClick={() => handleRootModeChange('FOODS')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              rootMode === 'FOODS'
                ? 'bg-emerald-600 text-white border-emerald-600 shadow-xs'
                : inactivePillCls
            }`}
          >
            <Apple className="w-3.5 h-3.5" /> All Foods
          </button>
          <button
            onClick={() => handleRootModeChange('RECIPES')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-bold transition-all border ${
              rootMode === 'RECIPES'
                ? 'bg-teal-600 text-white border-teal-600 shadow-xs'
                : inactivePillCls
            }`}
          >
            <Utensils className="w-3.5 h-3.5" /> Recipes Catalog
          </button>
        </div>

        {/* ROW 2: SUB-CATEGORY SELECTION */}
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-[10px] font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider mr-1">
            {rootMode === 'FOODS' ? 'Category:' : 'Recipe Type:'}
          </span>
          {activeButtons.map(({ id, label, icon: Icon, active, iconCls }) => (
            <button
              key={id}
              onClick={() => handleSubPresetChange(id)}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold transition-all border ${
                activePreset === id ? `${active} text-white shadow-xs font-bold` : inactivePillCls
              }`}
            >
              <Icon className={`w-3 h-3 ${activePreset === id ? '' : iconCls}`} /> {label}
            </button>
          ))}
        </div>
      </div>

      {/* RESULTS COUNT & ITEMS PER PAGE */}
      <div className="flex items-center justify-between text-xs text-slate-500 dark:text-zinc-400 mb-3 px-1">
        <div>
          Showing{' '}
          <span className="font-bold text-slate-900 dark:text-zinc-100">{totalElements > 0 ? page * pageSize + 1 : 0}</span> to{' '}
          <span className="font-bold text-slate-900 dark:text-zinc-100">{Math.min((page + 1) * pageSize, totalElements)}</span> of{' '}
          <span className="font-bold text-emerald-700 dark:text-emerald-400">{totalElements}</span> items
        </div>
        <div className="flex items-center gap-2 text-[11px]">
          <span>Items per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setPage(0);
            }}
            className="bg-white dark:bg-zinc-800 border border-slate-200 dark:border-zinc-700 rounded px-2 py-0.5 text-slate-700 dark:text-zinc-200 font-bold focus:outline-none"
          >
            <option value={12}>12</option>
            <option value={24}>24</option>
            <option value={48}>48</option>
            <option value={96}>96</option>
          </select>
        </div>
      </div>

      {/* FOOD CARDS GRID — 4-column responsive grid on wide screens */}
      {loading ? (
        <div className="flex justify-center items-center py-20 text-emerald-600 dark:text-emerald-400">
          <Sparkles className="w-7 h-7 animate-spin mr-2" />
          <span className="text-sm font-medium">Loading Nutrition Database...</span>
        </div>
      ) : foods.length === 0 ? (
        <div className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-10 text-center my-6 shadow-sm">
          <Apple className="w-10 h-10 text-slate-400 dark:text-zinc-500 mx-auto mb-2" />
          <h3 className="text-lg font-bold text-slate-900 dark:text-zinc-100 mb-1">No Items Found</h3>
          <p className="text-slate-500 dark:text-zinc-400 text-xs max-w-md mx-auto mb-3">
            We could not find any items matching the selected category. Try selecting another sub-category above.
          </p>
          <button
            onClick={() => {
              setRootMode('FOODS');
              setActiveFoodPreset('FOOD_ALL');
              setPage(0);
            }}
            className="px-3.5 py-1.5 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-all shadow-sm"
          >
            Reset Category
          </button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
            {foods.map((food) => {
              const cal = getCalDisplay(food);
              const allZero = !hasAnyNutrition(food);
              const ingredientCount = food.recipeIngredients?.length ?? 0;
              const stepCount = food.recipeInstructions?.length ?? 0;
              // Guard condition explicitly boolean: prevents rendering '0' in React JSX
              const isMagRich = (food.magnesiumMg ?? 0) >= 25;

              return (
                <div
                  key={food.id}
                  onClick={() => setSelectedFoodModal(food)}
                  className="group relative bg-white dark:bg-zinc-900 hover:bg-slate-50/90 dark:hover:bg-zinc-800/80 border border-slate-200 dark:border-zinc-800 hover:border-emerald-500/50 dark:hover:border-emerald-600/50 rounded-xl p-3.5 sm:p-4 transition-all duration-200 cursor-pointer shadow-xs hover:shadow-md flex flex-col justify-between"
                >
                  <div>
                    {/* CATEGORY & TAG BADGES */}
                    <div className="flex items-center justify-between gap-1.5 mb-2 flex-wrap min-h-[22px]">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 truncate max-w-[140px]">
                        {food.category || 'General Food'}
                      </span>

                      <div className="flex items-center gap-1 flex-wrap">
                        {isMagRich ? (
                          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-amber-50 dark:bg-amber-950/50 text-amber-700 dark:text-amber-400 border border-amber-200/80 dark:border-amber-800/40 flex items-center gap-1">
                            <Zap className="w-2.5 h-2.5 text-amber-500" /> {food.magnesiumMg}mg Mag
                          </span>
                        ) : null}

                        {food.isRecipe ? (
                          <>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-400 border border-teal-200/80 dark:border-teal-800/40 flex items-center gap-1">
                              <Utensils className="w-2.5 h-2.5" /> Recipe
                            </span>
                            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-300 flex items-center gap-1">
                              <Clock className="w-2.5 h-2.5 text-slate-500 dark:text-zinc-400" /> {food.prepTimeMins || 15}m
                            </span>
                          </>
                        ) : null}
                      </div>
                    </div>

                    {/* TITLE */}
                    <h3 className="text-sm font-bold text-slate-900 dark:text-zinc-100 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors mb-2 line-clamp-2 min-h-[40px] leading-snug">
                      {food.name}
                    </h3>

                    {/* CALORIES DISPLAY BOX */}
                    <div
                      className={`rounded-lg p-2 mb-2 flex items-center justify-between border ${
                        allZero
                          ? 'bg-slate-50 dark:bg-zinc-800/50 border-slate-200 dark:border-zinc-700/60'
                          : 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-100 dark:border-emerald-900/40'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <Flame
                          className={`w-3.5 h-3.5 ${
                            allZero ? 'text-slate-400 dark:text-zinc-500' : 'text-amber-500'
                          }`}
                        />
                        <div>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400 block font-medium leading-none">
                            Calories{cal.estimated ? ' (est.)' : ''}
                          </span>
                          <span className="text-base font-black text-slate-900 dark:text-zinc-100 font-mono">
                            {cal.val != null ? (
                              <>
                                {cal.val}{' '}
                                <span className="text-[11px] text-emerald-700 dark:text-emerald-400 font-sans font-normal">
                                  kcal
                                </span>
                              </>
                            ) : (
                              <span className="text-sm text-slate-400 dark:text-zinc-500">—</span>
                            )}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[9px] text-slate-400 dark:text-zinc-500 block uppercase tracking-wider font-semibold">
                          Serving
                        </span>
                        <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 font-mono">
                          {food.isRecipe ? 'Total Recipe' : 'Per 100g'}
                        </span>
                      </div>
                    </div>

                    {/* MACRONUTRIENTS GRID */}
                    <div className="grid grid-cols-3 gap-1.5 mb-2 text-center">
                      {[
                        { label: 'Protein', val: fmtVal(food.proteinPer100g), color: 'text-cyan-700 dark:text-cyan-400' },
                        { label: 'Carbs', val: fmtVal(food.carbsPer100g), color: 'text-amber-700 dark:text-amber-400' },
                        { label: 'Fats', val: fmtVal(food.fatPer100g), color: 'text-rose-700 dark:text-rose-400' },
                      ].map(({ label, val, color }) => (
                        <div
                          key={label}
                          className="bg-slate-50 dark:bg-zinc-800 p-1 rounded-lg border border-slate-200/70 dark:border-zinc-700/50"
                        >
                          <span className="text-[9px] text-slate-400 dark:text-zinc-500 uppercase font-semibold block">
                            {label}
                          </span>
                          <span className={`text-xs font-bold font-mono ${val ? color : 'text-slate-400 dark:text-zinc-500'}`}>
                            {val ?? '—'}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* EXTRA DETAILS ROW: Fiber or Recipe Meta */}
                    {allZero && food.isRecipe ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/40 text-[10px] text-amber-700 dark:text-amber-400 font-medium">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block shrink-0" />
                          Nutritional data not yet available
                        </div>
                        {ingredientCount > 0 || stepCount > 0 ? (
                          <div className="grid grid-cols-2 gap-1 text-[10px]">
                            {ingredientCount > 0 ? (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-400 border border-teal-200/60 dark:border-teal-800/30">
                                <ListChecks className="w-3 h-3 shrink-0" />
                                {ingredientCount} ingredients
                              </div>
                            ) : null}
                            {stepCount > 0 ? (
                              <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 text-slate-600 dark:text-zinc-400 border border-slate-200 dark:border-zinc-700">
                                <BookOpen className="w-3 h-3 shrink-0" />
                                {stepCount} steps
                              </div>
                            ) : null}
                          </div>
                        ) : null}
                      </div>
                    ) : (food.fiberPer100g ?? 0) > 0 ? (
                      <div className="flex items-center justify-between px-2 py-0.5 rounded-md bg-slate-50 dark:bg-zinc-800/80 border border-slate-200/70 dark:border-zinc-700/50 text-[10px]">
                        <span className="text-slate-500 dark:text-zinc-400 font-medium">Dietary Fiber</span>
                        <span className="text-teal-700 dark:text-teal-400 font-mono font-bold">{food.fiberPer100g}g</span>
                      </div>
                    ) : null}
                  </div>

                  {/* FOOTER ACTION */}
                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-zinc-800 flex items-center justify-between text-[11px] text-emerald-600 dark:text-emerald-400 font-semibold group-hover:translate-x-0.5 transition-transform">
                    <span>View Details &amp; Recipe</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* PAGINATION CONTROLS */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl p-3 shadow-xs mb-8">
            <div className="text-xs text-slate-500 dark:text-zinc-400 font-medium">
              Page <span className="font-bold text-slate-900 dark:text-zinc-100">{page + 1}</span> of{' '}
              <span className="font-bold text-slate-900 dark:text-zinc-100">{totalPages}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => setPage((p) => Math.max(0, p - 1))}
                disabled={page === 0 || !hasPrev}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  page === 0 || !hasPrev
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
                    : 'bg-white dark:bg-zinc-800 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-700 border border-slate-200 dark:border-zinc-700 shadow-xs'
                }`}
              >
                <ChevronLeft className="w-3.5 h-3.5" /> Previous
              </button>
              <div className="hidden md:flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, idx) => {
                  const pn = page < 3 ? idx : page >= totalPages - 2 ? totalPages - 5 + idx : page - 2 + idx;
                  if (pn < 0 || pn >= totalPages) return null;
                  return (
                    <button
                      key={pn}
                      onClick={() => setPage(pn)}
                      className={`w-6 h-6 rounded-md text-[11px] font-bold transition-all ${
                        page === pn
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : 'bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-200 dark:hover:bg-zinc-700'
                      }`}
                    >
                      {pn + 1}
                    </button>
                  );
                })}
              </div>
              <button
                onClick={() => setPage((p) => (hasNext ? p + 1 : p))}
                disabled={page >= totalPages - 1 || !hasNext}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  page >= totalPages - 1 || !hasNext
                    ? 'bg-slate-100 dark:bg-zinc-800 text-slate-400 dark:text-zinc-600 cursor-not-allowed'
                    : 'bg-emerald-600 text-white hover:bg-emerald-700 shadow-xs'
                }`}
              >
                Next <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </>
      )}

      {/* DETAIL RECTANGULAR MODAL */}
      {selectedFoodModal && (
        <div
          onClick={() => setSelectedFoodModal(null)}
          className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 cursor-pointer"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-6xl bg-white dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-2xl p-5 sm:p-7 shadow-2xl text-slate-900 dark:text-zinc-100 cursor-default max-h-[93vh] flex flex-col justify-between"
          >
            {/* MODAL TOP BAR */}
            <div className="flex items-start justify-between border-b border-slate-200/80 dark:border-zinc-800 pb-3 mb-3 shrink-0">
              <div>
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="text-xs font-extrabold px-2.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 uppercase tracking-wider">
                    {selectedFoodModal.category || 'Food Specification'}
                  </span>
                  {selectedFoodModal.isRecipe || selectedFoodModal.category?.toLowerCase().includes('recipe') ? (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300 flex items-center gap-1 border border-teal-200 dark:border-teal-800/50">
                      <Clock className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" /> Prep: {selectedFoodModal.prepTimeMins || 15} Mins
                    </span>
                  ) : null}
                  {selectedFoodModal.recipeIngredients && selectedFoodModal.recipeIngredients.length > 0 ? (
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-zinc-800 text-slate-700 dark:text-zinc-300 flex items-center gap-1 border border-slate-200 dark:border-zinc-700">
                      <ListChecks className="w-3.5 h-3.5" /> {selectedFoodModal.recipeIngredients.length} Ingredients
                    </span>
                  ) : null}
                </div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-zinc-50">{selectedFoodModal.name}</h2>
                <p className="text-xs text-slate-500 dark:text-zinc-400 mt-0.5">
                  {selectedFoodModal.isRecipe
                    ? 'Nutritional values shown are for the total recipe yield'
                    : 'Nutritional breakdown per 100g standard serving'}
                </p>
              </div>
              <button
                onClick={() => setSelectedFoodModal(null)}
                className="text-slate-400 dark:text-zinc-500 hover:text-slate-700 dark:hover:text-zinc-200 p-2 rounded-full hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* MODAL 2-COLUMN CONTENT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6 text-sm flex-1 min-h-0 overflow-y-auto md:overflow-hidden max-h-[70vh] mb-4">
              {/* LEFT COLUMN: MACROS & MICRONUTRIENTS */}
              <div className="flex flex-col justify-between space-y-3">
                <div className="grid grid-cols-4 gap-2.5 sm:gap-3">
                  {[
                    {
                      label: 'Calories',
                      val: (selectedFoodModal.caloriesPer100g ?? 0) > 0 ? `${selectedFoodModal.caloriesPer100g}` : '—',
                      bg: 'bg-amber-500/10 dark:bg-amber-950/40 border-amber-500/20 dark:border-amber-800/30',
                      lbl: 'text-amber-700 dark:text-amber-400',
                    },
                    {
                      label: 'Protein',
                      val: (selectedFoodModal.proteinPer100g ?? 0) > 0 ? `${selectedFoodModal.proteinPer100g}g` : '—',
                      bg: 'bg-cyan-500/10 dark:bg-cyan-950/40 border-cyan-500/20 dark:border-cyan-800/30',
                      lbl: 'text-cyan-700 dark:text-cyan-400',
                    },
                    {
                      label: 'Carbs',
                      val: (selectedFoodModal.carbsPer100g ?? 0) > 0 ? `${selectedFoodModal.carbsPer100g}g` : '—',
                      bg: 'bg-emerald-500/10 dark:bg-emerald-950/40 border-emerald-500/20 dark:border-emerald-800/30',
                      lbl: 'text-emerald-700 dark:text-emerald-400',
                    },
                    {
                      label: 'Fats',
                      val: (selectedFoodModal.fatPer100g ?? 0) > 0 ? `${selectedFoodModal.fatPer100g}g` : '—',
                      bg: 'bg-rose-500/10 dark:bg-rose-950/40 border-rose-500/20 dark:border-rose-800/30',
                      lbl: 'text-rose-700 dark:text-rose-400',
                    },
                  ].map(({ label, val, bg, lbl }) => (
                    <div key={label} className={`${bg} border p-3 sm:p-4 rounded-xl text-center`}>
                      <span className={`text-xs sm:text-sm ${lbl} font-semibold block`}>{label}</span>
                      <span className="text-lg sm:text-xl font-black text-slate-900 dark:text-zinc-100 font-mono">{val}</span>
                    </div>
                  ))}
                </div>

                {/* MICRONUTRIENT TABLE */}
                <div className="bg-slate-50 dark:bg-zinc-800/70 rounded-xl p-3.5 sm:p-4 border border-slate-200 dark:border-zinc-700/60 flex-1">
                  <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-zinc-100 mb-2 flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-500" /> Micronutrient &amp; Mineral Breakdown
                  </h4>
                  <div className="grid grid-cols-2 gap-x-5 gap-y-2 text-sm">
                    {[
                      {
                        label: 'Magnesium (Mg)',
                        val: (selectedFoodModal.magnesiumMg ?? 0) > 0 ? `${selectedFoodModal.magnesiumMg} mg` : 'Trace',
                        color: 'text-amber-600 dark:text-amber-400',
                      },
                      {
                        label: 'Calcium (Ca)',
                        val: (selectedFoodModal.calciumMg ?? 0) > 0 ? `${selectedFoodModal.calciumMg} mg` : 'N/A',
                        color: 'text-cyan-600 dark:text-cyan-400',
                      },
                      {
                        label: 'Iron (Fe)',
                        val: (selectedFoodModal.ironMg ?? 0) > 0 ? `${selectedFoodModal.ironMg} mg` : 'N/A',
                        color: 'text-slate-800 dark:text-zinc-200',
                      },
                      {
                        label: 'Potassium (K)',
                        val: (selectedFoodModal.potassiumMg ?? 0) > 0 ? `${selectedFoodModal.potassiumMg} mg` : 'N/A',
                        color: 'text-emerald-600 dark:text-emerald-400',
                      },
                      {
                        label: 'Sodium (Na)',
                        val: (selectedFoodModal.sodiumMg ?? 0) > 0 ? `${selectedFoodModal.sodiumMg} mg` : 'N/A',
                        color: 'text-rose-600 dark:text-rose-400',
                      },
                      {
                        label: 'Dietary Fiber',
                        val: (selectedFoodModal.fiberPer100g ?? 0) > 0 ? `${selectedFoodModal.fiberPer100g} g` : '0 g',
                        color: 'text-teal-700 dark:text-teal-400',
                      },
                    ].map(({ label, val, color }) => (
                      <div key={label} className="flex justify-between py-1 border-b border-slate-200/70 dark:border-zinc-700/50">
                        <span className="text-slate-600 dark:text-zinc-400 font-medium">{label}</span>
                        <span className={`font-mono font-bold ${color}`}>{val}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: INGREDIENTS & STEPS */}
              <div className="bg-gradient-to-br from-teal-50/90 dark:from-teal-950/25 via-emerald-50/50 dark:via-emerald-950/15 to-slate-50 dark:to-zinc-900 border border-teal-200 dark:border-teal-800/40 rounded-xl p-3.5 sm:p-4 flex flex-col space-y-3 min-h-0 max-h-[64vh] overflow-hidden">
                <div className="flex flex-col min-h-0">
                  <div className="flex items-center justify-between mb-1.5 pb-1 border-b border-teal-200/60 dark:border-teal-800/50 shrink-0">
                    <span className="text-xs text-teal-950 dark:text-teal-300 font-black uppercase tracking-wider flex items-center gap-1.5">
                      <Utensils className="w-4 h-4 text-teal-600 dark:text-teal-400" /> Ingredients &amp; Quantities
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300">
                      {selectedFoodModal.isRecipe ? 'Full Recipe' : 'Per 100g Serving'}
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 bg-white/90 dark:bg-zinc-800/80 border border-teal-100 dark:border-teal-800/30 rounded-lg p-3 max-h-[170px] overflow-y-auto pr-1">
                    {(selectedFoodModal.recipeIngredients && selectedFoodModal.recipeIngredients.length > 0
                      ? selectedFoodModal.recipeIngredients
                      : [
                          `150g ${selectedFoodModal.name}`,
                          '200ml Water / Milk',
                          '1/2 tsp Salt & Pepper',
                          '1 tbsp Olive Oil',
                          '1 tsp Garlic & Herbs',
                        ]
                    ).map((ing, idx) => (
                      <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-800 dark:text-zinc-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400 shrink-0 mt-0.5" />
                        <span className="font-medium leading-tight">{ing}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="flex-1 flex flex-col min-h-0">
                  <span className="text-xs text-teal-950 dark:text-teal-300 font-black uppercase tracking-wider block mb-1.5 shrink-0 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-600 dark:bg-emerald-500" /> Culinary Preparation Guide:
                  </span>
                  <div className="space-y-2.5 max-h-[250px] overflow-y-auto pr-1.5">
                    {(selectedFoodModal.recipeInstructions && selectedFoodModal.recipeInstructions.length > 0
                      ? selectedFoodModal.recipeInstructions
                      : [
                          `Measure 150g of ${selectedFoodModal.name} and prepare ingredients.`,
                          'Boil 300ml of water or heat 1 tbsp olive oil in a skillet over medium heat.',
                          'Add ingredients and cook for 8-12 minutes, stirring evenly.',
                          'Season with 1/2 tsp salt, pepper, and herbs, then serve warm.',
                        ]
                    ).map((step, idx) => {
                      const clean = step.replace(/^(\d+[\.\-\)]\s*|step\s*\d+:?\s*)/i, '').trim();
                      return (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 bg-white/90 dark:bg-zinc-800/80 border border-slate-200/80 dark:border-zinc-700/50 rounded-lg p-2 text-xs"
                        >
                          <span className="flex items-center justify-center w-5 h-5 rounded-full bg-teal-600 dark:bg-teal-700 text-white text-[10px] font-bold shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <p className="text-slate-800 dark:text-zinc-200 leading-snug font-normal">{clean}</p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            {/* MODAL FOOTER */}
            <button
              onClick={() => setSelectedFoodModal(null)}
              className="w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 dark:bg-emerald-700 dark:hover:bg-emerald-600 text-white font-bold transition-all text-sm shadow-xs shrink-0"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
