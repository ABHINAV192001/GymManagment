export function getStoredToken(): string | null {
  const tokenMatch = document.cookie.match(/(?:^|; )(?:gymos_token|accessToken|token)=([^;]*)/);
  if (tokenMatch && tokenMatch[1]) {
    return decodeURIComponent(tokenMatch[1]);
  }
  return localStorage.getItem('gymos_token') || localStorage.getItem('accessToken') || localStorage.getItem('token');
}

export function clearStoredAuth() {
  document.cookie = 'gymos_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'gymos_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  localStorage.removeItem('gymos_token');
  localStorage.removeItem('gymos_role');
  localStorage.removeItem('accessToken');
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

/** Thrown when the API answers 429. Carries the server's retry window so UI can count down. */
export class RateLimitError extends Error {
  readonly retryAfterSeconds: number;
  readonly limit: number | null;

  constructor(message: string, retryAfterSeconds: number, limit: number | null = null) {
    super(message);
    this.name = 'RateLimitError';
    this.retryAfterSeconds = retryAfterSeconds;
    this.limit = limit;
  }
}

interface ApiErrorBody {
  message?: string;
  error?: { code?: string; message?: string };
}

function extractMessage(body: ApiErrorBody | null, fallback: string): string {
  return body?.error?.message || body?.message || fallback;
}

function parseRetryAfter(response: Response): number {
  const retryAfter = response.headers.get('Retry-After');
  if (retryAfter) {
    const seconds = Number.parseInt(retryAfter, 10);
    if (Number.isFinite(seconds) && seconds > 0) {
      return seconds;
    }
    // Retry-After may also be an HTTP date.
    const asDate = Date.parse(retryAfter);
    if (Number.isFinite(asDate)) {
      return Math.max(1, Math.ceil((asDate - Date.now()) / 1000));
    }
  }
  const reset = response.headers.get('X-RateLimit-Reset');
  if (reset) {
    const seconds = Number.parseInt(reset, 10);
    if (Number.isFinite(seconds) && seconds > 0) {
      return seconds;
    }
  }
  return 60;
}

export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Retrieve token from cookies or localStorage
  const token = getStoredToken();

  const headers = new Headers(options.headers || {});

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  if (!response.ok) {
    let errorBody: ApiErrorBody | null = null;
    try {
      errorBody = (await response.json()) as ApiErrorBody;
    } catch {
      errorBody = null;
    }

    const serverMessage = extractMessage(errorBody, response.statusText);

    if (response.status === 401) {
      clearStoredAuth();
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/login')) {
        window.location.href = '/auth/login';
      }
      throw new Error(`401 Unauthorized: Session expired or invalid authentication credentials.`);
    } else if (response.status === 403) {
      throw new Error(`403 Forbidden: You do not have permission to access this resource.`);
    } else if (response.status === 404) {
      throw new Error(`404 Not Found: ${serverMessage || 'The requested resource or endpoint was not found.'}`);
    } else if (response.status === 429) {
      const retryAfterSeconds = parseRetryAfter(response);
      const limitHeader = response.headers.get('X-RateLimit-Limit');
      const limit = limitHeader ? Number.parseInt(limitHeader, 10) : null;
      throw new RateLimitError(
        serverMessage || `Too many requests. Please retry in ${retryAfterSeconds} seconds.`,
        retryAfterSeconds,
        Number.isFinite(limit) ? limit : null,
      );
    } else if (response.status >= 500) {
      throw new Error(`500 Server Error: ${serverMessage || 'An internal server error occurred.'}`);
    }

    throw new Error(serverMessage || `Request failed with status code ${response.status}`);
  }

  // Handle 204 No Content
  if (response.status === 204) {
    return null;
  }

  return response.json();
}
