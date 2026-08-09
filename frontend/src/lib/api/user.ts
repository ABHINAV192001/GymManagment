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

export const logFoodItem = async (foodId: string, quantity: number = 1.0, mealType: string = 'Lunch', date?: string) => {
  const payload = {
    foodId,
    quantity,
    mealType,
    date: date || new Date().toISOString().split('T')[0]
  };
  const response = await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/log`, {
    method: 'POST',
    body: JSON.stringify(payload),
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
