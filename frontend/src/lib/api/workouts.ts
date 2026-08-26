import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { WorkoutPlan, Exercise } from '../../types';

const BASE_URL = `${API_CONFIG.WORKOUT_SERVICE_URL}/api/workout`;
const EXERCISES_URL = `${API_CONFIG.WORKOUT_SERVICE_URL}/api/exercises`;

export async function getWorkouts(): Promise<WorkoutPlan[]> {
  const response = await fetchWithAuth(BASE_URL);
  return response.data || [];
}

export async function getMySplits(): Promise<WorkoutPlan[]> {
  const response = await fetchWithAuth(`${BASE_URL}/my-splits`);
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

export async function getUserWorkoutPlan(userId: string): Promise<string[]> {
  try {
    const response = await fetchWithAuth(`${API_CONFIG.WORKOUT_SERVICE_URL}/api/workout/user-plan/${userId}`);
    return response.data || [];
  } catch (err) {
    console.warn('Error fetching user workout plan:', err);
    return [];
  }
}

export async function updateUserWorkoutPlan(userId: string, workoutPlan: string[]): Promise<void> {
  await fetchWithAuth(`${API_CONFIG.WORKOUT_SERVICE_URL}/api/workout/user-plan/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(workoutPlan),
  });
}

export async function searchWorkouts(query: string, page = 0, size = 20): Promise<WorkoutPlan[]> {
  const url = `${BASE_URL}/search?query=${encodeURIComponent(query || '')}&page=${page}&size=${size}`;
  const response = await fetchWithAuth(url);
  return response.data?.content || (Array.isArray(response.data) ? response.data : []);
}

export async function getExercises(muscleGroup?: string, search?: string): Promise<Exercise[]> {
  const params = new URLSearchParams();
  if (muscleGroup && muscleGroup !== 'ALL') params.set('muscleGroup', muscleGroup);
  if (search && search.trim()) params.set('search', search.trim());
  const queryString = params.toString();
  const url = queryString ? `${EXERCISES_URL}?${queryString}` : EXERCISES_URL;
  const response = await fetchWithAuth(url);
  return response.data || [];
}

export async function getExerciseById(id: string): Promise<Exercise | null> {
  if (!id) return null;
  try {
    const response = await fetchWithAuth(`${EXERCISES_URL}/${id}`);
    return response.data || null;
  } catch (err) {
    console.warn(`Error fetching exercise detail for ${id}:`, err);
    return null;
  }
}
