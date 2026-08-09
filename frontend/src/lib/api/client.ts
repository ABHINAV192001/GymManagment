export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  // Retrieve token from localStorage or cookies (accessToken, gymos_token, token)
  let token = localStorage.getItem('accessToken') || localStorage.getItem('gymos_token') || localStorage.getItem('token');
  if (!token) {
    const tokenMatch = document.cookie.match(/(?:^|; )(?:accessToken|gymos_token|token)=([^;]*)/);
    token = tokenMatch ? decodeURIComponent(tokenMatch[1]) : null;
  }
  
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

    if (response.status === 404) {
      throw new Error(`404 Not Found: ${serverMessage || 'The requested resource or endpoint was not found.'}`);
    } else if (response.status === 403) {
      throw new Error(`403 Forbidden: You do not have permission to access this resource.`);
    } else if (response.status === 401) {
      throw new Error(`401 Unauthorized: Session expired or invalid authentication credentials.`);
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
