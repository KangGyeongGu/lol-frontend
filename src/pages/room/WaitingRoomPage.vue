<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useRoomStore } from '@/stores/useRoomStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { roomApi } from '@/api/room';
import type { RoomDetail } from '@/api/dtos/room.types';
import BaseBadge from '@/shared/ui/BaseBadge.vue';
import BaseButton from '@/shared/ui/BaseButton.vue';
import bgMainSrc from '@/assets/images/bg-main.jpg';

const route = useRoute();
const router = useRouter();
const roomStore = useRoomStore();
const authStore = useAuthStore();

const roomId = route.params.roomId as string;
const room = ref<RoomDetail | null>(null);
const isLoading = ref(true);

// 현재 로그인한 사용자가 방장인지 확인
const isHost = computed(() => {
    if (!room.value || !authStore.user) return false;
    return room.value.players.find(p => p.user.userId === authStore.user?.userId)?.isHost || false;
});

// 내 플레이어 정보 및 상태
const myPlayer = computed(() => {
    if (!room.value || !authStore.user) return null;
    return room.value.players.find(p => p.user.userId === authStore.user?.userId) || null;
});

// 방장 닉네임 찾기
const hostNickname = computed(() => {
    return room.value?.players.find(p => p.isHost)?.user.nickname || '';
});

