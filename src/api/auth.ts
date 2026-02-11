import { apiClient } from '@/api/core';
import type { LoginRequest, LoginResponse, SignupRequest, SignupResponse, UserProfile, ActiveGame } from '@/api/dtos/auth.dto';

export const authApi = {
    login: (code: string) => {
        return apiClient.post<LoginRequest, LoginResponse>('/auth/kakao/login', { authorizationCode: code });
    },

    signup: (req: SignupRequest) => {
        return apiClient.post<SignupRequest, SignupResponse>('/auth/signup', req);
    },

    getMe: () => {
        return apiClient.get<void, UserProfile>('/users/me');
    },

    getActiveGame: () => {
        return apiClient.get<void, ActiveGame | null>('/users/me/active-game');
    },

    logout: () => {
        return apiClient.post<void, void>('/auth/logout');
    }
};
