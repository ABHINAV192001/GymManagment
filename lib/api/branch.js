
import { apiGet, apiPost, apiPut, apiDelete } from './client';
import { API_ENDPOINTS } from './config';

// Helper to construct dynamic endpoints if not already in config
// Note: Ideally these should be in config.js but for now we can construct them here or extend config.

// --- USERS ---

export const getUsers = async (branchId) => {
    // Determine endpoint based on role/context. Assuming Admin/Branch Admin.
    // backend.md says GET /api/admin/dashboard/users
    // But if it's branch specific, maybe filter?
    // Let's stick to the docs: /api/admin/dashboard/users
    // If we need to filter by branch, maybe query param?
    // The docs show GET /api/admin/dashboard/users returns a list.
    return apiGet('/api/admin/dashboard/users');
};

export const createUser = async (userData) => {
    return apiPost('/api/admin/dashboard/users', userData);
};

export const updateUser = async (id, userData) => {
    return apiPut(`/api/admin/dashboard/users/${id}`, userData);
};

export const deleteUser = async (id) => {
    return apiDelete(`/api/admin/dashboard/users/${id}`);
};


// --- STAFF ---

export const getStaff = async () => {
    return apiGet('/api/admin/dashboard/staff');
};

export const createStaff = async (staffData) => {
    return apiPost('/api/admin/dashboard/staff', staffData);
};

export const updateStaff = async (id, staffData) => {
    return apiPut(`/api/admin/dashboard/staff/${id}`, staffData);
};

export const deleteStaff = async (id) => {
    return apiDelete(`/api/admin/dashboard/staff/${id}`);
};

export const updateStaffPaymentStatus = async (id, status) => {
    return apiPut(`/api/admin/dashboard/staff/${id}/payment-status?status=${status}`, {});
};

// --- TRAINERS ---

export const getTrainers = async () => {
    // Note: backend's /api/admin/dashboard/staff returns both Staff and Trainers.
    // We use /staff as there is no trainers-only list endpoint yet.
    return apiGet('/api/admin/dashboard/staff');
};

export const createTrainer = async (trainerData) => {
    return apiPost('/api/admin/dashboard/trainers', trainerData);
};

export const updateTrainer = async (id, trainerData) => {
    return apiPut(`/api/admin/dashboard/trainers/${id}`, trainerData);
};

export const deleteTrainer = async (id) => {
    return apiDelete(`/api/admin/dashboard/trainers/${id}`);
};

export const updateTrainerPaymentStatus = async (id, status) => {
    return apiPut(`/api/admin/dashboard/trainers/${id}/payment-status?status=${status}`, {});
};


// --- INVENTORY ---

export const getInventory = async () => {
    return apiGet('/api/inventory');
};

export const createInventoryItem = async (itemData) => {
    return apiPost('/api/inventory', itemData);
};

export const updateInventoryItem = async (id, itemData) => {
    return apiPut(`/api/inventory/${id}`, itemData);
};

export const deleteInventoryItem = async (id) => {
    return apiDelete(`/api/inventory/${id}`);
};

// --- DASHBOARD ---

export const getDashboardStats = async () => {
    return apiGet('/api/admin/dashboard/stats');
};
