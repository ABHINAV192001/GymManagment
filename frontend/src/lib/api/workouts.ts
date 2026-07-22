import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { WorkoutPlan, Exercise } from '../../types';

const BASE_URL = `${API_CONFIG.WORKOUT_SERVICE_URL}/api/workout`;
const EXERCISES_URL = `${API_CONFIG.WORKOUT_SERVICE_URL}/api/exercises`;

export async function getWorkouts(): Promise<WorkoutPlan[]> {
  const response = await fetchWithAuth(BASE_URL);
  return response.data || [];
}

export async function createWorkout(workout: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
  const response = await fetchWithAuth(BASE_URL, {
    method: 'POST',
    body: JSON.stringify(workout),
  });
  return response.data;
}

export async function updateWorkout(id: string, workout: Partial<WorkoutPlan>): Promise<WorkoutPlan> {
  const response = await fetchWithAuth(`${BASE_URL}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(workout),
  });
  return response.data;
}

export async function deleteWorkout(id: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/${id}`, { method: 'DELETE' });
}

export async function getExercises(): Promise<Exercise[]> {
  const response = await fetchWithAuth(EXERCISES_URL);
  return response.data || [];
}
