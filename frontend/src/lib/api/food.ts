import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { FoodItem } from '../../types';

export interface PaginatedResult<T> {
  items: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export function mapDtoToFoodItem(dto: any): FoodItem {
  if (!dto) return {} as FoodItem;

  // Extract nutrients array if present
  let proteinVal = dto.protein ?? 0;
  let carbsVal = dto.carbohydrates ?? 0;
  let fatVal = dto.fat ?? 0;
  let fiberVal = dto.fiber ?? 0;
  let magnesiumVal = dto.magnesium ?? 0;
  let calciumVal = dto.calcium ?? 0;
  let ironVal = dto.iron ?? 0;
  let potassiumVal = dto.potassium ?? 0;
  let sodiumVal = dto.sodium ?? 0;
  let vitaminCVal = dto.vitaminC ?? 0;
  let vitaminDVal = dto.vitaminD ?? 0;

  if (Array.isArray(dto.nutrients)) {
    dto.nutrients.forEach((n: any) => {
      const name = n.name?.toLowerCase();
      if (name?.includes('protein')) proteinVal = n.amount;
      if (name?.includes('carbohydrate')) carbsVal = n.amount;
      if (name?.includes('fat') && !name?.includes('saturated')) fatVal = n.amount;
      if (name?.includes('fiber')) fiberVal = n.amount;
      if (name?.includes('magnesium')) magnesiumVal = n.amount;
      if (name?.includes('calcium')) calciumVal = n.amount;
      if (name?.includes('iron')) ironVal = n.amount;
      if (name?.includes('potassium')) potassiumVal = n.amount;
      if (name?.includes('sodium')) sodiumVal = n.amount;
      if (name?.includes('vitamin c')) vitaminCVal = n.amount;
      if (name?.includes('vitamin d')) vitaminDVal = n.amount;
    });
  }

  return {
    id: dto.id || String(dto.fdcId || Math.random()),
    name: dto.description || dto.foodName || dto.name || 'Food Item',
    category: dto.foodCategory || dto.category || 'General',
    caloriesPer100g: dto.calories ?? 0,
    proteinPer100g: proteinVal,
    carbsPer100g: carbsVal,
    fatPer100g: fatVal,
    fiberPer100g: fiberVal,
    magnesiumMg: magnesiumVal,
    calciumMg: calciumVal,
    ironMg: ironVal,
    potassiumMg: potassiumVal,
    sodiumMg: sodiumVal,
    vitaminCMg: vitaminCVal,
    vitaminDIu: vitaminDVal,
    unit: dto.unit || 'g',
    defaultServingGrams: dto.defaultServingGrams || 100,
    isRecipe: Boolean(dto.isRecipe || dto.recipe || dto.foodCategory === 'Recipes' || dto.category === 'Recipes'),
    recipeIngredients: (() => {
      if (Array.isArray(dto.recipeIngredients) && dto.recipeIngredients.length > 0) {
        return dto.recipeIngredients;
      }
      if (typeof dto.recipeIngredients === 'string' && dto.recipeIngredients.trim()) {
        return dto.recipeIngredients.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
      if (dto.keyIngredients) {
        return typeof dto.keyIngredients === 'string'
          ? dto.keyIngredients.split('\n').map((s: string) => s.trim()).filter(Boolean)
          : [dto.keyIngredients];
      }
      if (dto.isRecipe) {
        const title = dto.description || dto.foodName || dto.name || 'Recipe';
        return [
          `150g ${title}`,
          '200ml Fresh Water / Milk (for boiling/mixing)',
          '1/2 tsp Sea Salt & Black Pepper',
          '1 tbsp Extra Virgin Olive Oil',
          '1 tsp Mixed Herb Seasoning / Garlic'
        ];
      }
      return [];
    })(),
    recipeInstructions: (() => {
      if (Array.isArray(dto.recipeInstructions) && dto.recipeInstructions.length > 0) {
        return dto.recipeInstructions;
      }
      if (typeof dto.recipeInstructions === 'string' && dto.recipeInstructions.trim()) {
        return dto.recipeInstructions.split('\n').map((s: string) => s.trim()).filter(Boolean);
      }
      if (dto.isRecipe) {
        const title = dto.description || dto.foodName || dto.name || 'Recipe';
        return [
          `Prepare and measure 150g of ${title}.`,
          'Boil 300ml of water or heat 1 tbsp olive oil in a skillet over medium heat for 3-5 minutes.',
          'Add ingredients to pan/pot and cook for 8-12 minutes, stirring evenly.',
          'Season with 1/2 tsp salt, black pepper, and herbs to taste.',
          'Plate and serve warm immediately.'
        ];
      }
      return [];
    })(),
    prepTimeMins: dto.cookingTime || 15,
    tags: dto.dietaryFlags || [],
  };
}

export async function getFoods(page = 0, size = 24): Promise<PaginatedResult<FoodItem>> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/list?page=${page}&size=${size}`;
  const response = await fetchWithAuth(url);
  const data = response.data || [];
  const meta = response.pagination || {};

  return {
    items: Array.isArray(data) ? data.map(mapDtoToFoodItem) : [],
    page: meta.page ?? page,
    size: meta.size ?? size,
    totalElements: meta.totalElements ?? (Array.isArray(data) ? data.length : 0),
    totalPages: meta.totalPages ?? 1,
    hasNext: meta.hasNext ?? false,
    hasPrev: meta.hasPrev ?? false,
  };
}

export async function searchFoods(query: string, page = 0, size = 24): Promise<PaginatedResult<FoodItem>> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/search?page=${page}&size=${size}`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  const data = response.data || [];
  const meta = response.pagination || {};

  return {
    items: Array.isArray(data) ? data.map(mapDtoToFoodItem) : [],
    page: meta.page ?? page,
    size: meta.size ?? size,
    totalElements: meta.totalElements ?? (Array.isArray(data) ? data.length : 0),
    totalPages: meta.totalPages ?? 1,
    hasNext: meta.hasNext ?? false,
    hasPrev: meta.hasPrev ?? false,
  };
}

export async function getLowCalorieRecipes(): Promise<FoodItem[]> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/low-calorie`;
  const response = await fetchWithAuth(url);
  const data = response.data || [];
  return Array.isArray(data) ? data.map(mapDtoToFoodItem) : [];
}

export async function getFoodsByPreference(preference: string): Promise<FoodItem[]> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/preference?preference=${encodeURIComponent(preference)}`;
  const response = await fetchWithAuth(url);
  const data = response.data || [];
  return Array.isArray(data) ? data.map(mapDtoToFoodItem) : [];
}

