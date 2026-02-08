<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { roomApi } from '@/api/room';
import { EventDispatcher } from '@/api/realtime/EventDispatcher';
import type { RoomDetail } from '@/api/dtos/room.types';
import BaseBadge from '@/shared/ui/BaseBadge.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import ChatPanel from '@/features/chat/ui/ChatPanel.vue';
import PlayerSlot from '@/features/room/ui/PlayerSlot.vue';
import RoomSettingsPanel from '@/features/room/ui/RoomSettingsPanel.vue';
import bgMainSrc from '@/assets/images/bg-main.jpg';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();

const roomId = route.params.roomId as string;
const room = ref<RoomDetail | null>(null);
const isLoading = ref(true);

const isHost = computed(() => {
    if (!room.value || !authStore.user) return false;
    return room.value.players.find(p => p.user.userId === authStore.user?.userId)?.isHost || false;
});

const myPlayer = computed(() => {
    if (!room.value || !authStore.user) return null;
    return room.value.players.find(p => p.user.userId === authStore.user?.userId) || null;
});

const hostNickname = computed(() => {
    return room.value?.players.find(p => p.isHost)?.user.nickname || '';
});

const displaySlots = computed(() => {
    if (!room.value) return [];
    const totalSlots = 6;
    const slots: (typeof room.value.players[0] | null)[] = [...room.value.players];
    while (slots.length < totalSlots) {
        slots.push(null);
    }
    return slots;
});

async function fetchRoomDetail() {
    isLoading.value = true;
    try {
        room.value = await roomApi.getRoomDetail(roomId);
    } catch (error) {
        console.error('Failed to fetch room detail:', error);
        alert('방 정보를 불러오는데 실패했습니다.');
        router.push({ name: 'MAIN' });
    } finally {
        isLoading.value = false;
    }
}

async function handleLeave() {
    try {
        await roomApi.leaveRoom(roomId);
        router.replace({ name: 'MAIN' });
    } catch (error) {
        console.error('Leave failed:', error);
        router.replace({ name: 'MAIN' });
    }
}

async function toggleReady() {
    if (!myPlayer.value) return;
    try {
        if (myPlayer.value.state === 'READY') {
            room.value = await roomApi.unready(roomId);
        } else {
            room.value = await roomApi.ready(roomId);
        }
        // 소켓 이벤트에서도 fetchRoomDetail()이 트리거되겠지만, 
        // 응답으로 받은 데이터를 바로 넣어서 즉각적인 반응성을 확보합니다.
    } catch (error) {
        console.error('Toggle ready failed:', error);
    }
}

async function handleStart() {
    try {
        await roomApi.startGame(roomId);
    } catch (error) {
        console.error('Start failed:', error);
    }
}

async function handleKick(targetUserId: string) {
    if (!isHost.value) return;
    try {
        await roomApi.kickPlayer(roomId, targetUserId);
    } catch (error) {
        console.error('Kick failed:', error);
    }
}

onMounted(async () => {
    await fetchRoomDetail();
    EventDispatcher.subscribeToRoom(roomId, () => {
        fetchRoomDetail();
    });
});

onUnmounted(() => {
    EventDispatcher.unsubscribeFromRoom(roomId);
});
</script>

