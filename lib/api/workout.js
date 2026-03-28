import { apiGet, apiPost, apiPut, apiDelete, WORKOUT_API_BASE_URL } from './client';

export const updateWeeklyWorkoutPlan = async (userId, planData) => {
    return apiPost(`/api/workout/user-plan/${userId}/weekly`, planData, { baseUrl: WORKOUT_API_BASE_URL });
};

export const getWeeklyWorkoutPlan = async (userId) => {
    return apiGet(`/api/workout/user-plan/${userId}/weekly`, {}, { baseUrl: WORKOUT_API_BASE_URL });
};

export const assignDietPlan = async (userId, dietPlanData) => {
    return apiPost(`/api/workout/diet-plan/${userId}`, dietPlanData, { baseUrl: WORKOUT_API_BASE_URL });
};

export const getUserDietPlans = async (userId) => {
    return apiGet(`/api/workout/diet-plan/${userId}`, {}, { baseUrl: WORKOUT_API_BASE_URL });
};

export const deleteDietPlan = async (planId) => {
    return apiDelete(`/api/workout/diet-plan/${planId}`, { baseUrl: WORKOUT_API_BASE_URL });
};
// Assignment
export const assignWorkoutToUser = async (assignmentData) => {
    return apiPost('/api/workout/assign', assignmentData, { baseUrl: WORKOUT_API_BASE_URL });
};

export const getWorkoutAssignment = async (userId) => {
    return apiGet(`/api/workout/assignment/${userId}`, {}, { baseUrl: WORKOUT_API_BASE_URL });
};

// Exercises CRUD
export const getAllExercises = async (muscleGroup) => {
    const params = muscleGroup ? { muscleGroup } : {};
    return apiGet('/api/exercises', params, { baseUrl: WORKOUT_API_BASE_URL });
};

export const createExercise = async (exerciseData) => {
    return apiPost('/api/exercises', exerciseData, { baseUrl: WORKOUT_API_BASE_URL });
};

export const updateExercise = async (id, exerciseData) => {
    return apiPut(`/api/exercises/${id}`, exerciseData, { baseUrl: WORKOUT_API_BASE_URL });
};

export const deleteExercise = async (id) => {
    return apiDelete(`/api/exercises/${id}`, { baseUrl: WORKOUT_API_BASE_URL });
};

// Workouts CRUD (Templates/General)
export const getAllWorkouts = async (category) => {
    const params = category ? { category } : {};
    return apiGet('/api/user/workout/all', params, { baseUrl: WORKOUT_API_BASE_URL });
};

export const createWorkout = async (workoutData) => {
    return apiPost('/api/user/workout', workoutData, { baseUrl: WORKOUT_API_BASE_URL });
};

export const updateWorkout = async (id, workoutData) => {
    return apiPut(`/api/user/workout/${id}`, workoutData, { baseUrl: WORKOUT_API_BASE_URL });
};

export const deleteWorkout = async (id) => {
    return apiDelete(`/api/user/workout/${id}`, { baseUrl: WORKOUT_API_BASE_URL });
};
