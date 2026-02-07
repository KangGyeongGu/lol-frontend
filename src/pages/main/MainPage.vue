<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRoomStore } from '@/stores/useRoomStore';
import HubPanel from './panels/HubPanel.vue';
import RoomListPanel from './panels/RoomListPanel.vue';
import CreateRoomModal from '@/widgets/CreateRoomModal.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import type { CreateRoomRequest } from '@/api/dtos/room.types';
import logoSrc from '@/assets/images/logo.svg';
import bgMainSrc from '@/assets/images/bg-main.jpg';

const router = useRouter();
const authStore = useAuthStore();
const roomStore = useRoomStore();

type ViewMode = 'HUB' | 'ROOM_LIST';
const viewMode = ref<ViewMode>((sessionStorage.getItem('mainViewMode') as ViewMode) || 'HUB');
const showCreateModal = ref(false);

watch(viewMode, (newVal) => {
    sessionStorage.setItem('mainViewMode', newVal);
});

function handleLogout() {
    authStore.logout();
    router.replace({ name: 'LOGIN' }); 
}

async function handleCreateRoom(payload: CreateRoomRequest) {
    try {
        const roomDetail = await roomStore.createRoom(payload);
        showCreateModal.value = false;
        router.push({ name: 'WAITING_ROOM', params: { roomId: roomDetail.roomId } });
    } catch (e) {
        console.error(e);
    }
}

function switchView(mode: ViewMode) {
    viewMode.value = mode;
}
</script>

<template>
  <div class="main-page-container" :style="{ backgroundImage: `url(${bgMainSrc})` }">
    <div class="main-overlay"></div>
    <header class="app-header">
        <div class="header-left">
        </div>
        
        <div class="logo-container" @click="viewMode = 'HUB'" style="cursor: pointer;">
            <img :src="logoSrc" alt="LoL" class="header-logo" />
        </div>
        
        <div class="user-menu" v-if="authStore.user">
            <span class="nickname">{{ authStore.user.nickname }}</span>
            <span class="tier">{{ authStore.user.tier }}</span>
            <BaseButton variant="neutral" size="sm" @click="router.push({ name: 'MY_PAGE' })">마이페이지</BaseButton>
            <BaseButton variant="danger" size="sm" @click="handleLogout">로그아웃</BaseButton>
        </div>
    </header>
    
    <main class="content-area">
        <Transition name="fade" mode="out-in">
            <HubPanel 
                v-if="viewMode === 'HUB'" 
                @navigate="switchView"
                @create="showCreateModal = true"
            />
            <RoomListPanel 
                v-else-if="viewMode === 'ROOM_LIST'" 
                @navigate="switchView"
                @create="showCreateModal = true"
            />
        </Transition>
    </main>

    <CreateRoomModal 
        v-if="showCreateModal"
        @close="showCreateModal = false"
        @create="handleCreateRoom"
    />
  </div>
</template>

<style scoped lang="scss">
.main-page-container {
    height: 100vh;
    display: flex;
    flex-direction: column;
    background-size: cover;
    background-position: center;
    position: relative;
    color: var(--color-text-primary);
    overflow: hidden;
    
    .main-overlay {
        position: absolute;
        inset: 0;
        background: rgba(11, 8, 20, 0.7); // 복잡한 배경 명도를 낮추기 위한 오버레이
        z-index: 1;
        pointer-events: none;
    }
}

.app-header {
    height: calc(var(--gu) * 6.25); // 100px equivalent
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: var(--space-4) var(--space-6) 0; // 상단 패딩 추가
    z-index: 10;
    position: relative; 
    
    background: linear-gradient(to bottom, rgba(0,0,0,0.8) 0%, transparent 100%);
    border-bottom: none;
    
    .header-left { 
        flex: 1; 
        // 비어있어도 공간을 차지하도록 설정
    }
    
    .logo-container {
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
        display: flex;
        justify-content: center;
        
        .header-logo {
            height: calc(var(--gu) * 5.625); // 90px equivalent
            filter: drop-shadow(0 0 5px rgba(58, 242, 255, 0.5));
        }
    }
    
    .user-menu {
        flex: 1;
        display: flex;
        justify-content: flex-end;
        gap: var(--space-4);
        align-items: center;
        font-size: var(--fontSize-sm);
        
        .nickname { font-weight: bold; }
        .tier { color: var(--color-accent-yellow); }
    }
}

.content-area {
    position: relative;
    z-index: 2;
    flex: 1;
    padding: var(--space-4) calc(var(--gu) * 6);
    overflow: hidden;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
