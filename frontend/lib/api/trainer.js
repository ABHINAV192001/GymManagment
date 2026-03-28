import { apiPost, apiGet, apiPut } from './client';
import { WORKOUT_API_BASE_URL } from './config';

/**
 * Assign a diet plan to a member
 * @param {number} userId 
 * @param {Array} planItems 
 */
export const assignDietPlan = async (userId, planItems) => {
    return apiPost(`/api/diet-plan/assign/${userId}`, planItems);
};

/**
 * Get a user's diet plan
 * @param {number} userId 
 */
export const getUserDietPlan = async (userId) => {
    return apiGet(`/api/diet-plan/user/${userId}`);
};

/**
 * Assign a weekly workout plan to a member
 * @param {number} userId 
 * @param {Object} workoutPlan 
 */
export const assignWorkoutPlan = async (userId, workoutPlan) => {
    return apiPost(`/api/workout/user-plan/${userId}/weekly`, workoutPlan, { baseUrl: WORKOUT_API_BASE_URL });
};

/**
 * Get all available workouts
 */
export const getAllWorkouts = async () => {
    return apiGet('/api/user/workout/all', {}, { baseUrl: WORKOUT_API_BASE_URL });
};

/**
 * Submit a rating for a trainer
 * @param {number} trainerId 
 * @param {number} rating 
 * @param {string} comment 
 */
export const rateTrainer = async (trainerId, rating, comment) => {
    return apiPost(`/api/ratings/trainer/${trainerId}`, { rating, comment });
};
