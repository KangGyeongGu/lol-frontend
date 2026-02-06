<script setup lang="ts">
import { ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import type { SignupRequest } from '@/api/dtos/auth';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const signupToken = (route.query.signupToken as string) || '';
const nickname = ref('');
const language = ref('JAVA'); // Default
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
  <div class="signup-container">
    <div class="panel">
        <h2 class="title">회원가입</h2>
        
        <div class="form-group">
            <label>닉네임</label>
            <input v-model="nickname" type="text" placeholder="사용할 닉네임을 입력하세요" />
        </div>

        <div class="form-group">
            <label>주력 언어</label>
            <select v-model="language">
                <option v-for="lang in languages" :key="lang.value" :value="lang.value">
                    {{ lang.label }}
                </option>
            </select>
        </div>

        <button 
            class="submit-button" 
            :disabled="isSubmitting"
            @click="handleSignup"
        >
            {{ isSubmitting ? '처리 중...' : '가입 완료' }}
        </button>
    </div>
  </div>
</template>

<style scoped lang="scss">
.signup-container {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
}

.panel {
    background-color: var(--color-bg-panel);
    padding: var(--space-8);
    border-radius: var(--radius-lg);
    border: 1px solid var(--color-border-subtle);
    width: 480px;
    display: flex;
    flex-direction: column;
    gap: var(--space-6);
}

.title {
    font-family: var(--font-display);
    font-size: var(--fontSize-2xl);
    color: var(--color-text-primary);
    text-align: center;
}

.form-group {
    display: flex;
    flex-direction: column;
    gap: var(--space-2);
    
    label {
        color: var(--color-text-secondary);
        font-size: var(--fontSize-sm);
    }
    
    input, select {
        background-color: var(--color-bg-panelStrong);
        border: 1px solid var(--color-border-subtle);
        color: var(--color-text-primary);
        padding: var(--space-3);
        border-radius: var(--radius-sm);
        font-family: var(--font-ui);
        
        &:focus {
            border-color: var(--color-border-cyan);
            outline: none;
        }
    }
}

.submit-button {
    background-color: var(--color-accent-blue); // Assuming blue/primary logic
    background-color: var(--color-accent-cyan);
    color: var(--color-text-inverse);
    padding: var(--space-3);
    border: none;
    border-radius: var(--radius-sm);
    font-weight: bold;
    cursor: pointer;
    
    &:disabled {
        background-color: var(--color-state-disabled);
        cursor: not-allowed;
    }
}
</style>
