import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';

export interface HealthRequest {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: string;
  activityLevel: string;
}

export interface HealthResponse {
  bmi: number;
  bmiStatus: string;
  bmiColor: string;
  bmr: number;
  tdee: number;
  bulkCals: number;
  cutCals: number;
  fiberGrams: number;
  waterLiters: string;
  normalizedHeightCm: number;
  normalizedHeightM: string;
  heightFtInDisplay: string;
  normalizedWeightKg: number;
  normalizedWeightLbs: number;
}

export async function calculateHealthMetrics(req: HealthRequest): Promise<HealthResponse> {
  const url = `${API_CONFIG.USER_MANAGEMENT_URL}/api/health/calculate`;
  const response = await fetchWithAuth(url, {
    method: 'POST',
    body: JSON.stringify(req),
  });
  return response.data;
}