// 슬롯 데이터 계산 (고정 6개)
const displaySlots = computed(() => {
    if (!room.value) return [];
    const totalSlots = 6;
    const slots = [...room.value.players];
    // 부족한 자리는 null로 채움
    while (slots.length < totalSlots) {
        slots.push(null as any);
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
        router.push({ name: 'MAIN' });
    } catch (error) {
        console.error('Leave failed:', error);
        router.push({ name: 'MAIN' });
    }
}

async function toggleReady() {
    console.log('Toggle Ready');
    // Phase 3에서 WebSocket/API 연동 예정
}

function handleStart() {
    console.log('Game Start');
}

onMounted(() => {
    fetchRoomDetail();
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
                    <div 
                        v-for="(player, idx) in displaySlots" 
                        :key="idx" 
                        class="player-slot"
                        :class="{ 
                            occupied: !!player, 
                            empty: !player,
                            ready: player?.state === 'READY'
                        }"
                    >
                        <template v-if="player">
                            <div class="slot-content">
                                <div class="player-header">
                                    <div class="avatar-icon"></div>
                                    <span class="nickname">{{ player.user.nickname }}</span>
                                </div>
                                <div class="tier-info">
                                    <span class="tier-name">{{ player.user.tier }}</span>
                                    <span class="score-badge">{{ player.user.score }}</span>
                                </div>
                                <BaseBadge v-if="player.isHost" variant="host" class="host-badge-pos">HOST</BaseBadge>
                                <BaseBadge v-if="player.state === 'READY'" variant="default" class="ready-badge-pos">준비 완료</BaseBadge>
                            </div>
                        </template>
                        <template v-else>
                            <div class="empty-content">
                                <span class="placeholder-text">참가자를 기다리는 중...</span>
                            </div>
                        </template>
                    </div>
                </div>
            </section>

            <!-- Right Side: Sidebar -->
            <aside class="room-sidebar">
                <!-- Room Settings Panel -->
                <div class="sidebar-panel settings-panel">
                    <h3 class="panel-title">방 설정</h3>
                    <div class="settings-list">
                        <div class="setting-item">
                            <span class="label">게임 유형:</span>
                            <BaseBadge variant="cyan" :label="room.gameType" />
                        </div>
                        <div class="setting-item">
                            <span class="label">최대 인원:</span>
                            <BaseBadge variant="cyan" :label="`${room.maxPlayers}명`" />
                        </div>
                        <div class="setting-item">
                            <span class="label">제한 시간:</span>
                            <BaseBadge variant="cyan" label="60분" />
                        </div>
                        <div class="setting-item">
                            <span class="label">언어:</span>
                            <BaseBadge variant="cyan" :label="room.language" />
                        </div>
                    </div>
                </div>

                <!-- Chat Panel -->
                <div class="sidebar-panel chat-panel">
                    <h3 class="panel-title">인게임 채팅</h3>
                    <div class="chat-log">
                        <div class="chat-msg system">방에 입장하였습니다.</div>
                        <div class="chat-msg system">욕설 및 비방은 제재 대상이 될 수 있습니다.</div>
                    </div>
                    <div class="chat-input-row">
                        <input type="text" placeholder="팀원에게 메시지를 보내세요..." />
                        <button class="send-btn">></button>
                    </div>
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

// 16:9 비율을 유지하며 스케일링되는 컨테이너
.scaling-container {
    position: relative;
    z-index: 2;
    width: 100%;
    height: 100%;
    max-width: 1600px; // 최대 폭 제한
    max-height: 900px; // 16:9 기준 최대 높이
    aspect-ratio: 16 / 9;
    display: flex;
    flex-direction: column;
    padding: 3vh 6vw; // 뷰포트 기반 유동적 패딩
    box-sizing: border-box;
}

.room-header {
    flex-shrink: 0;
    background: var(--color-bg-panel);
    border: 2px solid var(--color-border-cyan);
    border-radius: 1.2vw;
    padding: 1.2vh 2.5vw;
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2.5vh;
    box-shadow: 0 0 20px rgba(58, 242, 255, 0.1);

    .room-id {
        font-family: var(--font-display);
        font-size: clamp(1.5rem, 2.5vw, 2.2rem);
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
    grid-template-columns: 1fr 22vw;
    gap: 2vw;
    min-height: 0;
}

.player-grid-container {
    background: rgba(18, 16, 30, 0.4);
    border: 2px solid var(--color-border-cyan);
    border-radius: 1.2vw;
    padding: 2vh;
    overflow: hidden;
}

.player-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    grid-template-rows: repeat(3, 1fr);
    gap: 1.2vw;
    height: 100%;
}

.player-slot {
    border-radius: 1vw;
    position: relative;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    background: rgba(0, 0, 0, 0.2);
    
    &.occupied {
        background: rgba(23, 19, 42, 0.95);
        border: 2px solid rgba(255, 255, 255, 0.2);
        
        &.ready {
            background: linear-gradient(135deg, rgba(23, 19, 42, 0.95) 0%, rgba(255, 210, 72, 0.15) 100%);
            border-color: var(--color-accent-yellow);
            box-shadow: 0 0 20px rgba(255, 210, 72, 0.15);
        }
        
        .slot-content {
            padding: 1.5vw;
            height: 100%;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
        }

        .player-header {
            display: flex;
            align-items: center;
            gap: 0.8vw;

            .avatar-icon {
                width: 2.8vw; height: 2.8vw;
                background: rgba(255, 210, 72, 0.1) url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" stroke="%23FFD248" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 0 0-16 0"/></svg>') no-repeat center;
                background-size: 60%;
                border: 1px solid var(--color-accent-yellow);
                border-radius: 0.5vw;
            }

            .nickname {
                font-family: var(--font-display);
                font-size: clamp(1rem, 1.5vw, 1.4rem);
                color: var(--color-accent-yellow);
                font-weight: 800;
            }
        }

        .tier-info {
            .tier-name {
                font-family: var(--font-display);
                font-size: clamp(1.2rem, 2vw, 1.8rem);
                font-weight: 900;
                display: block;
                color: white;
            }
            .score-badge {
                display: inline-block;
                margin-top: 0.5vh;
                background: rgba(255, 255, 255, 0.08);
                padding: 0.2vh 0.8vw;
                border-radius: 0.4vw;
                font-family: var(--font-mono);
                color: var(--color-accent-yellow);
                font-size: clamp(0.7rem, 0.9vw, 1rem);
            }
        }

        .host-badge-pos {
            position: absolute;
            top: 1vh; right: 1vw;
            font-size: 0.6vw !important;
            padding: 2px 6px !important;
        }

        .ready-badge-pos {
            position: absolute;
            bottom: 1.5vh; right: 1vw;
            background: var(--color-accent-yellow) !important;
            color: black !important;
            border: none !important;
            box-shadow: 0 0 15px rgba(255, 210, 72, 0.4);
        }
    }

    &.empty {
        border: 2px dashed rgba(58, 242, 255, 0.15);
        display: flex;
        align-items: center;
        justify-content: center;
        
        .placeholder-text {
            color: var(--color-text-muted);
            font-size: clamp(0.7rem, 0.9vw, 1rem);
            opacity: 0.5;
        }
    }
}

.room-sidebar {
    display: flex;
    flex-direction: column;
    gap: 2vh;
}

.sidebar-panel {
    background: var(--color-bg-panel);
    border-radius: 1.2vw;
    padding: 2vh;
    display: flex;
    flex-direction: column;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);

    .panel-title {
        font-family: var(--font-display);
        font-size: clamp(0.9rem, 1.2vw, 1.2rem);
        margin-top: 0;
        margin-bottom: 1.5vh;
        color: white;
        font-weight: 800;
    }
}

.settings-panel {
    border: 2px solid var(--color-border-cyan);
    
    .settings-list {
        display: flex;
        flex-direction: column;
        gap: 1vh;
    }
    
    .setting-item {
        display: flex;
        justify-content: space-between;
        align-items: center;
        font-size: clamp(0.7rem, 0.9vw, 1rem);
        color: var(--color-text-secondary);
    }
}

.chat-panel {
    flex: 1;
    border: 2px solid var(--color-border-yellow);
    min-height: 0;

    .chat-log {
        flex: 1;
        overflow-y: auto;
        padding-right: 8px;
        margin-bottom: 1.5vh;
        font-size: clamp(0.7rem, 0.85vw, 0.9rem);
        display: flex;
        flex-direction: column;
        gap: 0.8vh;
        
        .chat-msg.system { 
            color: var(--color-accent-cyan); 
            font-weight: 600;
            font-size: 0.85em;
        }
        
        &::-webkit-scrollbar { width: 4px; }
        &::-webkit-scrollbar-thumb { background: rgba(255, 210, 72, 0.3); border-radius: 2px; }
    }

    .chat-input-row {
        display: flex;
        gap: 0.8vw;
        
        input {
            flex: 1;
            background: rgba(0, 0, 0, 0.4);
            border: 1px solid var(--color-border-cyan);
            border-radius: 0.5vw;
            padding: 0.8vh 1vw;
            color: white;
            font-size: clamp(0.7rem, 0.85vw, 0.9rem);
            &:focus { outline: none; border-color: var(--color-accent-yellow); }
        }
        
        .send-btn {
            width: 2.5vw; height: 2.5vw;
            background: rgba(255, 255, 255, 0.08);
            border: 1px solid var(--color-border-subtle);
            color: white;
            border-radius: 0.5vw;
            cursor: pointer;
            display: flex; align-items: center; justify-content: center;
        }
    }
}

.room-actions {
    flex-shrink: 0;
    background: var(--color-bg-panel);
    border: 2px solid var(--color-border-cyan);
    border-radius: 1.2vw;
    padding: 1.5vh 2vw;
    margin-top: 2.5vh;
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
