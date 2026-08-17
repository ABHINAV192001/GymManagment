import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

export const getUserDashboard = async (date?: string) => {
  const url = new URL(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/dashboard`);
  if (date) url.searchParams.append('date', date);
  const response = await fetchWithAuth(url.toString());
  return response.data || response;
};

export const logWater = async (amount: number, date?: string) => {
  const payload = { amount, date: date || new Date().toISOString().split('T')[0] };
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/water/log`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data || response;
};

export const getDailyLog = async (date?: string) => {
  const url = new URL(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/daily-log`);
  if (date) url.searchParams.append('date', date);
  const response = await fetchWithAuth(url.toString());
  return response.data || response;
};

export const getRecipes = async () => {
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/recipes?page=0&size=10`);
  return response.data || response;
};

export interface LogFoodPayload {
  foodId?: string | number;
  foodName?: string;
  quantity?: number;
  mealType?: string;
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  servingUnit?: string;
  customGrams?: number;
  date?: string;
}

export const logFoodItem = async (
  foodIdOrPayload: string | number | LogFoodPayload,
  quantity: number = 1.0,
  mealType: string = 'Lunch',
  date?: string
) => {
  let payload: any;
  if (typeof foodIdOrPayload === 'object' && foodIdOrPayload !== null) {
    payload = {
      foodId: String(foodIdOrPayload.foodId || ''),
      foodName: foodIdOrPayload.foodName,
      quantity: foodIdOrPayload.quantity ?? 1.0,
      mealType: foodIdOrPayload.mealType || 'Lunch',
      calories: foodIdOrPayload.calories,
      protein: foodIdOrPayload.protein,
      carbohydrates: foodIdOrPayload.carbs,
      fat: foodIdOrPayload.fat,
      servingUnit: foodIdOrPayload.servingUnit,
      date: foodIdOrPayload.date || new Date().toISOString().split('T')[0]
    };
  } else {
    payload = {
      foodId: String(foodIdOrPayload),
      quantity,
      mealType,
      date: date || new Date().toISOString().split('T')[0]
    };
  }

  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/log`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return response.data || response;
};

export const deleteFoodLog = async (id: string) => {
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/log/${id}`, {
    method: 'DELETE',
  });
  return response.data || response;
};

export const searchFoodsList = async (query: string) => {
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/search`, {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return response.data || response;
};

export const filterFoodsList = async (params: { query?: string; name?: string; category?: string; preset?: string; isRecipe?: boolean; page?: number; size?: number } = {}) => {
  const searchParams = new URLSearchParams();
  if (params.query) searchParams.set('query', params.query);
  if (params.name) searchParams.set('name', params.name);
  if (params.category) searchParams.set('category', params.category);
  if (params.preset) searchParams.set('preset', params.preset);
  if (params.isRecipe !== undefined) searchParams.set('isRecipe', String(params.isRecipe));
  searchParams.set('page', String(params.page ?? 0));
  searchParams.set('size', String(params.size ?? 20));

  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/filter?${searchParams.toString()}`);
  return response.data || response;
};

export const getAllFoodsList = async () => {
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/list?page=0&size=20`);
  return response.data || response;
};

export const submitOnboardingApi = async (data: {
  age: number;
  gender: string;
  height: number;
  weight: number;
  activityLevel: string;
  goal: string;
}) => {
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/onboarding`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data || response;
};

export const getUserProfile = async () => {
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/profile`);
  return response.data || response;
};

export interface NotificationBundle {
  enabled: boolean;
  recipientEmail: string;
  workoutReminder: {
    enabled: boolean;
    preferredTime: string;
    splitFocus: string;
    includeWarmup: boolean;
    includeMotivation: boolean;
    targetExercises?: string[];
  };
  dietReminder: {
    enabled: boolean;
    breakfastTime: string;
    lunchTime: string;
    snackTime: string;
    dinnerTime: string;
    dailyCalorieTarget: number;
    proteinTargetGrams: number;
    carbsTargetGrams: number;
    fatTargetGrams: number;
    suggestMealIdeas: boolean;
    dietPlanName?: string;
  };
  waterReminder: {
    enabled: boolean;
    intervalHours: number;
    startTime: string;
    endTime: string;
    dailyTargetLiters: number;
    currentLoggedLiters: number;
    percentageCompleted: number;
    alertIfBelowTarget: boolean;
  };
  walkReminder: {
    enabled: boolean;
    intervalHours: number;
    walkTime: string;
    dailyStepTarget: number;
    reminderType: string;
  };
}

export const getNotificationBundle = async (): Promise<NotificationBundle> => {
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/notification-bundle`);
  return response.data || response;
};

export const saveNotificationBundle = async (dto: NotificationBundle): Promise<NotificationBundle> => {
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/notification-bundle`, {
    method: 'PUT',
    body: JSON.stringify(dto),
  });
  return response.data || response;
};

export const sendNotificationBundleEmail = async (dto: NotificationBundle): Promise<{ message: string }> => {
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/notification-bundle/send-email`, {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  return response.data || response;
};

