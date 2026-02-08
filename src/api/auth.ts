import { apiClient } from '@/api/core';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, UserProfile } from '@/api/dtos/auth.types';

export const authApi = {
    login: (code: string) => {
        return apiClient.post<any, LoginResponse>('/auth/kakao/login', { authorizationCode: code } as LoginRequest);
    },

    signup: (req: SignupRequest) => {
        return apiClient.post<any, SignupResponse>('/auth/signup', req);
    },

    getMe: () => {
        return apiClient.get<any, UserProfile>('/users/me');
    },

    logout: () => {
        return apiClient.post('/auth/logout');
    }
};
