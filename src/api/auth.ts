import apiClient from './client';

export interface LoginPayload {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  role: string;
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return apiClient.post('/admin/auth/login', payload);
}

export function getProfile(): Promise<UserProfile> {
  return apiClient.get('/admin/auth/me');
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export function changePassword(payload: ChangePasswordPayload): Promise<{ success: boolean }> {
  return apiClient.post('/admin/auth/change-password', payload);
}

export interface ChangeEmailPayload {
  currentPassword: string;
  newEmail: string;
}

export interface ChangeEmailResponse {
  success: boolean;
  email: string;
}

export function changeEmail(payload: ChangeEmailPayload): Promise<ChangeEmailResponse> {
  return apiClient.post('/admin/auth/change-email', payload);
}