<template>
  <div class="waiting-room-page" :style="{ backgroundImage: `url(${bgMainSrc})` }">
    <div class="overlay"></div>

    <div v-if="isLoading" class="loading-state">
        <div class="spinner"></div>
    </div>

    <!-- Scaling Content Wrapper -->
    <div v-else-if="room" class="scaling-container">
        <!-- 1. Header Row -->
        <header class="room-header">
            <h1 class="room-id">{{ room.roomName }}</h1>
            <div class="header-right">
                <BaseBadge 
                    :variant="room.gameType === 'RANKED' ? 'rank' : 'normal'"
                    :label="room.gameType === 'RANKED' ? '랭크전' : '일반전'"
                />
                <BaseBadge variant="host">
                    방장 : {{ hostNickname }}
                </BaseBadge>
            </div>
        </header>

        <!-- 2. Main Content Area -->
        <div class="main-layout">
            <!-- Left Side: Player Grid -->
            <section class="player-grid-container">
                <div class="player-grid">
                    <PlayerSlot 
                        v-for="(player, idx) in displaySlots" 
                        :key="idx" 
                        :player="player"
                        :is-host-view="isHost"
                        @kick="handleKick"
                    />
                </div>
            </section>

            <!-- Right Side: Sidebar -->
            <aside class="room-sidebar">
                <!-- Room Settings Panel -->
                <RoomSettingsPanel :room="room" />

                <!-- Chat Panel -->
                <div class="chat-container">
                    <ChatPanel 
                        :channel-id="`room-${roomId}`"
                        :nickname="authStore.user?.nickname || 'Guest'" 
                    />
                </div>
            </aside>
        </div>

        <!-- 3. Bottom Action Row -->
        <footer class="room-actions">
            <BaseButton variant="secondary" @click="handleLeave">나가기</BaseButton>
            <div class="spacer"></div>
            <div class="right-btns">
                <BaseButton 
                    v-if="!isHost" 
                    variant="outline"
                    :class="{ active: myPlayer?.state === 'READY' }"
                    @click="toggleReady"
                >
                    준비 완료
                </BaseButton>
                <BaseButton 
                    v-if="isHost" 
                    variant="primary"
                    :disabled="room.players.length < 2"
                    @click="handleStart"
                >
                    게임 시작
                </BaseButton>
            </div>
        </footer>
    </div>
  </div>
</template>

<style scoped lang="scss">
.waiting-room-page {
    width: 100vw;
    height: 100vh;
    background-size: cover;
    background-position: center;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-text-primary);
    overflow: hidden;

    .overlay {
        position: absolute;
        inset: 0;
        background: rgba(11, 8, 20, 0.7);
        z-index: 1;
    }
}

.scaling-container {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    max-width: 1600px;
    max-height: 900px;
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    padding: calc(var(--gu) * 1.68) calc(var(--gu) * 6); // 3vh 6vw equivalent
    box-sizing: border-box;
}

.room-header {
    flex-shrink: 0;
    background: var(--color-bg-panel);
    border: calc(var(--gu) * 0.125) solid var(--color-border-cyan);
    border-radius: calc(var(--gu) * 1.2);
    padding: calc(var(--gu) * 0.67) calc(var(--gu) * 2.5); // 1.2vh 2.5vw
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: calc(var(--gu) * 1.4); // 2.5vh
    box-shadow: 0 0 calc(var(--gu) * 1.25) rgba(58, 242, 255, 0.1);

    .room-id {
        font-family: var(--font-display);
        font-size: calc(var(--gu) * 1.8);
        font-weight: 800;
        margin: 0;
        color: white;
    }

    .header-right {
        display: flex;
        align-items: center;
        gap: 1.5vw;
    }
}

.main-layout {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr calc(var(--gu) * 22);
    gap: calc(var(--gu) * 2);
    min-height: 0;
}

.player-grid-container {
    background: rgba(18, 16, 30, 0.4);
    border: calc(var(--gu) * 0.125) solid var(--color-border-cyan);
    border-radius: calc(var(--gu) * 1.2);
    padding: calc(var(--gu) * 1.125); // 2vh
    overflow: hidden;
}

.player-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: calc(var(--gu) * 1.2);
    height: 100%;
}

.room-sidebar {
    display: flex;
    flex-direction: column;
    gap: calc(var(--gu) * 1.125); // 2vh
    min-height: 0;
}

.chat-container {
    flex: 1;
    min-height: 0;
}

.room-actions {
    flex-shrink: 0;
    background: var(--color-bg-panel);
    border: calc(var(--gu) * 0.125) solid var(--color-border-cyan);
    border-radius: calc(var(--gu) * 1.2);
    padding: calc(var(--gu) * 0.84) calc(var(--gu) * 2); // 1.5vh 2vw
    margin-top: calc(var(--gu) * 1.4); // 2.5vh
    display: flex;
    align-items: center;

    .right-btns {
        display: flex;
        gap: 1.5vw;
    }

    .spacer { flex: 1; }
}

.loading-state {
    position: absolute;
    inset: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 10;
}

@keyframes spin {
    to { transform: rotate(360deg); }
}
</style>
