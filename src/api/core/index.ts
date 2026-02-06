import axios, { type AxiosInstance, type AxiosResponse, type AxiosError } from 'axios';
import { tokenStorage } from '@/utils/token.util';

// FE_STACK: VITE_API_BASE_URL
const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api/v1';

export const apiClient: AxiosInstance = axios.create({
    baseURL: BASE_URL,
    headers: {
        'Content-Type': 'application/json',
    },
    timeout: 10000,
});

// Request Interceptor: Inject Token
apiClient.interceptors.request.use(
    (config) => {
        const token = tokenStorage.getAccessToken();
        if (token && config.headers) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Response Interceptor: Error Handling per FE_API_CLIENT.md
apiClient.interceptors.response.use(
    (response: AxiosResponse) => {
        // FE_API_CLIENT: "성공 응답은 data만 사용한다." -> Extract data if wrapped in envelope?
        // OpenAPI says SuccessEnvelope has { data, meta }.
        // We strictly follow the schema. If the backend returns { data: ... }, we return response.data.data?
        // Let's assume the caller handles the envelope or we unwrap it here.
        // Spec says: "성공 응답은 data만 사용한다." -> It implies unwrapping.
        if (response.data && response.data.data) {
            return response.data.data;
        }
        return response.data;
    },
    (error: AxiosError) => {
        // FE_API_CLIENT: "실패 응답은 HTTP status가 아니라 error.code로 분기한다."
        // However, axios throws on 4xx/5xx by default.
        // We should extract the error code from the response body.
        if (error.response && error.response.data) {
            const errorBody = error.response.data as any; // ErrorEnvelope
            if (errorBody.error && errorBody.error.code) {
                // Re-throw with clearer structure or just pass it through
                // For now, attach code to the error object for easier checking
                (error as any).code = errorBody.error.code;
                (error as any).message = errorBody.error.message;
            }
        }
        return Promise.reject(error);
    }
);
