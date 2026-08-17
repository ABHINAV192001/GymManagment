const getBaseUrl = (envUrl: string | undefined, defaultLocalUrl: string) => {
  if (envUrl && envUrl.trim() !== '') {
    return envUrl.replace(/\/+$/, '');
  }
  return defaultLocalUrl;
};

export const API_CONFIG = {
  USER_MANAGEMENT_URL: getBaseUrl(
    import.meta.env.VITE_USER_MANAGEMENT_URL || import.meta.env.VITE_API_BASE_URL,
    'http://localhost:8080'
  ),
  WORKOUT_SERVICE_URL: getBaseUrl(
    import.meta.env.VITE_WORKOUT_SERVICE_URL || import.meta.env.VITE_API_BASE_URL,
    'http://localhost:8083'
  ),
  CHAT_SERVICE_URL: getBaseUrl(
    import.meta.env.VITE_CHAT_SERVICE_URL || import.meta.env.VITE_API_BASE_URL,
    'http://localhost:8082'
  ),
};

