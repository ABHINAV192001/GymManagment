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
    let serverMessage = '';
    try {
      const errorData = await response.json();
      serverMessage = errorData.message || '';
    } catch {
      serverMessage = response.statusText;
    }

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

