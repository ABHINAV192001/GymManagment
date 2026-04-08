import { API_ENDPOINTS } from './config';
import { apiPost, apiGet } from './client';
import { setCookie, removeCookie, getCookie } from '../cookie';

/**
 * Authentication Service
 * Handles all authentication-related API calls
 */

/**
 * Register a new organization with branches
 * 
 * Creates the Organization entity, an Organization Admin (ORG_ADMIN) user,
 * Branch entities (if provided), and Branch Admin (BRANCH_ADMIN) users for each branch.
 * 
 * Generates usernames automatically:
 * - Organization Username: First 4 letters of name + 4 random digits (e.g., "GymB1234")
 * - User Username: First name + 4 random digits (e.g., "John5678")
 * 
 * @param {Object} data - Registration data
 * @param {string} data.name - Organization name (can also be sent as orgName)
 * @param {string} data.ownerEmail - Email address of the organization owner (used for ORG_ADMIN login)
 * @param {string} data.phone - Contact number for the organization
 * @param {string} data.password - Password for the organization owner account
 * @param {Array} [data.branches] - Optional array of initial branches to create
 * @param {string} data.branches[].name - Name of the branch
 * @param {string} data.branches[].adminEmail - Email address for the branch admin
 * @param {string} data.branches[].password - Password for the branch admin account
 * 
 * @returns {Promise<Object>} Response object
 * @returns {string} return.token - JWT authentication token (Bearer token)
 * @returns {string} return.role - Role of the authenticated user (usually ORG_ADMIN)
 * @returns {string} return.organizationId - UUID of the created organization
 * @returns {string|null} return.branchId - ID of the branch (null for Organization Admin)
 * 
 * @throws {APIError} 400 - Validation errors (e.g., invalid email, missing fields)
 * @throws {APIError} 500 - Server-side processing error
 */
export const registerOrganization = async (data) => {
    try {
        const response = await apiPost(API_ENDPOINTS.AUTH.REGISTER_ORGANIZATION, data, { skipAuth: true });

        // Store the token in cookies (Session Cookies - no expiry)
        if (response.token) {
            setCookie('accessToken', response.token, null);
            setCookie('userRole', response.role, null);
            setCookie('isLoggedIn', 'true', null);
            if (response.branchId) {
                setCookie('branchId', response.branchId, null);
            }
            // Mark session as active in this tab
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('received_session', 'true');
            }
        }

        return response;
    } catch (error) {
        console.error('Registration error:', error);
        throw error;
    }
};

/**
 * Login with email/username and password
 * @param {Object} credentials - Login credentials
 * @param {string} credentials.identifier - Email or username
 * @param {string} credentials.password - Password
 * @returns {Promise<Object>} Response with token, role, organizationId, branchId
 */
export const login = async (credentials) => {
    try {
        const response = await apiPost(API_ENDPOINTS.AUTH.LOGIN, credentials, { skipAuth: true });

        // Store the token and user info in cookies (Session Cookies - no expiry)
        if (response.token) {
            setCookie('accessToken', response.token, null);
            setCookie('userRole', response.role, null);
            setCookie('isLoggedIn', 'true', null);
            if (response.branchId) {
                setCookie('branchId', response.branchId, null);
            }
            // Mark session as active in this tab
            if (typeof window !== 'undefined') {
                sessionStorage.setItem('received_session', 'true');
            }
        }

        return response;
    } catch (error) {
        console.error('Login error:', error);
        throw error;
    }
};

/**
 * Send OTP to email or phone
 * @param {Object} data - OTP request data
 * @param {string} [data.email] - Email address
 * @param {string} [data.phone] - Phone number
 * @param {string} data.otpType - Type of OTP (e.g., 'register_org')
 * @returns {Promise<Object>} Response with message, otpId, expiresAt
 */
export const sendOTP = async (data) => {
    try {
        const response = await apiPost(API_ENDPOINTS.AUTH.SEND_OTP, data, { skipAuth: true });
        return response;
    } catch (error) {
        console.error('Send OTP error:', error);
        throw error;
    }
};

/**
 * Verify OTP code
 * @param {Object} data - OTP verification data
 * @param {string} data.organizationId - Organization ID
 * @param {string} data.otpCode - OTP code received
 * @returns {Promise<Object>} Response with verified status and message
 */
