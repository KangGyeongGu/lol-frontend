import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authApi } from '@/api/auth';
import { tokenStorage } from '@/shared/utils/token.util';
import type { SignupRequest } from '@/api/dtos/auth.dto';
import { toUserViewModel, toUserProfileViewModel, type UserViewModel, type UserProfileViewModel } from '@/entities/auth.model';

export const useAuthStore = defineStore('auth', () => {
    const user = ref<UserViewModel | UserProfileViewModel | null>(null);
    const accessToken = ref<string | null>(tokenStorage.getAccessToken());
    const isAuthenticated = computed(() => !!accessToken.value);

    async function login(code: string) {
        try {
            const response = await authApi.login(code);
            if (response.result === 'OK' && response.accessToken && response.refreshToken && response.user) {
                tokenStorage.setTokens(response.accessToken, response.refreshToken);
                accessToken.value = response.accessToken;
                user.value = toUserViewModel(response.user);
                return { success: true };
            } else if (response.result === 'SIGNUP_REQUIRED' && response.signupToken) {
                return { success: false, signupToken: response.signupToken };
            }
            return { success: false, error: 'Unknown response' };
        } catch (error) {
            throw error;
        }
    }

    async function signup(req: SignupRequest) {
        const response = await authApi.signup(req);
        tokenStorage.setTokens(response.accessToken, response.refreshToken);
        accessToken.value = response.accessToken;
        user.value = toUserViewModel(response.user);
    }

    async function fetchUserProfile() {
        if (!accessToken.value) return;
        try {
            const profile = await authApi.getMe();
            user.value = toUserProfileViewModel(profile);
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('[AuthStore] Fetch profile error:', error);
            }
        }
    }

    async function logout() {
        try {
            await authApi.logout();
        } finally {
            tokenStorage.clearTokens();
            accessToken.value = null;
            user.value = null;
        }
    }

    return {
        user,
        isAuthenticated,
        login,
        signup,
        fetchUserProfile,
        logout
    };
});
