<script setup lang="ts">
import { useAuthStore } from '@/stores/useAuthStore';
import { useRouter } from 'vue-router';

const authStore = useAuthStore();
const router = useRouter();

</script>

<template>
  <div class="mypage-container">
    <button class="back" @click="router.back()">← 뒤로가기</button>
    <h1>마이페이지</h1>
    <div class="profile" v-if="authStore.user">
        <p>닉네임: {{ authStore.user.nickname }}</p>
        <p>티어: {{ authStore.user.tier }}</p>
        <p>점수: {{ authStore.user.score }}</p>
    </div>
  </div>
</template>

<style scoped lang="scss">
.mypage-container {
    padding: var(--space-6);
    color: var(--color-text-primary);
}
.back {
    background: none;
    border: none;
    color: var(--color-text-secondary);
    cursor: pointer;
    margin-bottom: var(--space-4);
    font-size: var(--fontSize-md);
}
</style>
