import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { FoodItem } from '../../types';

export async function getFoods(): Promise<FoodItem[]> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/list`;
  const response = await fetchWithAuth(url);
  return response.data || [];
}

export async function searchFoods(query: string): Promise<FoodItem[]> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/user/food/search`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
  return response.data || [];
}
