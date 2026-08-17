import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { Plan } from '../../types';

const BASE_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/plans`;

export async function getPlans(): Promise<Plan[]> {
  const response = await fetchWithAuth(BASE_URL);
  return response.data || [];
}

export async function createPlan(plan: Partial<Plan>): Promise<Plan> {
  const response = await fetchWithAuth(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(plan),
  });
  return response.data;
}

export async function updatePlan(id: string, plan: Partial<Plan>): Promise<Plan> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(plan),
  });
  return response.data;
}

export async function deletePlan(id: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/${id}`, { method: 'DELETE' });
}

export async function activatePlan(id: string): Promise<Plan> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/activate`, { method: 'PUT' });
  return response.data;
}

export async function getPlanSubscribers(id: string): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}/subscribers`);
  return response.data;
}

export async function getPlanStats(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/stats`);
  return response.data;
}
