/**
 * API Configuration
 * Central configuration for all API calls
 */

// Base API URL - Proxy paths via next.config.mjs
import { getCookie } from '../cookie';
export const API_BASE_URL = '/proxy/main';
export const CHAT_API_BASE_URL = '/proxy/chat';
export const WORKOUT_API_BASE_URL = '/proxy/workout';

// API endpoints
export const API_ENDPOINTS = {
    // Authentication
    AUTH: {
        REGISTER_ORGANIZATION: '/api/auth/register-organization',
        LOGIN: '/api/auth/login',
        SEND_OTP: '/api/auth/send-otp',
        VERIFY_OTP: '/api/auth/verify-otp',
        RESEND_OTP: '/api/auth/resend-otp',
        FORGOT_PASSWORD: '/api/auth/forgot-password',
        GET_INVITE_DETAILS: '/api/public/invite-details',
        COMPLETE_REGISTRATION: '/api/auth/complete-registration',
        RESEND_INVITE: '/api/auth/resend-invite',
    },
    // Organizations
    ORGANIZATIONS: {
        BASE: '/api/organizations',
        BY_ID: (id) => `/api/organizations/${id}`,
    },
    // Branches
    BRANCHES: {
        BASE: '/api/branches',
        BY_ID: (id) => `/api/branches/${id}`,
        BY_ORGANIZATION: (orgId) => `/api/branches/organization/${orgId}`,
    },
    // Users
    USERS: {
        BASE: '/api/users',
        BY_ID: (id) => `/api/users/${id}`,
        BY_BRANCH: (branchId) => `/api/users/branch/${branchId}`,
        ONBOARDING: '/api/user/onboarding',
    },
    // Trainers
    TRAINERS: {
        BASE: '/api/trainers',
        BY_ID: (id) => `/api/trainers/${id}`,
        BY_BRANCH: (branchId) => `/api/trainers/branch/${branchId}`,
    },
    // Staff
    STAFF: {
        BASE: '/api/staff',
        BY_ID: (id) => `/api/staff/${id}`,
        BY_BRANCH: (branchId) => `/api/staff/branch/${branchId}`,
    },
    // Admins
    ADMINS: {
        BASE: '/api/admins',
        BY_ID: (id) => `/api/admins/${id}`,
        BY_BRANCH: (branchId) => `/api/admins/branch/${branchId}`,
    },
    // Premium Users
    PREMIUM_USERS: {
        BASE: '/api/premium-users',
        BY_ID: (id) => `/api/premium-users/${id}`,
        BY_BRANCH: (branchId) => `/api/premium-users/branch/${branchId}`,
    },
    // OTP
    OTP: {
        BY_ID: (id) => `/api/otps/${id}`,
    },
};

/**
 * Get authorization header with JWT token
 */
export const getAuthHeader = () => {
    if (typeof window === 'undefined') return {};

    // Try all possible token keys used in the app (prioritize accessToken from backend)
    const token = getCookie('accessToken') || getCookie('authToken') || getCookie('jwt') || getCookie('token');

    if (!token) {
        if (typeof window !== 'undefined') {
            console.warn("DEBUG: [getAuthHeader] No token found in any common cookie keys!");
        }
    } else {
        console.log(`DEBUG: [getAuthHeader] Token found (key fallback check, length: ${token.length})`);
    }

    return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Default headers for API requests
 */
export const getDefaultHeaders = () => ({
    'Content-Type': 'application/json',
    ...getAuthHeader(),
});
