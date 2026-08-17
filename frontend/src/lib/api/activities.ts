import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

const BASE_URL = `${API_CONFIG.WORKOUT_SERVICE_URL}/api/activities`;

export async function getActivities() {
  const response = await fetchWithAuth(BASE_URL);
  return response.data;
}

export async function getActivityById(id: string) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`);
  return response.data;
}

export async function createActivity(data: any) {
  const response = await fetchWithAuth(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function updateActivity(id: string, data: any) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
  return response.data;
}

export async function deleteActivity(id: string) {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'DELETE',
  });
  return response.data;
}
