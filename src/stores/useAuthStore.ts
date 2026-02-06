import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';
import { tokenStorage } from '@/utils/token.util';
import type { UserSummary, SignupRequest } from '@/api/dtos/auth.types';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<UserSummary | null>(null);
    const isAuthenticated = computed(() => !!tokenStorage.getAccessToken());

    async function login(code: string) {
        try {
            const response = await authApi.login(code);
            if (response.result === 'OK' && response.accessToken && response.refreshToken && response.user) {
                tokenStorage.setTokens(response.accessToken, response.refreshToken);
                user.value = response.user;
                return { success: true };
            } else if (response.result === 'SIGNUP_REQUIRED' && response.signupToken) {
                return { success: false, signupToken: response.signupToken };
            }
            return { success: false, error: 'Unknown response' };
        } catch (error) {
            throw error;
        }
    }

    async function mockLogin() {
        tokenStorage.setTokens('mock-access-token', 'mock-refresh-token');
        user.value = {
            userId: 'host-user-01',
            nickname: 'DevHost',
            tier: 'GOLD',
            score: 1200
        };
        return { success: true };
    }

    async function signup(req: SignupRequest) {
        const response = await authApi.signup(req);
        tokenStorage.setTokens(response.accessToken, response.refreshToken);
        user.value = response.user;
    }

    async function logout() {
        try {
            await authApi.logout();
        } finally {
            tokenStorage.clearTokens();
            user.value = null;
        }
    }

    return {
        user,
        isAuthenticated,
        login,
        mockLogin,
        signup,
        logout
    };
});
