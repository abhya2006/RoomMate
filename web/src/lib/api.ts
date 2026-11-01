const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

export type RoomMateUser = {
  id: number; username: string; email: string; role: string; fullName: string;
  phoneNumber: string; aadhaarLastFour?: string; emailVerified: boolean;
  phoneVerified: boolean; digilockerVerified: boolean;
};
export type AuthResponse = { token: string; tokenType: string; expiresInSeconds: number; user: RoomMateUser };
type ApiErrorBody = { message?: string; fieldErrors?: { field: string; message: string }[] };

async function request<T>(path: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...(init.headers || {}) },
    });
  } catch {
    throw new Error(`Cannot reach RoomMate API at ${API_BASE}. Start the Spring Boot backend and check its URL.`);
  }
  const data = await response.json().catch(() => null) as ApiErrorBody | T | null;
  if (!response.ok) {
    const body = data as ApiErrorBody | null;
    const fields = body?.fieldErrors?.map((e) => `${e.field}: ${e.message}`).join(', ');
    throw new Error(fields || body?.message || `Request failed (${response.status})`);
  }
  return data as T;
}

export const api = {
  register: (payload: { username: string; email: string; password: string; fullName: string; phoneNumber: string; aadhaarNumber: string }) =>
    request<AuthResponse>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (identifier: string, password: string) =>
    request<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  forgotPassword: (email: string) =>
    request<{ message?: string }>('/api/v1/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  sendEmailOtp: (email: string) =>
    request<{ message?: string }>('/api/v1/auth/verification/email/send', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyEmailOtp: (email: string, otp: string) =>
    request<{ verified: boolean }>('/api/v1/auth/verification/email/verify', { method: 'POST', body: JSON.stringify({ email, otp }) }),
  sendPhoneOtp: (phoneNumber: string) =>
    request<{ message?: string }>('/api/v1/auth/verification/phone/send', { method: 'POST', body: JSON.stringify({ phoneNumber }) }),
  verifyPhoneOtp: (phoneNumber: string, otp: string) =>
    request<{ verified: boolean }>('/api/v1/auth/verification/phone/verify', { method: 'POST', body: JSON.stringify({ phoneNumber, otp }) }),
  me: (token: string) => request<RoomMateUser>('/api/v1/auth/me', { headers: { Authorization: `Bearer ${token}` } }),
  health: () => request<{ status?: string }>('/api/v1/health'),
  startDigiLocker: (token: string) => request<{ authorizationUrl: string; status: string }>('/api/v1/auth/digilocker/start', { method: 'POST', headers: { Authorization: `Bearer ${token}` } }),
};
