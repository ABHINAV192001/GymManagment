import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { DietPlan, FoodItem } from '../../types';

const BASE_URL = `${API_CONFIG.WORKOUT_SERVICE_URL}/api/workout/diet-plan`;
const FOOD_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food`;

export async function getDietPlans(): Promise<DietPlan[]> {
  const response = await fetchWithAuth(BASE_URL);
  return response.data || [];
}

export async function createDietPlan(plan: Partial<DietPlan>): Promise<DietPlan> {
  const response = await fetchWithAuth(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(plan),
  });
  return response.data;
}

export async function updateDietPlan(id: string, plan: Partial<DietPlan>): Promise<DietPlan> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plan),
  });
  return response.data;
}

export async function deleteDietPlan(id: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/${id}`, { method: 'DELETE' });
}

export async function getFoods(): Promise<FoodItem[]> {
  const response = await fetchWithAuth(FOOD_URL);
  return response.data || [];
}
