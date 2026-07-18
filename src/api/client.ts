import axios from 'axios';
import type { AxiosRequestConfig, AxiosResponse } from 'axios';
import type { ApiResponse } from '@/types/api';
import { createMockAdapter } from '@/mocks';

export class ApiError extends Error {
  code: number;
  status: number;
  response?: unknown;
  constructor(code: number, message: string, status = 0, response?: unknown) {
    super(message);
    this.name = 'ApiError';
    this.code = code;
    this.status = status;
    this.response = response;
  }
}

const instance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api/v1',
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
  adapter: import.meta.env.VITE_USE_MOCK === 'true' ? createMockAdapter() : undefined,
});

instance.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  if (config.data instanceof FormData) {
    delete config.headers['Content-Type'];
  }
  return config;
});

instance.interceptors.response.use(
  (response) => {
    const body = response.data as ApiResponse<unknown>;
    if (body === null || body === undefined) {
      return Promise.reject(new ApiError(50001, 'Empty response'));
    }
    if (body.code !== 0) {
      return Promise.reject(new ApiError(body.code, body.message));
    }
    // 拦截器已解包为 body.data；运行时返回业务数据，类型上按 AxiosResponse 兼容 axios 内部
    return body.data as unknown as AxiosResponse;
  },
  (error) => {
    if (error.response?.data?.code) {
      return Promise.reject(
        new ApiError(error.response.data.code, error.response.data.message, error.response.status, error.response.data),
      );
    }
    return Promise.reject(error);
  },
);

// 401 自动登出：token 过期/失效时清除本地态，避免用户停留在已失效会话
// 仅在 token 存在时触发，避免未登录场景误清
instance.interceptors.response.use(undefined, (error) => {
  if (error.response?.status === 401) {
    try {
      if (localStorage.getItem('auth_token')) {
        localStorage.removeItem('auth_token');
        // 通过事件通知 AuthContext 重新评估认证状态
        window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      }
    } catch {
      // localStorage 不可用时忽略
    }
  }
  return Promise.reject(error);
});

// 响应拦截器已解包 body.data，包装让 get/post 等返回 Promise<T>（业务数据）
const apiClient = {
  get: <T = unknown>(url: string, config?: AxiosRequestConfig) => instance.get(url, config) as unknown as Promise<T>,
  post: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.post(url, data, config) as unknown as Promise<T>,
  patch: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.patch(url, data, config) as unknown as Promise<T>,
  put: <T = unknown>(url: string, data?: unknown, config?: AxiosRequestConfig) => instance.put(url, data, config) as unknown as Promise<T>,
  delete: <T = unknown>(url: string, config?: AxiosRequestConfig) => instance.delete(url, config) as unknown as Promise<T>,
  defaults: instance.defaults,
  interceptors: instance.interceptors,
};

export default apiClient;
