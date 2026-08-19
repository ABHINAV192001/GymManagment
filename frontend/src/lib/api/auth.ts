import { fetchWithAuth, clearStoredAuth } from './client';
import { API_CONFIG } from '../../config/api';

export async function login(email: string, password: string) {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/auth/login`;
  
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ identifier: email, password }),
  });
  
  if (response && response.data && response.data.token) {
    clearStoredAuth();
    
    document.cookie = `gymos_token=${response.data.token}; path=/; max-age=${8 * 60 * 60}; samesite=lax`;
    localStorage.setItem('gymos_token', response.data.token);
    
    if (response.data.role) {
      document.cookie = `gymos_role=${response.data.role}; path=/; max-age=${8 * 60 * 60}; samesite=lax`;
      localStorage.setItem('gymos_role', response.data.role);
    }
  }
  
  return response.data;
}

export async function logout() {
  try {
    await fetchWithAuth(`${API_CONFIG.USER_MANAGEMENT_URL}/api/auth/logout`, { method: 'POST' });
  } catch (err) {
    console.warn('Server logout notice:', err);
  } finally {
    clearStoredAuth();
  }
}


export async function completeRegistration(params: {
  userCode?: string;
  email?: string;
  adminCode?: string;
  role?: string;
  password: string;
  otp: string;
}) {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/auth/complete-registration`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(params),
  });
  return response;
}

export async function resendOtp(email: string, phone?: string, otpType: string = 'REGISTER') {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/auth/resend-otp`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ email, phone: phone || null, otpType }),
  });
  return response;
}

export async function forgotPassword(email: string) {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/auth/forgot-password`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim() }),
  });
  return response;
}

export async function resetPassword(email: string, otp: string, newPassword: string) {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/auth/reset-password`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ email: email.trim(), otp: otp.trim(), newPassword }),
  });
  return response;
}

