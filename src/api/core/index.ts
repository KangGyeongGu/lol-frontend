import axios, { type AxiosInstance, type AxiosResponse, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/shared/utils/token.util';
import type { ErrorEnvelope } from '@/shared/types/api.types';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        const token = tokenStorage.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },
    async (error: AxiosError) => {
        if (error.response?.data) {
            const errorBody = error.response.data as ErrorEnvelope;
            if (errorBody.error?.code) {
                Object.assign(error, {
                    code: errorBody.error.code,
                    message: errorBody.error.message
                });
            }
        }

        const status = error.response?.status;
        if (status === 401) {
            tokenStorage.clearTokens();

            // 순환 참조 방지를 위한 lazy import
            const router = (await import('@/router')).default;
            router.push({ name: 'LOGIN' });
        } else if (status === 403) {
            // 403 처리는 호출부에서 catch로 위임
        } else if (status && status >= 500) {
            if (import.meta.env.DEV) {
                console.error(`[API] ${status} Server Error:`, error.message);
            }
        }

        return Promise.reject(error);
    }
);
