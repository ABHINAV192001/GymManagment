import { fetchWithAuth } from './client';
import { API_CONFIG } from '../../config/api';
import { Payment } from '../../types';

const BASE_URL = `${API_CONFIG.USER_MANAGEMENT_URL}/api/v1/accounts`;

export async function getAccountsSummary(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/summary`);
  return response.data;
}

export async function getPayments(): Promise<Payment[]> {
  const response = await fetchWithAuth(`${BASE_URL}/payments`);
  return response.data || [];
}

export async function createPayment(payment: Partial<Payment>): Promise<Payment> {
  const response = await fetchWithAuth(`${BASE_URL}/payments`, {
    method: 'POST',
    body: JSON.stringify(payment),
  });
  return response.data;
}

export async function updatePayment(id: string, payment: Partial<Payment>): Promise<Payment> {
  const response = await fetchWithAuth(`${BASE_URL}/payments/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payment),
  });
  return response.data;
}

export async function deletePayment(id: string): Promise<void> {
  await fetchWithAuth(`${BASE_URL}/payments/${id}`, { method: 'DELETE' });
}

export async function getIncome(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/income`);
  return response.data;
}

export async function getExpenses(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/expenses`);
  return response.data;
}

export async function createExpense(expense: any): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/expenses`, {
    method: 'POST',
    body: JSON.stringify(expense),
  });
  return response.data;
}

export async function getSalary(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/salary`);
  return response.data;
}

export async function getPlReport(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/pl-report`);
  return response.data;
}

export async function getCashflow(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/cashflow`);
  return response.data;
}

export async function getPendingPayments(): Promise<any> {
  const response = await fetchWithAuth(`${BASE_URL}/pending`);
  return response.data;
}
