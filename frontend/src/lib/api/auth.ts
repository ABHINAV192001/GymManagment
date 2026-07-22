import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

export async function login(email: string, password: string) {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/auth/login`;
  
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify({ identifier: email, password }),
  });
  
  if (response && response.data && response.data.token) {
    document.cookie = `gymos_token=${response.data.token}; path=/; max-age=${8 * 60 * 60}; samesite=lax`;
    if (response.data.role) {
      document.cookie = `gymos_role=${response.data.role}; path=/; max-age=${8 * 60 * 60}; samesite=lax`;
    }
  }
  
  return response.data;
}

export function logout() {
  document.cookie = 'gymos_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
  document.cookie = 'gymos_role=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT';
}

export async function completeRegistration(params: {
  userCode: string;
  adminCode: string;
  role: string;
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
