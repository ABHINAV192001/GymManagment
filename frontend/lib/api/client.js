import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders, WORKOUT_API_BASE_URL } from './config';
import { removeCookie, getCookie, setCookie } from '../cookie';

export { WORKOUT_API_BASE_URL };

/**
 * Custom error class for API errors
 */
export class APIError extends Error {
    constructor(message, status, errors = null) {
        super(message);
        this.name = 'APIError';
        this.status = status;
        this.errors = errors;
    }
}

/**
 * Internal helper to wait for the authentication token to propagate to cookies
 */
const waitForToken = async (timeoutMs = 1000) => {
    if (typeof window === 'undefined') return false;
    const startTime = Date.now();
    while (Date.now() - startTime < timeoutMs) {
        const token = getCookie('accessToken') || getCookie('authToken') || getCookie('isLoggedIn') === 'true';
        if (token) return true;
        await new Promise(resolve => setTimeout(resolve, 100));
    }
    return false;
};

/**
 * Base API request handler with error handling
 */
export const apiRequest = async (endpoint, options = {}) => {
    const baseUrl = options.baseUrl || API_BASE_URL;
    const url = `${baseUrl}${endpoint}`;

    // --- AUTH CONTEXT ---
    const isPublic = endpoint.startsWith('/api/auth/') || endpoint.startsWith('/api/public/');
    const hasToken = typeof window !== 'undefined' && 
        (getCookie('accessToken') || getCookie('authToken') || getCookie('isLoggedIn') === 'true');

    // --- INTERNAL AUTH SYNC ---
    if (typeof window !== 'undefined' && !isPublic && !hasToken && !options.skipAuth) {
        // We wait briefly for a possible cookie sync, but we NEVER block the request.
        // If it's HttpOnly, the browser will handle it; if it's truly missing, the server will 401.
        await waitForToken(500);
    }

    const config = {
        credentials: options.skipAuth ? 'same-origin' : 'include',
        ...options,
        headers: {
            ...(options.skipAuth ? { 'Content-Type': 'application/json' } : getDefaultHeaders()),
            ...(options.headers || {}),
        },
    };

    try {
        console.log(`DEBUG: [apiRequest] Fetching ${config.method || 'GET'} to ${url}`);
        const response = await fetch(url, config);

        if (response.status === 204) {
            return null;
        }

        const responseText = await response.text();
        let data = null;
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                if (!response.ok) {
                    throw new APIError(`Server returned ${response.status}: ${responseText.substring(0, 100)}`, response.status, null);
                }
                data = { message: responseText };
            }
        }

        if (!response.ok) {
            if (response.status === 401) {
                if (typeof window !== 'undefined' && baseUrl === API_BASE_URL && !isPublic && !options.skipAuthRedirect) {
                    console.warn("DEBUG: [apiRequest] Unauthorized! Redirecting to login.");
                    removeCookie('accessToken');
                    removeCookie('authToken');
                    removeCookie('isLoggedIn');
                    window.location.href = '/auth/login';
                }
            }
            throw new APIError(data?.message || data?.error || `HTTP ${response.status}`, response.status, data?.errors || null);
        }

        // --- SESSION SYNC ---
        if (response.ok && !isPublic && typeof window !== 'undefined') {
            setCookie('isLoggedIn', 'true', null);
        }

        return data;
    } catch (error) {
        if (error instanceof APIError) throw error;
        throw new APIError(error.message || 'Network error occurred', 0, null);
    }
};

/**
 * Helpers
 */
export const apiGet = (endpoint, params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;
    return apiRequest(url, { method: 'GET', ...options });
};

export const apiPost = (endpoint, body, options = {}) => {
    return apiRequest(endpoint, { method: 'POST', body: JSON.stringify(body), ...options });
};

export const apiPut = (endpoint, body, options = {}) => {
    return apiRequest(endpoint, { method: 'PUT', body: JSON.stringify(body), ...options });
};

export const apiPatch = (endpoint, body, options = {}) => {
    return apiRequest(endpoint, { method: 'PATCH', body: JSON.stringify(body), ...options });
};

export const apiDelete = (endpoint, options = {}) => {
    return apiRequest(endpoint, { method: 'DELETE', ...options });
};
