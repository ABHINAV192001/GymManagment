import { apiGet, apiPut, apiPatch } from './client';

/**
 * User Service
 * Standardized to use apiRequest for consistent auth and base URL handling
 */

export const getProfile = async () => {
    return await apiGet('/api/user/profile');
};

export const updateProfile = async (data) => {
    return await apiPut('/api/user/profile', data);
};

export const toggleUserStatus = async (isActive) => {
    return await apiPatch(`/api/user/status?isActive=${isActive}`, {});
};

export const getAttendanceHistory = async () => {
    return await apiGet('/api/user/attendance');
};

export const getSubscriptionHistory = async () => {
    return await apiGet('/api/user/subscription-history');
};

export const getDashboardStats = async (date = '') => {
    return await apiGet('/api/user/dashboard', date ? { date } : {});
};

export const getDailyLog = async (date = '') => {
    return await apiGet('/api/user/daily-log', date ? { date } : {});
};

export const getFoodsByPreference = async (preference) => {
    return await apiGet('/api/user/food/preference', { preference });
};

export const getLowCalorieRecipes = async () => {
    return await apiGet('/api/user/food/low-calorie');
};

export const getAssignedDiet = async (userId) => {
    // For now user views their own diet, so no ID needed for the endpoint typically if using JWT claims, 
    // but the backend controller I wrote expects /api/diet/user/{userId}.
    // However, for the user-facing page, we should ideally use /api/diet/my-plan or similar, 
    // but sticking to the plan: assuming the user knows their ID or we extract it from token in a new endpoint.
    // Let's use the profile ID matching.
    const profile = await getProfile();
    return await apiGet(`/api/diet/user/${profile.id}`);
};