export const verifyOTP = async (data) => {
    try {
        // Using Query Params: ?organizationId=...&OTP=...
        const url = `${API_ENDPOINTS.AUTH.VERIFY_OTP}?organizationId=${data.organizationId}&OTP=${data.otpCode}`;
        const response = await apiPost(url, {}, { skipAuth: true }); // Send empty body
        return response;
    } catch (error) {
        console.error('Verify OTP error:', error);
        throw error;
    }
};

/**
 * Verify account via email and OTP (generic)
 * @param {string} email 
 * @param {string} otp 
 */
export const verifyAccount = async (email, otp) => {
    try {
        const url = `/api/auth/verify-account?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`;
        return await apiPost(url, {}, { skipAuth: true });
    } catch (error) {
        console.error('Verify Account error:', error);
        throw error;
    }
};

/**
 * Resend OTP code
 * @param {Object} data - Resend OTP data
 * @param {string} data.organizationId - Organization ID
 * @returns {Promise<Object>} Response
 */
export const resendOTP = async (data) => {
    try {
        // Using Query Params: ?organizationId=...
        const url = `${API_ENDPOINTS.AUTH.RESEND_OTP}?organizationId=${data.organizationId}`;
        const response = await apiPost(url, {}, { skipAuth: true }); // Send empty body
        return response;
    } catch (error) {
        console.error('Resend OTP error:', error);
        throw error;
    }
};

/**
 * Request password reset
 * @param {Object} data - Password reset request data
 * @param {string} data.email - Email address
 * @returns {Promise<Object>} Response with message
 */
export const forgotPassword = async (data) => {
    try {
        const response = await apiPost(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, data, { skipAuth: true });
        return response;
    } catch (error) {
        console.error('Forgot password error:', error);
        throw error;
    }
};

/**
 * Logout user - clears local storage
 */
export const logout = () => {
    removeCookie('accessToken');
    removeCookie('authToken'); // Clear old one too
    removeCookie('userRole');
    removeCookie('isLoggedIn');
    removeCookie('organizationId');
    removeCookie('branchId');
    if (typeof window !== 'undefined') {
        sessionStorage.removeItem('received_session');
    }
};

/**
 * Check if user is authenticated
 * @returns {boolean} True if user has a valid token
 */
export const isAuthenticated = () => {
    if (typeof window === 'undefined') return false;
    // Check for either the client-side "isLoggedIn" hint OR the actual tokens.
    // This provides robustness against both HttpOnly restrictions and session transitions.
    const hasToken = !!(getCookie('accessToken') || getCookie('authToken'));
    const hasHint = getCookie('isLoggedIn') === 'true';
    
    return hasToken || hasHint;
};

/**
 * Get current user info from localStorage
 * @returns {Object|null} User info or null
 */
export const getCurrentUser = () => {
    if (typeof window === 'undefined') return null;

    const tokenHint = getCookie('isLoggedIn') === 'true';
    const token = getCookie('accessToken') || getCookie('authToken');
    
    // We only return null if the hint is missing AND the token is missing.
    // If the hint is true, we assume authentication is active (token might be HttpOnly).
    if (!tokenHint && !token) return null;

    return {
        token,
        role: getCookie('userRole'),
        organizationId: getCookie('organizationId'),
        branchId: getCookie('branchId'),
    };
};

/**
 * Fetch Invite Details (Public)
 */
export const getInviteDetails = async (userCode, adminCode, role) => {
    try {
        // Query Params: ?userCode=...&adminCode=...&role=...
        const url = `${API_ENDPOINTS.AUTH.GET_INVITE_DETAILS}?userCode=${userCode}&adminCode=${adminCode}&role=${role || 'USER'}`;
        return await apiGet(url);
    } catch (error) {
        console.error('Fetch Invite Details error:', error);
        throw error;
    }
};

/**
 * Complete Registration (Set Password)
 */
export const completeRegistration = async (data) => {
    try {
        const response = await apiPost(API_ENDPOINTS.AUTH.COMPLETE_REGISTRATION, data, { skipAuth: true });
        return response;
    } catch (error) {
        console.error('Complete Registration error:', error);
        throw error;
    }
};

/**
 * Resend Invite Email
 */
export const resendInvite = async (userCode, role) => {
    try {
        const response = await apiPost(API_ENDPOINTS.AUTH.RESEND_INVITE, { userCode, role }, { skipAuth: true });
        return response;
    } catch (error) {
        console.error('Resend Invite error:', error);
        throw error;
    }
};
