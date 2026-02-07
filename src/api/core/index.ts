import axios, { type AxiosInstance, type AxiosResponse, AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { tokenStorage } from '@/utils/token.util';
import { findMock } from '../mock/registry';
import type { ErrorEnvelope } from '@/shared/types/api.types';
import '../mock/room.mock';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// 요청 인터셉터: 인증 토큰 주입 및 Mocking 처리
apiClient.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
        if (import.meta.env.VITE_API_MOCK === 'true') {
            const mockHandler = findMock(config);
            if (mockHandler) {
                console.warn(`[Mock] Intercepted ${config.method?.toUpperCase()} ${config.url}`);
                const data = typeof mockHandler === 'function' ? mockHandler(config) : mockHandler;

                await new Promise(resolve => setTimeout(resolve, 500));

                config.adapter = async () => {
                    return {
                        data: { data },
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config
                    };
                };
            }
        }

        const token = tokenStorage.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error: AxiosError) => Promise.reject(error)
);

// 응답 인터셉터: 공통 응답 처리 및 에러 처리
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // 성공 응답 시 envelope에서 data 부분만 추출하여 반환
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },
    (error: AxiosError) => {
        if (error.response?.data) {
            const errorBody = error.response.data as ErrorEnvelope;
            if (errorBody.error?.code) {
                // AxiosError does not have .code as a string enum by default, 
                // but we can attach it or wrap it. 
                // For now, attaching to the object as a known extension.
                Object.assign(error, {
                    code: errorBody.error.code,
                    message: errorBody.error.message
                });
            }
        }
        return Promise.reject(error);
    }
);