export async function getFoodsByFilter(preset: string, page = 0, size = 24): Promise<PaginatedResult<FoodItem>> {
  return filterFoods({ preset, page, size });
}

export interface FoodFilterParams {
  query?: string;
  name?: string;
  category?: string;
  preset?: string;
  isRecipe?: boolean;
  page?: number;
  size?: number;
}

export async function filterFoods(params: FoodFilterParams = {}): Promise<PaginatedResult<FoodItem>> {
  const { query, name, category, preset, isRecipe, page = 0, size = 24 } = params;
  const searchParams = new URLSearchParams();
  if (query) searchParams.set('query', query);
  if (name) searchParams.set('name', name);
  if (category) searchParams.set('category', category);
  if (preset) searchParams.set('preset', preset);
  if (isRecipe !== undefined) searchParams.set('isRecipe', String(isRecipe));
  searchParams.set('page', String(page));
  searchParams.set('size', String(size));

  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/filter?${searchParams.toString()}`;
  const response = await fetchWithAuth(url);
  const data = response.data || [];
  const meta = response.pagination || {};

  return {
    items: Array.isArray(data) ? data.map(mapDtoToFoodItem) : [],
    page: meta.page ?? page,
    size: meta.size ?? size,
    totalElements: meta.totalElements ?? (Array.isArray(data) ? data.length : 0),
    totalPages: meta.totalPages ?? 1,
    hasNext: meta.hasNext ?? false,
    hasPrev: meta.hasPrev ?? false,
  };
}

export async function getFoodDetails(id: string): Promise<FoodItem | null> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/${id}`;
  try {
    const response = await fetchWithAuth(url);
    if (response.data) {
      return mapDtoToFoodItem(response.data);
    }
    return null;
  } catch (err) {
    console.error('Failed to get food details:', err);
    return null;
  }
}

