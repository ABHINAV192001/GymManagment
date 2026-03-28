import { apiGet, apiPost, apiPut, apiDelete } from './index';

// Stats
export const getAdminStats = async () => {
    return await apiGet('/api/admin/dashboard/stats');
};

// Users
export const getAdminUsers = async () => {
    return await apiGet('/api/admin/dashboard/users');
};

export const createAdminUser = async (userData) => {
    return await apiPost('/api/admin/dashboard/users', userData);
};

export const updateAdminUser = async (id, userData) => {
    return await apiPut(`/api/admin/dashboard/users/${id}`, userData);
};

export const deleteAdminUser = async (id) => {
    return await apiDelete(`/api/admin/dashboard/users/${id}`);
};

// Staff & Trainers
export const getAdminStaff = async () => {
    return await apiGet('/api/admin/dashboard/staff');
};

export const createAdminStaff = async (staffData) => {
    return await apiPost('/api/admin/dashboard/staff', staffData);
};

export const updateAdminStaff = async (id, staffData) => {
    return await apiPut(`/api/admin/dashboard/staff/${id}`, staffData);
};

export const deleteAdminStaff = async (id) => {
    return await apiDelete(`/admin/dashboard/staff/${id}`);
};

export const updatePaymentStatus = async (id, type, status) => {
    // type: 'STAFF' or 'TRAINER'
    const endpoint = type === 'TRAINER' ? `/api/admin/dashboard/trainers/${id}/payment-status` : `/api/admin/dashboard/staff/${id}/payment-status`;
    return await apiPut(`${endpoint}?status=${status}`, {});
};

// Branches (for Org Admin)
export const getAdminBranches = async () => {
    return await apiGet('/api/admin/dashboard/branches');
};

export const resendBranchVerification = async (id) => {
    return await apiPost(`/api/admin/dashboard/branches/${id}/resend-verification`, {});
};

// Inventory
export const getAdminInventory = async () => {
    return await apiGet('/api/inventory');
};

export const addInventory = async (item) => {
    return await apiPost('/api/inventory', item);
};

export const updateInventory = async (id, item) => {
    return await apiPut(`/api/inventory/${id}`, item);
};

export const deleteInventory = async (id) => {
    return await apiDelete(`/api/inventory/${id}`);
};
