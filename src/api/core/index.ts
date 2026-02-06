import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import { tokenStorage } from '@/utils/token.util';
import { findMock } from '../mock/registry';
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
    async (config) => {
        // Mocking 로직 (환경 변수 VITE_API_MOCK이 'true'인 경우)
        if (import.meta.env.VITE_API_MOCK === 'true') {
            const mockHandler = findMock(config);
            if (mockHandler) {
                console.warn(`[Mock] Intercepted ${config.method?.toUpperCase()} ${config.url}`);
                const data = typeof mockHandler === 'function' ? mockHandler(config) : mockHandler;

                // 네트워크 지연 시뮬레이션 (500ms)
                await new Promise(resolve => setTimeout(resolve, 500));

                // 요청을 가로채서 Mock 데이터 반환
                config.adapter = async () => {
                    return {
                        data: { data }, // API 명세에 따른 SuccessEnvelope 래핑
                        status: 200,
                        statusText: 'OK',
                        headers: {},
                        config
                    };
                };
            }
        }

        // 인증 토큰 주입
        const token = tokenStorage.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
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
        // 에러 응답 시 HTTP 상태 코드가 아닌 서버 정의 에러 코드로 분기 처리 지원
        if (error.response && error.response.data) {
            const errorBody = error.response.data as any;
            if (errorBody.error && errorBody.error.code) {
                (error as any).code = errorBody.error.code;
                (error as any).message = errorBody.error.message;
            }
        }
        return Promise.reject(error);
    }
);
