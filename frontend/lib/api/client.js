import { API_BASE_URL, API_ENDPOINTS, getDefaultHeaders, WORKOUT_API_BASE_URL } from './config';
import { removeCookie } from '../cookie';

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
 * Base API request handler with error handling
 */
export const apiRequest = async (endpoint, options = {}) => {
    const baseUrl = options.baseUrl || API_BASE_URL;
    const url = `${baseUrl}${endpoint}`;

    const config = {
        credentials: options.skipAuth ? 'same-origin' : 'include', // Don't send cookies for public auth requests
        ...options,
        headers: {
            ...(options.skipAuth ? { 'Content-Type': 'application/json' } : getDefaultHeaders()),
            ...(options.headers || {}),
        },
    };

    try {
        console.log(`DEBUG: [apiRequest] Rendering ${config.method || 'GET'} to ${url}`);
        const response = await fetch(url, config);

        // Handle non-JSON responses (like 204 No Content)
        if (response.status === 204) {
            return null;
        }

        // Check if the response has content
        const contentType = response.headers.get('content-type');
        const hasJsonContent = contentType && contentType.includes('application/json');

        // Get response text first
        const responseText = await response.text();

        // Try to parse JSON if available
        let data = null;
        if (responseText) {
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                // If parsing fails and response is not OK, throw a meaningful error
                if (!response.ok) {
                    throw new APIError(
                        `Server returned ${response.status}: ${responseText.substring(0, 100)}`,
                        response.status,
                        null
                    );
                }

                // If response is OK but not JSON, treat raw text as the data/message
                data = { message: responseText };
            }
        }

        if (!response.ok) {
            // Check for 401 Unauthorized
            if (response.status === 401) {
                // Only redirect if this is a main API request and NOT an auth endpoint
                if (typeof window !== 'undefined' &&
                    baseUrl === API_BASE_URL &&
                    !endpoint.startsWith('/api/auth/') &&
                    !endpoint.startsWith('/api/public/')) {
                    // Clear any auth-related cookies to prevent redirect loops in middleware
                    removeCookie('accessToken');
                    removeCookie('authToken');
                    removeCookie('userRole');
                    removeCookie('organizationId');
                    removeCookie('branchId');

                    window.location.href = '/auth/login';
                }
            }

            // Handle error responses
            throw new APIError(
                data?.message || data?.error || `HTTP ${response.status}: ${response.statusText}`,
                response.status,
                data?.errors || null
            );
        }

        return data;
    } catch (error) {
        if (error instanceof APIError) {
            throw error;
        }

        // Network or other errors
        throw new APIError(
            error.message || 'Network error occurred',
            0,
            null
        );
    }
};

/**
 * GET request helper
 */
export const apiGet = (endpoint, params = {}, options = {}) => {
    const queryString = new URLSearchParams(params).toString();
    const url = queryString ? `${endpoint}?${queryString}` : endpoint;

    return apiRequest(url, {
        method: 'GET',
        ...options
    });
};

/**
 * POST request helper
 */
/**
 * POST request helper
 */
export const apiPost = (endpoint, body, options = {}) => {
    return apiRequest(endpoint, {
        method: 'POST',
        body: JSON.stringify(body),
        ...options
    });
};

/**
 * PUT request helper
 */
export const apiPut = (endpoint, body, options = {}) => {
    return apiRequest(endpoint, {
        method: 'PUT',
        body: JSON.stringify(body),
        ...options
    });
};

/**
 * PATCH request helper
 */
export const apiPatch = (endpoint, body, options = {}) => {
    return apiRequest(endpoint, {
        method: 'PATCH',
        body: JSON.stringify(body),
        ...options
    });
};

/**
 * DELETE request helper
 */
export const apiDelete = (endpoint, options = {}) => {
    return apiRequest(endpoint, {
        method: 'DELETE',
        ...options
    });
};
