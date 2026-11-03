const API_BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080').replace(/\/$/, '');

export type RoomMateUser = {
  id: number; username: string; email: string; role: string; fullName: string;
  phoneNumber: string; aadhaarLastFour?: string; emailVerified: boolean;
  phoneVerified: boolean; digilockerVerified: boolean;
};
export type AuthResponse = { token: string; tokenType: string; expiresInSeconds: number; user: RoomMateUser };
export type OtpChallenge = { challengeId: string; expiresInSeconds: number; phoneOtpRequired: boolean };
export type RoomListing = {
  id: number; title: string; location: string; capacity: number; occupancy: number;
  privacy: string; stayType: string; rent: number; description: string;
  imageUrl?: string; latitude?: number; longitude?: number; distanceKm?: number;
  status: string; createdAt: string; ownerUsername: string; ownerFullName: string; ownerPhoneNumber?: string | null;
};
export type Booking = {
  id: number; roomId: number; roomTitle: string; location: string; rent: number;
  status: 'REQUESTED' | 'CONFIRMED' | 'CANCELLED'; bookingOtp?: string;
  createdAt: string; confirmedAt?: string; renterFullName: string; renterPhoneNumber: string;
  ownerFullName: string; ownerPhoneNumber: string; latitude?: number; longitude?: number;
};
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

const authHeaders = (token: string) => ({ Authorization: 'Bearer ' + token });

export const api = {
  createRoom: (token: string, payload: Omit<RoomListing, 'id' | 'status' | 'createdAt' | 'ownerUsername' | 'ownerFullName' | 'ownerPhoneNumber'>) =>
    request<RoomListing>('/api/v1/rooms', { method: 'POST', headers: authHeaders(token), body: JSON.stringify(payload) }),
  myRooms: (token: string) => request<RoomListing[]>('/api/v1/rooms/mine', { headers: authHeaders(token) }),
  nearbyRooms: (latitude: number, longitude: number, stayType?: string) =>
    request<RoomListing[]>(`/api/v1/rooms/nearby?latitude=${latitude}&longitude=${longitude}${stayType ? `&stayType=${encodeURIComponent(stayType)}` : ''}`),
  createBooking: (token: string, roomId: number) =>
    request<Booking>('/api/v1/bookings', { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ roomId }) }),
  myBookings: (token: string) => request<Booking[]>('/api/v1/bookings/mine', { headers: authHeaders(token) }),
  ownerBookings: (token: string) => request<Booking[]>('/api/v1/bookings/owner', { headers: authHeaders(token) }),
  confirmBooking: (token: string, bookingId: number, otp: string) =>
    request<Booking>(`/api/v1/bookings/${bookingId}/confirm`, { method: 'POST', headers: authHeaders(token), body: JSON.stringify({ otp }) }),
  register: (payload: { username: string; email: string; password: string; fullName: string; phoneNumber: string; aadhaarNumber: string }) =>
    request<OtpChallenge>('/api/v1/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (identifier: string, password: string) =>
    request<AuthResponse>('/api/v1/auth/login', { method: 'POST', body: JSON.stringify({ identifier, password }) }),
  verifyRegistrationOtp: (challengeId: string, emailOtp: string, phoneOtp: string) =>
    request<AuthResponse>('/api/v1/auth/register/verify-otp', { method: 'POST', body: JSON.stringify({ challengeId, emailOtp, phoneOtp }) }),
  forgotPassword: (email: string) =>
    request<OtpChallenge>('/api/v1/auth/forgot-password', { method: 'POST', body: JSON.stringify({ email }) }),
  verifyForgotPassword: (challengeId: string, emailOtp: string, phoneOtp: string, newPassword: string) =>
    request<void>('/api/v1/auth/forgot-password/verify-otp', { method: 'POST', body: JSON.stringify({ challengeId, emailOtp, phoneOtp, newPassword }) }),
  me: (token: string) => request<RoomMateUser>('/api/v1/auth/me', { headers: authHeaders(token) }),
  logout: (token: string) => request<void>('/api/v1/auth/logout', { method: 'POST', headers: authHeaders(token) }),
  health: () => request<{ status?: string }>('/api/v1/health'),
  startDigiLocker: (token: string) => request<{ authorizationUrl: string; status: string }>('/api/v1/auth/digilocker/start', { method: 'POST', headers: authHeaders(token) }),
};
