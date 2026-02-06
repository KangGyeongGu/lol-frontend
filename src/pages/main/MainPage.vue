<script setup lang="ts">
import { ref, watch } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRoomStore } from '@/stores/useRoomStore';
import HubPanel from './panels/HubPanel.vue';
import RoomListPanel from './panels/RoomListPanel.vue';
import CreateRoomModal from '@/widgets/CreateRoomModal.vue';
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
        await roomStore.createRoom(payload);
        showCreateModal.value = false;
        roomStore.fetchRooms();
        viewMode.value = 'ROOM_LIST';
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
            <!-- 필요한 경우 왼쪽 아이템 추가 가능 -->
        </div>
        
        <div class="logo-container" @click="viewMode = 'HUB'" style="cursor: pointer;">
            <img :src="logoSrc" alt="LoL" class="header-logo" />
        </div>
        
        <div class="user-menu" v-if="authStore.user">
            <span class="nickname">{{ authStore.user.nickname }}</span>
            <span class="tier">{{ authStore.user.tier }}</span>
            <button @click="router.push({ name: 'MY_PAGE' })">마이페이지</button>
            <button class="logout" @click="handleLogout">로그아웃</button>
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
    height: 100px; // 로고와 간격 확보를 위해 높이 증가
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
            height: 90px; // 기존 60px 대비 1.5배 확대
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
        
        button {
            background: rgba(255, 255, 255, 0.1);
            border: 1px solid var(--color-border-subtle);
            color: var(--color-text-secondary);
            padding: 6px 16px;
            border-radius: var(--radius-sm);
            cursor: pointer;
            transition: all 0.2s;
            
            &:hover { 
                background: rgba(255, 255, 255, 0.2);
                color: var(--color-text-primary); 
            }
            &.logout { 
                color: var(--color-state-danger); 
                border-color: rgba(255, 77, 109, 0.3);
                &:hover { background: rgba(255, 77, 109, 0.1); }
            }
        }
    }
}

.content-area {
    position: relative;
    z-index: 2;
    flex: 1;
    padding: var(--space-4) 120px;
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
