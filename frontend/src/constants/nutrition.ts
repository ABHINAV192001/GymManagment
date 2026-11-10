/**
 * Nutrition / food-catalogue constants.
 *
 * Values here are shared by the food logging UI and are intentionally kept out
 * of components so pagination sizes, debounce delays and catalogue presets are
 * declared exactly once.
 */

/** Rows requested per page. Mobile screens get a smaller first page. */
export const FOOD_LOG_PAGE_SIZE = {
  mobile: 30,
  desktop: 50,
} as const;

/** Media query that decides which page size / scroll strategy applies. */
export const FOOD_LOG_MOBILE_QUERY = '(max-width: 767px)';

/** Delay applied to catalogue search input before it hits the API. */
export const FOOD_SEARCH_DEBOUNCE_MS = 300;

/** Backend preset identifiers understood by `/api/user/food/filter`. */
export const FOOD_PRESET = {
  all: 'FOOD_ALL',
  highProtein: 'FOOD_HIGH_PROTEIN',
  recipes: 'RECIPES',
} as const;

/** Nutrient thresholds (per 100 g) used for client-side preset refinement. */
export const FOOD_NUTRIENT_THRESHOLD = {
  highProteinMinGrams: 15,
  lowCarbMaxGrams: 5,
  ketoMinFatGrams: 10,
} as const;

/** Category keywords excluded by the vegetarian refinement. */
export const NON_VEGETARIAN_CATEGORY_KEYWORDS = [
  'meat',
  'poultry',
  'seafood',
] as const;

export type FoodCategoryFilterId =
  | 'all'
  | 'high-protein'
  | 'low-carb'
  | 'keto'
  | 'vegetarian'
  | 'recipes';

/** Minimal shape needed to evaluate a catalogue filter. */
export interface FoodFilterCandidate {
  protein?: number;
  carbohydrates?: number;
  carbs?: number;
  fat?: number;
  category?: string;
  foodCategory?: string;
  isRecipe?: boolean;
}

export interface FoodCategoryFilter {
  id: FoodCategoryFilterId;
  label: string;
  /**
   * Backend preset sent with the request. Omitted when the catalogue has no
   * exact server-side equivalent, in which case `matches` refines the page.
   */
  preset?: string;
  /** Client-side refinement, evaluated per page after the response arrives. */
  matches: (food: FoodFilterCandidate) => boolean;
}

const readCarbs = (food: FoodFilterCandidate): number =>
  food.carbohydrates ?? food.carbs ?? 0;

const readCategory = (food: FoodFilterCandidate): string =>
  (food.foodCategory ?? food.category ?? '').toLowerCase();

export const FOOD_CATEGORY_FILTERS: readonly FoodCategoryFilter[] = [
  {
    id: 'all',
    label: 'All',
    preset: FOOD_PRESET.all,
    matches: () => true,
  },
  {
    id: 'high-protein',
    label: 'High Protein',
    preset: FOOD_PRESET.highProtein,
    matches: (food) =>
      (food.protein ?? 0) >= FOOD_NUTRIENT_THRESHOLD.highProteinMinGrams,
  },
  {
    id: 'low-carb',
    label: 'Low Carb',
    matches: (food) =>
      readCarbs(food) <= FOOD_NUTRIENT_THRESHOLD.lowCarbMaxGrams,
  },
  {
    id: 'keto',
    label: 'Keto',
    matches: (food) =>
      (food.fat ?? 0) >= FOOD_NUTRIENT_THRESHOLD.ketoMinFatGrams &&
      readCarbs(food) <= FOOD_NUTRIENT_THRESHOLD.lowCarbMaxGrams,
  },
  {
    id: 'vegetarian',
    label: 'Vegetarian',
    matches: (food) => {
      const category = readCategory(food);
      return !NON_VEGETARIAN_CATEGORY_KEYWORDS.some((keyword) =>
        category.includes(keyword),
      );
    },
  },
  {
    id: 'recipes',
    label: 'Recipes',
    preset: FOOD_PRESET.recipes,
    matches: (food) =>
      Boolean(food.isRecipe) || readCategory(food).includes('recipe'),
  },
];

export const DEFAULT_FOOD_CATEGORY_FILTER_ID: FoodCategoryFilterId = 'all';

/** Resolves a filter id, falling back to the unfiltered catalogue. */
export function getFoodCategoryFilter(
  id: FoodCategoryFilterId,
): FoodCategoryFilter {
  return (
    FOOD_CATEGORY_FILTERS.find((filter) => filter.id === id) ??
    FOOD_CATEGORY_FILTERS[0]
  );
}

/** Applies a filter's client-side refinement to a catalogue row. */
export function matchesFoodFilter(
  food: FoodFilterCandidate,
  filter: FoodCategoryFilter,
): boolean {
  return filter.matches(food);
}
