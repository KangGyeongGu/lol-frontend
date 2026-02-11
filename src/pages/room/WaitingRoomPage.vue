<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthStore } from '@/stores/useAuthStore';
import { useRoomStore } from '@/stores/useRoomStore';
import { MESSAGES } from '@/shared/constants/messages';
import type { RoomDetailViewModel } from '@/entities/room.model';
import type { RoomEventData, RoomGameStartedEvent } from '@/api/dtos/room.dto';
import { useRoomSubscription } from './composables/useRoomSubscription';
import BaseBadge from '@/shared/ui/BaseBadge.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import ChatPanel from '@/features/chat/ui/ChatPanel.vue';
import PlayerSlot from './components/PlayerSlot.vue';
import RoomSettingsPanel from './components/RoomSettingsPanel.vue';
import bgMainSrc from '@/assets/images/bg-main.jpg';

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const roomStore = useRoomStore();

const roomId = route.params.roomId as string;
const room = ref<RoomDetailViewModel | null>(null);
const isInitialLoading = ref(true);
const errorMessage = ref<string | null>(null);
let lastActionTime = 0;

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
    try {
        room.value = await roomStore.getRoomDetail(roomId);
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Failed to fetch room detail:', error);
        }
        errorMessage.value = MESSAGES.ROOM.FETCH_FAILED;
        setTimeout(() => {
            router.push({ name: 'MAIN' });
        }, 2000);
    } finally {
        isInitialLoading.value = false;
    }
}

// STOMP 이벤트 수신 시: 직전 사용자 액션 직후면 스킵, 아니면 조용히 갱신
async function onLobbyEvent(type?: string, data?: RoomEventData) {
    // 게임 시작 이벤트 → 전원(방장 포함) 페이지 전환
    if (type === 'ROOM_GAME_STARTED') {
        const event = data as unknown as RoomGameStartedEvent;
        router.push({ name: event.pageRoute, params: { roomId, gameId: event.gameId } });
        return;
    }

    if (Date.now() - lastActionTime < 1000) return;
    try {
        const updated = await roomStore.getRoomDetail(roomId);
        if (room.value) {
            room.value = { ...room.value, players: updated.players };
        }
    } catch { /* 다른 유저 이벤트 갱신 실패는 무시 */ }
}

async function handleLeave() {
    try {
        await roomStore.leaveRoom(roomId);
        router.replace({ name: 'MAIN' });
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Leave failed:', error);
        }
        router.replace({ name: 'MAIN' });
    }
}

async function toggleReady() {
    if (!myPlayer.value) return;
    try {
        const updated = myPlayer.value.state === 'READY'
            ? await roomStore.unready(roomId)
            : await roomStore.ready(roomId);
        if (room.value) {
            room.value = { ...room.value, players: updated.players };
        }
        lastActionTime = Date.now();
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Toggle ready failed:', error);
        }
    }
}

async function handleStart() {
    try {
        await roomStore.startGame(roomId);
        // 전환은 ROOM_GAME_STARTED 이벤트로 전원 일괄 처리
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Start failed:', error);
        }
    }
}

async function handleKick(targetUserId: string) {
    if (!isHost.value) return;
    try {
        await roomStore.kickPlayer(roomId, targetUserId);
        lastActionTime = Date.now();
    } catch (error) {
        if (import.meta.env.DEV) {
            console.error('Kick failed:', error);
        }
    }
}

useRoomSubscription(roomId, onLobbyEvent);
fetchRoomDetail();
</script>

<template>
  <div class="waiting-room-page" :style="{ backgroundImage: `url(${bgMainSrc})` }">
    <div class="overlay"></div>

    <div v-if="isInitialLoading" class="loading-state">
        <div class="spinner"></div>
        <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
    </div>

    <!-- Scaling Content Wrapper -->
    <div v-else-if="room" class="scaling-container">
        <!-- 1. Header Row -->
        <header class="room-header">
            <h1 class="room-id">{{ room.roomName }}</h1>
            <div class="header-right">
                <BaseBadge
                    :variant="room.gameType === 'RANKED' ? 'rank' : 'normal'"
                    :label="room.gameType === 'RANKED' ? MESSAGES.GAME.RANKED : MESSAGES.GAME.NORMAL"
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
                        :key="player ? player.user.userId : `empty-${idx}`"
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
                        :channel-id="roomId"
                        :nickname="authStore.user?.nickname || 'Guest'"
                    />
                </div>
            </aside>
        </div>

        <!-- 3. Bottom Action Row -->
        <footer class="room-actions">
            <BaseButton variant="secondary" @click="handleLeave">{{ MESSAGES.COMMON.LEAVE }}</BaseButton>
            <div class="spacer"></div>
            <div class="right-btns">
                <BaseButton
                    v-if="!isHost"
                    variant="outline"
                    :class="{ active: myPlayer?.state === 'READY' }"
                    @click="toggleReady"
                >
                    {{ myPlayer?.state === 'READY' ? MESSAGES.COMMON.READY_CANCEL : MESSAGES.COMMON.READY }}
                </BaseButton>
                <BaseButton
                    v-if="isHost"
                    variant="primary"
                    :disabled="room.players.length < 2"
                    @click="handleStart"
                >
                    {{ MESSAGES.COMMON.START_GAME }}
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
    max-width: calc(var(--gu) * 100);
    max-height: calc(var(--gu) * 56.25);
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    padding: calc(var(--gu) * 1.68) calc(var(--gu) * 6);
    box-sizing: border-box;
}

.room-header {
    flex-shrink: 0;
    background: var(--color-bg-panel);
    border: calc(var(--gu) * 0.125) solid var(--color-border-cyan);
    border-radius: calc(var(--gu) * 1.2);
    padding: calc(var(--gu) * 0.67) calc(var(--gu) * 2.5);
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: calc(var(--gu) * 1.4);
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
    padding: calc(var(--gu) * 1.125);
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
    gap: calc(var(--gu) * 1.125);
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
    padding: calc(var(--gu) * 0.84) calc(var(--gu) * 2);
    margin-top: calc(var(--gu) * 1.4);
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
    flex-direction: column;
    justify-content: center;
    align-items: center;
    gap: calc(var(--gu) * 2);
    z-index: 10;

    .error-message {
        color: var(--color-accent-red);
        font-size: calc(var(--gu) * 1.1);
        text-align: center;
        padding: calc(var(--gu) * 1);
        background: rgba(255, 77, 109, 0.1);
        border: calc(var(--gu) * 0.0625) solid var(--color-accent-red);
        border-radius: var(--radius-md);
        animation: shake 0.3s ease-in-out;
    }
}

@keyframes spin {
    to { transform: rotate(360deg); }
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-5px); }
    75% { transform: translateX(5px); }
}
</style>
