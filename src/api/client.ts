import axios from 'axios';
import type { ApiResponse } from '@/types/api';
import { createMockAdapter } from '@/mocks';

export class ApiError extends Error {
  code: number;
  constructor(code: number, message: string) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
  }
}

const apiClient = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  adapter: import.meta.env.VITE_USE_MOCK === 'true' ? createMockAdapter() : undefined,
});

apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    if (body === null || body === undefined) {
      return Promise.reject(new ApiError(50001, 'Empty response'));
    }
    if (body.code !== 0) {
      return Promise.reject(new ApiError(body.code, body.message));
    }
    return body.data as any;
  },
  (error) => {
    if (error.response?.data?.code) {
      return Promise.reject(new ApiError(error.response.data.code, error.response.data.message));
    }
    return Promise.reject(error);
  },
);

export default apiClient;
