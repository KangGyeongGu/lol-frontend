<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import type { SignupRequest } from '@/api/dtos/auth.types';
import logoSrc from '@/assets/images/logo.svg';
import bgLoginSrc from '@/assets/images/bg-login.jpg';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const signupToken = (route.query.signupToken as string | undefined) || '';
const nickname = ref('');
const language = ref('JAVA');
const isSubmitting = ref(false);

const languages = [
    { value: 'JAVA', label: 'Java' },
    { value: 'PYTHON', label: 'Python' },
    { value: 'CPP', label: 'C++' },
    { value: 'JAVASCRIPT', label: 'JavaScript' }
];

async function handleSignup() {
    if (!nickname.value) return;
    
    isSubmitting.value = true;
    try {
        const payload: SignupRequest = {
            signupToken,
            nickname: nickname.value,
            language: language.value
        };
        await authStore.signup(payload);
        router.replace({ name: 'MAIN' });
    } catch (e) {
        console.error(e);
        alert('회원가입 실패');
    } finally {
        isSubmitting.value = false;
    }
}
</script>

<template>
  <div class="signup-container" :style="{ backgroundImage: `url(${bgLoginSrc})` }">
    <div class="overlay"></div>
    <div class="panel">
        <div class="brand">
            <img :src="logoSrc" alt="League of Algo Logic" class="logo-img" />
        </div>

        <div class="signup-form">
            <h2 class="title">Complete Your Profile</h2>
            
            <div class="form-group">
                <label>NICKNAME</label>
                <input v-model="nickname" type="text" placeholder="Enter your nickname" />
            </div>

            <div class="form-group">
                <label>PRIMARY LANGUAGE</label>
                <select v-model="language">
                    <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                        {{ lang.label }}
                    </option>
                </select>
            </div>

            <button 
                class="submit-button" 
                :disabled="isSubmitting || !nickname"
                @click="handleSignup"
            >
                {{ isSubmitting ? 'PROCESSING...' : 'JOIN THE BATTLE' }}
            </button>
        </div>
    </div>
  </div>
</template>

<style scoped lang="scss">
.signup-container {
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
        background: rgba(0, 0, 0, 0.5); 
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
    .logo-img {
        width: calc(var(--gu) * 40);
        height: auto;
        filter: drop-shadow(0 0 calc(var(--gu) * 0.6) rgba(58, 242, 255, 0.5));
    }
}

.signup-form {
    width: 100%;
    background: rgba(18, 16, 30, 0.8);
    backdrop-filter: blur(20px);
    border: calc(var(--gu) * 0.125) solid var(--color-border-subtle);
    border-radius: var(--radius-lg);
    padding: calc(var(--gu) * 2.5);
    display: flex;
    flex-direction: column;
    gap: calc(var(--gu) * 1.5);
    box-shadow: 0 0 calc(var(--gu) * 2) rgba(0, 0, 0, 0.4);
}

.title {
    font-family: var(--font-display);
    font-size: calc(var(--gu) * 1.5);
    color: var(--color-accent-cyan);
    text-align: center;
    margin: 0;
    text-shadow: 0 0 calc(var(--gu) * 0.6) rgba(58, 242, 255, 0.3);
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: calc(var(--gu) * 0.5);
    
    label {
        color: var(--color-text-muted);
        font-size: calc(var(--gu) * 0.7);
        font-weight: 800;
        letter-spacing: calc(var(--gu) * 0.1);
    }
    
    input, select {
        background-color: rgba(0, 0, 0, 0.3);
        border: calc(var(--gu) * 0.0625) solid var(--color-border-subtle);
        color: var(--color-text-primary);
        padding: calc(var(--gu) * 0.8) calc(var(--gu) * 1);
        border-radius: var(--radius-sm);
        font-family: var(--font-ui);
        font-size: calc(var(--gu) * 0.9);
        transition: all 0.3s;
        
        &:focus {
            border-color: var(--color-accent-cyan);
            background-color: rgba(58, 242, 255, 0.05);
            outline: none;
            box-shadow: 0 0 calc(var(--gu) * 0.6) rgba(58, 242, 255, 0.1);
        }
    }

    select {
        cursor: pointer;
        option {
            background-color: #12101e;
        }
    }
}

.submit-button {
    margin-top: calc(var(--gu) * 0.5);
    background: linear-gradient(135deg, var(--color-accent-cyan) 0%, #2AB6C1 100%);
    color: black;
    padding: calc(var(--gu) * 1);
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 800;
    font-size: calc(var(--gu) * 1);
    font-family: var(--font-display);
    cursor: pointer;
    transition: all 0.3s;
    
    &:hover:not(:disabled) {
        transform: translateY(calc(var(--gu) * -0.125));
        box-shadow: 0 0 calc(var(--gu) * 1.25) rgba(58, 242, 255, 0.4);
        filter: brightness(1.1);
    }

    &:active:not(:disabled) {
        transform: scale(0.98);
    }
    
    &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
    }
}
</style>
