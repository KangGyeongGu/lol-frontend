<script setup lang="ts">
import { onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import logoSrc from '@/assets/images/logo.svg';
import bgLoginSrc from '@/assets/images/bg-login.jpg';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const KAKAO_AUTH_URL = `https://kauth.kakao.com/oauth/authorize?client_id=${import.meta.env.VITE_KAKAO_CLIENT_ID}&redirect_uri=${import.meta.env.VITE_REDIRECT_URI}&response_type=code`;

async function handleLogin() {
  window.location.href = KAKAO_AUTH_URL;
}

async function handleDevLogin() {
    await authStore.mockLogin();
    router.replace({ name: 'MAIN' });
}

onMounted(async () => {
  const code = route.query.code as string;
  if (code) {
    try {
      const result = await authStore.login(code);
      if (result.success) {
        router.replace({ name: 'MAIN' });
      } else if (result.signupToken) {
        router.replace({ 
            name: 'SIGNUP', 
            query: { signupToken: result.signupToken } 
        });
      }
    } catch (e) {
      console.error('Login failed', e);
      alert('로그인 처리에 실패했습니다.');
      router.replace({ name: 'LOGIN' });
    }
  }
});
</script>

<template>
  <div class="login-container" :style="{ backgroundImage: `url(${bgLoginSrc})` }">
    <div class="overlay"></div>
    <div class="panel">
        <div class="brand">
            <img :src="logoSrc" alt="League of Algo Logic" class="logo-img" />
        </div>
        
        <div class="login-actions">
            <button v-if="!route.query.code" class="kakao-button" @click="handleLogin">
                카카오 로그인
            </button>
            <button v-if="!route.query.code" class="dev-button" @click="handleDevLogin">
                [QA] 임시 로그인 (Pass)
            </button>
            <p v-else class="loading">
                로그인 처리 중...
            </p>
        </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.login-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-size: cover;
    background-position: center;
    position: relative;
    overflow: hidden;
    
    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(0, 0, 0, 0.4); 
        z-index: 1;
    }
}

.panel {
    position: relative;
    z-index: 2;
    display: flex;
    flex-direction: column;
    gap: calc(var(--gu) * 3);
    align-items: center;
    width: calc(var(--gu) * 40);
}

.brand {
    display: flex;
    justify-content: center;
    
    .logo-img {
        width: calc(var(--gu) * 40);
        height: auto;
        filter: drop-shadow(0 0 calc(var(--gu) * 0.6) rgba(58, 242, 255, 0.5));
    }
}

.login-actions {
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: calc(var(--gu) * 1);
    align-items: center;
}

.kakao-button {
    background-color: #FEE500;
    color: #000000;
    border: none;
    padding: calc(var(--gu) * 1.1) calc(var(--gu) * 2);
    border-radius: var(--radius-md);
    font-size: calc(var(--gu) * 1.1);
    font-weight: 700;
    cursor: pointer;
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: transform 0.2s, box-shadow 0.2s;
    
    &:hover { 
        transform: translateY(calc(var(--gu) * -0.125));
        box-shadow: 0 0 calc(var(--gu) * 1.25) rgba(254, 229, 0, 0.4);
    }
}

.dev-button {
    width: 100%;
    background-color: transparent;
    border: calc(var(--gu) * 0.0625) solid var(--color-border-subtle);
    color: var(--color-text-muted);
    padding: calc(var(--gu) * 0.5);
    border-radius: var(--radius-sm);
    cursor: pointer;
    font-size: calc(var(--gu) * 0.8);
    transition: all 0.2s;
    &:hover {
        border-color: var(--color-text-primary);
        color: var(--color-text-primary);
    }
}

.loading {
    color: var(--color-text-muted);
    font-size: calc(var(--gu) * 1.1);
}
</style>
