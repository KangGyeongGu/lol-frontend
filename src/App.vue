<script setup lang="ts">
import { onMounted, onUnmounted, watch } from 'vue';
import { useAuthStore } from '@/stores/useAuthStore';
import { EventDispatcher } from '@/realtime/EventDispatcher';
import { stompClient } from '@/realtime/StompClient';

const authStore = useAuthStore();

onMounted(() => {
    if (authStore.isAuthenticated) {
        authStore.fetchUserProfile();
        EventDispatcher.init();
    }
});

watch(() => authStore.isAuthenticated, (isAuth) => {
    if (isAuth) {
        EventDispatcher.init();
    } else {
        stompClient.disconnect();
    }
});

onUnmounted(() => {
    stompClient.disconnect();
});
</script>

<template>
  <div id="root-layout">
    <router-view />
  </div>
</template>

<style scoped lang="scss">
#root-layout {
  width: 100vw;
  height: 100vh;
  background-color: var(--color-bg-page);
  color: var(--color-text-primary);
  display: flex;
  flex-direction: column;
}
</style>
